import type { LogLevel } from "./types";

export class Logger {
  info(msg: string, meta?: Record<string, unknown>) {
    console.log(`[INFO] ${msg}`, meta ?? "");
  }
  error(msg: string, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${msg}`, meta ?? "");
  }
  warn(msg: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${msg}`, meta ?? "");
  }
}
