import React from 'react';
import { formatWon, formatMonths, formatPct } from '../utils/formatters.js';

export default function SummaryCards({ results }) {
  const { roiOneYear, paybackMonths, annualNetBenefit, monthlyLaborSavings } = results;

  const cards = [
    {
      color: 'blue',
      icon: '📈',
      label: '1년 ROI',
      value: roiOneYear >= 0 ? `+${roiOneYear.toFixed(1)}` : roiOneYear.toFixed(1),
      unit: '%',
      sub: '세전 기준',
    },
    {
      color: 'green',
      icon: '⏱️',
      label: '투자 회수 기간',
      value: paybackMonths ? formatMonths(paybackMonths) : '즉시',
      unit: '',
      sub: '정부 지원 적용 시',
    },
    {
      color: 'orange',
      icon: '💰',
      label: '연간 순이익',
      value: formatWon(annualNetBenefit, false),
      unit: '원',
      sub: '1년차 순이익 증가분',
    },
    {
      color: 'purple',
      icon: '👥',
      label: '월 인건비 절감',
      value: formatWon(monthlyLaborSavings, false),
      unit: '원',
      sub: '매월 반복 절감',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className={`kpi-card ${c.color}`}>
          <div className={`kpi-icon ${c.color}`}>{c.icon}</div>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-value">
            {c.value}
            {c.unit && <span className="kpi-unit">{c.unit}</span>}
          </div>
          <div className="kpi-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
