const { build } = require("esbuild");
const { join } = require("path");

// console.log(paths);

console.log("Bundling lambdas to ESM modules");

build({
  absWorkingDir: process.cwd(),
  bundle: true,
  logLevel: "info",
  entryPoints: ["./src/index.ts"],
  outdir: join(process.cwd(), "./lib/"),
  minify: false,
  format: "esm",
  target: "esnext",
  platform: "node",
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  outExtension: {
    ".js": ".mjs",
  },
}).catch(() => process.exit(1));
