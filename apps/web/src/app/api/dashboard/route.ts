import { NextResponse } from "next/server";
import { prisma, getNetWorth, getWalletBalance } from "@zendompi/database";
import { auth } from "@/lib/auth";

/**
 * GET /api/dashboard
 *
 * Mengembalikan semua data dashboard berdasarkan user yang sedang login.
 */
export async function GET() {
  try {
    // Ambil session dari Auth.js
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ─── 1. Net Worth ────────────────────────
    const netWorth = await getNetWorth(userId);

    // ─── 2. Wallets with Balance ─────────────
    const wallets = await prisma.wallet.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const walletsWithBalance = await Promise.all(
      wallets.map(async (wallet) => {
        const balance = await getWalletBalance(wallet.id);

        return {
          id: wallet.id,
          name: wallet.name,
          type: wallet.type,
          balance,
          percentage: netWorth > 0 ? (balance / netWorth) * 100 : 0,
        };
      }),
    );

    // ─── 3. Recent Transactions ──────────────
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        ledgerEntries: {
          include: {
            wallet: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const transactionItems = recentTransactions.map((tx) => {
      const firstEntry = tx.ledgerEntries[0];

      return {
        id: tx.id,
        type: tx.type as "income" | "expense" | "transfer",
        description: tx.description,
        amount: tx.totalAmount.toNumber(),
        walletName: firstEntry?.wallet.name,
        categoryName: tx.category?.name,
        categoryIcon: tx.category?.icon,
        date: tx.createdAt.toISOString(),
      };
    });

    // ─── 4. Expense by Category ──────────────
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "expense",
        createdAt: {
          gte: startOfMonth,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });

    const categoryMap = new Map<
      string,
      {
        name: string;
        icon: string;
        amount: number;
      }
    >();

    let totalExpense = 0;

    for (const tx of expenseTransactions) {
      const name = tx.category?.name ?? "Lainnya";
      const icon = tx.category?.icon ?? "📌";
      const amount = tx.totalAmount.toNumber();

      totalExpense += amount;

      const existing = categoryMap.get(name);

      if (existing) {
        existing.amount += amount;
      } else {
        categoryMap.set(name, {
          name,
          icon,
          amount,
        });
      }
    }

    const expenseByCategory = Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        percentage:
          totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ─── 5. Monthly Summary ───────────────────
    const monthlyStats = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
        type: {
          in: ["income", "expense"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalIncome =
      monthlyStats
        .find((item) => item.type === "income")
        ?._sum.totalAmount?.toNumber() ?? 0;

    const totalExpenseMonth =
      monthlyStats
        .find((item) => item.type === "expense")
        ?._sum.totalAmount?.toNumber() ?? 0;

    const response = {
      netWorth,
      totalIncome,
      totalExpense: totalExpenseMonth,
      wallets: walletsWithBalance,
      recentTransactions: transactionItems,
      expenseByCategory,
    };

    console.log("DASHBOARD RESPONSE:");
    console.dir(response, { depth: null });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
