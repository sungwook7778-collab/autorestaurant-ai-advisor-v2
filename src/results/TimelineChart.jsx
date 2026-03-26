import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { formatWon } from '../utils/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value;
    return (
      <div style={{
        background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 4 }}>{label}개월차</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: val >= 0 ? '#16A34A' : '#DC2626' }}>
          누적: {formatWon(val)}
        </p>
      </div>
    );
  }
  return null;
};

export default function TimelineChart({ results }) {
  const { monthlyTimeline, paybackMonths, netInvestment } = results;

  // 36개월 중 6개월 간격으로 표시
  const chartData = monthlyTimeline.filter((_, i) => i % 3 === 2 || i === 0).map((d) => ({
    month: d.month,
    cumulative: d.cumulative,
  }));

  const breakEvenMonth = paybackMonths ? Math.round(paybackMonths) : null;

  return (
    <div className="chart-section">
      <div className="chart-title">
        <span>📈</span> 3년 누적 수익 추이
      </div>
      <div className="chart-subtitle">
        {breakEvenMonth ? `${breakEvenMonth}개월째 투자금 회수 → 이후 순이익 발생` : '누적 손익 흐름'}
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}M`}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1.5} />
            {breakEvenMonth && (
              <ReferenceLine
                x={breakEvenMonth}
                stroke="#F97316"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: '손익분기', position: 'top', fontSize: 11, fill: '#F97316' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#16A34A"
              strokeWidth={2.5}
              fill="url(#posGrad)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
