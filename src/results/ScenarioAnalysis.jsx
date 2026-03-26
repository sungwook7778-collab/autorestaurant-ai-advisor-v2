import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatWon, formatMonths } from '../utils/formatters.js';

const SCENARIOS = [
  { key: 'best', label: '낙관적', emoji: '🚀', className: 'best', desc: '예상보다 30% 성과 향상' },
  { key: 'realistic', label: '현실적', emoji: '📊', className: 'realistic', desc: '예측 기반 기본 시나리오' },
  { key: 'worst', label: '보수적', emoji: '🛡️', className: 'worst', desc: '예상보다 30% 낮은 성과' },
];

const COLORS = { best: '#16A34A', realistic: '#2563EB', worst: '#DC2626' };

export default function ScenarioAnalysis({ results }) {
  const [active, setActive] = useState('realistic');
  const { scenarios, netInvestment } = results;

  const current = scenarios[active];

  const chartData = SCENARIOS.map((s) => ({
    name: s.label,
    roi: Math.round(scenarios[s.key].roiOneYear),
    key: s.key,
  }));

  return (
    <div className="chart-section">
      <div className="chart-title">
        <span>🎯</span> 시나리오별 ROI 분석
      </div>
      <div className="chart-subtitle">변수 변화에 따른 3가지 투자 시나리오 비교</div>

      {/* 탭 */}
      <div className="scenario-tabs">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            className={`scenario-tab ${s.className} ${active === s.key ? 'active' : ''}`}
            onClick={() => setActive(s.key)}
            type="button"
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* 선택 시나리오 메트릭 */}
      <div className="scenario-metrics" style={{ marginBottom: 20 }}>
        <div className="scenario-metric">
          <div className="scenario-metric-label">1년 ROI</div>
          <div className={`scenario-metric-value ${active === 'worst' ? 'down' : active === 'best' ? 'up' : 'mid'}`}>
            {current.roiOneYear > 0 ? '+' : ''}{current.roiOneYear}%
          </div>
        </div>
        <div className="scenario-metric">
          <div className="scenario-metric-label">회수 기간</div>
          <div className={`scenario-metric-value ${active === 'worst' ? 'down' : active === 'best' ? 'up' : 'mid'}`}>
            {current.paybackMonths ? formatMonths(current.paybackMonths) : '미회수'}
          </div>
        </div>
        <div className="scenario-metric">
          <div className="scenario-metric-label">3년 순이익</div>
          <div className={`scenario-metric-value ${current.threeYearNetBenefit > 0 ? 'up' : 'down'}`}>
            {formatWon(current.threeYearNetBenefit, false)}
          </div>
        </div>
      </div>

      {/* 시나리오 설명 */}
      <div style={{
        padding: '10px 14px',
        background: active === 'best' ? 'var(--success-light)' : active === 'worst' ? 'var(--danger-light)' : 'var(--primary-light)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 12,
        color: active === 'best' ? '#166534' : active === 'worst' ? '#991B1B' : '#1D4ED8',
        marginBottom: 16,
        fontWeight: 500,
      }}>
        {SCENARIOS.find((s) => s.key === active)?.desc}
      </div>

      {/* ROI 비교 차트 */}
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              width={42}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, '1년 ROI']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="roi" radius={[6, 6, 0, 0]}>
              {chartData.map((d) => (
                <Cell key={d.key} fill={COLORS[d.key]} opacity={d.key === active ? 1 : 0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
