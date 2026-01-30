"use client";

import { useMemo } from "react";

export type UsePaginationOptions = {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  totalCount: number;
  pageSize: number;
};

export function usePagination({
  page,
  setPage,
  totalCount,
  pageSize,
}: UsePaginationOptions) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const from = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalCount);

  const nextPage = useMemo(
    () => () => setPage((p) => Math.min(totalPages, p + 1)),
    [setPage, totalPages]
  );
  const prevPage = useMemo(
    () => () => setPage((p) => Math.max(1, p - 1)),
    [setPage]
  );

  return {
    page,
    setPage,
    totalPages,
    from,
    to,
    nextPage,
    prevPage,
  };
}
