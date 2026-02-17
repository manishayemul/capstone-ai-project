import fs from "fs";

export function retrieveRelevant(): string {
  return fs.readFileSync("data/project-context.txt", "utf-8");
}
