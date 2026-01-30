"use client";

import { formatAmount, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";

export type TransactionRowProps = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { date, account_no, description, amount } = transaction;
  const isPositive = amount >= 0;

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{formatDate(date)}</TableCell>
      <TableCell>{account_no}</TableCell>
      <TableCell>{description}</TableCell>
      <TableCell
        className={`text-right font-medium ${
          isPositive
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {formatAmount(amount)}
      </TableCell>
    </TableRow>
  );
}
