export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Transport',
  'Belanja',
  'Tagihan',
  'Kesehatan',
  'Hiburan',
  'Pendidikan',
  'Sosial',
  'Lainnya',
] as const;

export const INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'Usaha',
  'Hadiah',
  'Lainnya',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type Category = ExpenseCategory | IncomeCategory;

export const CATEGORY_COLORS: Record<string, string> = {
  Makanan: '#F59E0B',    // Amber
  Transport: '#3B82F6',  // Blue
  Belanja: '#EC4899',    // Pink
  Tagihan: '#8B5CF6',    // Purple
  Kesehatan: '#10B981',  // Emerald
  Hiburan: '#F43F5E',    // Rose
  Pendidikan: '#6366F1', // Indigo
  Sosial: '#14B8A6',     // Teal
  Gaji: '#16A34A',       // Green
  Bonus: '#22C55E',      // Green light
  Usaha: '#059669',      // Emerald
  Hadiah: '#EAB308',     // Yellow
  Lainnya: '#6B7280',    // Gray
};

export const CATEGORY_ICONS: Record<string, string> = {
  Makanan: '🍔',
  Transport: '🚗',
  Belanja: '🛍️',
  Tagihan: '⚡',
  Kesehatan: '💊',
  Hiburan: '🎬',
  Pendidikan: '📚',
  Sosial: '🤝',
  Gaji: '💼',
  Bonus: '🎁',
  Usaha: '📈',
  Hadiah: '🎉',
  Lainnya: '📦',
};

