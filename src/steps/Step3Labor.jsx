import React from 'react';
import SliderInput from '../components/SliderInput.jsx';
import NavigationButtons from '../components/NavigationButtons.jsx';
import { formatWon } from '../utils/formatters.js';

export default function Step3Labor({ state, dispatch, onNext, onPrev }) {
  const update = (key) => (val) => dispatch({ type: 'UPDATE', payload: { [key]: val } });

  const monthlyTotal = state.staffCount * state.avgMonthlyWagePerPerson;
  const annualTotal = monthlyTotal * 12;
  const projectedAnnual3Y = monthlyTotal * 12 * Math.pow(1 + state.annualWageIncreaseRate / 100, 3);

  return (
    <div className="step-card">
      <div className="step-icon-wrap">💼</div>
      <h2 className="step-title">인건비 현황을 입력하세요</h2>
      <p className="step-subtitle">직원 급여와 임금 상승 전망을 입력하면 장기 ROI를 더 정확하게 예측할 수 있습니다.</p>

      <SliderInput
        label="직원 1인당 월 급여"
        value={state.avgMonthlyWagePerPerson}
        min={2000000}
        max={4500000}
        step={50000}
        onChange={update('avgMonthlyWagePerPerson')}
        formatValue={(v) => `${Math.round(v / 10000)}만`}
        unit="원"
        hint={`2025년 최저임금 기준 월 2,096,270원 (209시간)`}
        minLabel="200만원"
        maxLabel="450만원"
      />

      <SliderInput
        label="주당 평균 근무시간"
        value={state.workHoursPerWeek}
        min={40}
        max={68}
        step={2}
        onChange={update('workHoursPerWeek')}
        formatValue={(v) => v}
        unit="시간"
        hint="연장·야간 수당 산정 기준"
        minLabel="40시간"
        maxLabel="68시간"
      />

      <SliderInput
        label="연간 임금 상승률 예상"
        value={state.annualWageIncreaseRate}
        min={0}
        max={15}
        step={0.5}
        onChange={update('annualWageIncreaseRate')}
        formatValue={(v) => v.toFixed(1)}
        unit="%"
        hint="최근 3년 평균 최저임금 인상률 약 5~6%"
        minLabel="0%"
        maxLabel="15%"
      />

      {/* 비용 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        <div style={{
          background: 'var(--danger-light)', border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>현재 연간 인건비</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#B91C1C' }}>{formatWon(annualTotal)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>월 {formatWon(monthlyTotal)}</div>
        </div>
        <div style={{
          background: 'var(--warning-light)', border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>3년 후 예상 인건비</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#92400E' }}>{formatWon(projectedAnnual3Y)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>임금 {state.annualWageIncreaseRate}% 상승 가정</div>
        </div>
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} />
    </div>
  );
}
