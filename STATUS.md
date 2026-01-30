# Project status vs assignment

Full review of what’s done and what’s left.

---

## Done

| Requirement | Status |
|-------------|--------|
| **Next.js App Router + TypeScript** | Done |
| **Supabase Auth (Magic Link)** | Done – login → `/dashboard`, confirm handles `code` + `token_hash` |
| **Route to /dashboard after login** | Done |
| **Supabase table `transactions`** | Done – table created and seeded |
| **Server Actions for data** | Done – `app/actions/transactions.ts` with `getTransactions(params)` |
| **No API Routes** | Done – data only via Server Actions |
| **TanStack Query** | Done – `QueryClientProvider` in layout |
| **Client calls Server Action via React Query** | Done – `TransactionsList` uses `useQuery` with `queryFn: () => getTransactions(params)` |
| **List transactions in UI** | Done – table on dashboard with Date, Account, Description, Amount |
| **Loading state** | Done – "Loading transactions..." |
| **Error state** | Done – message + "Try again" button |
| **Empty state** | Done – "No transactions found." |
| **Types** | Done – `lib/types.ts`: `Transaction`, `GetTransactionsParams` |
| **shadcn Table component** | Done – `components/ui/table.tsx` exists (list uses native `<table>`; can swap to shadcn Table for full compliance) |
| **Structure / naming** | Done – `app/`, `actions/`, `lib/`, `components/` |

---

## Not done yet

| Requirement | Status |
|-------------|--------|
| **≥2 exploration features (UI)** | Server Action supports search, accountNo, fromDate, toDate, minAmount, maxAmount, sortBy, sortDir, page, pageSize – but **no UI** (inputs, filters, sort controls, pagination). Need at least 2 exposed in the dashboard. |
| **≥1 insight** | Not implemented – e.g. totals by account, monthly summary, KPI cards (total income/expenses, balance), or chart. |
| **Bonus: inline edit** | No `updateTransaction` Server Action, no mutation + optimistic update. |
| **Bonus: RLS** | Not implemented – optional `user_id` in table only. |

---

## Suggested next steps (order)

1. **Exploration UI** – Add at least 2 of: search input, account filter (dropdown/select), date range (from/to), sort controls (column + direction), pagination (prev/next or page size). Wire them to local state, pass params to `getTransactions`, and use the same params in `queryKey` so React Query caches correctly.
2. **Insight** – One block: e.g. total by account (new Server Action or derived from existing data), or KPI cards (total income, total expenses, balance), or a simple monthly summary/chart.
3. **Optional: use shadcn Table** – In `TransactionsList`, replace native `<table>` with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table` for full “shadcn Table” compliance.
4. **Bonus** – `updateTransaction` Server Action + `useMutation` + inline edit + optimistic update; RLS if you want.

---

## Files overview

- **Auth:** `app/auth/login`, `app/auth/confirm/route.ts`, `components/login-form.tsx`
- **Dashboard:** `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `components/dashboard/transactions-list.tsx`
- **Data:** `app/actions/transactions.ts`, `lib/types.ts`, `lib/supabase/server.ts`
- **Query:** `components/providers/query-provider.tsx`, `app/layout.tsx`
- **UI:** `components/ui/table.tsx`, `components/ui/button.tsx`, etc.
