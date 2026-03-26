import React, { useState } from 'react';
import { formatWon, formatWonFull } from '../utils/formatters.js';

function Accordion({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="calc-accordion">
      <div className="calc-accordion-header" onClick={() => setOpen(!open)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
        <div className="calc-accordion-title">
          <span className="calc-accordion-icon">{icon}</span>
          {title}
        </div>
        <svg className={`calc-chevron ${open ? 'open' : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <div className={`calc-accordion-body ${open ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function CalcRow({ label, value, pos, neg }) {
  return (
    <div className="calc-row">
      <span className="calc-row-label">{label}</span>
      <span className={`calc-row-value ${pos ? 'pos' : neg ? 'neg' : ''}`}>{value}</span>
    </div>
  );
}

export default function CalculationDetail({ results, inputs }) {
  const {
    totalInvestment, govSubsidy, netInvestment, installationCost, trainingCost,
    monthlyLaborSavings, monthlyThroughputGain, monthlyWasteSavings,
    monthlyTotalGains, monthlyRobotCost, monthlyNetBenefit,
    roiOneYear, paybackMonths, annualNetBenefit, npv3Year,
  } = results;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        🔍 계산 방식 보기 (How we calculated this)
      </div>

      <Accordion title="투자 비용 분해" icon="💳">
        <CalcRow label="장비 본체 가격" value={formatWon(totalInvestment - installationCost - trainingCost)} />
        <CalcRow label="설치·운반비 (본체의 5%)" value={formatWon(installationCost)} />
        <CalcRow label="교육·셋업비" value={formatWon(trainingCost)} />
        <CalcRow label="총 투자 비용" value={formatWon(totalInvestment)} />
        <CalcRow label="정부 지원금 차감" value={`-${formatWon(govSubsidy)}`} neg />
        <CalcRow label="실질 투자 비용 (순투자)" value={formatWon(netInvestment)} />
        <div className="calc-formula">
          순투자 = 총투자 - 정부지원금<br />
          = {formatWon(totalInvestment)} - {formatWon(govSubsidy)}<br />
          = {formatWon(netInvestment)}
        </div>
      </Accordion>

      <Accordion title="월별 수익 항목" icon="📈">
        <CalcRow label="인건비 절감" value={formatWon(monthlyLaborSavings)} pos />
        <CalcRow label="주방 출고·회전 (매출 향상분의 25%)" value={formatWon(monthlyThroughputGain)} pos />
        <CalcRow label="폐기물 감소" value={formatWon(monthlyWasteSavings)} pos />
        <CalcRow label="총 월 수익" value={formatWon(monthlyTotalGains)} pos />
        <CalcRow label="장비 운영비 차감" value={`-${formatWon(monthlyRobotCost)}`} neg />
        <CalcRow label="월 순이익" value={formatWon(monthlyNetBenefit)} pos />
        <div className="calc-formula">
          월 순이익 = 인건비절감 + 출고·회전이익 + 폐기물감소 - 장비운영비<br />
          = {formatWon(monthlyLaborSavings)} + {formatWon(monthlyThroughputGain)} + {formatWon(monthlyWasteSavings)} - {formatWon(monthlyRobotCost)}<br />
          = {formatWon(monthlyNetBenefit)}
        </div>
      </Accordion>

      <Accordion title="ROI 공식 적용" icon="🧮">
        <CalcRow label="연간 순이익" value={formatWon(annualNetBenefit)} pos />
        <CalcRow label="실질 투자 비용" value={formatWon(netInvestment)} />
        <CalcRow label="1년 ROI" value={`${roiOneYear > 0 ? '+' : ''}${roiOneYear.toFixed(1)}%`} pos={roiOneYear > 0} neg={roiOneYear < 0} />
        <CalcRow label="투자 회수 기간" value={paybackMonths ? `${paybackMonths.toFixed(1)}개월` : '-'} />
        <CalcRow label="3년 NPV (할인율 3%)" value={formatWon(npv3Year)} pos={npv3Year > 0} />
        <div className="calc-formula">
          ROI (%) = (연간수익 - 투자비용) / 투자비용 × 100<br />
          = ({formatWon(annualNetBenefit)} - {formatWon(netInvestment)}) / {formatWon(netInvestment)} × 100<br />
          = {roiOneYear.toFixed(1)}%<br /><br />
          투자회수기간 = 투자비용 / 월순이익<br />
          = {formatWon(netInvestment)} / {formatWon(monthlyNetBenefit)}<br />
          = {paybackMonths ? `${paybackMonths.toFixed(1)}개월` : '-'}
        </div>
      </Accordion>
    </div>
  );
}
