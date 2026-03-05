import { callLLM } from "./llm.js";
import { retrieveRelevant } from "./rag.js";

export async function searchKnowledgeBase(query: string, k = 4) {
  return retrieveRelevant(query, k);
}

export async function generateLinkedInPost(context: string, goal: string) {
  const prompt = `Using the context delimited by triple quotes, write a professional LinkedIn post that satisfies the goal.
Context:
"""
${context}
"""
Goal:
${goal}
Requirements:
- 5 to 7 sentences
- Professional, concise tone
- Include Ciklum AI Academy when relevant
- Avoid bullet points
Return only the post without surrounding quotes.`;
  return callLLM(prompt);
}

export async function checkGrammar(text: string) {
  const prompt = `Fix grammar, spelling, and minor style issues in the text. Preserve meaning. Return only the corrected text.
Text:
${text}`;
  return callLLM(prompt);
}

export async function formatOutput(text: string) {
  const prompt = `Rewrite the text to be a 5–7 sentence LinkedIn post with a professional, concise tone and a clear mention of Ciklum AI Academy. No bullet points. Return only the post without surrounding quotes.
Text:
${text}`;
  return callLLM(prompt);
}
