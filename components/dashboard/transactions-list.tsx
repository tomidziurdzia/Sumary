"use client";

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
import { useTransactionsList } from "@/hooks/use-transactions-list";

export function TransactionsList() {
  const {
    transactions,
    count,
    isFetching,
    isError,
    error,
    refetch,
    accounts,
    searchInput,
    setSearchInput,
    handleSearch,
    accountNo,
    handleAccountChange,
    handleResetFilters,
    hasActiveFilters,
    page,
    totalPages,
    from,
    to,
    nextPage,
    prevPage,
    updateMutation,
    PAGE_SIZE,
  } = useTransactionsList();

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
        hasActiveFilters={hasActiveFilters}
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
                  <TableHead className="w-0">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onUpdate={(id, updates) =>
                      updateMutation.mutate({ id, ...updates })
                    }
                    isUpdating={updateMutation.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {!isFetching && (
            <TransactionsPagination
              page={page}
              totalPages={totalPages}
              onPrevious={prevPage}
              onNext={nextPage}
            />
          )}
        </>
      )}
    </div>
  );
}
