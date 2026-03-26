import React from 'react';

export default function NavigationButtons({
  onNext,
  onPrev,
  nextLabel = '다음',
  disabled = false,
  showPrev = true,
  isLast = false,
}) {
  return (
    <div className="nav-buttons">
      {showPrev && (
        <button className="btn-prev" onClick={onPrev} type="button" aria-label="이전 단계">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          이전
        </button>
      )}
      <button
        className="btn-next"
        onClick={onNext}
        disabled={disabled}
        type="button"
        aria-label={nextLabel}
      >
        {nextLabel}
        {!isLast && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
        {isLast && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
    </div>
  );
}
