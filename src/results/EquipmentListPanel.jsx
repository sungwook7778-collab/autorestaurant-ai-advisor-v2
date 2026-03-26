import React from 'react';
import { formatWon } from '../utils/formatters.js';

function StaffBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="equip-bar-wrap">
      <div className="equip-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EquipmentListPanel({ selectedItems, totalInvestment, monthlyRobotCost }) {
  if (!selectedItems || selectedItems.length === 0) return null;

  const totalEquipPrice = selectedItems.reduce((s, i) => s + i.price, 0);
  const totalMonthly = selectedItems.reduce((s, i) => s + i.monthlyCost, 0);
  const maxTP = Math.max(...selectedItems.map((i) => i.throughputPts));
  const maxWP = Math.max(...selectedItems.map((i) => i.wastePts));

  return (
    <div className="equip-list-panel">
      <div className="equip-list-header">
        <div className="equip-list-eyebrow">INTRODUCTION PLAN</div>
        <div className="equip-list-title">도입 자동화 장비 구성</div>
        <div className="equip-list-sub">
          총 {selectedItems.length}개 공정 자동화 · 장비 도입 원가 {formatWon(totalEquipPrice)} · 월 운영비 {formatWon(totalMonthly)}
        </div>
      </div>

      <div className="equip-cards-grid">
        {selectedItems.map((item, idx) => (
          <div key={item.categoryId} className="equip-card">
            <div className="equip-card-top">
              <div className="equip-card-num">{String(idx + 1).padStart(2, '0')}</div>
              <div className="equip-card-category">
                <span className="equip-card-icon">{item.categoryIcon}</span>
                {item.categoryName}
              </div>
            </div>

            <div className="equip-card-name">{item.name}</div>
            <div className="equip-card-mfr">{item.manufacturer}</div>
            {item.priceNote && (
              <div className="equip-card-note">{item.priceNote}</div>
            )}

            <div className="equip-card-metrics">
              <div className="equip-metric-row">
                <span className="equip-metric-key">처리량 기여</span>
                <StaffBar value={item.throughputPts} max={maxTP} />
                <span className="equip-metric-val tp">+{item.throughputPts}pt</span>
              </div>
              <div className="equip-metric-row">
                <span className="equip-metric-key">폐기 절감</span>
                <StaffBar value={item.wastePts} max={maxWP} />
                <span className="equip-metric-val wp">-{item.wastePts}pt</span>
              </div>
              <div className="equip-metric-row">
                <span className="equip-metric-key">인력 절감</span>
                <span className="equip-metric-val sf">
                  {item.staffEquiv >= 1
                    ? `약 ${item.staffEquiv.toFixed(1)}인`
                    : `약 ${Math.round(item.staffEquiv * 160)}h/월`}
                </span>
              </div>
            </div>

            <div className="equip-card-cost-row">
              <div className="equip-cost-item">
                <div className="equip-cost-label">도입 비용</div>
                <div className="equip-cost-value">{formatWon(item.price)}</div>
              </div>
              <div className="equip-cost-divider" />
              <div className="equip-cost-item">
                <div className="equip-cost-label">월 운영비</div>
                <div className="equip-cost-value monthly">{formatWon(item.monthlyCost)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="equip-list-summary">
        <div className="equip-summary-item">
          <div className="equip-summary-label">총 장비 도입 원가</div>
          <div className="equip-summary-value">{formatWon(totalEquipPrice)}</div>
        </div>
        <div className="equip-summary-sep">+</div>
        <div className="equip-summary-item">
          <div className="equip-summary-label">설치·교육비</div>
          <div className="equip-summary-value">{formatWon(totalInvestment - totalEquipPrice)}</div>
        </div>
        <div className="equip-summary-sep">=</div>
        <div className="equip-summary-item highlight">
          <div className="equip-summary-label">총 투자 비용</div>
          <div className="equip-summary-value">{formatWon(totalInvestment)}</div>
        </div>
        <div className="equip-summary-sep" style={{ opacity: 0 }}>|</div>
        <div className="equip-summary-item">
          <div className="equip-summary-label">월 운영비 합계</div>
          <div className="equip-summary-value monthly">{formatWon(monthlyRobotCost)}/월</div>
        </div>
      </div>
    </div>
  );
}
