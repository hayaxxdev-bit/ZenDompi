export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}
