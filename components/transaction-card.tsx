'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/categories';
import { formatRupiah } from '@/lib/format';
import { AlertCircle } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const iconEmoji = CATEGORY_ICONS[transaction.category] || '💰';
  const categoryBg = CATEGORY_COLORS[transaction.category] || '#6B7280';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="flex items-center justify-between p-3.5 rounded-2xl neu-button cursor-pointer group text-left transition-all duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Sunken Neumorphic Icon Well */}
        <div
          className="w-11 h-11 rounded-2xl neu-sunken flex items-center justify-center text-lg shrink-0"
          style={{
            borderColor: `${categoryBg}40`,
          }}
        >
          <span>{iconEmoji}</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate">
              {transaction.note || transaction.category}
            </span>
            {transaction.needs_review && (
              <span title="Perlu dicek">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold truncate mt-0.5">
            {transaction.category}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 pl-2">
        <span
          className={`font-black text-xs sm:text-sm tracking-tight ${
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatRupiah(transaction.amount)}
        </span>
      </div>
    </div>
  );
}
