import React, { useReducer, useCallback } from 'react';
import ProgressBar from './components/ProgressBar.jsx';
import Step1Industry from './steps/Step1Industry.jsx';
import Step2Scale from './steps/Step2Scale.jsx';
import Step3Labor from './steps/Step3Labor.jsx';
import Step4Robot from './steps/Step4Robot.jsx';
import Step5Subsidy from './steps/Step5Subsidy.jsx';
import Dashboard from './results/Dashboard.jsx';
import { calculateROI } from './engine/roiCalculator.js';
import { createEmptyKitchenSelections } from './engine/kitchenEquipmentCatalog.js';
import { aggregateKitchenFromState } from './engine/aggregateKitchenSelections.js';
import { trackStepEnter, trackStepComplete, trackStepExit } from './utils/analytics.js';

// ─── 초기 상태 ───────────────────────────────────────────────
const INITIAL_STATE = {
  step: 1,
  totalSteps: 6,

  // Step 1: 업종
  industry: null,

  // Step 2: 매장 규모
  seats: 50,
  staffCount: 3,
  monthlyRevenue: 15000000,

  // Step 3: 인건비
  avgMonthlyWagePerPerson: 2500000,
  workHoursPerWeek: 48,
  annualWageIncreaseRate: 5,

  // Step 4: 주방 자동화 (제품군별 선택, null = 해당 군 미도입)
  kitchenSelections: createEmptyKitchenSelections(),
  robotCount: 0,
  staffReduction: 0,
  throughputImprovement: 0,
  wasteReductionRate: 0,

  // Step 5: 정부 지원
  applySubsidy: true,
  subsidyAmount: 10000000,

  // 결과
  results: null,
};

const STEP_NAMES = ['', '업종 선택', '매장 규모', '인건비', '주방 자동화', '정부 지원', '결과'];

// ─── Reducer ───────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_INDUSTRY':
      return { ...state, industry: action.payload };

    case 'APPLY_DEFAULTS':
      return { ...state, ...action.payload };

    case 'UPDATE':
      return { ...state, ...action.payload };

    case 'NEXT_STEP': {
      const nextStep = state.step + 1;
      let results = state.results;
      if (nextStep === state.totalSteps) {
        const calculated = calculateROI(state);
        if (!calculated) return state;
        results = calculated;
      }
      return { ...state, step: nextStep, results };
    }

    case 'PREV_STEP':
      return { ...state, step: Math.max(1, state.step - 1) };

    case 'RESTART':
      return {
        ...INITIAL_STATE,
        kitchenSelections: createEmptyKitchenSelections(),
        results: null,
      };

    default:
      return state;
  }
}

// ─── App Component ───────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const handleNext = useCallback(() => {
    if (state.step === 4 && !aggregateKitchenFromState(state).hasSelection) {
      window.alert('주방 자동화 단계에서 장비를 한 가지 이상 선택해 주세요.');
      return;
    }
    trackStepComplete(state.step, STEP_NAMES[state.step]);
    dispatch({ type: 'NEXT_STEP' });
    trackStepEnter(state.step + 1, STEP_NAMES[state.step + 1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

  const handlePrev = useCallback(() => {
    trackStepExit(state.step, STEP_NAMES[state.step], 'back');
    dispatch({ type: 'PREV_STEP' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoHome = useCallback(() => {
    if (state.step <= 1) return;
    const ok = window.confirm('처음 화면으로 돌아가시겠습니까? 입력한 내용은 초기화됩니다.');
    if (ok) handleRestart();
  }, [state.step, handleRestart]);

  const showProgress = state.step < state.totalSteps;

  const stepProps = { state, dispatch, onNext: handleNext, onPrev: handlePrev };

  return (
    <div className="app-shell">
      {/* 헤더 */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">🤖</div>
          <span className="logo-text">Free<span>Kit</span></span>
        </div>
        <div className="header-actions">
          {state.step > 1 && (
            <button
              type="button"
              className="btn-home"
              onClick={handleGoHome}
              aria-label="처음 화면으로"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              처음으로
            </button>
          )}
        <div className="header-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          무료 ROI 분석
        </div>
        </div>
      </header>

      {/* 진행률 바 */}
      {showProgress && (
        <ProgressBar currentStep={state.step} totalSteps={state.totalSteps} />
      )}

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {state.step === 1 && <Step1Industry {...stepProps} />}
        {state.step === 2 && <Step2Scale {...stepProps} />}
        {state.step === 3 && <Step3Labor {...stepProps} />}
        {state.step === 4 && <Step4Robot {...stepProps} />}
        {state.step === 5 && <Step5Subsidy {...stepProps} />}
        {state.step === 6 && state.results && (
          <Dashboard state={state} results={state.results} onRestart={handleRestart} />
        )}
        {state.step === 6 && !state.results && (
          <div className="step-card">
            <p className="step-subtitle" style={{ marginBottom: 0 }}>
              분석을 진행할 수 없습니다. 주방 자동화 단계에서 장비를 한 가지 이상 선택한 뒤 다시 시도해 주세요.
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <div className="footer-trust">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>데이터 암호화 보호</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>무료 시뮬레이션</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>개인정보 안전 보호</span>
          </div>
        </div>
        <div className="footer-copy">© 2025 FreeKit Inc. All rights reserved.</div>
      </footer>
    </div>
  );
}
