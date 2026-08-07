import type { LogMessage } from "../types";
export const consoleTransport = (log: LogMessage) => {
  console.log(`[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`);
};
