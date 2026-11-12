// Builds an installable production zip: dist/guten-style-<version>.zip.
//
// 1. Builds fresh assets (tsc + vite) unless --skip-build is passed.
// 2. Copies only the runtime files (and the readable source) into build/<slug>/, a staging folder.
// 3. Runs `composer install --no-dev` inside the staging folder, so the zip gets a
//    production vendor/ while your working vendor/ (PHPUnit etc.) stays untouched.
// 4. Zips the staging folder and checks the archive has what WordPress needs.
//
// makeZip() is exported, so an add-on can package itself the same way.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')

/** GutenStyle's package. */
export const FREE_PLAN = {
  build: { args: ['build'], command: 'pnpm', cwd: ROOT },
  forbidden: ['.env', 'node_modules/', 'tests/', 'vendor/phpunit/'],
  required: ['guten-style.php', 'readme.txt', 'backend/bootstrap.php', 'schema/blocks.json', 'assets/admin.js', 'assets/editor.js', 'vendor/autoload.php'],
  runtime: ['guten-style.php', 'readme.txt', 'backend', 'schema', 'assets', 'languages', 'composer.json', 'composer.lock'],
  // WordPress.org asks for the readable source next to the built files. Tests are left out.
  sourceFiles: ['frontend/src', 'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.mjs', 'postcss.config.mjs', 'scripts/build.mjs'],
  slug: 'guten-style',
  source: ROOT,
  dist: path.join(ROOT, 'dist')
}

const step = message => console.log(`\n▸ ${message}`)

/**
 * Builds, stages, zips and checks one plugin.
 *
 * @param {typeof FREE_PLAN} plan what to package
 * @param {{ skipBuild?: boolean }} options
 * @returns {string} the zip's path
 */
export function makeZip(plan, { skipBuild = false } = {}) {
  const run = (command, args, cwd = plan.source) => execFileSync(command, args, { cwd, stdio: 'inherit' })
  const stageRoot = path.join(plan.source, 'build')
  const stage = path.join(stageRoot, plan.slug)
  const mainFile = `${plan.slug}.php`
  const version = /^\s*\*\s*Version:\s*(\S+)/m.exec(readFileSync(path.join(plan.source, mainFile), 'utf8'))?.[1]
  if (!version) throw new Error(`Could not read "Version:" from the ${mainFile} plugin header.`)

  if (!skipBuild) {
    step('Building assets')
    run(plan.build.command, plan.build.args, plan.build.cwd)
  }

  if (!existsSync(path.join(plan.source, 'assets', 'admin.js'))) {
    throw new Error('assets/ is missing. Run without --skip-build.')
  }

  step(`Staging ${plan.slug} ${version}`)
  rmSync(stageRoot, { force: true, recursive: true })
  mkdirSync(stage, { recursive: true })
  for (const item of plan.runtime) {
    const source = path.join(plan.source, item)
    if (existsSync(source)) cpSync(source, path.join(stage, item), { recursive: true })
  }

  const skippedSource = /\.test\.[a-z]+$/
  for (const item of plan.sourceFiles ?? []) {
    const source = path.join(plan.source, item)
    if (existsSync(source)) {
      cpSync(source, path.join(stage, item), { filter: file => !skippedSource.test(path.basename(file)), recursive: true })
    }
  }

  step('Installing production PHP dependencies (no dev packages)')
  run('composer', ['install', '--no-dev', '--optimize-autoloader', '--no-interaction', '--no-progress', '--quiet'], stage)
  rmSync(path.join(stage, 'composer.json'))
  rmSync(path.join(stage, 'composer.lock'))

  step('Creating zip')
  mkdirSync(plan.dist, { recursive: true })
  const zipPath = path.join(plan.dist, `${plan.slug}-${version}.zip`)
  rmSync(zipPath, { force: true })
  run('zip', ['-rqX', zipPath, plan.slug, '-x', '*.DS_Store', '*/.git/*', '*/.github/*'], stageRoot)

  step('Checking the zip')
  const entries = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).split('\n')
  const missing = plan.required.filter(file => !entries.includes(`${plan.slug}/${file}`))
  const leaked = entries.filter(entry =>
    plan.forbidden.some(bad => (bad instanceof RegExp ? bad.test(entry) : entry.startsWith(`${plan.slug}/${bad}`)))
  )
  if (missing.length > 0) throw new Error(`Zip is missing: ${missing.join(', ')}`)
  if (leaked.length > 0) throw new Error(`Zip contains files that must not ship: ${leaked.slice(0, 5).join(', ')}`)
  run('php', ['-l', path.join(stage, mainFile)])

  rmSync(stageRoot, { force: true, recursive: true })

  const sizeMb = (statSync(zipPath).size / 1024 / 1024).toFixed(2)
  console.log(`\n✓ ${zipPath} (${sizeMb} MB, ${entries.filter(Boolean).length} files)`)
  return zipPath
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  makeZip(FREE_PLAN, { skipBuild: process.argv.includes('--skip-build') })
}
