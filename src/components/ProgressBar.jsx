import React from 'react';

const STEP_NAMES = [
  '업종 선택',
  '매장 규모',
  '인건비',
  '주방 자동화',
  '정부 지원',
  '결과',
];

export default function ProgressBar({ currentStep, totalSteps }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="progress-section">
      <div className="progress-meta">
        <span className="progress-label">{STEP_NAMES[currentStep - 1]}</span>
        <span className="progress-step">{currentStep} / {totalSteps}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="step-dots">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`step-dot ${i + 1 === currentStep ? 'active' : i + 1 < currentStep ? 'done' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
