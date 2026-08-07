import { prisma } from "../client";
import { Prisma, TransactionType } from "@prisma/client";

export type TransactionFilter = {
  userId: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  walletId?: string;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest" | "largest" | "smallest";
  page?: number;
  limit?: number;
};

export async function listTransactions(filter: TransactionFilter) {
  const {
    userId,
    type,
    walletId,
    categoryId,
    search,
    startDate,
    endDate,
    sort = "newest",
    page = 1,
    limit = 20,
  } = filter;

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(type && { type: type as TransactionType }),
    ...(walletId && { walletId }),
    ...(categoryId && { categoryId }),
    ...(search && { description: { contains: search, mode: "insensitive" } }),
    ...(startDate && { date: { gte: new Date(startDate) } }),
    ...(endDate && {
      date: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        lte: new Date(endDate),
      },
    }),
  };

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    sort === "oldest" ? { date: "asc" }
    : sort === "largest" ? { amount: "desc" }
    : sort === "smallest" ? { amount: "asc" }
    : { date: "desc" };

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wallet: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, icon: true } },
        transfer: {
          select: {
            fromWallet: { select: { name: true } },
            toWallet: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return {
    data: transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount.toNumber(),
      date: tx.date.toISOString(),
      createdAt: tx.createdAt.toISOString(),
      wallet: tx.wallet,
      category: tx.category,
      transfer: tx.transfer
        ? `${tx.transfer.fromWallet.name} → ${tx.transfer.toWallet.name}`
        : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}