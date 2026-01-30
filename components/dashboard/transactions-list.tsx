"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionAccounts,
} from "@/app/actions/transactions";
import type { GetTransactionsParams } from "@/lib/types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TransactionsFilters } from "@/components/dashboard/transactions-filters";
import { TransactionsPagination } from "@/components/dashboard/transactions-pagination";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { TransactionsTableSkeleton } from "@/components/dashboard/transactions-table-skeleton";
import { useState, useMemo } from "react";

const PAGE_SIZE = 20;

export function TransactionsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const params: GetTransactionsParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: "date",
      sortDir: "desc",
      search: search.trim() || undefined,
      accountNo: accountNo || undefined,
    }),
    [page, search, accountNo]
  );

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions(params),
    placeholderData: (previousData) => previousData,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["transaction-accounts"],
    queryFn: getTransactionAccounts,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleAccountChange = (value: string) => {
    setAccountNo(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSearchInput("");
    setAccountNo("");
    setPage(1);
  };

  const transactions = data?.data ?? [];
  const count = data?.count ?? 0;
  const totalPages = Math.ceil(count / PAGE_SIZE) || 1;
  const from = count > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, count);

  return (
    <div className="flex flex-col gap-4">
      <TransactionsFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearch}
        accountNo={accountNo}
        onAccountChange={handleAccountChange}
        accounts={accounts}
        onReset={handleResetFilters}
        hasActiveFilters={!!(search || accountNo || page > 1)}
      />

      {isFetching ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {count} transaction{count !== 1 ? "s" : ""} total
          {count > 0 && <> · Showing {from}–{to}</>}
        </p>
      )}

      {isError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load transactions"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3"
          >
            Try again
          </Button>
        </div>
      ) : isFetching ? (
        <TransactionsTableSkeleton rowCount={PAGE_SIZE} />
      ) : transactions.length === 0 ? (
        <div className="rounded-md border">
          <div className="p-8 text-center text-muted-foreground">
            No transactions found.
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </TableBody>
            </Table>
          </div>

          {!isFetching && (
            <TransactionsPagination
              page={page}
              totalPages={totalPages}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </>
      )}
    </div>
  );
}
