import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getWalletBalance } from "@zendompi/database";

/**
 * GET /api/wallets
 * Ambil semua wallet user + saldo
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id, isArchived: false },
      orderBy: { createdAt: "asc" },
    });

    const walletsWithBalance = await Promise.all(
      wallets.map(async (wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        currency: wallet.currency,
        balance: await getWalletBalance(wallet.id),
        createdAt: wallet.createdAt,
      }))
    );

    return NextResponse.json(walletsWithBalance);
  } catch (error) {
    console.error("Get wallets error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data wallet" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallets
 * Buat wallet baru
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, initialBalance } = await req.json();

    if (!name || name.length < 1) {
      return NextResponse.json(
        { error: "Nama wallet tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!["bank", "e-wallet", "cash"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe wallet tidak valid" },
        { status: 400 }
      );
    }

    // Cek duplikat nama
    const existing = await prisma.wallet.findFirst({
      where: { userId: session.user.id, name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Nama wallet sudah ada" },
        { status: 409 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        name,
        type,
        initialBalance: initialBalance || 0,
      },
    });

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error("Create wallet error:", error);
    return NextResponse.json(
      { error: "Gagal membuat wallet" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/wallets
 * Update wallet
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, isArchived } = await req.json();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isArchived !== undefined && { isArchived }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update wallet error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate wallet" },
      { status: 500 }
    );
  }
}