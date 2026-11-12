'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatRupiah } from '@/lib/format';

interface MonthlyBarChartProps {
  data: { month: string; label: string; income: number; expense: number }[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            stroke="#94A3B8"
            fontSize={11}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={10}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatRupiah(Number(value) || 0),
              name === 'income' ? 'Masuk' : 'Keluar',
            ]}
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
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }}
            formatter={(val) => (val === 'income' ? 'Pemasukan' : 'Pengeluaran')}
          />
          <Bar
            dataKey="income"
            name="income"
            fill="#16A34A"
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="expense"
            name="expense"
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
