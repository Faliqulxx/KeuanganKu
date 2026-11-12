import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  HeartPulse,
  Film,
  GraduationCap,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  Gift,
  Package,
  LucideIcon,
} from 'lucide-react';

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
  Makanan: '#F58220',             // Orange
  'Makanan & Minuman': '#F58220', // Orange (alias)
  Transport: '#3B82F6',           // Blue
  Transportasi: '#3B82F6',        // Blue (alias)
  Belanja: '#8B5CF6',             // Purple
  Tagihan: '#EF4444',             // Red
  Kesehatan: '#10B981',           // Green
  Hiburan: '#EC4899',             // Pink
  Pendidikan: '#06B6D4',          // Cyan
  Sosial: '#14B8A6',              // Teal
  Gaji: '#16A34A',                // Green (Income)
  Bonus: '#059669',               // Emerald (Income)
  Usaha: '#F97316',               // Warm Orange (Income)
  Hadiah: '#EAB308',              // Yellow (Income)
  Lainnya: '#78716C',             // Gray
};

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Makanan: Utensils,
  'Makanan & Minuman': Utensils,
  Transport: Car,
  Transportasi: Car,
  Belanja: ShoppingBag,
  Tagihan: Zap,
  Kesehatan: HeartPulse,
  Hiburan: Film,
  Pendidikan: GraduationCap,
  Sosial: Users,
  Gaji: Briefcase,
  Bonus: Award,
  Usaha: TrendingUp,
  Hadiah: Gift,
  Lainnya: Package,
};

/** Komponen Ikon Flat untuk Kategori Transaksi */
export function CategoryIcon({
  category,
  className = 'w-4 h-4',
}: {
  category: string;
  className?: string;
}) {
  const IconComponent = CATEGORY_ICON_MAP[category] || Package;
  return <IconComponent className={className} />;
}

// Fallback untuk backward compatibility
export const CATEGORY_ICONS: Record<string, string> = {
  Makanan: 'Makanan',
  Transport: 'Transport',
  Belanja: 'Belanja',
  Tagihan: 'Tagihan',
  Kesehatan: 'Kesehatan',
  Hiburan: 'Hiburan',
  Pendidikan: 'Pendidikan',
  Sosial: 'Sosial',
  Gaji: 'Gaji',
  Bonus: 'Bonus',
  Usaha: 'Usaha',
  Hadiah: 'Hadiah',
  Lainnya: 'Lainnya',
};

