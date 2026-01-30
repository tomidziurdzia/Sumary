"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TransactionsFiltersProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  accountNo: string;
  onAccountChange: (value: string) => void;
  accounts: string[];
  onReset: () => void;
  hasActiveFilters: boolean;
};

export function TransactionsFilters({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  accountNo,
  onAccountChange,
  accounts,
  onReset,
  hasActiveFilters,
}: TransactionsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <form onSubmit={onSearchSubmit} className="flex items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Input
            id="search"
            type="search"
            placeholder="Search description or account..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="w-64"
          />
        </div>
        <Button type="submit" variant="secondary" size="default">
          Search
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <Label htmlFor="account">Account</Label>
        <select
          id="account"
          value={accountNo}
          onChange={(e) => onAccountChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All accounts</option>
          {accounts.map((acc) => (
            <option key={acc} value={acc}>
              {acc}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <Button type="button" variant="ghost" size="default" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
