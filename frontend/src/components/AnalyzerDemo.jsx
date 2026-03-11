import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FlaskConical,
  Pill,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { analyzeFromVcf, checkApiHealth } from "../lib/api";

const TARGET_DRUGS = ["Clopidogrel", "Warfarin", "Codeine", "Simvastatin", "Azathioprine", "Fluorouracil"];

const PIPELINE_STEPS = [
  "Establishing secure connection",
  "Parsing Variant Call Format (VCF)",
  "Mapping star alleles and haplotypes",
  "Generating pharmacogenomic insight",
  "Building clinical recommendations",
];

const RISK_ORDER = { High: 3, Moderate: 2, Low: 1, "-": 0 };

export default function AnalyzerDemo() {
  const [selectedDrugs, setSelectedDrugs] = useState(["Clopidogrel", "Warfarin", "Codeine"]);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [apiHealthy, setApiHealthy] = useState(null);

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiHealthy(true))
      .catch(() => setApiHealthy(false));
  }, []);

  const progressStep = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.max(0, Math.floor((progress / 100) * PIPELINE_STEPS.length))
  );

  const summary = useMemo(() => {
    const high = reports.filter((r) => r.riskLevel === "High").length;
    const moderate = reports.filter((r) => r.riskLevel === "Moderate").length;
    const low = reports.filter((r) => r.riskLevel === "Low").length;

    const genes = [];
    const seen = new Set();
    reports.forEach((r) => {
      if (!r.gene || r.gene === "No actionable variant") return;
      if (seen.has(r.gene)) return;
      seen.add(r.gene);
      genes.push({ gene: r.gene, diplotype: r.diplotype, phenotype: r.phenotype });
    });

    return { high, moderate, low, genes, total: reports.length };
  }, [reports]);

  function toggleDrug(drug) {
    setSelectedDrugs((prev) => {
      if (prev.includes(drug)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== drug);
      }
      return [...prev, drug];
    });
  }

  function onFileSelect(next) {
    if (!next) return;
    setFile(next);
    setError("");
  }

  async function runAnalysis() {
    setError("");

    if (!file) {
      setError("Please upload a VCF file.");
      return;
    }

    if (selectedDrugs.length === 0) {
      setError("Select at least one drug.");
      return;
    }

    setLoading(true);
    setProgress(6);

    const timer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + 3 : p));
    }, 180);

    try {
      const settled = await Promise.allSettled(
        selectedDrugs.map(async (drug) => {
          const result = await analyzeFromVcf({ file, drug });
          return { drug, ...result };
        })
      );

      const success = settled
        .filter((s) => s.status === "fulfilled")
        .map((s) => s.value);

      const failed = settled
        .filter((s) => s.status === "rejected")
        .map((s) => s.reason?.message || "Unknown error");

      if (success.length > 0) {
        success.sort((a, b) => (RISK_ORDER[b.riskLevel] || 0) - (RISK_ORDER[a.riskLevel] || 0));
        setReports(success);
        if (failed.length > 0) {
          setError(`Some drugs failed: ${failed[0]}`);
        }
      } else {
        setReports([]);
        setError(failed[0] || "Analysis failed for all selected drugs.");
      }

      setProgress(100);
    } catch (err) {
      setReports([]);
      setError(err?.message || "Analysis failed.");
      setProgress(100);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  function resetAll() {
    setFile(null);
    setError("");
    setReports([]);
    setProgress(0);
    setSelectedDrugs(["Clopidogrel", "Warfarin", "Codeine"]);
  }

  return (
    <div id="studio">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        <p className="label">Live Demo</p>
        <StatusBadge apiHealthy={apiHealthy} />
      </div>

      <h2 className="mt-1 text-center text-3xl font-semibold text-[#132a4b] md:text-4xl">
        Pharmacogenomic Analysis
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-[#5b6d86] md:text-base">
        Upload one patient VCF, choose multiple target drugs, and generate a clinician-ready multi-therapy report.
      </p>

      <div className="mx-auto mt-10 max-w-3xl card p-6 md:p-8">
        <h3 className="text-center text-3xl font-semibold text-[#173156]">VCF Analysis</h3>
        <p className="mt-2 text-center text-sm text-[#5f7190]">
          Upload patient Variant Call Format file and select therapies for AI review.
        </p>

        <label
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            onFileSelect(e.dataTransfer.files?.[0]);
          }}
          className={`group relative mt-5 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-10 text-center transition ${
            dragActive ? "border-[#7f9b74] bg-[#eef5ea]" : "border-[#bfd0c2] bg-[#f7fbf8]"
          }`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#dcebd4] opacity-65 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#d4e6cd] opacity-65 blur-2xl" />
          <motion.div whileHover={{ y: -2 }} className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#6f8f64] shadow-sm">
            <UploadCloud size={30} />
          </motion.div>
          <p className="relative z-10 mt-3 text-base font-semibold text-[#304766]">Click to upload or drag & drop</p>
          <p className="relative z-10 mt-1 text-xs text-[#7b8ca6]">.vcf files only (max 5MB)</p>
          <p className="relative z-10 mt-2 inline-flex items-center gap-1 rounded-full border border-[#d8e4d3] bg-white px-3 py-1 text-[11px] text-[#5f736a]">
            <Sparkles size={12} />
            Multi-drug clinical analysis enabled
          </p>
          <input
            type="file"
            accept=".vcf,.txt"
            onChange={(e) => onFileSelect(e.target.files?.[0])}
            className="hidden"
          />
        </label>

        {file ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#dbe5de] bg-white px-3 py-2 text-xs text-[#304766]">
            <div className="flex items-center gap-2">
              <FileCheck2 size={15} className="text-emerald-700" />
              <span className="max-w-[260px] truncate">{file.name}</span>
              <span className="text-[#7b8ca6]">({Math.ceil(file.size / 1024)} KB)</span>
            </div>
            <button className="text-[#6f8f64] hover:text-[#56784f]" onClick={() => setFile(null)}>
              Remove
            </button>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7a8ea8]">
            <FlaskConical size={13} />
            Target Therapeutics (multi-select)
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {TARGET_DRUGS.map((drug) => {
              const active = selectedDrugs.includes(drug);
              return (
                <button
                  key={drug}
                  onClick={() => toggleDrug(drug)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "border-[#90ad84] bg-[#edf4ea] text-[#365134]"
                      : "border-[#dbe5de] bg-white text-[#5b6d86] hover:border-[#a9bba0]"
                  }`}
                >
                  {drug}
                </button>
              );
            })}
          </div>
        </div>

        {loading || progress > 0 ? (
          <div className="mt-6 rounded-xl border border-[#dbe5de] bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-[#5f7390]">
              <span>{PIPELINE_STEPS[progressStep]}</span>
              <span className="font-semibold text-[#2f8fcf]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eaf0f5]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#67b3ff] to-[#4ed6d6] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 space-y-2">
              {PIPELINE_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center gap-2 text-xs text-[#5b6d86]">
                  {idx < progressStep ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Clock3 size={13} className="text-[#7b8ca6]" />}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            onClick={runAnalysis}
            className="rounded-full bg-[#11151f] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,21,31,0.25)] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? "Analyzing..." : "Analyse"}
          </motion.button>

          <button
            onClick={resetAll}
            className="rounded-full border border-[#dbe5de] bg-white px-6 py-3 text-sm font-medium text-[#4d607a] hover:border-[#9db28f]"
          >
            Reset
          </button>
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="mt-10 grid gap-6 xl:grid-cols-[0.24fr,0.52fr,0.24fr]">
          <div className="card p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5d7392]">Genomic Profile</h4>
            <div className="mt-3 space-y-3">
              {summary.genes.length ? (
                summary.genes.map((g) => (
                  <div key={g.gene} className="rounded-xl border border-[#dbe5de] bg-white p-3">
                    <p className="text-sm font-semibold text-[#1c3458]">{g.gene}</p>
                    <p className="mt-1 text-xs text-[#5f7390]">{g.diplotype}</p>
                    <p className="text-xs text-[#7b8ca6]">{g.phenotype}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7d96]">No actionable gene profile found in this run.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5d7392]">Drug-Drug Interaction Analysis</h4>
            {reports.map((r) => (
              <DrugReportCard key={r.drug} report={r} />
            ))}
          </div>

          <div className="card p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5d7392]">Analysis Quality</h4>
            <div className="mt-4 rounded-xl border border-[#dbe5de] bg-white p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7b8ca6]">Confidence Score</p>
              <p className="mt-1 text-xl font-semibold text-[#1f3c66]">100%</p>
              <div className="mt-2 h-2 rounded-full bg-[#e9eef3]">
                <div className="h-full w-full rounded-full bg-[#2f9be2]" />
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-[#dbe5de] bg-white p-3 text-sm text-[#4f627d]">
              <p>Drugs analyzed: <span className="font-semibold">{summary.total}</span></p>
              <p className="mt-1 text-red-600">High risk: {summary.high}</p>
              <p className="text-amber-600">Moderate risk: {summary.moderate}</p>
              <p className="text-emerald-700">Low risk: {summary.low}</p>
            </div>
            <button className="mt-4 w-full rounded-full bg-[#11151f] px-4 py-3 text-sm font-semibold text-white">Ask AI Questions</button>
            <button className="mt-3 w-full rounded-full bg-[#11151f] px-4 py-3 text-sm font-semibold text-white">Analyze Another Patient</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ apiHealthy }) {
  const state = apiHealthy == null ? "Checking API" : apiHealthy ? "API Online" : "API Offline";
  const tone = apiHealthy == null ? "text-amber-700 bg-amber-50" : apiHealthy ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50";
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${tone}`}>
      <Activity size={14} />
      <span>{state}</span>
    </div>
  );
}

function DrugReportCard({ report }) {
  const riskTone =
    report.riskLevel === "High"
      ? "border-[#efc7c9] bg-[#fff7f7]"
      : report.riskLevel === "Moderate"
      ? "border-[#eedfb8] bg-[#fffdf7]"
      : "border-[#d5e8d9] bg-[#f8fff9]";

  return (
    <div className={`card p-5 ${riskTone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#7a8ea8]">Drug</p>
          <h5 className="text-2xl font-semibold text-[#173156]">{report.drug}</h5>
          <p className="text-xs text-[#7b8ca6]">{report.gene} · {report.phenotype}</p>
        </div>
        <span className="rounded-full border border-[#dbe5de] bg-white px-3 py-1 text-xs font-semibold text-[#3f5879]">
          {report.riskLevel}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-lg border border-[#dbe5de] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#90a0b7]">Clinical Recommendation</p>
          <p className="mt-1 leading-relaxed text-[#3d5170]">{report.recommendation}</p>
        </div>

        <div className="rounded-lg border border-[#dbe5de] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#90a0b7]">AI Explanation</p>
          <p className="mt-1 leading-relaxed text-[#3d5170]">{report.explanation}</p>
        </div>

        <div className="rounded-lg border border-[#dbe5de] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#90a0b7]">Evidence</p>
          <p className="mt-1 text-[#3d5170]">{report.evidence}</p>
        </div>
      </div>
    </div>
  );
}
