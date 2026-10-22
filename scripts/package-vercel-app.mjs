// Prepare a standalone source upload from tracked apps/web files. Never copies .env.local.
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (!process.argv[2])
  throw Error("Provide a new output directory outside the repository");
const out = resolve(process.argv[2]);
if (!relative(root, out).startsWith(".."))
  throw Error("Output must be outside the repository");
await mkdir(out, { recursive: false });
const paths = execFileSync("git", ["ls-files", "-z", "apps/web"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
for (const path of paths) {
  if (/(^|\/)\.env/.test(path)) throw Error("Environment file rejected");
  const target = join(out, path.slice("apps/web/".length));
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(root, path), target);
}
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const monorepo = await readJson(join(root, "package.json"));
const manifest = await readJson(join(out, "package.json"));
if (
  Object.values({ ...manifest.dependencies, ...manifest.devDependencies }).some(
    (v) => v.startsWith("workspace:"),
  )
)
  throw Error("Workspace dependencies need an explicit packaging strategy");
manifest.engines = { node: "24.x" };
manifest.packageManager = monorepo.packageManager;
const added = [];
for (const name of ["typescript", "@types/node"])
  if (!manifest.devDependencies[name]) {
    manifest.devDependencies[name] = monorepo.devDependencies[name];
    added.push(name);
  }
await writeFile(
  join(out, "package.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
const config = await readJson(join(out, "tsconfig.json"));
config.extends = "./tsconfig.base.json";
await writeFile(
  join(out, "tsconfig.json"),
  JSON.stringify(config, null, 2) + "\n",
);
await copyFile(
  join(root, "tsconfig.base.json"),
  join(out, "tsconfig.base.json"),
);
const lock = await readFile(join(root, "pnpm-lock.yaml"), "utf8");
const match = lock.match(/^  apps\/web:\n(.*?)(?=^  [^ ]|^packages:)/ms);
if (!match || !match[1].includes("    devDependencies:"))
  throw Error("Unexpected lockfile layout");
let importer = match[1].trimEnd() + "\n";
for (const name of added) {
  const version = manifest.devDependencies[name];
  if (!/^\d+\.\d+\.\d+$/.test(version))
    throw Error("Pinned compiler version required");
  importer += `      '${name}':\n        specifier: ${version}\n        version: ${version}\n`;
}
await writeFile(
  join(out, "pnpm-lock.yaml"),
  lock.split("importers:\n")[0] +
    "importers:\n\n  .:\n" +
    importer +
    "\n" +
    lock.slice(lock.indexOf("\npackages:\n")),
);
const policy = await readFile(join(root, "pnpm-workspace.yaml"), "utf8");
await writeFile(
  join(out, "pnpm-workspace.yaml"),
  "packages: []\n" + policy.slice(policy.indexOf("allowBuilds:")),
);
await writeFile(
  join(out, "vercel.json"),
  JSON.stringify(
    {
      framework: "nextjs",
      buildCommand: "pnpm build",
      installCommand: "pnpm install --frozen-lockfile",
      regions: ["dub1"],
    },
    null,
    2,
  ) + "\n",
);
await writeFile(join(out, ".node-version"), "24\n");
console.log(
  JSON.stringify({
    directory: out,
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim(),
    trackedApplicationFiles: paths.length,
  }),
);
