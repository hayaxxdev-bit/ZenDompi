import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    phoneNumber?: string;
    telegramId?: number;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phoneNumber?: string;
      telegramId?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phoneNumber?: string;
    telegramId?: number | null;
  }
}