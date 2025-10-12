// Pure validation functions (no behavior change)
import { isValidApiKeyFormat } from "@/lib/openrouter";
import { ValidationResult } from "./types";

export function validateApiKey(key: string): ValidationResult {
  if (!key?.trim()) {
    return { ok: false, reason: "API key is required" };
  }
  if (!isValidApiKeyFormat(key)) {
    return { ok: false, reason: "Invalid API key format. OpenRouter keys start with 'sk-or-v1-'" };
  }
  return { ok: true };
}
