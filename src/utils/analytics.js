/**
 * 사용자 행동 분석 유틸리티
 * localStorage에 세션 데이터 기록 → 이탈 분석 및 UX 개선에 활용
 */

const SESSION_KEY = 'roi_sim_sessions';
const EVENT_KEY = 'roi_sim_events';

let sessionId = null;
let stepStartTime = null;

function getSessionId() {
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

/** 스텝 진입 기록 */
export function trackStepEnter(stepNumber, stepName) {
  stepStartTime = Date.now();
  _log('step_enter', { step: stepNumber, name: stepName });
}

/** 스텝 완료 기록 (체류 시간 포함) */
export function trackStepComplete(stepNumber, stepName, inputs = {}) {
  const duration = stepStartTime ? Date.now() - stepStartTime : 0;
  _log('step_complete', { step: stepNumber, name: stepName, durationMs: duration, inputs });
  stepStartTime = null;
}

/** 스텝 이탈 기록 */
export function trackStepExit(stepNumber, stepName, reason = 'back') {
  const duration = stepStartTime ? Date.now() - stepStartTime : 0;
  _log('step_exit', { step: stepNumber, name: stepName, reason, durationMs: duration });
}

/** 결과 조회 기록 */
export function trackResultView(results) {
  _log('result_view', {
    roi: results.roiOneYear,
    payback: results.paybackMonths,
    annualBenefit: results.annualNetBenefit,
  });
}

/** 리드 제출 기록 */
export function trackLeadSubmit(hasEmail, hasPhone, wantsConsultation) {
  _log('lead_submit', { hasEmail, hasPhone, wantsConsultation });
}

/** PDF 다운로드 기록 */
export function trackPDFDownload() {
  _log('pdf_download', {});
}

/** 공유 버튼 클릭 기록 */
export function trackShare(method) {
  _log('share_click', { method });
}

/** 저장된 세션 데이터 조회 (개발자 도구용) */
export function getAnalyticsSummary() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
    return sessions;
  } catch {
    return [];
  }
}

function _log(event, data) {
  try {
    const entry = {
      sessionId: getSessionId(),
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };
    const events = JSON.parse(localStorage.getItem(EVENT_KEY) || '[]');
    // 최대 500개 이벤트 유지
    if (events.length >= 500) events.splice(0, 100);
    events.push(entry);
    localStorage.setItem(EVENT_KEY, JSON.stringify(events));
    console.debug('[Analytics]', event, data);
  } catch {
    // 로컬 스토리지 오류는 무시
  }
}
