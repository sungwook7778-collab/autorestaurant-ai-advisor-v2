import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Label,
} from 'recharts';
import { formatWon, formatMonths } from '../utils/formatters.js';

/* ── 공통 도우미 ──────────────────────────────────── */
function PctBadge({ pct, higherIsBetter }) {
  const isPositive = higherIsBetter ? pct > 0 : pct < 0;
  const display = pct > 0 ? `+${pct}%` : `${pct}%`;
  return (
    <span className={`opfin-pct-badge ${isPositive ? 'good' : 'bad'}`}>
      {display}
    </span>
  );
}

function MetricBar({ before, after, higherIsBetter, unit }) {
  const max = Math.max(before, after, 1);
  const beforePct = (before / max) * 100;
  const afterPct  = (after  / max) * 100;
  const [bigLabel, smallLabel] = higherIsBetter
    ? ['TO-BE', 'AS-IS']
    : ['AS-IS', 'TO-BE'];
  const [bigVal, smallVal] = higherIsBetter ? [after, before] : [before, after];

  return (
    <div className="opfin-bar-group">
      {/* AS-IS row */}
      <div className="opfin-bar-row">
        <span className="opfin-bar-tag opfin-tag-asis">AS-IS</span>
        <div className="opfin-bar-track">
          <div
            className="opfin-bar-fill opfin-fill-asis"
            style={{ width: `${beforePct}%` }}
          />
        </div>
        <span className="opfin-bar-val opfin-val-asis">
          {before}{unit}
        </span>
      </div>
      {/* TO-BE row */}
      <div className="opfin-bar-row">
        <span className="opfin-bar-tag opfin-tag-tobe">TO-BE</span>
        <div className="opfin-bar-track">
          <div
            className="opfin-bar-fill opfin-fill-tobe"
            style={{ width: `${afterPct}%` }}
          />
        </div>
        <span className="opfin-bar-val opfin-val-tobe">
          {after}{unit}
        </span>
      </div>
    </div>
  );
}

/* ── 차트 커스텀 툴팁 ─────────────────────────────── */
function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="opfin-tooltip">
      <div className="opfin-tooltip-month">{label}개월차</div>
      <div className={`opfin-tooltip-val ${val >= 0 ? 'pos' : 'neg'}`}>
        누적 {formatWon(val)}
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ────────────────────────────────── */
export default function OperationalFinancialPanel({ results }) {
  const { operationalMetrics: om, monthlyTimeline, paybackMonths,
          roiOneYear, npv3Year, annualNetBenefit } = results;
  if (!om) return null;

  const breakMonth = paybackMonths ? Math.round(paybackMonths) : null;

  const chartData = monthlyTimeline
    .filter((_, i) => i % 3 === 2 || i === 0)
    .map((d) => ({ month: d.month, cumulative: d.cumulative }));

  // 수치 카드 정의
  const metricCards = [
    {
      id: 'prepTime',
      icon: '🕐',
      name: '준비 및 세팅 시간',
      nameEn: 'Prep Time',
      desc: '정밀 Dosing 시스템으로 수동 계량/소분 공정 생략',
      ...om.prepTime,
    },
    {
      id: 'hourlyOutput',
      icon: '⚡',
      name: '시간당 생산량',
      nameEn: 'Hourly Output',
      desc: '인적 피로도 없는 24hr 연속 가동 체계 구현',
      ...om.hourlyOutput,
    },
    {
      id: 'maintenance',
      icon: '🔧',
      name: '관리/청소 리소스',
      nameEn: 'Maintenance',
      desc: '자동 세척·오일 관리로 정기 점검 시간 단축',
      ...om.maintenance,
    },
  ];

  return (
    <div className="opfin-panel">
      {/* ──────────────────────────────────────────── */}
      {/* 왼쪽: 공정별 상세 기대 효과                 */}
      {/* ──────────────────────────────────────────── */}
      <div className="opfin-left">
        <div className="opfin-section-eyebrow">공정별 상세 기대 효과</div>
        <div className="opfin-section-title">Operational Impact</div>
        <div className="opfin-section-sub">
          자동화를 통해 주방의 만성적 피로도를 제거하고,
          데이터 기반의 정밀 조리 환경을 실현합니다.
        </div>

        {/* 수치 비교 카드 3개 */}
        <div className="opfin-metric-cards">
          {metricCards.map((m) => (
            <div key={m.id} className="opfin-metric-card">
              <div className="opfin-metric-header">
                <span className="opfin-metric-icon">{m.icon}</span>
                <div>
                  <div className="opfin-metric-name">{m.name}</div>
                  <div className="opfin-metric-en">({m.nameEn})</div>
                </div>
                <PctBadge pct={m.changePct} higherIsBetter={m.higherIsBetter} />
              </div>
              <MetricBar
                before={m.before}
                after={m.after}
                higherIsBetter={m.higherIsBetter}
                unit={m.unit}
              />
              <div className="opfin-metric-desc">{m.desc}</div>
            </div>
          ))}

          {/* Human Value 카드 */}
          <div className="opfin-metric-card opfin-human-card">
            <div className="opfin-metric-header">
              <span className="opfin-metric-icon">👤</span>
              <div>
                <div className="opfin-metric-name">인력 가치 재정의</div>
                <div className="opfin-metric-en">(Human Value)</div>
              </div>
            </div>
            <div className="opfin-human-body">
              <div className="opfin-human-row">
                <span className="opfin-human-label">인력 재배치 가능</span>
                <span className="opfin-human-val blue">
                  {om.humanValue.staffReduction >= 1
                    ? `${om.humanValue.staffReduction.toFixed(1)}인`
                    : `${Math.round(om.humanValue.staffReduction * 160)}h/월`}
                </span>
              </div>
              <div className="opfin-human-row">
                <span className="opfin-human-label">월 인건비 절감 가치</span>
                <span className="opfin-human-val green">
                  {formatWon(om.humanValue.monthlyValue)}
                </span>
              </div>
              <div className="opfin-human-row highlight">
                <span className="opfin-human-label">연간 누적 절감 가치</span>
                <span className="opfin-human-val accent">
                  {formatWon(om.humanValue.annualValue)}
                </span>
              </div>
            </div>
            <div className="opfin-metric-desc">
              절감된 인력은 고객 서비스·메뉴 R&D·홀 운영 등 고부가 업무로 재배치
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────── */}
      {/* 오른쪽: 재무적 개선 효과                    */}
      {/* ──────────────────────────────────────────── */}
      <div className="opfin-right">
        <div className="opfin-fin-top">
          <div>
            <div className="opfin-section-eyebrow">재무적 개선 효과</div>
            <div className="opfin-section-title">FINANCIAL RESULTS</div>
          </div>
          <div className="opfin-roi-badge">
            <div className="opfin-roi-badge-label">ROI</div>
            <div className="opfin-roi-badge-sub">Verified</div>
          </div>
        </div>
        <div className="opfin-fin-sub">
          공정 최적화로 확보된 잉여 리소스를 화폐 가치로 환산하여
          매장의 실질적 현금 흐름을 개선합니다.
        </div>

        {/* Cumulative Cash Flow Chart */}
        <div className="opfin-chart-label">CUMULATIVE CASH FLOW PROJECTION</div>
        <div className="opfin-chart-wrap">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="50%" stopColor="#2563EB" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickFormatter={(v) => `${v}M`}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                width={44}
              />
              <Tooltip content={<CashFlowTooltip />} />
              <ReferenceLine y={0} stroke="#D1D5DB" strokeDasharray="4 4" strokeWidth={1.5} />
              {breakMonth && (
                <ReferenceLine
                  x={breakMonth}
                  stroke="#F97316"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                >
                  <Label
                    value={`GOLDEN CROSS: ${formatWon(0, false)}`}
                    position="insideTopRight"
                    style={{ fontSize: 9, fontWeight: 700, fill: '#F97316' }}
                    offset={4}
                  />
                </ReferenceLine>
              )}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#cfGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#EF4444', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {breakMonth && (
            <div className="opfin-golden-label">
              ✦ GOLDEN CROSS: {breakMonth}개월차 손익분기
            </div>
          )}
        </div>

        {/* 4 KPI 박스 */}
        <div className="opfin-kpi-grid">
          <div className="opfin-kpi-box">
            <div className="opfin-kpi-label">ANNUAL ROI</div>
            <div className={`opfin-kpi-val ${roiOneYear >= 0 ? 'roi-pos' : 'roi-neg'}`}>
              {roiOneYear >= 0 ? '+' : ''}{roiOneYear.toFixed(0)}%
            </div>
          </div>
          <div className="opfin-kpi-box">
            <div className="opfin-kpi-label">PAYBACK PERIOD</div>
            <div className="opfin-kpi-val payback">
              {paybackMonths ? paybackMonths.toFixed(1) : '-'}
              <span className="opfin-kpi-unit">개월</span>
            </div>
          </div>
          <div className="opfin-kpi-box">
            <div className="opfin-kpi-label">NET PRESENT VALUE</div>
            <div className="opfin-kpi-val npv">
              {formatWon(npv3Year, false)}
            </div>
          </div>
          <div className="opfin-kpi-box">
            <div className="opfin-kpi-label">COST RECOVERY</div>
            <div className="opfin-kpi-val recover">
              연 {formatWon(annualNetBenefit, false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
