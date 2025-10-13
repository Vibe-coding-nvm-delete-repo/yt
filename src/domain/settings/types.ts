// Re-export settings-related types (no changes to behavior)
export type {
  AppSettings,
  ValidationState,
  ModelState,
} from "@/types";

// Domain-specific types
export interface ValidationResult {
  ok: boolean;
  reason?: string;
}
