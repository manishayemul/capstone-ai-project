import fs from "fs";
import path from "path";
import { embed } from "./llm.js";

type Chunk = {
  id: string;
  text: string;
  embedding: number[] | null;
};

let indexBuilt = false;
let chunks: Chunk[] = [];

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...listFiles(p));
    } else if (e.isFile() && /\.(txt|md)$/i.test(e.name)) {
      files.push(p);
    }
  }
  return files;
}

function chunkText(text: string, size = 500, overlap = 100): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const result: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + size, clean.length);
    result.push(clean.slice(i, end));
    if (end === clean.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return result;
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

function norm(a: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function cosine(a: number[], b: number[]): number {
  const d = dot(a, b);
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return d / (na * nb);
}

async function buildIndex() {
  if (indexBuilt) return;
  const knowledgeDir = path.join("data", "knowledge");
  const files = listFiles(knowledgeDir);
  const targets = files.length > 0 ? files : [path.join("data", "project-context.txt")];
  const newChunks: Chunk[] = [];
  for (const f of targets) {
    if (!fs.existsSync(f)) continue;
    const content = fs.readFileSync(f, "utf-8");
    const parts = chunkText(content);
    for (let i = 0; i < parts.length; i++) {
      newChunks.push({ id: `${path.basename(f)}:${i}`, text: parts[i], embedding: null });
    }
  }
  for (let i = 0; i < newChunks.length; i++) {
    const v = await embed(newChunks[i].text);
    newChunks[i].embedding = v;
  }
  chunks = newChunks;
  indexBuilt = true;
}

export async function retrieveRelevant(query: string, topK = 4): Promise<string> {
  await buildIndex();
  const qv = await embed(query);
  const scored = chunks
    .filter((c) => Array.isArray(c.embedding))
    .map((c) => ({ c, s: cosine(qv, c.embedding as number[]) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topK)
    .map((x) => x.c.text);
  return scored.join("\n\n");
}
