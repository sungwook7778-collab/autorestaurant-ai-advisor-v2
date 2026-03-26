import React from 'react';
import { formatWon } from '../utils/formatters.js';

const LOSS_ITEMS = [
  {
    key: 'hrRisk',
    label: '인적 리스크',
    subLabel: '신규 채용 및 교육 배용비',
    icon: '👤',
    color: '#EF4444',
  },
  {
    key: 'operEfficiency',
    label: '운영 효율성 손실',
    subLabel: '피크타임 주문 처리 한계 손실',
    icon: '⚡',
    color: '#F97316',
  },
  {
    key: 'qualityLoss',
    label: '품질 관리 손실',
    subLabel: '조리 실수 및 식재료 폐기비용',
    icon: '🍽️',
    color: '#EF4444',
  },
  {
    key: 'otherLoss',
    label: '재무적 기타 손실',
    subLabel: '운영 공수 및 간접 관리 비용',
    icon: '📋',
    color: '#F97316',
  },
];

export default function AsIsLossPanel({ asIsLoss }) {
  if (!asIsLoss) return null;

  const maxVal = Math.max(
    asIsLoss.hrRisk,
    asIsLoss.operEfficiency,
    asIsLoss.qualityLoss,
    asIsLoss.otherLoss,
  );

  return (
    <div className="asis-panel">
      <div className="asis-header">
        <div className="asis-title-row">
          <span className="asis-badge">AS-IS</span>
          <span className="asis-title">운영 손실 대시보드 (월간 기준)</span>
        </div>
        <div className="asis-legend">
          <span className="asis-legend-dot fixed" />고정 비용
          <span className="asis-legend-dot loss" />매출 손실
        </div>
      </div>

      {/* 막대 그래프 */}
      <div className="asis-bar-grid">
        {LOSS_ITEMS.map(({ key, label, subLabel, icon }) => {
          const val = asIsLoss[key];
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const wan = Math.round(val / 10000);
          return (
            <div key={key} className="asis-bar-col">
              <div className="asis-bar-amount">{wan}만원</div>
              <div className="asis-bar-sub">{subLabel}</div>
              <div className="asis-bar-wrap">
                <div
                  className="asis-bar-fill"
                  style={{ height: `${Math.max(pct, 8)}%` }}
                />
              </div>
              <div className="asis-bar-label">
                <span>{icon}</span> {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 합계 배너 */}
      <div className="asis-totals">
        <div className="asis-total-item">
          <div className="asis-total-label">총 월간 비효율 매몰 비용</div>
          <div className="asis-total-value">
            {Math.round(asIsLoss.totalMonthly / 10000).toLocaleString()}만원
            <span className="asis-total-unit">/월 평균</span>
          </div>
        </div>
        <div className="asis-divider" />
        <div className="asis-total-item">
          <div className="asis-total-label">연간 누적 손실 규모 (ANNUAL SUNK IMPACT)</div>
          <div className="asis-total-value asis-annual">
            {formatWon(asIsLoss.annualSunkImpact)}
          </div>
        </div>
      </div>

      <p className="asis-disclaimer">
        * 업종별 평균 이직률·폐기율·피크타임 기회손실 기준 추정값입니다. 실제 매장 운영 데이터로 보정하면 더 정확해집니다.
      </p>
    </div>
  );
}
