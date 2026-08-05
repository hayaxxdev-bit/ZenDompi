// File: apps/web/src/lib/auth/login-store.ts

type LoginSession = {
  code: string;
  telegramId?: string;
  verified: boolean;
  expires: number;
};

// Menggunakan globalThis agar memori tidak ter-reset saat Next.js Fast Refresh di tahap dev
const globalForStore = globalThis as unknown as {
  loginSessions: Map<string, LoginSession>;
};

export const loginSessions = globalForStore.loginSessions || new Map<string, LoginSession>();

if (process.env.NODE_ENV !== "production") {
  globalForStore.loginSessions = loginSessions;
}