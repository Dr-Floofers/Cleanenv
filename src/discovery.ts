import * as fs from "fs"
import * as path from "path"

export interface EnvPair {
    envFile: string
    exampleFile: string
    fallback: boolean
}

function getExampleFiles(dir: string): Set<string> {
    const files = fs.readdirSync(dir)
    const examples = new Set<string>()

    for (const file of files) {
        if (file.startsWith(".env") && file.includes("example")) {
            examples.add(file)
        }
    }

    return examples
}

function findMatchingExample(envFile: string, examples: Set<string>): string | null {
  if (envFile === ".env") {
    return examples.has(".env.example") ? ".env.example" : null
  }

  const suffix = envFile.replace(/^\.env\.?/, "")

  const candidates = [
    `.env.${suffix}.example`,
    `.env.example.${suffix}`,
  ].filter(c => c !== ".env..example" && c !== ".env.example.")

  for (const candidate of candidates) {
    if (examples.has(candidate)) return candidate
  }

  return null
}
export function discoverPairs(dir: string): EnvPair[] {
    const files = fs.readdirSync(dir)
    const examples = getExampleFiles(dir)
    const hasFallback = examples.has(".env.example")
    const pairs: EnvPair[] = []

    for (const file of files) {
        if (!file.startsWith(".env")) continue
        if (file.includes("example")) continue
        if (file === ".envrc") continue

        const match = findMatchingExample(file, examples)

        if (match) {
            pairs.push({ envFile: file, exampleFile: match, fallback: false })
        } else if (hasFallback) {
            pairs.push({ envFile: file, exampleFile: ".env.example", fallback: true })
        } else {
            pairs.push({ envFile: file, exampleFile: "", fallback: false })
        }
    }

    return pairs
}