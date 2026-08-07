import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/auth/config";
import { checkOTPRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkOTPRateLimit(phoneNumber, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.message,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { "Retry-After": String(rateLimit.retryAfter) }
            : {},
        }
      );
    }

    // Generate & store OTP
    const otp = generateOTP();
    await storeOTP(phoneNumber, otp);

    // Kirim via WhatsApp atau log ke console
    if (
      process.env.whatsapp_TOKEN &&
      process.env.whatsapp_PHONE_NUMBER_ID
    ) {
      try {
        await fetch(
          `https://graph.facebook.com/v21.0/${process.env.whatsapp_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.whatsapp_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phoneNumber,
              type: "text",
              text: {
                body: `🔐 *Kode OTP ZenDompi*\n\nKode verifikasi kamu: *${otp}*\n\nBerlaku 5 menit. Jangan berikan ke siapapun.`,
              },
            }),
          }
        );
      } catch (waError) {
        console.error("WhatsApp send error:", waError);
      }
    }

    // Development: log OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`📱 [DEV] OTP untuk ${phoneNumber}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "OTP telah dikirim",
      expiresIn: 300, // 5 menit
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim OTP. Coba lagi nanti." },
      { status: 500 }
    );
  }
}