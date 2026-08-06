import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@zendompi/database";

/**
 * GET /api/transactions/:id
 * Detail transaksi dengan ledger entries
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        ledgerEntries: {
          include: {
            wallet: {
              select: { id: true, name: true, type: true, currency: true },
            },
          },
          orderBy: { accountType: "asc" },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Format response
    const formatted = {
      id: transaction.id,
      type: transaction.type,
      description: transaction.description,
      amount: transaction.totalAmount.toNumber(),
      date: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            icon: transaction.category.icon,
          }
        : null,
      entries: transaction.ledgerEntries.map((entry) => ({
        id: entry.id,
        walletId: entry.walletId,
        walletName: entry.wallet.name,
        walletType: entry.wallet.type,
        walletCurrency: entry.wallet.currency,
        accountType: entry.accountType,
        amount: entry.amount.toNumber(),
        label:
          entry.accountType === "debit"
            ? `Masuk ke ${entry.wallet.name}`
            : `Keluar dari ${entry.wallet.name}`,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get transaction detail error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail transaksi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/:id
 * Hapus transaksi (soft delete atau hard delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Cek kepemilikan
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus ledger entries dulu (cascade)
    await prisma.ledgerEntry.deleteMany({
      where: { transactionId: id },
    });

    // Hapus transaction
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}