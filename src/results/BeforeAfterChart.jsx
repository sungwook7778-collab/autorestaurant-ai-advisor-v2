import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { formatWon } from '../utils/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 6 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: 12, color: p.color }}>
            {p.name}: {formatWon(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BeforeAfterChart({ results }) {
  const { beforeAfter, monthlyLaborSavings, monthlyThroughputGain, monthlyWasteSavings } = results;
  const { before, after } = beforeAfter;

  const costData = [
    { name: '인건비', before: before.monthlyCost, after: after.monthlyCost },
    { name: '폐기물 비용', before: before.monthlyWaste, after: after.monthlyWaste },
  ];

  const gainData = [
    { label: '인건비 절감', value: monthlyLaborSavings, fill: '#16A34A' },
    { label: '출고·회전 효율', value: monthlyThroughputGain, fill: '#2563EB' },
    { label: '폐기물 감소', value: monthlyWasteSavings, fill: '#D97706' },
  ];

  return (
    <>
      <div className="chart-section">
        <div className="chart-title">
          <span>📊</span> 월 비용 비교 (도입 전 vs 후)
        </div>
        <div className="chart-subtitle">주방 자동화 도입 전·후 주요 고정비 변화</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="before" name="도입 전" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="도입 후" fill="#86EFAC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-title">
          <span>💚</span> 월별 수익 개선 분해
        </div>
        <div className="chart-subtitle">주방 효율 개선으로 발생하는 수익 항목별 기여도</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {gainData.map((g) => {
            const total = gainData.reduce((s, x) => s + x.value, 0);
            const pct = total > 0 ? (g.value / total) * 100 : 0;
            return (
              <div key={g.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{g.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: g.fill }}>{formatWon(g.value)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, background: g.fill,
                    borderRadius: 10, transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, textAlign: 'right' }}>
                  전체 수익의 {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
