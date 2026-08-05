import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

// QStash client untuk publish background job
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * Webhook endpoint untuk Telegram Bot
 * 
 * POST /api/webhook/telegram
 * 
 * Menerima update dari Telegram, lalu mendelegasikan pemrosesan
 * ke background job via QStash agar cepat balas 200.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram mengirim array of updates atau single update
    // via webhook, kita handle single update
    if (body.message?.text) {
      const chatId = body.message.chat.id;
      const messageText = body.message.text;
      const userName = body.message.from?.first_name || "User";

      // Kirim ke background job via QStash
      // Ini langsung balik, tidak nunggu AI selesai
      await qstash.publishJSON({
        url: `${process.env.VERCEL_URL || "http://localhost:3001"}/api/process`,
        body: {
          platform: "telegram",
          chatId,
          message: messageText,
          userName,
        },
        // Opsional: delay atau retry config
        retries: 1,
      });

      // Balas cepat — Telegram dapat response 200 < 1 detik
      return NextResponse.json({ ok: true });
    }

    // Untuk event non-message (callback_query, dll), abaikan atau handle terpisah
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/**
 * GET endpoint untuk verifikasi webhook Telegram
 * Dipanggil saat pertama kali set webhook
 */
export async function GET() {
  return NextResponse.json({
    status: "Webhook aktif",
    timestamp: new Date().toISOString(),
  });
}