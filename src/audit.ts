import { parseEnvFile } from "./parser"

export interface AuditResult {
  ok: string[]
  missing: string[]
  unused: string[]
  empty: string[]
}

export function audit(envPath: string, examplePath: string): AuditResult {
  const env = parseEnvFile(envPath)
  const example = parseEnvFile(examplePath)

  const result: AuditResult = {
    ok: [],
    missing: [],
    unused: [],
    empty: [],
  }

  for (const [key] of example) {
    if (!env.has(key)) {
      result.missing.push(key)
    } else if (env.get(key) === "") {
      result.empty.push(key)
    } else {
      result.ok.push(key)
    }
  }

  for (const [key] of env) {
    if (!example.has(key)) {
      result.unused.push(key)
    }
  }

  return result
}