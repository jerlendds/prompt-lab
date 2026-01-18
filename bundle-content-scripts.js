import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "esbuild"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname)

const entry = path.join(rootDir, "extension", "scripts", "legacy_hotkey.js")
const outfile = path.join(rootDir, "extension", "scripts", "legacy_hotkey.bundle.js")

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  sourcemap: false,
  minify: false,
  logLevel: "info",
})
