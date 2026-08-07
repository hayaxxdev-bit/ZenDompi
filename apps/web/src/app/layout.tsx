import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZenDompi - Smart Financial Companion",
  description: "Kelola keuangan pribadi dengan mudah lewat AI, Telegram, dan WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
