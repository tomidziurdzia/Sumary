export type Transaction = {
  id: string;
  date: string;
  account_no: string;
  description: string;
  amount: number;
  created_at: string;
};

export type GetTransactionsParams = {
  search?: string;
  accountNo?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount" | "account_no" | "created_at";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};
