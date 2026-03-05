import "dotenv/config";
import { runAgent } from "./agent.js";
import { ensureOllamaReady } from "./llm.js";

async function main() {
  try {
    await ensureOllamaReady();
    const result = await runAgent();

    console.log("\n✨ Final Post:\n");
    console.log(result.improved);

    console.log("\n📊 Evaluation:\n");
    console.log(result.score);
  } catch (err: any) {
    console.error("❌ Agent failed:", err?.message || String(err));
    console.error("Troubleshooting:");
    console.error("- Ensure Ollama is running: ollama serve");
    console.error("- Pull models if missing: ollama pull llama3 && ollama pull nomic-embed-text");
    console.error("- Increase timeout and retries in .env, e.g.:");
    console.error("  OLLAMA_TIMEOUT_MS=300000");
    console.error("  OLLAMA_RETRIES=3");
    console.error("  OLLAMA_RETRY_DELAY_MS=4000");
    process.exit(1);
  }
}

main();
