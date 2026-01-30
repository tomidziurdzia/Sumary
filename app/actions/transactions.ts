"use server";

import { createClient } from "@/lib/supabase/server";
import { GetTransactionsParams } from "@/lib/types";

export async function getTransactions(params: GetTransactionsParams = {}) {
  const supabase = await createClient();

  const {
    search,
    accountNo,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortBy = "date",
    sortDir = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  let query = supabase
    .from("transactions")
    .select("id,date,account_no,description,amount,created_at", {
      count: "exact",
    });

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

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDir === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getTransactionAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("account_no")
    .order("account_no");

  if (error) throw new Error(error.message);

  const accounts = [...new Set((data ?? []).map((r) => r.account_no))];
  return accounts;
}

export type InsightsData = {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  byAccount: {
    account_no: string;
    count: number;
    income: number;
    expense: number;
    sum: number;
  }[];
  monthly: { month: string; year: number; income: number; expense: number }[];
  last7DaysCount: number;
};

export async function getInsights(): Promise<InsightsData> {
  const supabase = await createClient();

  const { data: all, error: errAll } = await supabase
    .from("transactions")
    .select("id,amount,account_no,date");

  if (errAll) throw new Error(errAll.message);

  const rows = all ?? [];
  const totalTransactions = rows.length;

  let totalIncome = 0;
  let totalExpense = 0;
  const byAccountMap = new Map<
    string,
    { count: number; income: number; expense: number; sum: number }
  >();
  const monthlyMap = new Map<string, { income: number; expense: number }>();

  for (const r of rows) {
    const amount = r.amount ?? 0;
    const isIncome = amount >= 0;
    const income = isIncome ? amount : 0;
    const expense = isIncome ? 0 : Math.abs(amount);
    totalIncome += income;
    totalExpense += expense;

    const accKey = r.account_no ?? "";
    const acc = byAccountMap.get(accKey) ?? {
      count: 0,
      income: 0,
      expense: 0,
      sum: 0,
    };
    acc.count += 1;
    acc.income += income;
    acc.expense += expense;
    acc.sum += amount;
    byAccountMap.set(accKey, acc);

    const dateStr = r.date ?? "";
    if (dateStr) {
      const [y, m] = dateStr.split("-");
      const monthKey = `${y}-${m}`;
      const mon = monthlyMap.get(monthKey) ?? { income: 0, expense: 0 };
      mon.income += income;
      mon.expense += expense;
      monthlyMap.set(monthKey, mon);
    }
  }

  const byAccount = [...byAccountMap.entries()]
    .map(([account_no, v]) => ({ account_no, ...v }))
    .sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum));

  const now = new Date();
  const monthly: {
    month: string;
    year: number;
    income: number;
    expense: number;
  }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const v = monthlyMap.get(key) ?? { income: 0, expense: 0 };
    monthly.push({
      month: d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      year: y,
      income: v.income,
      expense: v.expense,
    });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split("T")[0];
  const last7DaysCount = rows.filter((r) => (r.date ?? "") >= cutoff).length;

  return {
    totalTransactions,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    byAccount,
    monthly,
    last7DaysCount,
  };
}
