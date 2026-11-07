'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS } from '@/lib/categories';
import { formatRupiah } from '@/lib/format';

interface CategoryPieChartProps {
  data: { category: string; total: number; percentage: number }[];
  totalExpense: number;
}

export function CategoryPieChart({ data, totalExpense }: CategoryPieChartProps) {
  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs text-center neu-sunken rounded-2xl p-4">
        <p className="font-semibold">Belum ada pengeluaran pada periode ini.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    color: CATEGORY_COLORS[item.category] || '#9CA3AF',
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-4">
      <div className="relative h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Pengeluaran']}
              contentStyle={{
                backgroundColor: 'rgba(23, 30, 26, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Soft Neumorphic Center Label */}
        <div className="absolute w-24 h-24 rounded-full neu-sunken flex flex-col items-center justify-center pointer-events-none text-center p-1">
          <span className="text-[9px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">
            Total Keluar
          </span>
          <span className="text-[11px] font-black text-neutral-900 dark:text-neutral-100 truncate max-w-[80px]">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.slice(0, 6).map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between p-2 rounded-xl neu-sunken-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#9CA3AF' }}
              />
              <span className="truncate text-neutral-700 dark:text-neutral-300 font-bold text-[11px]">
                {item.category}
              </span>
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 font-extrabold text-[11px] shrink-0">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
