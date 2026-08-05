import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZenDompi - Webhook Bot",
  description: "Webhook handler untuk Telegram & WhatsApp bot ZenDompi",
};

/**
 * Root Layout untuk Webhook Bot
 * 
 * App ini 99% API routes, jadi layout sangat minimal.
 * Halaman root hanya untuk health check / status.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="id">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#0a0a0a",
        color: "#fafafa"
      }}>
        {children}
      </body>
    </html>
  );
}