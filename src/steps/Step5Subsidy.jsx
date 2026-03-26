import React from 'react';
import NavigationButtons from '../components/NavigationButtons.jsx';
import { GOVERNMENT_SUBSIDY } from '../engine/industryDefaults.js';
import { aggregateKitchenFromState } from '../engine/aggregateKitchenSelections.js';
import { formatWon, formatMonths } from '../utils/formatters.js';

export default function Step5Subsidy({ state, dispatch, onNext, onPrev }) {
  const agg = aggregateKitchenFromState(state);
  const totalInvestment = agg.equipmentBasePrice * 1.05 + agg.trainingCost;
  const maxSubsidy = Math.min(GOVERNMENT_SUBSIDY.maxSubsidy, totalInvestment * GOVERNMENT_SUBSIDY.subsidyRate);

  const handleApply = (val) => {
    dispatch({ type: 'UPDATE', payload: { applySubsidy: val, subsidyAmount: val ? maxSubsidy : 0 } });
  };

  const withSubsidyNet = totalInvestment - maxSubsidy;
  const withoutSubsidyNet = totalInvestment;

  // 간이 회수 기간 예측
  const monthlyBenefit = state.staffReduction * state.avgMonthlyWagePerPerson +
    (state.monthlyRevenue * state.throughputImprovement / 100) * 0.25 +
    state.monthlyRevenue * 0.04 * (state.wasteReductionRate / 100) -
    agg.monthlyEquipmentCost;

  const paybackWith = monthlyBenefit > 0 ? withSubsidyNet / monthlyBenefit : null;
  const paybackWithout = monthlyBenefit > 0 ? withoutSubsidyNet / monthlyBenefit : null;

  return (
    <div className="step-card">
      <div className="step-icon-wrap">🏛️</div>
      <h2 className="step-title">정부 지원 정책 연동</h2>
      <p className="step-subtitle">2025년 스마트상점 기술보급사업을 통해 최대 <strong>1,000만 원</strong>까지 지원받을 수 있습니다.</p>

      {/* 정책 배너 */}
      <div className="subsidy-banner">
        <div className="subsidy-banner-icon">🎁</div>
        <div>
          <div className="subsidy-banner-title">{GOVERNMENT_SUBSIDY.programName}</div>
          <div className="subsidy-banner-amount">
            최대 {formatWon(GOVERNMENT_SUBSIDY.maxSubsidy)}
            <span> 국비 지원</span>
          </div>
        </div>
      </div>

      {/* 신청 여부 선택 */}
      <div style={{ marginBottom: 20 }}>
        <div className="slider-label" style={{ marginBottom: 12 }}>정부 지원 신청 여부</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div
            className={`select-card ${state.applySubsidy ? 'selected' : ''}`}
            onClick={() => handleApply(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleApply(true)}
          >
            <div className="check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="select-card-icon">✅</div>
            <div className="select-card-name">신청할 예정</div>
            <div className="select-card-desc">{formatWon(maxSubsidy)} 지원</div>
          </div>
          <div
            className={`select-card ${!state.applySubsidy ? 'selected' : ''}`}
            onClick={() => handleApply(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleApply(false)}
          >
            <div className="check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="select-card-icon">🚫</div>
            <div className="select-card-name">자비 부담</div>
            <div className="select-card-desc">지원 없이 도입</div>
          </div>
        </div>
      </div>

      {/* 지원 전/후 비교 */}
      <div style={{ marginBottom: 20 }}>
        <div className="slider-label" style={{ marginBottom: 12 }}>지원 전·후 투자비 비교</div>
        <div className="subsidy-compare">
          <div className="subsidy-col">
            <div className="subsidy-col-label">지원 없이</div>
            <div className="subsidy-col-amount">{formatWon(withoutSubsidyNet)}</div>
            {paybackWithout && <div className="subsidy-col-sub">회수 {formatMonths(paybackWithout)}</div>}
          </div>
          <div className="subsidy-arrow">→</div>
          <div className={`subsidy-col ${state.applySubsidy ? 'highlight' : ''}`}>
            <div className="subsidy-col-label">지원 받으면</div>
            <div className={`subsidy-col-amount ${state.applySubsidy ? 'green' : ''}`}>{formatWon(withSubsidyNet)}</div>
            {paybackWith && <div className="subsidy-col-sub">회수 {formatMonths(paybackWith)}</div>}
          </div>
        </div>
        {state.applySubsidy && (
          <div style={{
            textAlign: 'center', marginTop: 10,
            padding: '8px', background: 'var(--success-light)',
            borderRadius: 'var(--radius-sm)', fontSize: 13,
            color: 'var(--success)', fontWeight: 700
          }}>
            🎉 {formatWon(maxSubsidy)} 절약! 회수 기간 {paybackWithout && paybackWith ?
              `${formatMonths(paybackWithout)} → ${formatMonths(paybackWith)}으로 단축` : '단축'}
          </div>
        )}
      </div>

      {/* 지원 조건 */}
      <div className="info-box">
        <span className="info-box-icon">📋</span>
        <div className="info-box-text">
          <strong>지원 대상 조건:</strong>
          <ul style={{ marginTop: 4, paddingLeft: 16 }}>
            {GOVERNMENT_SUBSIDY.eligibility.map((e) => (
              <li key={e} style={{ marginBottom: 2 }}>{e}</li>
            ))}
          </ul>
          <div style={{ marginTop: 6 }}>{GOVERNMENT_SUBSIDY.additionalInfo}</div>
        </div>
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} nextLabel="ROI 결과 보기" isLast />
    </div>
  );
}
