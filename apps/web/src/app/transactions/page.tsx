import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { TransactionSearch } from "@/components/transactions/transaction-search";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionExport } from "@/components/transactions/transaction-export";
import { prisma } from "@zendompi/database";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionListClient } from "@/components/transactions/transaction-list-client";

type SearchParams = {
  page?: string;
  limit?: string;
  type?: string;
  walletId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const userId = session.user.id;

  // Parse query params
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || "20")));
  const type = params.type as "income" | "expense" | "transfer" | undefined;
  const walletId = params.walletId;
  const categoryId = params.categoryId;
  const startDate = params.startDate;
  const endDate = params.endDate;
  const search = params.search;
  const sort = params.sort || "newest";

  // Build where clause
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(startDate && {
      transactionDate: { gte: new Date(startDate) },
    }),
    ...(endDate && {
      transactionDate: {
        ...((startDate && { gte: new Date(startDate) }) as any),
        lte: new Date(endDate),
      },
    }),
    ...(search && {
      description: { contains: search, mode: "insensitive" },
    }),
  };

  // Filter by wallet
  if (walletId) {
    (where as any).ledgerEntries = {
      some: { walletId },
    };
  }

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
    default:
      orderBy = { transactionDate: "desc" };
  }

  // Fetch data langsung dari Prisma (bukan fetch API)
  const [total, transactions, wallets, categories] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        ledgerEntries: {
          include: {
            wallet: { select: { id: true, name: true, type: true } },
          },
        },
      },
    }),
    prisma.wallet.findMany({
      where: { userId, isArchived: false },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, icon: true },
    }),
  ]);

  // Format transactions
  const formattedTransactions = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    description: tx.description,
    amount: tx.totalAmount.toNumber(),
    date: tx.transactionDate.toISOString(),
    category: tx.category
      ? { id: tx.category.id, name: tx.category.name, icon: tx.category.icon }
      : undefined,
    wallets: tx.ledgerEntries.map((e) => e.wallet.name).join(" → "),
  }));

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">📝 Transaksi</h1>
            <p className="mt-1 text-sm text-zinc-500">{total} transaksi</p>
          </div>
        </div>
        <TransactionExport />
      </header>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <TransactionSearch />
        </div>
        <TransactionFilters wallets={wallets} categories={categories} />
      </div>

      {/* Transaction List */}
      <Card>
        <TransactionListClient
          transactions={formattedTransactions}
          pagination={pagination}
        />
      </Card>
    </div>
  );
}
