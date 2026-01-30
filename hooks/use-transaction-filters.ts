"use client";

import { useState, useMemo, useCallback } from "react";

export type UseTransactionFiltersOptions = {
  onFilterChange?: () => void;
};

export function useTransactionFilters(
  options: UseTransactionFiltersOptions = {}
) {
  const { onFilterChange } = options;
  const [search, setSearch] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const filterParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      accountNo: accountNo || undefined,
    }),
    [search, accountNo]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput.trim());
      onFilterChange?.();
    },
    [searchInput, onFilterChange]
  );

  const handleAccountChange = useCallback(
    (value: string) => {
      setAccountNo(value);
      onFilterChange?.();
    },
    [onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setAccountNo("");
    onFilterChange?.();
  }, [onFilterChange]);

  const hasActiveFilters = !!(search || accountNo);

  return {
    searchInput,
    setSearchInput,
    accountNo,
    handleSearch,
    handleAccountChange,
    handleResetFilters,
    hasActiveFilters,
    filterParams,
  };
}
