import { callLLM } from "./llm.js";

export async function evaluatePost(post: string) {
  const prompt = `
Score this post from 1-10 for:
- Relevance
- Clarity
- Professional Tone
- Academy Mention

Return result in JSON format only.

Post:
${post}
`;

  return callLLM(prompt);
}
