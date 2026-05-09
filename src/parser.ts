import * as fs from "fs"
import * as path from "path"

function parseValue(raw: string): string {
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }
  if (raw.startsWith("#")) return ""
  const commentIdx = raw.indexOf(" #")
  if (commentIdx !== -1) {
    return raw.slice(0, commentIdx).trim()
  }
  return raw
}

export function parseEnvFile(filePath: string): Map<string, string> {
  const fullPath = path.resolve(filePath)
  const result = new Map<string, string>()

  if (!fs.existsSync(fullPath)) {
    return result
  }

  const lines = fs.readFileSync(fullPath, "utf-8").split("\n")

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) continue

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue

    const rawKey = trimmed.slice(0, eqIndex).trim()
    const key = rawKey.startsWith("export ") ? rawKey.slice(7).trim() : rawKey
    const value = parseValue(trimmed.slice(eqIndex + 1).trim())

    result.set(key, value)
  }

  return result
}