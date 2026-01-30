# Project status vs assignment

Full review of what's done and what's left.

---

## Done

| Requirement | Status |
|-------------|--------|
| **Next.js App Router + TypeScript** | Done |
| **Supabase Auth (Magic Link)** | Done – login → `/dashboard`, confirm handles `code` + `token_hash` |
| **Route to /dashboard after login** | Done |
| **Supabase table `transactions`** | Done – table created and seeded |
| **Server Actions for data** | Done – `app/actions/transactions.ts` with `getTransactions(params)`, `getTransactionAccounts()`, `getInsights()` |
| **No API Routes** | Done – data only via Server Actions |
| **TanStack Query** | Done – `QueryClientProvider` in layout |
| **Client calls Server Action via React Query** | Done – `TransactionsList` uses `useQuery` with `queryFn: () => getTransactions(params)` |
| **List transactions in UI** | Done – table on dashboard with Date, Account, Description, Amount |
| **Loading state** | Done – skeleton table + "Loading..." for totals |
| **Error state** | Done – message + "Try again" button |
| **Empty state** | Done – "No transactions found." |
| **Types** | Done – `lib/types.ts`: `Transaction`, `GetTransactionsParams` |
| **shadcn Table component** | Done – list uses `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table` |
| **Structure / naming** | Done – `app/`, `actions/`, `lib/`, `components/` |
| **≥2 exploration features (UI)** | Done – (1) search input + submit, (2) account filter (select), (3) pagination (prev/next). Params in `queryKey` for correct cache. |
| **≥1 insight** | Done – `/dashboard/insights`: KPI cards (total income, expense, net, txns, last 7 days), by account (income/expense + bar), monthly summary (last 12 months). |

---

## Not done yet

| Requirement | Status |
|-------------|--------|
| **Bonus: inline edit** | No `updateTransaction` Server Action, no `useMutation` + optimistic update. |
| **Bonus: RLS** | Not implemented – optional `user_id` in table only. |

---

## Suggested next steps (order)

1. ~~**Exploration UI**~~ – Done (search, account filter, pagination).
2. ~~**Insight**~~ – Done (Insights page: KPIs, by account income/expense, monthly summary).
3. ~~**shadcn Table**~~ – Done (list uses shadcn Table components).
4. **Bonus** – `updateTransaction` Server Action + `useMutation` + inline edit + optimistic update; RLS if desired.

---

## Files overview

- **Auth:** `app/auth/login`, `app/auth/confirm/route.ts`, `components/login-form.tsx`
- **Dashboard:** `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/insights/page.tsx`, `components/dashboard/transactions-list.tsx`, `transactions-filters.tsx`, `transactions-pagination.tsx`, `transaction-row.tsx`, `transactions-table-skeleton.tsx`
- **Data:** `app/actions/transactions.ts`, `lib/types.ts`, `lib/format.ts`, `lib/supabase/server.ts`
- **Query:** `components/providers/query-provider.tsx`, `app/layout.tsx`
- **UI:** `components/ui/table.tsx`, `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, etc.
