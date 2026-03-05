import { searchKnowledgeBase, generateLinkedInPost, checkGrammar, formatOutput } from "./tools.js";
import { reflectOnPost } from "./reflection.js";
import { evaluatePost } from "./evaluation.js";
import { callLLM } from "./llm.js";

type ToolCommand =
  | { tool: "search"; args: { query: string } }
  | { tool: "generate_post"; args: { goal: string } }
  | { tool: "check_grammar"; args: {} }
  | { tool: "format_output"; args: {} }
  | { tool: "finish"; args: { final?: string } };

function parseTool(jsonText: string): ToolCommand | null {
  try {
    // Try to extract first JSON object if the LLM returned extra text
    const match = jsonText.match(/\{[\s\S]*\}/);
    const candidate = match ? match[0] : jsonText;
    const obj = JSON.parse(candidate);
    if (obj && typeof obj.tool === "string" && obj.args) return obj as ToolCommand;
  } catch {}
  return null;
}

async function chooseNextTool(state: { goal: string; context: string; draft: string; formattedCount: number; grammarChecked: boolean }): Promise<ToolCommand | null> {
  const prompt = `You are orchestrating tools to achieve a goal. Choose exactly one tool to run next and return a JSON like {"tool":"search","args":{"query":"..."}}.
Available tools:
- search: args { "query": string } -> retrieves relevant knowledge
- generate_post: args { "goal": string } -> generates a draft using current context
- check_grammar: args {} -> fixes grammar of current draft
- format_output: args {} -> formats draft into a 5–7 sentence LinkedIn post
- finish: args { "final": string } -> finish if the draft is ready
Decision rules:
- If no draft exists, prefer generate_post (search first if no context).
- After generate_post, run check_grammar once, then format_output once.
- Do not call format_output more than once; then finish.
- If a well-formed draft exists (5–7 sentences, professional tone, Academy mentioned), finish.
State:
goal=${state.goal}
have_context=${state.context.length > 0}
have_draft=${state.draft.length > 0}
formatted_count=${state.formattedCount}
grammar_checked=${state.grammarChecked}
Return only the JSON.`;
  const raw = await callLLM(prompt);
  return parseTool(raw);
}

export async function runAgent(goal = "Generate a concise LinkedIn post about my agentic capstone and acknowledge Ciklum AI Academy.") {
  let context = "";
  let draft = "";
  let formattedCount = 0;
  let grammarChecked = false;
  let prevDraft = "";
  const normalize = (t: string) => t.trim().replace(/^[\"“”']+|[\"“”']+$/g, "");
  for (let step = 0; step < 6; step++) {
    console.log(`🧭 Planner step ${step + 1}...`);
    const cmd = await chooseNextTool({ goal, context, draft, formattedCount, grammarChecked });
    if (!cmd) break;
    console.log(`🔧 Chosen tool: ${cmd.tool}`);
    if (cmd.tool === "search") {
      console.log("🔎 Searching knowledge base...");
      context = await searchKnowledgeBase(cmd.args.query || goal, 4);
      continue;
    }
    if (cmd.tool === "generate_post") {
      console.log("🧠 Generating draft...");
      if (!context) context = await searchKnowledgeBase(goal, 4);
      draft = await generateLinkedInPost(context, goal);
      draft = normalize(draft);
      prevDraft = draft;
      grammarChecked = false;
      formattedCount = 0;
      continue;
    }
    if (cmd.tool === "check_grammar") {
      console.log("📝 Checking grammar...");
      if (draft) draft = await checkGrammar(draft);
      draft = normalize(draft);
      prevDraft = draft;
      grammarChecked = true;
      continue;
    }
    if (cmd.tool === "format_output") {
      console.log("🧱 Formatting output...");
      if (draft) {
        const formatted = await formatOutput(draft);
        const cleaned = normalize(formatted);
        if (cleaned !== normalize(draft)) {
          draft = cleaned;
          formattedCount += 1;
        } else {
          formattedCount = Math.max(formattedCount, 1);
        }
        prevDraft = draft;
      }
      continue;
    }
    if (cmd.tool === "finish") {
      console.log("✅ Finishing...");
      if (cmd.args.final && cmd.args.final.length > 0) draft = cmd.args.final;
      draft = normalize(draft);
      break;
    }
  }
  if (!draft) {
    console.log("🧠 Generating fallback draft...");
    if (!context) context = await searchKnowledgeBase(goal, 4);
    draft = await generateLinkedInPost(context, goal);
    draft = draft.trim();
  }
  console.log("🔁 Reflecting...");
  const improved = await reflectOnPost(draft);
  console.log("📊 Evaluating...");
  const evalStr = await evaluatePost(improved);
  let needsRetry = false;
  try {
    const obj = JSON.parse(evalStr);
    const scores = Object.values(obj).filter((x) => typeof x === "number") as number[];
    const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    needsRetry = avg < 7;
  } catch {
    needsRetry = true;
  }
  let finalPost = improved;
  let finalEval = evalStr;
  if (needsRetry) {
    console.log("🔄 Quality below threshold, regenerating...");
    const regen = await generateLinkedInPost(context || (await searchKnowledgeBase(goal, 4)), goal);
    const improved2 = await reflectOnPost(regen);
    finalPost = improved2;
    finalEval = await evaluatePost(finalPost);
  }

  return { improved: finalPost, score: finalEval };
}
