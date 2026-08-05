import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@zendompi/database";
import { generateOTP, storeOTP } from "@/lib/auth/config";
import { checkOTPRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/register
 * 
 * Registrasi user baru via nomor WhatsApp
 * Body: { phoneNumber: string, name: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, name } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Validasi
    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Nama minimal 2 karakter" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkOTPRateLimit(phoneNumber, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    // Cek user existing
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Nomor WhatsApp sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Generate OTP untuk verifikasi
    const otp = generateOTP();
    await storeOTP(phoneNumber, otp);

    // Kirim OTP via WhatsApp (atau log di dev)
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        await fetch(
          `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phoneNumber,
              type: "text",
              text: {
                body: `🎉 *Selamat datang di ZenDompi!*\n\nHai ${name}, kode verifikasi kamu: *${otp}*\n\nBerlaku 5 menit. Masukkan kode ini untuk menyelesaikan pendaftaran.`,
              },
            }),
          }
        );
      } catch (waError) {
        console.error("WhatsApp send error:", waError);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`📱 [DEV] OTP Register untuk ${phoneNumber}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "Kode verifikasi telah dikirim via WhatsApp",
      expiresIn: 300,
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftar. Coba lagi nanti." },
      { status: 500 }
    );
  }
}