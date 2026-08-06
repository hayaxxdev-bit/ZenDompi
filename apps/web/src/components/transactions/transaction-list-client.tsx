"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TransactionTable } from "./transaction-table";

type Props = {
  transactions: any[];
  pagination: {
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export function TransactionListClient({ transactions, pagination }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <TransactionTable
      transactions={transactions}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}