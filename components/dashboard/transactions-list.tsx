"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/app/actions/transactions";
import type { GetTransactionsParams } from "@/lib/types";

const defaultParams: GetTransactionsParams = {
  page: 1,
  pageSize: 20,
  sortBy: "date",
  sortDir: "desc",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TransactionsList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["transactions", defaultParams],
    queryFn: () => getTransactions(defaultParams),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Loading transactions...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load transactions"}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-sm font-medium underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  const transactions = data?.data ?? [];
  const count = data?.count ?? 0;

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No transactions found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {count} transaction{count !== 1 ? "s" : ""} total
      </p>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Account</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="px-4 py-3">{tx.account_no}</td>
                <td className="px-4 py-3">{tx.description}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    tx.amount >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatAmount(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
