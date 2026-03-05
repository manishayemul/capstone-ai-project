function getTimeoutMs(): number {
  const v = process.env.OLLAMA_TIMEOUT_MS;
  if (!v) return 300000;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 300000;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function getRetries(): number {
  const v = process.env.OLLAMA_RETRIES;
  if (!v) return 2;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 2;
}

function getRetryDelayMs(): number {
  const v = process.env.OLLAMA_RETRY_DELAY_MS;
  if (!v) return 3000;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 3000;
}

async function withRetries<T>(fn: () => Promise<T>): Promise<T> {
  const retries = getRetries();
  const delayMs = getRetryDelayMs();
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

export async function callLLM(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3";
  const timeout = getTimeoutMs();
  const response = await withRetries(() =>
    fetchWithTimeout(
      `${baseUrl}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      },
      timeout
    )
  );
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`LLM request failed (${response.status}): ${msg}`);
  }
  const data = await response.json();
  if (!data || typeof data.response !== "string") {
    throw new Error("LLM response missing 'response' field");
  }
  return data.response;
}

export async function embed(text: string): Promise<number[]> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const embedModel = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
  const timeout = getTimeoutMs();
  const response = await withRetries(() =>
    fetchWithTimeout(
      `${baseUrl}/api/embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: embedModel,
          prompt: text,
        }),
      },
      timeout
    )
  );
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Embedding request failed (${response.status}): ${msg}`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.embedding)) {
    throw new Error("Embedding response missing 'embedding' array");
  }
  return data.embedding as number[];
}

export async function isOllamaReachable(): Promise<boolean> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  try {
    const res = await fetchWithTimeout(`${baseUrl}/api/tags`, { method: "GET" }, 5000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensureOllamaReady(): Promise<void> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3";
  const embedModel = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
  const reachable = await isOllamaReachable();
  if (!reachable) {
    throw new Error(`Cannot reach Ollama at ${baseUrl}. Start it with 'ollama serve'.`);
  }
  const res = await fetchWithTimeout(`${baseUrl}/api/tags`, { method: "GET" }, 5000);
  if (!res.ok) {
    throw new Error(`Failed to query Ollama tags at ${baseUrl}/api/tags`);
  }
  const data = await res.json();
  const names: string[] =
    Array.isArray(data?.models) ? data.models.map((m: any) => m?.name).filter((x: any) => typeof x === "string") : [];
  const missing: string[] = [];
  if (!names.some((n) => typeof n === "string" && n.startsWith(model))) missing.push(model);
  if (!names.some((n) => typeof n === "string" && n.startsWith(embedModel))) missing.push(embedModel);
  if (missing.length > 0) {
    throw new Error(`Missing Ollama models: ${missing.join(", ")}. Pull them with 'ollama pull ${missing.join("' and 'ollama pull ")}'.`);
  }
}
