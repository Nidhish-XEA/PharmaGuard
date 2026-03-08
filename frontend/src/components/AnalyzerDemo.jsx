import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileCheck2, AlertCircle, Activity } from "lucide-react";
import { analyzeFromJson, analyzeFromVcf, checkApiHealth } from "../lib/api";

const SAMPLE_VARIANTS = {
  Clopidogrel: `{
  "sample_id": "PGX-CLOP-01",
  "variants": [
    { "gene": "CYP2C19", "rsid": "rs4244285", "genotype": "A/G" }
  ]
}`,
  Warfarin: `{
  "sample_id": "PGX-WAR-01",
  "variants": [
    { "gene": "VKORC1", "rsid": "rs9923231", "genotype": "A/G" }
  ]
}`,
  Codeine: `{
  "sample_id": "PGX-COD-01",
  "variants": [
    { "gene": "CYP2D6", "rsid": "rs3892097", "genotype": "G/G" }
  ]
}`,
};

const EMPTY_RESULT = {
  riskLevel: "-",
  gene: "-",
  diplotype: "-",
  phenotype: "-",
  recommendation: "Run analysis to see recommendation.",
  evidence: "-",
  explanation: "-",
  variantCount: 0,
};

export default function AnalyzerDemo() {
  const [drug, setDrug] = useState("Clopidogrel");
  const [mode, setMode] = useState("json");
  const [jsonText, setJsonText] = useState(SAMPLE_VARIANTS.Clopidogrel);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(EMPTY_RESULT);
  const [apiHealthy, setApiHealthy] = useState(null);

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiHealthy(true))
      .catch(() => setApiHealthy(false));
  }, []);

  const parsedJson = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const variants = Array.isArray(parsed?.variants) ? parsed.variants : [];
      return { valid: true, variants };
    } catch {
      return { valid: false, variants: [] };
    }
  }, [jsonText]);

  const riskTone = useMemo(() => {
    if (result.riskLevel === "High") return "text-red-600 bg-red-50 border-red-200";
    if (result.riskLevel === "Moderate") return "text-amber-600 bg-amber-50 border-amber-200";
    if (result.riskLevel === "Low") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    return "text-[#3d5170] bg-white border-[#dbe5de]";
  }, [result.riskLevel]);

  function loadSample(sampleDrug) {
    setDrug(sampleDrug);
    setMode("json");
    setFile(null);
    setJsonText(SAMPLE_VARIANTS[sampleDrug]);
    setError("");
  }

  function onFileSelect(next) {
    if (!next) return;
    setFile(next);
    setMode("vcf");
    setError("");
  }

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      let data;
      if (mode === "vcf") {
        if (!file) throw new Error("Please upload a VCF file.");
        data = await analyzeFromVcf({ file, drug });
      } else {
        if (!parsedJson.valid) throw new Error("Fix JSON format before running analysis.");
        data = await analyzeFromJson({ drug, variants: parsedJson.variants });
      }
      setResult(data);
    } catch (err) {
      setError(err?.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setMode("json");
    setFile(null);
    setError("");
    setResult(EMPTY_RESULT);
    setJsonText(SAMPLE_VARIANTS[drug]);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        <p className="label">Live Demo</p>
        <StatusBadge apiHealthy={apiHealthy} />
      </div>

      <h2 className="mt-1 text-center text-3xl font-semibold text-[#132a4b] md:text-4xl">
        Interactive Analysis Studio
      </h2>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {Object.keys(SAMPLE_VARIANTS).map((name) => (
          <button
            key={name}
            onClick={() => loadSample(name)}
            className="rounded-full border border-[#dbe5de] bg-white px-4 py-1.5 text-xs text-[#4d607a] hover:border-[#9db28f] hover:text-[#2f4566]"
          >
            Load {name} Sample
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="card p-6">
          <label className="text-sm text-[#5e7090]">Drug</label>
          <select
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#dbe5de] bg-white px-4 py-3 text-sm text-[#324866] outline-none transition focus:border-[#7f9b74]"
          >
            <option>Clopidogrel</option>
            <option>Warfarin</option>
            <option>Codeine</option>
          </select>

          <div className="mt-5 inline-flex rounded-full border border-[#dbe5de] bg-white p-1">
            <button
              onClick={() => setMode("json")}
              className={`rounded-full px-4 py-1.5 text-xs ${mode === "json" ? "bg-[#edf4ea] text-[#46623f]" : "text-[#60748d]"}`}
            >
              JSON Input
            </button>
            <button
              onClick={() => setMode("vcf")}
              className={`rounded-full px-4 py-1.5 text-xs ${mode === "vcf" ? "bg-[#edf4ea] text-[#46623f]" : "text-[#60748d]"}`}
            >
              VCF Upload
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "json" ? (
              <motion.div
                key="json"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#5e7090]">Variants JSON</span>
                  <span className={parsedJson.valid ? "text-emerald-700" : "text-red-600"}>
                    {parsedJson.valid ? "Valid JSON" : "Invalid JSON"}
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full rounded-xl border border-[#dbe5de] bg-white p-4 font-mono text-xs text-[#304766] outline-none transition focus:border-[#7f9b74]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="vcf"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4"
              >
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
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                    dragActive ? "border-[#7f9b74] bg-[#eef5ea]" : "border-[#bfd0c2] bg-[#f7fbf8]"
                  }`}
                >
                  <UploadCloud className="mb-2 text-[#6f8f64]" size={28} />
                  <p className="text-sm text-[#4d607a]">Drop VCF here or click to browse</p>
                  <p className="mt-1 text-xs text-[#7b8ca6]">.vcf or .txt</p>
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
              </motion.div>
            )}
          </AnimatePresence>

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
              className="rounded-full bg-gradient-to-r from-[#6f8f64] to-[#9bb08f] px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </motion.button>

            <button
              onClick={resetAll}
              className="rounded-full border border-[#dbe5de] bg-white px-6 py-3 text-sm font-medium text-[#4d607a] hover:border-[#9db28f]"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#173156]">Clinical Result</h3>
            <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskTone}`}>
              Risk: {result.riskLevel}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <ResultRow label="Gene" value={result.gene} />
            <ResultRow label="Diplotype" value={result.diplotype} />
            <ResultRow label="Phenotype" value={result.phenotype} />
            <ResultRow label="Recommendation" value={result.recommendation} wrap />
            <ResultRow label="Evidence" value={result.evidence} />
            <ResultRow label="Variants Parsed" value={String(result.variantCount)} />
            <ResultRow label="AI Explanation" value={result.explanation} wrap />
          </div>
        </div>
      </div>
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

function ResultRow({ label, value, wrap = false }) {
  return (
    <div className="rounded-xl border border-[#dbe5de] bg-white p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-[#90a0b7]">{label}</p>
      <p className={`mt-1 text-[#3d5170] ${wrap ? "leading-relaxed" : ""}`}>{value}</p>
    </div>
  );
}
