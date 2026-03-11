const PROD_FALLBACK_API = "https://pharmaguard-api-ut0x.onrender.com";

const host = typeof window !== "undefined" ? window.location.hostname : "";
const isLocalHost = host === "localhost" || host === "127.0.0.1";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost ? "http://127.0.0.1:8000" : PROD_FALLBACK_API);

async function apiFetch(path, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Request timeout after ${Math.round(timeoutMs / 1000)}s at ${API_BASE}.`);
    }
    throw new Error(`Network error: unable to reach API at ${API_BASE}.`);
  } finally {
    clearTimeout(timer);
  }
}

export async function checkApiHealth() {
  const res = await apiFetch("/api/health", {}, 10000);
  if (!res.ok) throw new Error("API unavailable");
  return res.json();
}

export async function analyzeFromJson({ drug, variants, mode = "doctor" }) {
  const res = await apiFetch(
    "/api/analyze/json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drug, variants, mode }),
    },
    45000
  );

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

  const res = await apiFetch(
    "/api/analyze/vcf",
    {
      method: "POST",
      body: form,
    },
    60000
  );

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
