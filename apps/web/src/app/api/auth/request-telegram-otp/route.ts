import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, hasValidOTP } from "@/lib/auth/otp-store";
import { getBot, formatOTPMessage } from "@/lib/telegram/bot";

/**
 * POST /api/auth/request-telegram-otp
 * 
 * Body: { telegramId: string }
 * 
 * Kirim OTP via Telegram Bot
 */
export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: "Telegram ID diperlukan" },
        { status: 400 }
      );
    }

    const id = parseInt(telegramId);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "Telegram ID tidak valid. Harus berupa angka positif." },
        { status: 400 }
      );
    }

    // Cek apakah masih ada OTP valid
    const hasOTP = await hasValidOTP(id);
    if (hasOTP) {
      return NextResponse.json(
        {
          error: "Kode OTP sudah dikirim sebelumnya. Cek chat Telegram kamu. Tunggu 5 menit untuk kirim ulang.",
          alreadySent: true,
        },
        { status: 429 }
      );
    }

    // Cek apakah user sudah pernah chat ke bot
    const bot = getBot();
    let canSendMessage = false;
    let userName = "User";

    try {
      const chat = await bot.api.getChat(id);
      canSendMessage = true;
      userName = [chat.first_name, chat.last_name]
        .filter(Boolean)
        .join(" ") || "User";
    } catch (error: any) {
      // 400 = chat not found (user belum pernah chat bot)
      if (error?.error_code === 400) {
        return NextResponse.json(
          {
            error:
              `Bot belum bisa mengirim pesan ke Telegram ID ${id}. Pastikan kamu sudah membuka @zendompi_bot dan mengirim pesan /start terlebih dahulu.`,
            needStart: true,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    if (!canSendMessage) {
      return NextResponse.json(
        {
          error: "Tidak bisa mengirim pesan ke Telegram ID ini.",
        },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Simpan OTP
    await storeOTP(id, otp);

    // Kirim OTP via Telegram
    try {
      await bot.api.sendMessage(id, formatOTPMessage(otp, userName), {
        parse_mode: "HTML",
      });
    } catch (sendError: any) {
      console.error("Send OTP error:", sendError);

      // Jika user blokir bot
      if (sendError?.error_code === 403) {
        return NextResponse.json(
          {
            error:
              "Bot tidak bisa mengirim pesan. Pastikan kamu tidak memblokir @zendompi_bot. Buka Telegram dan kirim /start ke bot.",
            needUnblock: true,
          },
          { status: 400 }
        );
      }

      throw sendError;
    }

    // Log di development
    if (process.env.NODE_ENV === "development") {
      console.log(`📱 [DEV] OTP untuk Telegram ID ${id} (${userName}): ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: `Kode OTP telah dikirim ke Telegram @${userName}. Cek chat dari @zendompi_bot.`,
      userName,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Request Telegram OTP error:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan server. Pastikan TELEGRAM_BOT_TOKEN sudah benar di .env.local",
      },
      { status: 500 }
    );
  }
}