import type { LogMessage } from "../types";
export const prettyTransport = (log: LogMessage) => {
  console.log(`✨ [${log.level.toUpperCase()}] ${log.message}`);
};
