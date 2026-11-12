// Builds the app.
//
//   node scripts/build.mjs          -> dist/ (static site: index.html, app.js, styles, images)
//   import { buildAppJs }           -> used by the dev server to rebuild app.js per request
//
// Why concatenate instead of ES modules? The files in src/js share globals (state `S`, `$`,
// render functions) and some later files deliberately override earlier functions
// (60-projects.js replaces load()/save()). Concatenating in filename order keeps that
// behavior exact. Moving to ES modules is a good first refactor; see CONTRIBUTING.md.

import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS_DIR = path.join(ROOT, "src", "js");

export async function buildAppJs() {
  const files = (await readdir(JS_DIR)).filter(f => f.endsWith(".js")).sort();
  const parts = await Promise.all(files.map(async f => `\n/* ===== src/js/${f} ===== */\n` + await readFile(path.join(JS_DIR, f), "utf8")));
  return parts.join("\n");
}

async function buildDist() {
  const out = path.join(ROOT, "dist");
  await rm(out, { recursive: true, force: true });
  await mkdir(path.join(out, "src", "styles"), { recursive: true });
  await writeFile(path.join(out, "app.js"), await buildAppJs());
  await cp(path.join(ROOT, "index.html"), path.join(out, "index.html"));
  await cp(path.join(ROOT, "src", "styles"), path.join(out, "src", "styles"), { recursive: true });
  await cp(path.join(ROOT, "public"), out, { recursive: true });
  console.log("Built dist/ (static; AI runs offline unless served by server/server.mjs)");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await buildDist();
