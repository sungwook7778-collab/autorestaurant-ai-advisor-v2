import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { formatWon } from '../utils/formatters.js';

function PctBadge({ pct, higherIsBetter }) {
  const isGood = higherIsBetter ? pct > 0 : pct < 0;
  const sign   = pct > 0 ? '+' : '';
  return (
    <span className={`opfin-badge ${isGood ? 'badge-good' : 'badge-bad'}`}>
      {sign}{pct}%
    </span>
  );
}

function MetricBar({ before, after, unit }) {
  const max = Math.max(before, after, 1);
  return (
    <div className="opfin-bars">
      <div className="opfin-bar-row">
        <span className="opfin-bar-tag tag-asis">AS-IS</span>
        <div className="opfin-bar-track">
          <div className="opfin-bar-fill fill-asis" style={{ width: `${(before / max) * 100}%` }} />
        </div>
        <span className="opfin-bar-num num-asis">{before}<small>{unit}</small></span>
      </div>
      <div className="opfin-bar-row">
        <span className="opfin-bar-tag tag-tobe">TO-BE</span>
        <div className="opfin-bar-track">
          <div className="opfin-bar-fill fill-tobe" style={{ width: `${(after / max) * 100}%` }} />
        </div>
        <span className="opfin-bar-num num-tobe">{after}<small>{unit}</small></span>
      </div>
    </div>
  );
}

function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="opfin-tooltip">
      <div className="opfin-tt-month">{label}개월</div>
      <div className={`opfin-tt-val ${val >= 0 ? 'tt-pos' : 'tt-neg'}`}>
        {formatWon(val)}
      </div>
    </div>
  );
}

export default function OperationalFinancialPanel({ results }) {
  const { operationalMetrics: om, monthlyTimeline, paybackMonths,
          roiOneYear, npv3Year, annualNetBenefit } = results;
  if (!om) return null;

  const breakMonth = paybackMonths ? Math.round(paybackMonths) : null;
  const chartData  = monthlyTimeline
    .filter((_, i) => i % 3 === 2 || i === 0)
    .map((d) => ({ month: d.month, v: d.cumulative }));

  const metrics = [
    { icon: '🕐', name: '준비·세팅 시간', en: 'Prep Time',      ...om.prepTime },
    { icon: '⚡', name: '시간당 생산량',   en: 'Hourly Output', ...om.hourlyOutput },
    { icon: '🔧', name: '관리·청소 리소스', en: 'Maintenance',  ...om.maintenance },
  ];

  const kpis = [
    { label: 'ANNUAL ROI',     value: `${roiOneYear >= 0 ? '+' : ''}${roiOneYear.toFixed(0)}%`, cls: 'kv-roi' },
    { label: 'PAYBACK PERIOD', value: paybackMonths ? `${paybackMonths.toFixed(1)}개월` : '-',   cls: 'kv-pay' },
    { label: 'NET PRESENT VALUE', value: formatWon(npv3Year, false),                             cls: 'kv-npv' },
    { label: 'COST RECOVERY',  value: formatWon(annualNetBenefit, false),                        cls: 'kv-rec' },
  ];

  return (
    <div className="opfin-wrap">

      {/* ── 왼쪽: Operational Impact ── */}
      <div className="opfin-left">
        <div className="opfin-hdr">
          <div className="opfin-eyebrow">공정별 상세 기대 효과</div>
          <div className="opfin-title">Operational Impact</div>
          <p className="opfin-desc">자동화를 통해 주방의 만성적 피로도를 제거하고 데이터 기반의 정밀 조리 환경을 실현합니다.</p>
        </div>

        {/* 수치 비교 행 */}
        <div className="opfin-metric-list">
          {metrics.map((m) => (
            <div key={m.en} className="opfin-mcard">
              <div className="opfin-mcard-top">
                <span className="opfin-mcard-icon">{m.icon}</span>
                <div className="opfin-mcard-titles">
                  <span className="opfin-mcard-name">{m.name}</span>
                  <span className="opfin-mcard-en">{m.en}</span>
                </div>
                <PctBadge pct={m.changePct} higherIsBetter={m.higherIsBetter} />
              </div>
              <MetricBar before={m.before} after={m.after} unit={m.unit} />
            </div>
          ))}

          {/* Human Value */}
          <div className="opfin-mcard opfin-human">
            <div className="opfin-mcard-top">
              <span className="opfin-mcard-icon">👤</span>
              <div className="opfin-mcard-titles">
                <span className="opfin-mcard-name">인력 가치 재정의</span>
                <span className="opfin-mcard-en">Human Value</span>
              </div>
            </div>
            <div className="opfin-human-stats">
              <div className="opfin-hstat">
                <span className="opfin-hstat-lbl">재배치 인력</span>
                <span className="opfin-hstat-val blue">
                  {om.humanValue.staffReduction >= 1
                    ? `${om.humanValue.staffReduction.toFixed(1)}인`
                    : `${Math.round(om.humanValue.staffReduction * 160)}h/월`}
                </span>
              </div>
              <div className="opfin-hstat-div" />
              <div className="opfin-hstat">
                <span className="opfin-hstat-lbl">월 절감 가치</span>
                <span className="opfin-hstat-val green">{formatWon(om.humanValue.monthlyValue)}</span>
              </div>
              <div className="opfin-hstat-div" />
              <div className="opfin-hstat">
                <span className="opfin-hstat-lbl">연간 절감 가치</span>
                <span className="opfin-hstat-val purple">{formatWon(om.humanValue.annualValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 오른쪽: Financial Results ── */}
      <div className="opfin-right">
        <div className="opfin-fin-hdr">
          <div>
            <div className="opfin-eyebrow">재무적 개선 효과</div>
            <div className="opfin-title">FINANCIAL RESULTS</div>
          </div>
          <div className="opfin-roi-chip">
            <div className="opfin-roi-chip-top">ROI</div>
            <div className="opfin-roi-chip-bot">Verified</div>
          </div>
        </div>
        <p className="opfin-desc">
          공정 최적화로 확보된 잉여 리소스를 화폐 가치로 환산하여 매장의 실질적 현금 흐름을 개선합니다.
        </p>

        {/* Cash Flow 차트 */}
        <div className="opfin-chart-lbl">CUMULATIVE CASH FLOW PROJECTION</div>
        <div className="opfin-chart-box">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cfG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v) => `${v}M`} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} width={42} />
              <Tooltip content={<CashFlowTooltip />} />
              <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="4 4" strokeWidth={1.5} />
              {breakMonth && (
                <ReferenceLine x={breakMonth} stroke="#F97316" strokeDasharray="5 3" strokeWidth={1.5} />
              )}
              <Area type="monotone" dataKey="v" stroke="#EF4444" strokeWidth={2.5}
                fill="url(#cfG)" dot={false} activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          {breakMonth && (
            <div className="opfin-golden">
              ✦ GOLDEN CROSS · {breakMonth}개월차 손익분기
            </div>
          )}
        </div>

        {/* KPI 4박스 */}
        <div className="opfin-kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="opfin-kbox">
              <div className="opfin-kbox-lbl">{k.label}</div>
              <div className={`opfin-kbox-val ${k.cls}`}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
