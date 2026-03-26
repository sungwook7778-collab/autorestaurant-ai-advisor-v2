import React from 'react';
import { formatWon } from '../utils/formatters.js';

const LOSS_ITEMS = [
  {
    key: 'hrRisk',
    label: '인적 리스크',
    subLabel: '채용·교육·이직 비용',
    icon: '👤',
    driver: '인력 절감으로 이직 리스크 감소',
  },
  {
    key: 'operEfficiency',
    label: '운영 효율성 손실',
    subLabel: '피크타임 처리 한계 기회손실',
    icon: '⚡',
    driver: 'DES 시뮬레이션 처리량 향상 반영',
  },
  {
    key: 'qualityLoss',
    label: '품질 관리 손실',
    subLabel: '조리 실수·식재료 폐기비용',
    icon: '🍽️',
    driver: '자동화로 폐기율 및 오류율 감소',
  },
  {
    key: 'otherLoss',
    label: '재무적 기타 손실',
    subLabel: '야근·공수 낭비·간접 관리비',
    icon: '📋',
    driver: '인력 효율화로 간접비 절감',
  },
];

export default function AsIsLossPanel({ asIsLoss, toBeOutcomes }) {
  if (!asIsLoss) return null;

  const hasToBe = !!toBeOutcomes;
  const maxVal = Math.max(
    asIsLoss.hrRisk,
    asIsLoss.operEfficiency,
    asIsLoss.qualityLoss,
    asIsLoss.otherLoss,
    1,
  );

  return (
    <div className="asis-panel">
      {/* 헤더 */}
      <div className="asis-header">
        <div className="asis-title-row">
          <span className="asis-badge">운영 손실</span>
          <span className="asis-title">비효율 비용 분석 (월간 기준)</span>
        </div>
        <div className="asis-legend">
          <span className="asis-legend-dot asis-dot" />
          <span style={{ marginRight: 10 }}>AS-IS (현재)</span>
          {hasToBe && (
            <>
              <span className="asis-legend-dot tobe-dot" />
              TO-BE (자동화 후)
            </>
          )}
        </div>
      </div>

      {/* 항목별 수평 비교 바 */}
      <div className="asis-compare-list">
        {LOSS_ITEMS.map(({ key, label, subLabel, icon, driver }) => {
          const asisVal = asIsLoss[key];
          const tobeVal = hasToBe ? toBeOutcomes[key] : null;
          const saving  = hasToBe ? asisVal - tobeVal : 0;
          const savingPct = asisVal > 0 ? Math.round((saving / asisVal) * 100) : 0;

          const asisPct = (asisVal / maxVal) * 100;
          const tobePct = hasToBe ? (tobeVal / maxVal) * 100 : 0;

          return (
            <div key={key} className="asis-compare-item">
              {/* 왼쪽: 항목 정보 */}
              <div className="asis-item-meta">
                <div className="asis-item-icon">{icon}</div>
                <div>
                  <div className="asis-item-label">{label}</div>
                  <div className="asis-item-sub">{subLabel}</div>
                </div>
              </div>

              {/* 중앙: 오버랩 바 */}
              <div className="asis-bars-col">
                {/* AS-IS 바 */}
                <div className="asis-bar-row">
                  <span className="asis-bar-tag asis-tag">AS-IS</span>
                  <div className="asis-bar-track">
                    <div
                      className="asis-bar-seg asis-seg"
                      style={{ width: `${asisPct}%` }}
                    />
                  </div>
                  <span className="asis-bar-num asis-num">
                    {Math.round(asisVal / 10000)}만원
                  </span>
                </div>

                {/* TO-BE 바 */}
                {hasToBe && (
                  <div className="asis-bar-row">
                    <span className="asis-bar-tag tobe-tag">TO-BE</span>
                    <div className="asis-bar-track">
                      <div
                        className="asis-bar-seg tobe-seg"
                        style={{ width: `${tobePct}%` }}
                      />
                      {/* 절감 영역 표시 */}
                      {saving > 0 && (
                        <div
                          className="asis-bar-seg saving-seg"
                          style={{ width: `${asisPct - tobePct}%` }}
                        />
                      )}
                    </div>
                    <span className="asis-bar-num tobe-num">
                      {Math.round(tobeVal / 10000)}만원
                    </span>
                  </div>
                )}
              </div>

              {/* 오른쪽: 절감 배지 */}
              {hasToBe && saving > 0 && (
                <div className="asis-saving-badge">
                  <div className="asis-saving-amount">-{Math.round(saving / 10000)}만</div>
                  <div className="asis-saving-pct">{savingPct}% 절감</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 합계 비교 */}
      <div className="asis-summary-compare">
        <div className="asis-summary-col asis-col">
          <div className="asis-summary-badge asis-badge-sm">AS-IS</div>
          <div className="asis-summary-val asis-val">
            {Math.round(asIsLoss.totalMonthly / 10000).toLocaleString()}만원
            <span className="asis-summary-unit">/월</span>
          </div>
          <div className="asis-summary-annual">
            연간 {formatWon(asIsLoss.annualSunkImpact)} 손실
          </div>
        </div>

        {hasToBe && (
          <>
            <div className="asis-summary-arrow">→</div>
            <div className="asis-summary-col tobe-col">
              <div className="asis-summary-badge tobe-badge-sm">TO-BE</div>
              <div className="asis-summary-val tobe-val">
                {Math.round(toBeOutcomes.totalMonthly / 10000).toLocaleString()}만원
                <span className="asis-summary-unit">/월</span>
              </div>
              <div className="asis-summary-annual">
                연간 {formatWon(toBeOutcomes.totalMonthly * 12)} 잔존
              </div>
            </div>
            <div className="asis-summary-sep" />
            <div className="asis-summary-col saving-col">
              <div className="asis-summary-badge saving-badge-sm">월 절감</div>
              <div className="asis-summary-val saving-val">
                +{Math.round(toBeOutcomes.monthlySaving / 10000).toLocaleString()}만원
                <span className="asis-summary-unit">/월</span>
              </div>
              <div className="asis-summary-annual">
                연간 {formatWon(toBeOutcomes.annualSaving)} 절감
              </div>
            </div>
          </>
        )}
      </div>

      <p className="asis-disclaimer">
        * 업종별 이직률·폐기율·피크타임 기회손실 기준 추정값입니다. TO-BE는 DES 시뮬레이션 보수적 처리량 및 선택 장비 효율 기반으로 산출됩니다.
      </p>
    </div>
  );
}
