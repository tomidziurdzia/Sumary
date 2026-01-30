"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionAccounts,
  updateTransaction,
} from "@/app/actions/transactions";
import type { GetTransactionsParams } from "@/lib/types";
import type { Transaction } from "@/lib/types";
import { useState, useMemo } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";

const PAGE_SIZE = 10;

export function useTransactionsList() {
  const [page, setPage] = useState(1);

  const filters = useTransactionFilters({
    onFilterChange: () => setPage(1),
  });

  const params: GetTransactionsParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: "date",
      sortDir: "desc",
      ...filters.filterParams,
    }),
    [page, filters.filterParams]
  );

  const queryClient = useQueryClient();

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions(params),
    placeholderData: (previousData) => previousData,
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", params] });
      const previousData = queryClient.getQueryData<{
        data: Transaction[];
        count: number;
      }>(["transactions", params]);
      queryClient.setQueryData(
        ["transactions", params],
        (old: typeof previousData) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((tx) =>
              tx.id === payload.id ? { ...tx, ...payload } : tx
            ),
          };
        }
      );
      return { previousData };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["transactions", params],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-accounts"] });
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["transaction-accounts"],
    queryFn: getTransactionAccounts,
  });

  const transactions = data?.data ?? [];
  const count = data?.count ?? 0;

  const pagination = usePagination({
    page,
    setPage,
    totalCount: count,
    pageSize: PAGE_SIZE,
  });

  const hasActiveFilters = filters.hasActiveFilters || page > 1;

  return {
    transactions,
    count,
    isFetching,
    isError,
    error,
    refetch,
    accounts,
    searchInput: filters.searchInput,
    setSearchInput: filters.setSearchInput,
    handleSearch: filters.handleSearch,
    accountNo: filters.accountNo,
    handleAccountChange: filters.handleAccountChange,
    handleResetFilters: filters.handleResetFilters,
    hasActiveFilters,
    page: pagination.page,
    totalPages: pagination.totalPages,
    from: pagination.from,
    to: pagination.to,
    setPage: pagination.setPage,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    updateMutation,
    PAGE_SIZE,
  };
}
