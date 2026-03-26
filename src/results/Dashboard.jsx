import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards.jsx';
import BeforeAfterChart from './BeforeAfterChart.jsx';
import TimelineChart from './TimelineChart.jsx';
import ScenarioAnalysis from './ScenarioAnalysis.jsx';
import CalculationDetail from './CalculationDetail.jsx';
import PDFReport from './PDFReport.jsx';
import AsIsLossPanel from './AsIsLossPanel.jsx';
import EquipmentListPanel from './EquipmentListPanel.jsx';
import ProcessImprovementPanel from './ProcessImprovementPanel.jsx';
import { formatWon, formatMonths } from '../utils/formatters.js';
import { INDUSTRY_DEFAULTS } from '../engine/industryDefaults.js';
import { formatKitchenEquipmentHeadline } from '../engine/aggregateKitchenSelections.js';
import { trackResultView } from '../utils/analytics.js';

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="toast-container">
      <div className="toast">{message}</div>
    </div>
  );
}

export default function Dashboard({ state, results, onRestart }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    trackResultView(results);
  }, []);

  const ind = state.industry ? INDUSTRY_DEFAULTS[state.industry] : null;
  const equipmentHeadline = formatKitchenEquipmentHeadline(state);
  const isPositive = results.roiOneYear > 0;

  return (
    <div className="results-wrap">

      {/* ── 결과 헤더 배너 ── */}
      <div className="results-header">
        <div className="results-header-top">
          <div>
            <div className="results-headline">
              {ind?.name || '매장'} | {equipmentHeadline}
            </div>
            <div className="results-main-roi">
              {isPositive ? '+' : ''}{results.roiOneYear.toFixed(1)}<span>%</span>
            </div>
            <div className="results-subline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {results.paybackMonths
                ? `${formatMonths(results.paybackMonths)} 이내 투자 회수`
                : '즉시 수익 발생'}
            </div>
          </div>
          <div className="results-tag">
            {isPositive ? '✅ 수익' : '⚠️ 검토 필요'}
          </div>
        </div>
        <div className="results-header-pills">
          {results.insights.slice(0, 2).map((insight, i) => (
            <div key={i} className="result-pill">
              <span className="result-pill-value"
                dangerouslySetInnerHTML={{ __html: insight.replace(/<\/?strong>/g, '') }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 1: 도입 장비 리스트 ── */}
      <EquipmentListPanel
        selectedItems={results.selectedItems}
        totalInvestment={results.totalInvestment}
        monthlyRobotCost={results.monthlyRobotCost}
      />

      {/* ── SECTION 2: AS-IS 운영 손실 현황 ── */}
      <AsIsLossPanel asIsLoss={results.asIsLoss} toBeOutcomes={results.toBeOutcomes} />

      {/* ── SECTION 3: 공정별 AS-IS → TO-BE 개선 효과 ── */}
      <ProcessImprovementPanel selectedItems={results.selectedItems} />

      {/* ── SECTION 4: 핵심 KPI 카드 ── */}
      <SummaryCards results={results} />

      {/* ── SECTION 5: Before/After 비교 ── */}
      <BeforeAfterChart results={results} />

      {/* ── SECTION 6: 3년 누적 추이 ── */}
      <TimelineChart results={results} />

      {/* ── SECTION 7: 시나리오 분석 ── */}
      <ScenarioAnalysis results={results} />

      {/* ── SECTION 8: 정부 지원 비교 (조건부) ── */}
      {state.applySubsidy && (
        <div className="chart-section">
          <div className="chart-title"><span>🏛️</span> 정부 지원 효과 분석</div>
          <div className="chart-subtitle">2025 스마트상점 기술보급사업 적용 전·후 비교</div>
          <div className="subsidy-compare">
            <div className="subsidy-col">
              <div className="subsidy-col-label">지원 없이</div>
              <div className="subsidy-col-amount">{formatWon(results.subsidyComparison.withoutSubsidy.netInvestment)}</div>
              <div className="subsidy-col-sub">
                회수 {formatMonths(results.subsidyComparison.withoutSubsidy.paybackMonths)}
              </div>
            </div>
            <div className="subsidy-arrow">→</div>
            <div className="subsidy-col highlight">
              <div className="subsidy-col-label">지원 받으면</div>
              <div className="subsidy-col-amount green">{formatWon(results.subsidyComparison.withSubsidy.netInvestment)}</div>
              <div className="subsidy-col-sub">
                회수 {formatMonths(results.subsidyComparison.withSubsidy.paybackMonths)}
              </div>
            </div>
          </div>
          <div style={{
            textAlign: 'center', marginTop: 12, padding: '10px',
            background: 'var(--success-light)', borderRadius: 'var(--radius-sm)',
            fontSize: 13, color: 'var(--success)', fontWeight: 700
          }}>
            🎉 {formatWon(results.govSubsidy)} 절약으로 투자 부담 경감!
          </div>
        </div>
      )}

      {/* ── SECTION 9: 계산 방식 ── */}
      <CalculationDetail results={results} inputs={state} />

      {/* ── SECTION 10: 리포트 및 공유 ── */}
      <PDFReport state={state} results={results} onToast={setToast} />

      {/* 다시 시작 */}
      <button className="btn-restart" onClick={onRestart} type="button">
        🔄 다른 조건으로 다시 시뮬레이션
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
