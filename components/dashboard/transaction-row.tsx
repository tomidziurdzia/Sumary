"use client";

import { useState, useCallback } from "react";
import { formatAmount, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

export type TransactionRowProps = {
  transaction: Transaction;
  onUpdate: (id: string, updates: Partial<Pick<Transaction, "date" | "account_no" | "description" | "amount">>) => void;
  isUpdating?: boolean;
};

export function TransactionRow({
  transaction,
  onUpdate,
  isUpdating = false,
}: TransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(transaction.date);
  const [editAccountNo, setEditAccountNo] = useState(transaction.account_no);
  const [editDescription, setEditDescription] = useState(transaction.description);
  const [editAmount, setEditAmount] = useState(String(transaction.amount));

  const startEditing = useCallback(() => {
    setEditDate(transaction.date);
    setEditAccountNo(transaction.account_no);
    setEditDescription(transaction.description);
    setEditAmount(String(transaction.amount));
    setIsEditing(true);
  }, [transaction]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const saveEditing = useCallback(() => {
    const amountNum = parseFloat(editAmount);
    if (Number.isNaN(amountNum)) return;
    onUpdate(transaction.id, {
      date: editDate,
      account_no: editAccountNo,
      description: editDescription,
      amount: amountNum,
    });
    setIsEditing(false);
  }, [
    transaction.id,
    editDate,
    editAccountNo,
    editDescription,
    editAmount,
    onUpdate,
  ]);

  const { date, account_no, description, amount } = transaction;
  const isPositive = amount >= 0;

  if (isEditing) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell className="whitespace-nowrap">
          <Input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="h-8 w-full min-w-[120px]"
          />
        </TableCell>
        <TableCell>
          <Input
            value={editAccountNo}
            onChange={(e) => setEditAccountNo(e.target.value)}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="h-8"
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Input
              type="number"
              step="any"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="h-8 w-28 text-right"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={saveEditing}
              disabled={isUpdating}
              aria-label="Save"
            >
              <Check className="size-4 text-green-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={cancelEditing}
              disabled={isUpdating}
              aria-label="Cancel"
            >
              <X className="size-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="w-0" />
      </TableRow>
    );
  }

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
      <TableCell className="w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={startEditing}
          disabled={isUpdating}
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
