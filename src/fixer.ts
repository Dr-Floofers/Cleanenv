import * as fs from "fs"
import { AuditResult } from "./audit"
import { parseEnvFile } from "./parser"

export interface FixResult {
  added: { key: string; value: string }[]
  removed: string[]
}

function lineKey(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return null
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) return null
  const rawKey = trimmed.slice(0, eqIdx).trim()
  return rawKey.startsWith("export ") ? rawKey.slice(7).trim() : rawKey
}

export function fix(envPath: string, examplePath: string, result: AuditResult): FixResult {
  const exampleValues = parseEnvFile(examplePath)
  const unusedSet = new Set(result.unused)

  const lines = fs.readFileSync(envPath, "utf-8").split("\n")
  const kept = lines.filter(line => {
    const key = lineKey(line)
    return key === null || !unusedSet.has(key)
  })

  const added: FixResult["added"] = []
  for (const key of result.missing) {
    const value = exampleValues.get(key) ?? ""
    kept.push(`${key}=${value}`)
    added.push({ key, value })
  }

  fs.writeFileSync(envPath, kept.join("\n"), "utf-8")

  return { added, removed: result.unused }
}
