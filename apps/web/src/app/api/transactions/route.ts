import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@zendompi/database";
import { Prisma } from "@prisma/client";

/**
 * GET /api/transactions
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20)
 * - type: "income" | "expense" | "transfer"
 * - walletId: string
 * - categoryId: string
 * - startDate: ISO string
 * - endDate: ISO string
 * - search: string (cari di description)
 * - sort: "newest" | "oldest" | "largest" | "smallest"
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;

    // Parse query params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const type = searchParams.get("type") as "income" | "expense" | "transfer" | null;
    const walletId = searchParams.get("walletId");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(startDate && {
        transactionDate: {
          gte: new Date(startDate),
        },
      }),
      ...(endDate && {
        transactionDate: {
          ...((startDate && { gte: new Date(startDate) }) as any),
          lte: new Date(endDate),
        },
      }),
      ...(search && {
        description: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    // Filter by wallet (via ledgerEntries)
    let walletFilter: Prisma.TransactionWhereInput = {};
    if (walletId) {
      walletFilter = {
        ledgerEntries: {
          some: {
            walletId,
          },
        },
      };
    }

    const finalWhere: Prisma.TransactionWhereInput = {
      ...where,
      ...walletFilter,
    };

    // Build orderBy
    let orderBy: Prisma.TransactionOrderByWithRelationInput = {};
    switch (sort) {
      case "oldest":
        orderBy = { transactionDate: "asc" };
        break;
      case "largest":
        orderBy = { totalAmount: "desc" };
        break;
      case "smallest":
        orderBy = { totalAmount: "asc" };
        break;
      case "newest":
      default:
        orderBy = { transactionDate: "desc" };
        break;
    }

    // Get total count
    const total = await prisma.transaction.count({ where: finalWhere });

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: finalWhere,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        ledgerEntries: {
          include: {
            wallet: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });

    // Format response
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: tx.totalAmount.toNumber(),
      date: tx.transactionDate.toISOString(),
      createdAt: tx.createdAt.toISOString(),
      category: tx.category
        ? { id: tx.category.id, name: tx.category.name, icon: tx.category.icon }
        : null,
      entries: tx.ledgerEntries.map((entry) => ({
        id: entry.id,
        walletId: entry.walletId,
        walletName: entry.wallet.name,
        walletType: entry.wallet.type,
        accountType: entry.accountType,
        amount: entry.amount.toNumber(),
      })),
      // Ringkasan wallet untuk display
      wallets: tx.ledgerEntries.map((e) => e.wallet.name).join(" → "),
    }));

    return NextResponse.json({
      data: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Buat transaksi baru
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, description, walletId, toWalletId, categoryId, transactionDate } = body;

    // Validasi
    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Data transaksi tidak valid" },
        { status: 400 }
      );
    }

    const { createTransaction, transferBetweenWallets } = await import("@zendompi/database");

    let result;

    if (type === "transfer") {
      if (!walletId || !toWalletId) {
        return NextResponse.json(
          { error: "Transfer membutuhkan wallet sumber dan tujuan" },
          { status: 400 }
        );
      }
      result = await transferBetweenWallets({
        userId: session.user.id,
        fromWalletId: walletId,
        toWalletId,
        amount: parseFloat(amount),
        description: description || "",
        categoryId: categoryId || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      });
    } else {
      if (!walletId) {
        return NextResponse.json(
          { error: "Wallet diperlukan" },
          { status: 400 }
        );
      }
      result = await createTransaction({
        userId: session.user.id,
        walletId,
        type: type as "income" | "expense",
        amount: parseFloat(amount),
        description: description || "",
        categoryId: categoryId || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat transaksi" },
      { status: 500 }
    );
  }
}