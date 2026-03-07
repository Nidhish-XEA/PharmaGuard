const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkApiHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("API unavailable");
  return res.json();
}

export async function analyzeFromJson({ drug, variants, mode = "doctor" }) {
  const res = await fetch(`${API_BASE}/api/analyze/json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drug, variants, mode }),
  });

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.detail || "JSON analysis failed.");
  }

  return res.json();
}

export async function analyzeFromVcf({ file, drug, mode = "doctor" }) {
  const form = new FormData();
  form.append("file", file);
  form.append("drug", drug);
  form.append("mode", mode);

  const res = await fetch(`${API_BASE}/api/analyze/vcf`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.detail || "VCF analysis failed.");
  }

  return res.json();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
