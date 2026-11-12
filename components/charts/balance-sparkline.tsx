'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRupiah } from '@/lib/format';

interface BalanceSparklineProps {
  data: { label: string; balance: number }[];
}

/** Grafik garis halus (sparkline) saldo akumulatif di dalam kartu saldo. */
export function BalanceSparkline({ data }: BalanceSparklineProps) {
  if (!data || data.length < 2) return null;

  return (
    <div className="w-full h-16 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F7861E" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#F7861E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: 'rgba(255,154,60,0.45)', strokeWidth: 1 }}
            contentStyle={{
              background: 'rgba(28, 25, 23, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              padding: '4px 10px',
            }}
            labelStyle={{ color: '#FFB266' }}
            itemStyle={{ color: '#fff' }}
            formatter={(v) => [formatRupiah(Number(v)), 'Saldo']}
            labelFormatter={(_, p) => (p && p[0] ? String(p[0].payload.label) : '')}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#FF9A3C"
            strokeWidth={2.2}
            fill="url(#balanceFill)"
            dot={false}
            activeDot={{ r: 3.5, fill: '#fff', stroke: '#F7861E', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

