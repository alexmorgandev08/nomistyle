// Builds the admin and editor bundles into assets/. Pass --watch to rebuild on change.
// GS_OUT_DIR and GS_OVERLAY_DIR (see vite.config.ts) let an add-on build the app with its own modules.
import { copyFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'

const ROOT = path.resolve(import.meta.dirname, '..')
const watch = process.argv.includes('--watch')
const outDir = path.resolve(ROOT, process.env.GS_OUT_DIR ?? 'assets')

process.env.GS_OUT_DIR = outDir
await rm(outDir, { force: true, recursive: true })

for (const entry of ['admin', 'editor']) {
  process.env.GS_ENTRY = entry
  await build({
    build: watch ? { minify: false, watch: {} } : {},
    configFile: path.join(ROOT, 'vite.config.ts'),
    root: ROOT,
    mode: watch ? 'development' : 'production'
  })
}

// Archivo ships as separate files so the CSS stays small and the font is cached once.
// Its SIL Open Font License must ship with it.
await mkdir(`${outDir}/fonts`, { recursive: true })
for (const file of ['archivo-latin.woff2', 'archivo-latin-ext.woff2', 'OFL.txt']) {
  await copyFile(path.join(ROOT, 'frontend/src/shared/fonts', file), `${outDir}/fonts/${file}`)
}
