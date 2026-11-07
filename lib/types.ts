export type TransactionType = 'income' | 'expense';

export type TransactionSource = 'manual' | 'ai_text' | 'ai_receipt' | 'recurring';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  source: TransactionSource;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export type DateFilterMode = 'month' | 'range' | 'year' | 'all';

export interface DateFilter {
  mode: DateFilterMode;
  year: number;
  month: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

export interface CategoryBudgetStatus {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface MonthSummary {
  periodLabel: string;
  month: string; // YYYY-MM (reference)
  income: number;
  expense: number;
  balance: number;
  byCategory: { category: string; total: number; percentage: number }[];
  budgetStatuses: CategoryBudgetStatus[];
  monthly: { month: string; label: string; income: number; expense: number }[];
  recent: Transaction[];
  filteredTransactions: Transaction[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  functionResult?: {
    type: string;
    data: any;
  };
}
