/**
 * Node adapter for `defineCollection`'s `files`: the plain-fs counterpart of
 * the app's `import.meta.glob("../content/**\/*.md", { query: "?raw" })`.
 * Used by build scripts that run without Vite.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ContentFiles } from "./collection.ts";

/** Reads every `.md` file under `dir`; a missing directory yields `{}`. */
export async function readContentFiles(dir: string): Promise<ContentFiles> {
  let names: string[];

  try {
    names = await readdir(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }

  const markdownNames = names.filter((name) => name.endsWith(".md"));
  const sources = await Promise.all(
    markdownNames.map((name) => readFile(join(dir, name), "utf8")),
  );

  return Object.fromEntries(
    markdownNames.map((name, index) => [
      join(dir, name).split("\\").join("/"),
      sources[index],
    ]),
  );
}
