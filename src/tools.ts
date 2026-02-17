import { callLLM } from "./llm.js";

export async function generateLinkedInPost(context: string) {
  const prompt = `
You are an AI agent.

Using this project context:

${context}

Generate a professional 5-7 sentence LinkedIn post.
Mention Ciklum AI Academy.
Keep it concise and authentic.
`;

  return callLLM(prompt);
}
