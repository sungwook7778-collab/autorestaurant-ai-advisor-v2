import React from 'react';
import { formatWon } from '../utils/formatters.js';

const PROCESS_PROFILE = {
  dishwasher: {
    processLabel: '세척 공정',
    asIsIssues: [
      '설거지 전담 인력 상시 투입 필요',
      '피크타임 세척 병목 → 테이블 회전율 저하',
      '세척 품질 불균일로 위생 리스크 상존',
    ],
    toBeGains: [
      '자동 세척으로 인력 재배치 가능',
      '일정한 처리 속도 확보, 병목 해소',
      '표준화된 세척 사이클로 위생 품질 안정',
    ],
    asIsColor: '#EF4444',
    toBeColor: '#16A34A',
  },
  stirCook: {
    processLabel: '조리 공정',
    asIsIssues: [
      '숙련 조리사 의존 → 이직 시 품질 불안정',
      '피크타임 동시 출고 한계로 고객 대기 증가',
      '화력·타이밍 편차로 메뉴 품질 불균일',
    ],
    toBeGains: [
      '레시피 프로그램화로 품질 일관성 확보',
      '다구 동시 처리, 출고 속도 향상',
      '조리사 핵심 업무(메뉴 개발·CS)에 집중',
    ],
    asIsColor: '#EF4444',
    toBeColor: '#16A34A',
  },
  prep: {
    processLabel: '전처리 공정',
    asIsIssues: [
      '오픈 전 전처리 인력·시간 과다 소모',
      '수작업 절단으로 식재료 손실 높음',
      '전처리 품질(두께·크기) 편차 발생',
    ],
    toBeGains: [
      '자동 전처리로 오픈 준비 시간 단축',
      '규격화 절단으로 식재료 손실률 감소',
      '균일한 식재료 품질 → 조리 표준화 기여',
    ],
    asIsColor: '#F97316',
    toBeColor: '#16A34A',
  },
  fryer: {
    processLabel: '튀김 공정',
    asIsIssues: [
      '온도·시간 수동 관리 → 조리 편차 발생',
      '오일 교체 타이밍 주관적 판단 → 낭비 발생',
      '피크 시 담당자 고정 배치 필요',
    ],
    toBeGains: [
      '정밀 온도·타이머 제어로 품질 안정',
      '오일 수명 자동 최적화 → 원가 절감',
      '무인·반자동 운영으로 인력 탄력 배치',
    ],
    asIsColor: '#F97316',
    toBeColor: '#16A34A',
  },
  combi: {
    processLabel: '가열·오븐 공정',
    asIsIssues: [
      '오븐·찜기 등 설비 분산 → 공간·에너지 비효율',
      '열 손실·수분 관리 어려워 조리 편차 발생',
      '다품종 동시 조리 불가 → 메뉴 제한',
    ],
    toBeGains: [
      '증기·대류·복합 조리 일원화, 공간 절약',
      '정밀 스팀·에너지 제어로 품질 안정',
      '다품종 동시 처리 → 메뉴 다양화 가능',
    ],
    asIsColor: '#8B5CF6',
    toBeColor: '#16A34A',
  },
};

function ContribBar({ value, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="proc-contrib-bar">
      <div
        className="proc-contrib-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export default function ProcessImprovementPanel({ selectedItems }) {
  if (!selectedItems || selectedItems.length === 0) return null;

  const totalTP = selectedItems.reduce((s, i) => s + i.throughputPts, 0);
  const totalWP = selectedItems.reduce((s, i) => s + i.wastePts, 0);

  return (
    <div className="proc-panel">
      <div className="proc-panel-header">
        <div className="proc-panel-eyebrow">AS-IS → TO-BE</div>
        <div className="proc-panel-title">공정별 개선 효과 분석</div>
        <div className="proc-panel-sub">
          선택된 {selectedItems.length}개 공정의 현재 문제점과 자동화 후 개선 효과를 비교합니다
        </div>
      </div>

      <div className="proc-cards">
        {selectedItems.map((item) => {
          const profile = PROCESS_PROFILE[item.categoryId] || {
            processLabel: item.categoryName,
            asIsIssues: ['수작업 의존', '품질 편차', '인력 낭비'],
            toBeGains: ['자동화 처리', '품질 표준화', '인력 절감'],
            asIsColor: '#EF4444',
            toBeColor: '#16A34A',
          };

          const tpPct = totalTP > 0 ? Math.round((item.throughputPts / totalTP) * 100) : 0;
          const wpPct = totalWP > 0 ? Math.round((item.wastePts / totalWP) * 100) : 0;
          const laborHrs = Math.round(item.staffEquiv * 160);

          return (
            <div key={item.categoryId} className="proc-card">
              {/* 공정 헤더 */}
              <div className="proc-card-header">
                <div className="proc-card-header-left">
                  <span className="proc-card-icon">{item.categoryIcon}</span>
                  <div className="proc-card-text">
                    <div className="proc-card-process">{profile.processLabel}</div>
                    <div className="proc-card-equip">{item.name}</div>
                  </div>
                </div>
                <div className="proc-card-mfr-badge">{item.manufacturer}</div>
              </div>

              {/* AS-IS / TO-BE 비교 */}
              <div className="proc-compare-row">
                {/* AS-IS */}
                <div className="proc-side asis">
                  <div className="proc-side-label" style={{ color: profile.asIsColor }}>
                    AS-IS · 현재 문제
                  </div>
                  <ul className="proc-issue-list">
                    {profile.asIsIssues.map((issue, i) => (
                      <li key={i} className="proc-issue-item">
                        <span className="proc-issue-dot" style={{ background: profile.asIsColor }} />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="proc-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* TO-BE */}
                <div className="proc-side tobe">
                  <div className="proc-side-label" style={{ color: profile.toBeColor }}>
                    TO-BE · 자동화 후 개선
                  </div>
                  <ul className="proc-issue-list">
                    {profile.toBeGains.map((gain, i) => (
                      <li key={i} className="proc-issue-item">
                        <span className="proc-issue-dot" style={{ background: profile.toBeColor }} />
                        {gain}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 수치 기여도 */}
              <div className="proc-metrics-row">
                <div className="proc-metric-chip">
                  <div className="proc-metric-chip-label">처리량 기여</div>
                  <ContribBar value={item.throughputPts} total={totalTP} color="#2563EB" />
                  <div className="proc-metric-chip-val tp">전체의 {tpPct}%</div>
                </div>
                <div className="proc-metric-chip">
                  <div className="proc-metric-chip-label">폐기 절감 기여</div>
                  <ContribBar value={item.wastePts} total={totalWP} color="#D97706" />
                  <div className="proc-metric-chip-val wp">전체의 {wpPct}%</div>
                </div>
                <div className="proc-metric-chip solo">
                  <div className="proc-metric-chip-label">인력 절감</div>
                  <div className="proc-metric-chip-val sf">
                    {laborHrs}h/월
                    <span className="proc-metric-chip-sub"> ({item.staffEquiv.toFixed(2)} FTE)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
