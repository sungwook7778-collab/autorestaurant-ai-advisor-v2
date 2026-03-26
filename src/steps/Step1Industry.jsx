import React from 'react';
import { INDUSTRY_DEFAULTS } from '../engine/industryDefaults.js';
import NavigationButtons from '../components/NavigationButtons.jsx';

export default function Step1Industry({ state, dispatch, onNext }) {
  const industries = Object.values(INDUSTRY_DEFAULTS);

  const handleSelect = (id) => {
    const def = INDUSTRY_DEFAULTS[id];
    dispatch({ type: 'SET_INDUSTRY', payload: id });
    // 업종 선택 시 해당 업종의 기본값 자동 적용
    dispatch({
      type: 'APPLY_DEFAULTS', payload: {
        seats: def.avgSeats,
        staffCount: def.avgStaffCount,
        avgMonthlyWagePerPerson: def.avgMonthlyWagePerPerson,
        monthlyRevenue: def.avgMonthlyRevenue,
      }
    });
  };

  return (
    <div className="step-card">
      <div className="step-icon-wrap">🍽️</div>
      <h2 className="step-title">어떤 업종을 운영하고 계신가요?</h2>
      <p className="step-subtitle">업종을 선택하면 해당 업종의 평균 데이터가 자동으로 채워집니다. 나중에 직접 수정할 수 있어요.</p>

      <div className="select-grid">
        {industries.map((ind) => (
          <div
            key={ind.id}
            className={`select-card ${state.industry === ind.id ? 'selected' : ''}`}
            onClick={() => handleSelect(ind.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(ind.id)}
          >
            <div className="check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="select-card-icon">{ind.emoji}</div>
            <div className="select-card-name">{ind.name}</div>
            <div className="select-card-desc">{ind.desc}</div>
            <div className="select-card-badge">월 평균 {Math.round(ind.avgMonthlyRevenue / 10000)}만원</div>
          </div>
        ))}
      </div>

      <div className="info-box" style={{ marginTop: 16 }}>
        <span className="info-box-icon">💡</span>
        <p className="info-box-text">
          <strong>업종별 평균값은 참고용</strong>이며, 다음 단계에서 실제 매장 데이터로 세밀하게 조정할 수 있습니다.
        </p>
      </div>

      <NavigationButtons
        onNext={onNext}
        showPrev={false}
        disabled={!state.industry}
        nextLabel="다음 단계"
      />
    </div>
  );
}
