import { callLLM } from "./llm.js";

export async function reflectOnPost(post: string) {
  const prompt = `
You are improving a LinkedIn post.

Here is the draft:

${post}

Your task:
- Ensure Ciklum AI Academy is clearly mentioned.
- Ensure tone is professional.
- Ensure clarity and conciseness.
- Keep it 5–7 sentences.

IMPORTANT:
Return ONLY the final improved LinkedIn post.
Do NOT explain your reasoning.
Do NOT evaluate.
Do NOT add bullet points.
`;

  return callLLM(prompt);
}
