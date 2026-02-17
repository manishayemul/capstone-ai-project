import { runAgent } from "./agent.js";

async function main() {
  const result = await runAgent();

  console.log("\n✨ Final Post:\n");
  console.log(result.improved);

  console.log("\n📊 Evaluation:\n");
  console.log(result.score);
}

main();
