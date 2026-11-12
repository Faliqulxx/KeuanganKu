'use client';

import React from 'react';
import { useFinance } from '@/lib/finance-context';
import { BottomNav } from '@/components/bottom-nav';
import { TransactionList } from '@/components/transaction-list';
import { formatMonthYear } from '@/lib/format';
import { ReceiptText } from 'lucide-react';

export default function TransaksiPage() {
  const { transactionFilteredList, transactionPeriod } = useFinance();

  return (
    <>
      <main className="flex-1 px-4 pt-5 pb-4 space-y-4">
        {/* Page Title Card with Transaction Period Context */}
        <div className="flex items-center justify-between p-4 rounded-3xl neu-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-button text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <ReceiptText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
                Riwayat Transaksi
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                {transactionFilteredList.length} transaksi • {formatMonthYear(transactionPeriod)}
              </p>
            </div>
          </div>
        </div>

        <TransactionList transactions={transactionFilteredList} showFilters={true} />
      </main>

      <BottomNav />
    </>
  );
}
