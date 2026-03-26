import React from 'react';
import { formatMonths } from '../utils/formatters.js';

/* ── SVG 미니 차트 ──────────────────────────────────────────── */

/** Poisson 분포 곡선 (피크타임 주문 패턴) */
function PoissonCurve({ lambda = 15 }) {
  const W = 120, H = 48;
  const pts = Array.from({ length: 20 }, (_, i) => {
    const x = i * (W / 19);
    // 정규화된 Poisson PMF 비슷한 벨 커브 (시각용)
    const k = Math.round(i * lambda / 19);
    const y = H - (Math.pow(lambda, k) * Math.exp(-lambda) /
      (factorial(k) || 1)) * H * 4;
    return `${x},${Math.max(2, Math.min(H - 2, y))}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts.join(' ')} fill="none" stroke="#EF4444" strokeWidth="2" />
      <line x1={W * 0.45} y1="0" x2={W * 0.45} y2={H} stroke="#F97316" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  );
}

function factorial(n) {
  if (n <= 1) return 1;
  if (n > 20) return Infinity;
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
}

/** 보틀넥 분석 바 차트 */
function BottleneckBars() {
  const bars = [
    { label: '주문', before: 90, after: 95 },
    { label: '조리', before: 55, after: 90 },
    { label: '배식', before: 72, after: 93 },
  ];
  const W = 120, H = 48, barW = 14, gap = 4;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {bars.map(({ label, before, after }, i) => {
        const x = i * (barW * 2 + gap + 8) + 4;
        const bh = (before / 100) * (H - 14);
        const ah = (after / 100) * (H - 14);
        return (
          <g key={label}>
            <rect x={x} y={H - 14 - bh} width={barW} height={bh} fill="#475569" rx="1" />
            <rect x={x + barW + 2} y={H - 14 - ah} width={barW} height={ah} fill="#EF4444" rx="1" />
            <text x={x + barW} y={H - 2} textAnchor="middle" fill="#94A3B8" fontSize="8">{label}</text>
          </g>
        );
      })}
      <line x1="0" y1={H - 14} x2={W} y2={H - 14} stroke="#334155" strokeWidth="1" />
    </svg>
  );
}

/** 인적 간섭 확률 원형 */
function InterferenceDiagram({ hriPct = 12 }) {
  const r = 22, cx = 32, cy = 28;
  const safe = 1 - hriPct / 100;
  const angle = safe * 2 * Math.PI;
  const x1 = cx + r * Math.sin(0), y1 = cy - r * Math.cos(0);
  const x2 = cx + r * Math.sin(angle), y2 = cy - r * Math.cos(angle);
  const large = safe < 0.5 ? 1 : 0;
  return (
    <svg width="80" height="56" viewBox="0 0 80 56">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E293B" strokeWidth="5" />
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none" stroke="#EF4444" strokeWidth="5" strokeLinecap="round"
      />
      <circle cx="62" cy="22" r="8" fill="#1E293B" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#F8FAFC" fontSize="9" fontWeight="700">
        {hriPct}%
      </text>
    </svg>
  );
}

/* ── 방법론 카드 ──────────────────────────────────────────── */
const METHODS = [
  {
    no: '01',
    title: '불규칙 주문 모델링',
    desc: '푸아송 분포를 활용하여 피크타임의 무작위 주문 폭주 상황을 수천 번 재현',
    Chart: PoissonCurve,
  },
  {
    no: '02',
    title: '전체 주방 공정 이벤트 추적',
    desc: '주문-조리-배식 전 과정을 이산 사건으로 추적하여 최적의 대기 행렬 관리',
    Chart: BottleneckBars,
  },
  {
    no: '03',
    title: '인적 간섭 리스크 반영',
    desc: '로봇과 사람의 동선 간섭 확률을 계산하여 가장 보수적이고 신뢰도 높은 ROI 산출',
    Chart: null,
  },
];

/* ── 메인 패널 ──────────────────────────────────────────── */
export default function SimMethodologyPanel({ des, paybackMonths }) {
  if (!des) return null;

  const predictionItems = [
    {
      label: '생산 효율 향상',
      value: `+${des.throughput.p50}%`,
      note: `보수적 P25: +${des.throughput.p25}%`,
      color: '#22C55E',
    },
    {
      label: '투자금 회수 기간',
      value: paybackMonths ? formatMonths(paybackMonths) : '-',
      note: `DES 보정 처리량 기반`,
      color: '#F97316',
    },
    {
      label: '조리 품질 밀도',
      value: `${des.qualityScore}%`,
      note: `HRI 안전계수 적용`,
      color: '#38BDF8',
    },
  ];

  return (
    <div className="des-panel">
      {/* 헤더 */}
      <div className="des-header">
        <div>
          <div className="des-eyebrow">SOLUTION. FreeKitchen ROI Analyzer</div>
          <div className="des-step-label">STEP 03. Hybrid Simulation : 성과 예측 엔진</div>
          <div className="des-desc">
            이론적 수치가 아닌, 실제 주방의 물리적 환경을 반영한 디지털 트윈 시뮬레이션.
          </div>
        </div>
        <div className="des-meta">
          <span className="des-meta-badge">DES ENGINE</span>
          <span className="des-meta-badge">v{des.engineVersion}</span>
          <span className="des-meta-badge green">SIM {des.simRuns.toLocaleString()}회</span>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="des-steps-row">
        {['데이터 수집', '기준선 설정', '하이브리드 시뮬레이션', '가치 분석', '결과 및 선정'].map((s, i) => (
          <div key={s} className={`des-step-pill ${i === 2 ? 'active' : ''}`}>
            STEP 0{i + 1} {s}
          </div>
        ))}
      </div>

      {/* 본문: 방법론 카드 + 엔진 패널 */}
      <div className="des-body">
        {/* 왼쪽: 방법론 3개 */}
        <div className="des-methods">
          <div className="des-methods-title">DES 엔진 구동 로직 및 상세 방법론</div>
          {METHODS.map(({ no, title, desc, Chart }, idx) => (
            <div key={no} className="des-method-card">
              <div className="des-method-chart">
                {idx === 0 && <PoissonCurve lambda={des.peakLambda} />}
                {idx === 1 && <BottleneckBars />}
                {idx === 2 && <InterferenceDiagram hriPct={des.hriProbability} />}
              </div>
              <div className="des-method-text">
                <div className="des-method-title">{title}</div>
                <div className="des-method-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽: 엔진 플로우 */}
        <div className="des-engine-col">
          {/* INPUT */}
          <div className="des-engine-box input">
            <div className="des-engine-box-label">01. DATA INPUT</div>
            <div className="des-engine-inputs">
              <div className="des-engine-input-item">
                <span className="des-input-key">피크 주문율 (λ)</span>
                <span className="des-input-val">{des.peakLambda}/h</span>
              </div>
              <div className="des-engine-input-item">
                <span className="des-input-key">기존 처리 용량 (μ)</span>
                <span className="des-input-val">{des.baseMu}/h</span>
              </div>
              <div className="des-engine-input-item">
                <span className="des-input-key">자동화 처리 용량</span>
                <span className="des-input-val">{des.effectiveMu}/h</span>
              </div>
              <div className="des-engine-input-item">
                <span className="des-input-key">HRI 간섭 확률</span>
                <span className="des-input-val">{des.hriProbability}%</span>
              </div>
            </div>
          </div>

          {/* 화살표 */}
          <div className="des-engine-arrow">↓</div>

          {/* ENGINE */}
          <div className="des-engine-core">
            <div className="des-engine-core-title">HYBRID DES ENGINE v{des.engineVersion}</div>
            <div className="des-engine-core-sub">SIMULATION ACTIVE</div>
            <div className="des-engine-dist">
              {[
                { label: 'P5',  val: des.throughput.p5 },
                { label: 'P25', val: des.throughput.p25 },
                { label: 'P50', val: des.throughput.p50 },
                { label: 'P75', val: des.throughput.p75 },
                { label: 'P95', val: des.throughput.p95 },
              ].map(({ label, val }) => (
                <div key={label} className="des-dist-bar">
                  <span className="des-dist-label">{label}</span>
                  <div className="des-dist-track">
                    <div
                      className={`des-dist-fill ${label === 'P25' ? 'highlight' : ''}`}
                      style={{ width: `${Math.min(100, Math.max(4, val * 3))}%` }}
                    />
                  </div>
                  <span className="des-dist-val">{val > 0 ? `+${val}%` : `${val}%`}</span>
                </div>
              ))}
              <div className="des-dist-note">처리량 향상 분포 ({des.simRuns}회 시뮬레이션)</div>
            </div>
          </div>

          {/* 화살표 */}
          <div className="des-engine-arrow">↓</div>

          {/* VALUE PREDICTION */}
          <div className="des-engine-box output">
            <div className="des-engine-box-label">03. VALUE PREDICTION</div>
            {predictionItems.map(({ label, value, note, color }) => (
              <div key={label} className="des-prediction-row">
                <span className="des-pred-label">{label}</span>
                <div className="des-pred-right">
                  <span className="des-pred-note">{note}</span>
                  <span className="des-pred-value" style={{ color }}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="des-disclaimer">
        * {des.simRuns.toLocaleString()}회 Monte Carlo 기반 P25(보수적) 처리량을 ROI에 반영. 실제 주방 레이아웃·동선 측정으로 HRI 보정 시 정확도 향상.
      </p>
    </div>
  );
}
