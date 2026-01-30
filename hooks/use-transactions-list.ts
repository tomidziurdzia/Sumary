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

const PAGE_SIZE = 20;

export function useTransactionsList() {
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
      queryClient.setQueryData(["transactions", params], (old: typeof previousData) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tx) =>
            tx.id === payload.id ? { ...tx, ...payload } : tx
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["transactions", params], context.previousData);
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
  const hasActiveFilters = !!(search || accountNo || page > 1);

  return {
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
    setPage,
    updateMutation,
    PAGE_SIZE,
  };
}
