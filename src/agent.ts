import { retrieveRelevant } from "./rag.js";
import { generateLinkedInPost } from "./tools.js";
import { reflectOnPost } from "./reflection.js";
import { evaluatePost } from "./evaluation.js";

export async function runAgent() {
  console.log("🔎 Retrieving context...");
  const context = retrieveRelevant();

  console.log("🧠 Generating draft...");
  const draft = await generateLinkedInPost(context);

  console.log("🔁 Reflecting...");
  const improved = await reflectOnPost(draft);

  console.log("📊 Evaluating...");
  const score = await evaluatePost(improved);

  return { improved, score };
}
