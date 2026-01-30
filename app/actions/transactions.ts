"use server";

import { createClient } from "@/lib/supabase/server";
import {
  GetTransactionsParams,
  InsightsData,
  UpdateTransactionParams,
  type Transaction,
} from "@/lib/types";

const TRANSACTION_COLUMNS =
  "id,date,account_no,description,amount,created_at" as const;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT = "date" as const satisfies GetTransactionsParams["sortBy"];
const DEFAULT_SORT_DIR =
  "desc" as const satisfies GetTransactionsParams["sortDir"];

type RowForInsights = {
  amount: number | null;
  account_no: string | null;
  date: string | null;
};

function splitAmount(amount: number): { income: number; expense: number } {
  if (amount >= 0) return { income: amount, expense: 0 };
  return { income: 0, expense: Math.abs(amount) };
}

function getMonthKey(dateStr: string): string | null {
  const [y, m] = dateStr.split("-");
  if (!y || !m) return null;
  return `${y}-${m}`;
}

function buildLast12Months(
  monthlyMap: Map<string, { income: number; expense: number }>
): InsightsData["monthly"] {
  const result: InsightsData["monthly"] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const values = monthlyMap.get(key) ?? { income: 0, expense: 0 };

    result.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      year,
      income: values.income,
      expense: values.expense,
    });
  }

  return result;
}

function getCutoffDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export async function getTransactions(params: GetTransactionsParams = {}) {
  const supabase = await createClient();
  const {
    search,
    accountNo,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortBy = DEFAULT_SORT,
    sortDir = DEFAULT_SORT_DIR,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  let query = supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS, { count: "exact" });

  if (search) {
    query = query.or(
      `description.ilike.%${search}%,account_no.ilike.%${search}%`
    );
  }
  if (accountNo) query = query.eq("account_no", accountNo);
  if (fromDate) query = query.gte("date", fromDate);
  if (toDate) query = query.lte("date", toDate);
  if (minAmount !== undefined) query = query.gte("amount", minAmount);
  if (maxAmount !== undefined) query = query.lte("amount", maxAmount);

  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  const orderColumn: "date" | "amount" | "account_no" | "created_at" =
    sortBy ?? DEFAULT_SORT;
  const { data, error, count } = await query
    .order(orderColumn, { ascending: sortDir === "asc" })
    .range(rangeStart, rangeEnd);

  if (error) throw new Error(error.message);

  return { data: data ?? [], count: count ?? 0 };
}

export async function updateTransaction(
  params: UpdateTransactionParams
): Promise<Transaction> {
  const supabase = await createClient();
  const { id, ...updates } = params;

  const allowedFields = [
    "date",
    "account_no",
    "description",
    "amount",
  ] as const;
  const payload: Record<string, unknown> = {};

  for (const key of allowedFields) {
    const value = updates[key];
    if (value !== undefined) payload[key] = value;
  }

  if (Object.keys(payload).length === 0) {
    const { data: existing, error } = await supabase
      .from("transactions")
      .select(TRANSACTION_COLUMNS)
      .eq("id", id)
      .single();
    if (error || !existing) throw new Error("Transaction not found");
    return existing as Transaction;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .select(TRANSACTION_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function getTransactionAccounts(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("account_no")
    .order("account_no");

  if (error) throw new Error(error.message);

  const accounts = [
    ...new Set(
      (data ?? [])
        .map((r) => r.account_no)
        .filter((a): a is string => a != null)
    ),
  ];
  return accounts;
}

export async function getInsights(): Promise<InsightsData> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("transactions")
    .select("id, amount, account_no, date");

  if (error) throw new Error(error.message);

  const list = (rows ?? []) as RowForInsights[];

  let totalIncome = 0;
  let totalExpense = 0;
  const byAccountMap = new Map<
    string,
    { count: number; income: number; expense: number; sum: number }
  >();
  const monthlyMap = new Map<string, { income: number; expense: number }>();

  for (const row of list) {
    const amount = row.amount ?? 0;
    const { income, expense } = splitAmount(amount);
    totalIncome += income;
    totalExpense += expense;

    const accountNo = row.account_no ?? "";
    const prev = byAccountMap.get(accountNo) ?? {
      count: 0,
      income: 0,
      expense: 0,
      sum: 0,
    };
    byAccountMap.set(accountNo, {
      count: prev.count + 1,
      income: prev.income + income,
      expense: prev.expense + expense,
      sum: prev.sum + amount,
    });

    const dateStr = row.date ?? "";
    const monthKey = dateStr ? getMonthKey(dateStr) : null;
    if (monthKey) {
      const prevMonth = monthlyMap.get(monthKey) ?? { income: 0, expense: 0 };
      monthlyMap.set(monthKey, {
        income: prevMonth.income + income,
        expense: prevMonth.expense + expense,
      });
    }
  }

  const byAccount = [...byAccountMap.entries()]
    .map(([account_no, v]) => ({ account_no, ...v }))
    .sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum));

  const monthly = buildLast12Months(monthlyMap);
  const cutoff = getCutoffDateDaysAgo(7);
  const last7DaysCount = list.filter((r) => (r.date ?? "") >= cutoff).length;

  return {
    totalTransactions: list.length,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    byAccount,
    monthly,
    last7DaysCount,
  };
}
