import react from '@vitejs/plugin-react'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Builds one entry at a time (GS_ENTRY=admin|editor) as an IIFE into assets/ (GS_OUT_DIR changes it).
 * An add-on can build the same app with its own modules: see overlay() below.
 * - admin: uses the React that WordPress ships (WordPress.org does not allow a bundled copy), and
 *   bundles antd, React Router and TanStack Query. Of the @wordpress packages, only the ones without
 *   components (i18n, api-fetch, dom-ready) stay external.
 * - editor: runs inside Gutenberg, so React and every @wordpress/* package map to the globals
 *   WordPress already loads (window.React, window.wp.components, …). A second React would break it.
 * Both run the React Compiler and target the React version WordPress ships (18).
 * Use `pnpm build` / `pnpm dev`, which run scripts/build.mjs for every entry.
 */
const ENTRIES = {
  admin: 'frontend/src/admin/main.tsx',
  editor: 'frontend/src/editor/index.tsx'
} as const

type Entry = keyof typeof ENTRIES

/** What the admin bundle takes from WordPress: React, and the @wordpress packages without components. */
const ADMIN_EXTERNALS = new Set([
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  '@wordpress/api-fetch',
  '@wordpress/dom-ready',
  '@wordpress/i18n'
])

const REACT_TARGET: Record<Entry, '18' | '19'> = { admin: '18', editor: '18' }

function wordpressGlobal(entry: Entry, id: string): string | undefined {
  if (entry === 'admin' && !ADMIN_EXTERNALS.has(id)) return undefined
  if (id === 'react') return 'React'
  if (id === 'react-dom' || id === 'react-dom/client') return 'ReactDOM'
  if (id === 'react/jsx-runtime') return 'ReactJSXRuntime'
  if (id.startsWith('@wordpress/')) {
    return `wp.${id.slice('@wordpress/'.length).replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())}`
  }
  return undefined
}

/** Marks a CSS url() that must resolve at runtime, next to the built CSS (e.g. fonts copied by scripts/build.mjs). */
const RUNTIME_URL_PREFIX = '/__gs_runtime__/'

function runtimeUrls(): Plugin {
  return {
    name: 'gs-runtime-urls',
    // Library mode writes the CSS file late, so the URLs are fixed on disk after writing.
    writeBundle(options) {
      const dir = options.dir ?? 'assets'
      for (const file of readdirSync(dir).filter(name => name.endsWith('.css'))) {
        const target = path.join(dir, file)
        writeFileSync(target, readFileSync(target, 'utf8').replaceAll(RUNTIME_URL_PREFIX, ''))
      }
    }
  }
}

const ROOT = import.meta.dirname
const SRC = path.join(ROOT, 'frontend', 'src') + path.sep

/** Lets an overlay module import the module it builds on, or any other module of this app: `@gs/shared/schema`. */
const SRC_ALIAS = '@gs'

/**
 * Overlay: with GS_OVERLAY_DIR set to a folder that mirrors frontend/src, an import that resolves to
 * frontend/src/<path> uses <GS_OVERLAY_DIR>/<path> when that file exists (.ts, .tsx or .css). This is
 * how Nomi Style Pro builds this app with its features. Off by default: the Nomi Style build reads
 * only this folder.
 */
function overlay(dir: string | undefined): Plugin {
  return {
    enforce: 'pre',
    name: 'gs-overlay',
    async resolveId(source, importer, options) {
      if (!dir || !importer) return null
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
      if (!resolved || resolved.external) return resolved
      const [file, query = ''] = resolved.id.split('?')
      if (!file.startsWith(SRC)) return resolved
      const relative = file.slice(SRC.length)
      const base = relative.replace(/\.(tsx?|css)$/, '')
      const candidates = relative.endsWith('.css') ? [`${base}.css`] : [`${base}.ts`, `${base}.tsx`]
      for (const candidate of candidates) {
        const replacement = path.join(dir, candidate)
        if (replacement !== importer && existsSync(replacement)) return query ? `${replacement}?${query}` : replacement
      }
      return resolved
    }
  }
}

/** Without an overlay, the build may only use this folder and its dependencies. */
function selfContained(overlayDir: string | undefined): Plugin {
  return {
    generateBundle(_options, bundle) {
      if (overlayDir) return
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const id of Object.keys(output.modules)) {
          const file = id.split('?')[0]
          if (path.isAbsolute(file) && !file.startsWith(ROOT + path.sep) && !file.includes(`${path.sep}node_modules${path.sep}`)) {
            this.error(`The Nomi Style build must not use files outside its folder: ${id}`)
          }
        }
      }
    },
    name: 'gs-self-contained'
  }
}

export default defineConfig(() => {
  const entry = (process.env.GS_ENTRY ?? 'admin') as Entry
  const overlayDir = process.env.GS_OVERLAY_DIR ? path.resolve(process.env.GS_OVERLAY_DIR) : undefined

  return {
    build: {
      emptyOutDir: false,
      lib: {
        cssFileName: entry,
        entry: path.resolve(import.meta.dirname, ENTRIES[entry]),
        fileName: () => `${entry}.js`,
        formats: ['iife'],
        name: `gutenStyle${entry.charAt(0).toUpperCase()}${entry.slice(1)}App`
      },
      outDir: process.env.GS_OUT_DIR ?? 'assets',
      rollupOptions: {
        external: (id: string) => wordpressGlobal(entry, id) !== undefined,
        output: { globals: (id: string) => wordpressGlobal(entry, id) ?? id }
      },
      target: 'es2020'
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production')
    },
    plugins: [
      react({
        babel: { plugins: [['babel-plugin-react-compiler', { target: REACT_TARGET[entry] }]] },
        jsxRuntime: 'automatic'
      }),
      overlay(overlayDir),
      tsconfigPaths(),
      runtimeUrls(),
      selfContained(overlayDir)
    ],
    // The dev server and tests may read the overlay folder, which is outside this one.
    server: overlayDir ? { fs: { allow: [ROOT, overlayDir] } } : undefined,
    resolve: {
      alias: { [SRC_ALIAS]: SRC.slice(0, -1) },
      // One React and one antd for this app and its overlay (an overlay folder may link node_modules).
      dedupe: ['react', 'react-dom', 'antd', '@tanstack/react-query']
    },
    test: {
      // With an overlay, only its tests run (Nomi Style's own tests expect the Nomi Style modules).
      dir: overlayDir ?? path.join(ROOT, 'frontend', 'src'),
      environment: 'happy-dom',
      globals: true,
      include: ['**/*.test.{tsx,ts}'],
      root: ROOT
    }
  }
})
