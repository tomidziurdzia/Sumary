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

  console.log(data);
  console.log(error);
  console.log(count);

  if (error) {
    throw new Error(error.message);
  }

  return { data: data ?? [], count: count ?? 0 };
}
