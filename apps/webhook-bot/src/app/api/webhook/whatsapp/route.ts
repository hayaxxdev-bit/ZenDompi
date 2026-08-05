import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * GET /api/webhook/whatsapp
 * 
 * Verifikasi webhook WhatsApp Cloud API
 * Meta akan mengirim challenge saat setup webhook
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("WhatsApp webhook verified!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

/**
 * POST /api/webhook/whatsapp
 * 
 * Menerima pesan masuk dari WhatsApp Cloud API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Cek apakah ini message dari user (bukan status update/delivery receipt)
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Nomor WA pengirim
      const userName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || "User";

      // Hanya proses text message
      if (message.text?.body) {
        const messageText = message.text.body;

        // Delegasi ke background job
        await qstash.publishJSON({
          url: `${process.env.VERCEL_URL || "http://localhost:3001"}/api/process`,
          body: {
            platform: "whatsapp",
            chatId: from,
            message: messageText,
            userName,
          },
          retries: 1,
        });
      }
    }

    // Selalu balas 200 OK ke Meta
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    // Tetap balas 200 agar Meta tidak retry berkali-kali
    return NextResponse.json({ ok: true });
  }
}