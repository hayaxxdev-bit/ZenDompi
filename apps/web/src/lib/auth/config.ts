import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { generateOTP, storeOTP, verifyOTP } from "./otp-store";
import {
  sendTelegramMessage,
  formatOTPMessage,
  formatWelcomeMessage,
} from "@/lib/telegram/bot";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login?error=true",
    newUser: "/profile",
  },

  providers: [
    Credentials({
      id: "telegram-otp",
      name: "OTP via Telegram",
      credentials: {
        telegramId: { label: "Telegram ID", type: "text" },
        otp: { label: "Kode OTP", type: "text" },
        loginCode: { label: "Login Code", type: "text" },
      },
      async authorize(credentials) {
        console.log("🔍 AUTHORIZE CALLED");
        console.log("  telegramId:", credentials?.telegramId);
        console.log("  otp:", credentials?.otp);
        console.log("  loginCode:", credentials?.loginCode);

        const telegramIdStr = credentials?.telegramId as string;
        const otpOrCode = credentials?.otp as string; // Bisa OTP atau loginCode
        const loginCode = credentials?.loginCode as string;

        if (!telegramIdStr || !otpOrCode) {
          throw new Error("Telegram ID dan kode diperlukan");
        }

        const telegramId = parseInt(telegramIdStr);
        if (isNaN(telegramId) || telegramId <= 0) {
          throw new Error("Telegram ID tidak valid");
        }

        // ═══════════════════════════════════════
        // CEK DULU: Apakah ini LOGIN CODE?
        // (loginCode dikirim sebagai otp dari frontend)
        // ═══════════════════════════════════════
        const { prisma } = await import("@zendompi/database");

        const session = await prisma.loginSession.findFirst({
          where: {
            code: otpOrCode, // ← CEK otpOrCode sebagai kode login
            telegramId: BigInt(telegramId),
            status: "verified",
            expiresAt: { gt: new Date() },
          },
        });

        if (session) {
          // ── MODE: LOGIN CODE ──
          console.log("🔑 MODE: Login Code (via otp field)");

          // Hapus session (one-time use)
          await prisma.loginSession.delete({ where: { id: session.id } });

          // Cari atau buat user
          let user = await prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
          });

          if (!user) {
            console.log("  Creating new user...");
            let name = `User ${telegramId.toString().slice(-4)}`;
            try {
              const { getBot } = await import("@/lib/telegram/bot");
              const bot = getBot();
              const chat = await bot.api.getChat(telegramId);
              name =
                [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
                name;
            } catch {}

            user = await prisma.user.create({
              data: { telegramId: BigInt(telegramId), name },
            });

            await prisma.wallet.createMany({
              data: [
                {
                  userId: user.id,
                  name: "Cash",
                  type: "cash",
                  initialBalance: 0,
                },
              ],
            });

            await prisma.category.createMany({
              data: [
                {
                  userId: user.id,
                  name: "Makanan",
                  type: "expense",
                  icon: "🍔",
                },
                {
                  userId: user.id,
                  name: "Transport",
                  type: "expense",
                  icon: "🚗",
                },
                {
                  userId: user.id,
                  name: "Belanja",
                  type: "expense",
                  icon: "🛍️",
                },
                {
                  userId: user.id,
                  name: "Hiburan",
                  type: "expense",
                  icon: "🎮",
                },
                { userId: user.id, name: "Gaji", type: "income", icon: "💼" },
                {
                  userId: user.id,
                  name: "Top Up",
                  type: "transfer",
                  icon: "🔄",
                },
              ],
            });

            try {
              await sendTelegramMessage(
                telegramId,
                formatWelcomeMessage(user.name || name),
              );
            } catch {}
          }

          console.log("✅ LOGIN CODE SUCCESS:", user.id);
          return {
            id: user.id,
            name: user.name,
            telegramId: Number(user.telegramId),
          };
        }

        // ═══════════════════════════════════════
        // MODE: OTP (fallback)
        // ═══════════════════════════════════════
        console.log("🔐 MODE: OTP");

        const isValid = await verifyOTP(telegramId, otpOrCode);
        if (!isValid) {
          console.error("❌ Invalid OTP");
          throw new Error("Kode OTP tidak valid atau sudah kadaluarsa");
        }

        let user = await prisma.user.findUnique({
          where: { telegramId: BigInt(telegramId) },
        });

        if (!user) {
          console.log("  Creating new user...");
          let name = `User ${telegramId.toString().slice(-4)}`;
          try {
            const { getBot } = await import("@/lib/telegram/bot");
            const bot = getBot();
            const chat = await bot.api.getChat(telegramId);
            name =
              [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
              name;
          } catch {}

          user = await prisma.user.create({
            data: { telegramId: BigInt(telegramId), name },
          });

          await prisma.wallet.createMany({
            data: [
              {
                userId: user.id,
                name: "Cash",
                type: "cash",
                initialBalance: 0,
              },
            ],
          });

          await prisma.category.createMany({
            data: [
              { userId: user.id, name: "Makanan", type: "expense", icon: "🍔" },
              {
                userId: user.id,
                name: "Transport",
                type: "expense",
                icon: "🚗",
              },
              { userId: user.id, name: "Belanja", type: "expense", icon: "🛍️" },
              { userId: user.id, name: "Hiburan", type: "expense", icon: "🎮" },
              { userId: user.id, name: "Gaji", type: "income", icon: "💼" },
              { userId: user.id, name: "Top Up", type: "transfer", icon: "🔄" },
            ],
          });

          try {
            await sendTelegramMessage(
              telegramId,
              formatWelcomeMessage(user.name || name),
            );
          } catch {}
        }

        console.log("✅ OTP SUCCESS:", user.id);
        return {
          id: user.id,
          name: user.name,
          telegramId: Number(user.telegramId),
        };
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      const publicRoutes = [
        "/login",
        "/register",
        "/api/auth",
        "/api/webhook",
        "/api/health",
      ];

      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
      ) {
        return true;
      }

      if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return true;
      }

      return !!auth;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.telegramId = (user as any).telegramId;
        token.phoneNumber = (user as any).phoneNumber;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).telegramId = token.telegramId;
        (session.user as any).phoneNumber = token.phoneNumber;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export { generateOTP, storeOTP, verifyOTP };
