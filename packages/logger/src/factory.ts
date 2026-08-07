import { Logger } from "./logger";
export function createLogger(context: string): Logger {
  return new Logger();
}
