from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


app = FastAPI(title="PharmaGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VariantInput(BaseModel):
    gene: str | None = None
    rsid: str
    genotype: str


class AnalysisRequest(BaseModel):
    drug: str = Field(..., min_length=2)
    variants: list[VariantInput] = Field(default_factory=list)
    mode: str = "doctor"


CPIC_RULES: dict[str, dict[str, Any]] = {
    "rs4244285": {
        "gene": "CYP2C19",
        "genotype_map": {
            "A/G": {"diplotype": "*1/*2", "phenotype": "Intermediate Metabolizer"},
            "G/G": {"diplotype": "*2/*2", "phenotype": "Poor Metabolizer"},
        },
        "drugs": {
            "Clopidogrel": {
                "risk_level": "High",
                "recommendation": "Use prasugrel or ticagrelor due to reduced antiplatelet effect.",
                "cpic_level": "CPIC Level A",
            }
        },
    },
    "rs3892097": {
        "gene": "CYP2D6",
        "genotype_map": {
            "A/G": {"diplotype": "*1/*4", "phenotype": "Intermediate Metabolizer"},
            "G/G": {"diplotype": "*4/*4", "phenotype": "Poor Metabolizer"},
        },
        "drugs": {
            "Codeine": {
                "risk_level": "High",
                "recommendation": "Avoid codeine; consider morphine or non-CYP2D6-dependent analgesic.",
                "cpic_level": "CPIC Level A",
            }
        },
    },
    "rs9923231": {
        "gene": "VKORC1",
        "genotype_map": {
            "A/G": {"diplotype": "A/G", "phenotype": "Increased Sensitivity"},
            "A/A": {"diplotype": "A/A", "phenotype": "High Sensitivity"},
        },
        "drugs": {
            "Warfarin": {
                "risk_level": "Moderate",
                "recommendation": "Consider lower initial dosing with close INR monitoring.",
                "cpic_level": "CPIC Level A",
            }
        },
    },
}


def normalize_gt(gt: str) -> str:
    raw = gt.strip().replace("|", "/")
    parts = raw.split("/")
    if len(parts) == 2 and all(len(p) == 1 and p.isalpha() for p in parts):
        return "/".join(sorted(parts))
    numeric_map = {
        "0/0": "A/A",
        "0/1": "A/G",
        "1/0": "A/G",
        "1/1": "G/G",
    }
    return numeric_map.get(raw, raw)


def genotype_from_vcf(gt_field: str, ref: str, alt: str) -> str:
    """
    Convert VCF genotype indices (e.g. 0/1) into allele genotype (e.g. A/G).
    Falls back to normalized raw genotype when conversion is not possible.
    """
    gt_raw = gt_field.strip().replace("|", "/")
    idx = gt_raw.split("/")
    if len(idx) != 2:
        return normalize_gt(gt_raw)

    alleles = [ref] + [a.strip() for a in alt.split(",") if a.strip()]
    resolved: list[str] = []
    for i in idx:
        if i == ".":
            return normalize_gt(gt_raw)
        if not i.isdigit():
            return normalize_gt(gt_raw)
        pos = int(i)
        if pos < 0 or pos >= len(alleles):
            return normalize_gt(gt_raw)
        resolved.append(alleles[pos])

    return normalize_gt("/".join(resolved))


def parse_vcf_bytes(content: bytes) -> list[VariantInput]:
    variants: list[VariantInput] = []
    for line in content.decode("utf-8", errors="ignore").splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 10:
            continue
        rsid = parts[2]
        if not rsid or rsid == ".":
            continue
        ref = parts[3]
        alt = parts[4]
        gt_field = parts[9].split(":")[0]
        gt = genotype_from_vcf(gt_field, ref, alt)
        variants.append(VariantInput(rsid=rsid, genotype=gt))
    return variants


def rule_based_analysis(drug: str, variants: list[VariantInput]) -> dict[str, Any]:
    default_result = {
        "riskLevel": "Low",
        "gene": "No actionable variant",
        "diplotype": "N/A",
        "phenotype": "Likely Normal Metabolizer",
        "recommendation": "No major pharmacogenomic alert detected for selected drug.",
        "evidence": "No CPIC-triggering rsID matched in provided data.",
    }

    for v in variants:
        rule = CPIC_RULES.get(v.rsid)
        if not rule:
            continue
        drug_rule = rule["drugs"].get(drug)
        if not drug_rule:
            continue

        gt = normalize_gt(v.genotype)
        mapped = rule["genotype_map"].get(gt, {"diplotype": "Unknown", "phenotype": "Unknown"})

        return {
            "riskLevel": drug_rule["risk_level"],
            "gene": rule["gene"],
            "diplotype": mapped["diplotype"],
            "phenotype": mapped["phenotype"],
            "recommendation": drug_rule["recommendation"],
            "evidence": drug_rule["cpic_level"],
        }

    return default_result


def ai_explanation(result: dict[str, Any], drug: str, mode: str) -> str:
    key = os.getenv("OPENAI_API_KEY")
    if not key or OpenAI is None:
        return (
            f"{result['gene']} result for {drug}: {result['phenotype']}. "
            f"Clinical action: {result['recommendation']} ({result['evidence']})."
        )

    try:
        client = OpenAI(api_key=key)
        prompt = (
            "You are a pharmacogenomics clinical assistant. "
            f"Mode: {mode}. Drug: {drug}. Result: {json.dumps(result)}. "
            "Provide a concise explanation in under 90 words."
        )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a precise PGx decision support assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return (
            f"{result['gene']} result for {drug}: {result['phenotype']}. "
            f"Clinical action: {result['recommendation']} ({result['evidence']})."
        )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze/json")
def analyze_json(payload: AnalysisRequest) -> dict[str, Any]:
    result = rule_based_analysis(payload.drug, payload.variants)
    result["explanation"] = ai_explanation(result, payload.drug, payload.mode)
    result["variantCount"] = len(payload.variants)
    return result


@app.post("/api/analyze/vcf")
async def analyze_vcf(
    file: UploadFile = File(...),
    drug: str = Form(...),
    mode: str = Form("doctor"),
) -> dict[str, Any]:
    if not file.filename.lower().endswith((".vcf", ".txt")):
        raise HTTPException(status_code=400, detail="Upload a valid VCF file.")

    content = await file.read()
    variants = parse_vcf_bytes(content)
    if not variants:
        raise HTTPException(status_code=400, detail="No parseable variants found in VCF.")

    result = rule_based_analysis(drug, variants)
    result["explanation"] = ai_explanation(result, drug, mode)
    result["variantCount"] = len(variants)
    return result


DIST_DIR = Path(__file__).parent / "dist"
ASSETS_DIR = DIST_DIR / "assets"
INDEX_FILE = DIST_DIR / "index.html"

if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/", include_in_schema=False)
def spa_root():
    if INDEX_FILE.exists():
        return FileResponse(INDEX_FILE)
    return {"message": "Frontend build not found. Run `npm run build` first."}


@app.get("/{full_path:path}", include_in_schema=False)
def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found.")
    candidate = DIST_DIR / full_path
    if candidate.exists() and candidate.is_file():
        return FileResponse(candidate)
    if INDEX_FILE.exists():
        return FileResponse(INDEX_FILE)
    raise HTTPException(status_code=404, detail="Frontend build not found.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
