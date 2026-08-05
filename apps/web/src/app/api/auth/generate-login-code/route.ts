import { NextResponse } from "next/server";
import { prisma } from "@zendompi/database";

export async function POST() {
  try {
    // Generate kode unik 6 digit
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Pastikan kode benar-benar unik atau buat retry mechanism singkat jika bentrok
    // Simpan ke database dengan waktu kadaluarsa 3 menit dari sekarang
    const session = await prisma.loginSession.create({
      data: {
        code,
        status: "pending",
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
      },
    });

    // Bersihkan sesi lama yang sudah kadaluarsa agar database tetap bersih
    await prisma.loginSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      code: session.code,
    });
  } catch (error) {
    console.error("Generate login code error:", error);
    return NextResponse.json(
      { error: "Gagal generate kode login" },
      { status: 500 }
    );
  }
}