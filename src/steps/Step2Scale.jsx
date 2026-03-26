import React from 'react';
import SliderInput from '../components/SliderInput.jsx';
import NavigationButtons from '../components/NavigationButtons.jsx';
import { formatWon } from '../utils/formatters.js';

export default function Step2Scale({ state, dispatch, onNext, onPrev }) {
  const update = (key) => (val) => dispatch({ type: 'UPDATE', payload: { [key]: val } });

  return (
    <div className="step-card">
      <div className="step-icon-wrap">🏪</div>
      <h2 className="step-title">매장 규모를 알려주세요</h2>
      <p className="step-subtitle">좌석 수와 현재 직원 수, 월 매출을 설정해 주세요. 슬라이더로 간편하게 조정할 수 있어요.</p>

      <SliderInput
        label="좌석 수"
        value={state.seats}
        min={10}
        max={200}
        step={5}
        onChange={update('seats')}
        formatValue={(v) => v}
        unit="석"
        hint="홀 좌석 기준 (바 좌석 포함)"
        minLabel="10석"
        maxLabel="200석"
      />

      <SliderInput
        label="현재 직원 수 (홀 기준)"
        value={state.staffCount}
        min={1}
        max={15}
        step={1}
        onChange={update('staffCount')}
        formatValue={(v) => v}
        unit="명"
        hint="서빙·홀 담당 직원만 입력하세요"
        minLabel="1명"
        maxLabel="15명"
      />

      <SliderInput
        label="월 평균 매출"
        value={state.monthlyRevenue}
        min={3000000}
        max={80000000}
        step={1000000}
        onChange={update('monthlyRevenue')}
        formatValue={(v) => `${Math.round(v / 10000)}만`}
        unit="원"
        hint="배달 매출 포함한 총 매출"
        minLabel="300만원"
        maxLabel="8,000만원"
      />

      <div className="info-box">
        <span className="info-box-icon">📊</span>
        <p className="info-box-text">
          현재 입력 기준 월 인건비 예상: <strong>{formatWon(state.staffCount * state.avgMonthlyWagePerPerson)}</strong>
          (직원 {state.staffCount}명 × {formatWon(state.avgMonthlyWagePerPerson)}/인)
        </p>
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} />
    </div>
  );
}
