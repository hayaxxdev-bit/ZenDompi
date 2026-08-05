import { NextResponse } from "next/server";
import { prisma } from "@zendompi/database";

/**
 * METHOD GET: 
 * Dipanggil secara berkala (polling) oleh Web Browser untuk mengecek status
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID tidak ditemukan" }, { status: 400 });
    }

    const session = await prisma.loginSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah sudah kadaluarsa
    if (new Date() > session.expiresAt) {
      return NextResponse.json({ error: "Waktu login habis" }, { status: 400 });
    }

    return NextResponse.json({
      verified: session.status === "verified",
      telegramId: session.telegramId ? session.telegramId.toString() : null,
    });
  } catch (error) {
    console.error("Verify GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * METHOD POST:
 * Dipanggil oleh Telegram Bot saat user mengirim perintah "/login [kode]"
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, telegramId } = body;

    if (!code || !telegramId) {
      return NextResponse.json({ error: "Code dan Telegram ID wajib dikirim" }, { status: 400 });
    }

    // Cari session di database yang kodenya cocok, statusnya pending, dan belum expired
    const session = await prisma.loginSession.findFirst({
      where: {
        code: code.toString(),
        status: "pending",
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Kode tidak valid atau sudah kadaluarsa" }, { status: 404 });
    }

    // Update status sesi menjadi verified dan simpan Telegram ID milik user
    await prisma.loginSession.update({
      where: { id: session.id },
      data: {
        status: "verified",
        telegramId: BigInt(telegramId),
      },
    });

    return NextResponse.json({ success: true, message: "Berhasil diverifikasi" });
  } catch (error) {
    console.error("Verify POST Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}