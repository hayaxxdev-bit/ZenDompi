import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ZenDompi - Smart Finance Tracker",
  description: "Kelola keuanganmu dengan mudah via chat atau manual",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <SessionProvider>
          {/* Loading screen akan muncul di sini saat auth check */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}