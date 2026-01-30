import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInsights } from "@/app/actions/transactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/format";

async function InsightsContent() {
  const insights = await getInsights();

  const maxAccountSum = Math.max(
    ...insights.byAccount.map((a) => Math.abs(a.sum)),
    1
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Insights</h1>
        <p className="text-muted-foreground">
          Summary by account and income/expense.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total income</CardTitle>
            <Badge variant="secondary" className="text-xs">
              +
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {formatAmount(insights.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total expense</CardTitle>
            <Badge variant="secondary" className="text-xs">
              −
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">
              {formatAmount(insights.totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                insights.netAmount >= 0
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500"
              }`}
            >
              {formatAmount(insights.netAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.totalTransactions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.last7DaysCount.toLocaleString()} txns
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By account</CardTitle>
          <CardDescription>
            Income and expense per account (net amount bar).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.byAccount.length === 0 ? (
              <p className="text-sm text-muted-foreground">No account data.</p>
            ) : (
              insights.byAccount.map(
                ({ account_no, count, income, expense, sum }) => (
                  <div key={account_no} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{account_no}</span>
                      <span className="text-muted-foreground">
                        {count} txns ·{" "}
                        <span className="text-green-600 dark:text-green-500">
                          +{formatAmount(income)}
                        </span>{" "}
                        <span className="text-red-600 dark:text-red-500">
                          −{formatAmount(expense)}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${
                          sum >= 0 ? "bg-green-500/80" : "bg-red-500/80"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (Math.abs(sum) / maxAccountSum) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly summary</CardTitle>
          <CardDescription>
            Income and expense for the last 12 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Month</th>
                  <th className="pb-2 pr-4 font-medium text-right">Income</th>
                  <th className="pb-2 pr-4 font-medium text-right">Expense</th>
                  <th className="pb-2 font-medium text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {insights.monthly.map(({ month, income, expense }) => (
                  <tr key={month} className="border-b last:border-0">
                    <td className="py-2 pr-4">{month}</td>
                    <td className="py-2 pr-4 text-right text-green-600 dark:text-green-500">
                      {formatAmount(income)}
                    </td>
                    <td className="py-2 pr-4 text-right text-red-600 dark:text-red-500">
                      {formatAmount(expense)}
                    </td>
                    <td
                      className={`py-2 text-right font-medium ${
                        income - expense >= 0
                          ? "text-green-600 dark:text-green-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {formatAmount(income - expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/auth/login");
  }

  return <InsightsContent />;
}
