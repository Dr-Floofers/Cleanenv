import chalk from "chalk"
import * as path from "path"
import * as readline from "readline"
import { audit, AuditResult } from "./audit.js"
import { report, summary } from "./reporter.js"
import { discoverPairs } from "./discovery.js"
import { fix } from "./fixer.js"

interface PairAudit {
  envPath: string
  examplePath: string
  envFile: string
  result: AuditResult
}

const cwd = process.cwd()

console.log(chalk.dim("\n  scanning project..."))

const pairs = discoverPairs(cwd)

if (pairs.length === 0) {
  console.log(chalk.redBright("\n  No .env files found in " + cwd))
  console.log(chalk.dim("  Make sure you're running cleanenv from your project root\n"))
  process.exit(1)
}

console.log(chalk.dim(`  found ${pairs.length} env file(s)\n`))

let totalClean = 0
let totalWarnings = 0
let totalErrors = 0

const fixable: PairAudit[] = []
const allEmpty: string[] = []

for (const pair of pairs) {
  if (!pair.exampleFile) {
    console.log(chalk.red(`  x  ${pair.envFile}`) + chalk.dim(" — no example file found, skipping\n"))
    totalErrors++
    continue
  }

  const envPath = path.join(cwd, pair.envFile)
  const examplePath = path.join(cwd, pair.exampleFile)
  const result = audit(envPath, examplePath)

  const isClean = !result.missing.length && !result.empty.length && !result.unused.length
  if (isClean) totalClean++
  totalWarnings += result.missing.length + result.empty.length
  totalErrors += result.unused.length

  report(result, pair.envFile, pair.exampleFile, pair.fallback)

  if (result.missing.length || result.unused.length) {
    fixable.push({ envPath, examplePath, envFile: pair.envFile, result })
  }
  allEmpty.push(...result.empty)
}

summary(totalClean, totalWarnings, totalErrors)

if (fixable.length === 0) process.exit(0)

const totalMissing = fixable.reduce((n, p) => n + p.result.missing.length, 0)
const totalUnused = fixable.reduce((n, p) => n + p.result.unused.length, 0)
const autoCount = totalMissing + totalUnused
const parts = [
  totalMissing && `${totalMissing} missing`,
  totalUnused && `${totalUnused} unused`,
].filter(Boolean).join(", ")

console.log(chalk.dim(`  ${autoCount} issue${autoCount !== 1 ? "s" : ""} can be fixed automatically (${parts})`))

if (allEmpty.length) {
  console.log(chalk.dim(`  ${allEmpty.length} issue${allEmpty.length !== 1 ? "s" : ""} need${allEmpty.length === 1 ? "s" : ""} manual attention: empty values (${allEmpty.join(", ")})`))
}

console.log()
console.log(chalk.yellow("  !  This will write to your .env files."))

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const answer = await new Promise<string>(resolve => {
  rl.question(chalk.dim("  Fix automatically? (Y/n) › "), resolve)
})
rl.close()

if (!["y", "yes"].includes(answer.trim().toLowerCase()) && answer.trim() !== "") {
  console.log()
  process.exit(0)
}

console.log()

for (const { envPath, examplePath, envFile, result } of fixable) {
  const fixResult = fix(envPath, examplePath, result)
  const segments: string[] = []

  if (fixResult.added.length) {
    const keys = fixResult.added.map(({ key, value }) => `${key}=${value}`).join(", ")
    segments.push(`added ${keys} (placeholder — fill in your real value)`)
  }
  if (fixResult.removed.length) {
    segments.push(`removed ${fixResult.removed.join(", ")}`)
  }

  console.log(chalk.green("  +  ") + chalk.blueBright(envFile) + chalk.dim(" — " + segments.join(", ")))
}

console.log()
