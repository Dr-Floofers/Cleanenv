import chalk from "chalk"
import { AuditResult } from "./audit.js"

export function report(result: AuditResult, envFile: string, exampleFile: string, fallback: boolean) {
  const header = chalk.blueBright(envFile) + chalk.dim(" vs ") + chalk.dim(exampleFile)
  const fallbackTag = fallback ? chalk.yellow(" (fallback)") : ""
  console.log(header + fallbackTag)

  if (result.missing.length) {
    console.log(chalk.dim("  ├─ ") + chalk.yellow("missing  ") + chalk.white(result.missing.join(", ")))
  }

  if (result.empty.length) {
    console.log(chalk.dim("  ├─ ") + chalk.yellow("empty    ") + chalk.white(result.empty.join(", ")))
  }

  if (result.unused.length) {
    console.log(chalk.dim("  ├─ ") + chalk.red("unused   ") + chalk.white(result.unused.join(", ")))
  }

  const isClean = !result.missing.length && !result.empty.length && !result.unused.length

  if (isClean) {
    console.log(chalk.dim("  └─ ") + chalk.green("ok"))
  } else if (result.ok.length) {
    console.log(chalk.dim("  └─ ") + chalk.green("ok       ") + chalk.dim(result.ok.join(", ")))
  } else {
    console.log(chalk.dim("  └─ ") + chalk.dim("none ok"))
  }

  console.log()
}

export function summary(totalClean: number, totalWarnings: number, totalErrors: number) {
  console.log(chalk.dim("─".repeat(40)))
  console.log(
    chalk.dim("summary  ") +
    chalk.greenBright(`${totalClean} clean`) + "   " +
    chalk.yellowBright(`${totalWarnings} warnings`) + "   " +
    chalk.redBright(`${totalErrors} errors`)
  )
  console.log()
}