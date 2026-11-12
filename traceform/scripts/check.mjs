// Syntax-checks the built app.js and every server file. Runs in CI on each pull request.
import { buildAppJs } from "./build.mjs";
import { writeFile, readdir, mkdtemp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const tmp = await mkdtemp(path.join(os.tmpdir(), "traceform-"));
const app = path.join(tmp, "app.js");
await writeFile(app, await buildAppJs());
const targets = [app, "server/server.mjs", "server/photos.mjs", "server/extract.mjs", "scripts/build.mjs", ...(await readdir("server/providers")).map(f => "server/providers/" + f)];
let failed = 0;
for (const f of targets) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { failed++; console.error(`✗ ${f}\n${e.stderr}`); }
}
if (failed) process.exit(1);
console.log(`✓ ${targets.length} files pass syntax check`);
