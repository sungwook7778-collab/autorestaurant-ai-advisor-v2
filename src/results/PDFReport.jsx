import React, { useState } from 'react';
import { formatWon, formatMonths, formatDate } from '../utils/formatters.js';
import { INDUSTRY_DEFAULTS } from '../engine/industryDefaults.js';
import { trackPDFDownload, trackShare } from '../utils/analytics.js';

function generateHTMLReport({ state, results }) {
  const ind = state.industry ? INDUSTRY_DEFAULTS[state.industry] : null;
  const date = formatDate();
  const lead = (state.leadName && String(state.leadName).trim()) || '';
  const headerSub = lead ? `${lead} 대표님 | ${date}` : `시뮬레이션 매장 | ${date}`;
  const equipLines = results.equipmentSummaryLines?.length
    ? results.equipmentSummaryLines.map((l) => `<p style="margin:4px 0;font-size:12px;opacity:0.9">${l}</p>`).join('')
    : '';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Noto Sans KR', Arial, sans-serif; margin: 0; padding: 40px; color: #111; background: white; }
  .header { background: linear-gradient(135deg, #1B3C73, #2563EB); color: white; padding: 32px; border-radius: 12px; margin-bottom: 28px; }
  .header h1 { font-size: 26px; font-weight: 800; margin: 0 0 6px; }
  .header p { font-size: 13px; opacity: 0.85; margin: 0; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 15px; font-weight: 800; color: #1B3C73; border-bottom: 2px solid #2563EB; padding-bottom: 6px; margin-bottom: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi-box { background: #F0F7FF; border-radius: 10px; padding: 16px; text-align: center; }
  .kpi-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
  .kpi-val { font-size: 20px; font-weight: 800; color: #1B3C73; }
  .kpi-sub { font-size: 10px; color: #9CA3AF; margin-top: 3px; }
  .table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .table th { background: #1B3C73; color: white; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; }
  .table td { padding: 9px 12px; border-bottom: 1px solid #E5E7EB; }
  .table tr:nth-child(even) td { background: #F9FAFB; }
  .pos { color: #16A34A; font-weight: 700; }
  .neg { color: #DC2626; font-weight: 700; }
  .footer { text-align: center; font-size: 11px; color: #9CA3AF; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
  .insight-box { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .insight-text { font-size: 13px; color: #166534; line-height: 1.6; }
</style>
</head>
<body>
<div class="header">
  <h1>🤖 FreeKit ROI 분석 리포트</h1>
  <p>${ind?.name || '음식점'} | ${headerSub}</p>
  <p style="margin-top:6px;font-size:12px;opacity:0.95">선택 주방 라인 (${state.robotCount}식)</p>
  ${equipLines}
  <p style="margin-top:8px;font-size:12px">이 리포트는 입력하신 데이터 기반의 시뮬레이션 결과이며, 실제 성과는 운영 환경에 따라 다를 수 있습니다.</p>
</div>

<div class="section">
  <div class="section-title">핵심 ROI 요약</div>
  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-label">1년 ROI</div>
      <div class="kpi-val">${results.roiOneYear > 0 ? '+' : ''}${results.roiOneYear.toFixed(1)}%</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">투자 회수 기간</div>
      <div class="kpi-val">${results.paybackMonths ? formatMonths(results.paybackMonths) : '-'}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">연간 순이익</div>
      <div class="kpi-val">${formatWon(results.annualNetBenefit)}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">3년 순이익</div>
      <div class="kpi-val">${formatWon(results.threeYearNetBenefit)}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">비즈니스 인사이트</div>
  ${results.insights.map((i) => `<div class="insight-box"><div class="insight-text">${i}</div></div>`).join('')}
</div>

<div class="section">
  <div class="section-title">투자 비용 분석</div>
  <table class="table">
    <thead><tr><th>항목</th><th>금액</th></tr></thead>
    <tbody>
      <tr><td>총 투자 비용</td><td>${formatWon(results.totalInvestment)}</td></tr>
      <tr><td>정부 지원금 (2025 스마트상점)</td><td class="pos">-${formatWon(results.govSubsidy)}</td></tr>
      <tr><td><strong>실질 투자 비용</strong></td><td><strong>${formatWon(results.netInvestment)}</strong></td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">월별 수익 분해</div>
  <table class="table">
    <thead><tr><th>수익 항목</th><th>월별 금액</th><th>연간 환산</th></tr></thead>
    <tbody>
      <tr><td>인건비 절감</td><td class="pos">${formatWon(results.monthlyLaborSavings)}</td><td class="pos">${formatWon(results.monthlyLaborSavings * 12)}</td></tr>
      <tr><td>주방 출고·회전 효율</td><td class="pos">${formatWon(results.monthlyThroughputGain)}</td><td class="pos">${formatWon(results.monthlyThroughputGain * 12)}</td></tr>
      <tr><td>폐기물 감소</td><td class="pos">${formatWon(results.monthlyWasteSavings)}</td><td class="pos">${formatWon(results.monthlyWasteSavings * 12)}</td></tr>
      <tr><td>장비 운영비</td><td class="neg">-${formatWon(results.monthlyRobotCost)}</td><td class="neg">-${formatWon(results.monthlyRobotCost * 12)}</td></tr>
      <tr><td><strong>월 순이익</strong></td><td class="pos"><strong>${formatWon(results.monthlyNetBenefit)}</strong></td><td class="pos"><strong>${formatWon(results.annualNetBenefit)}</strong></td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">시나리오 분석</div>
  <table class="table">
    <thead><tr><th>시나리오</th><th>1년 ROI</th><th>투자 회수</th><th>3년 순이익</th></tr></thead>
    <tbody>
      <tr>
        <td>🚀 낙관적 (성과 +30%)</td>
        <td class="pos">${results.scenarios.best.roiOneYear > 0 ? '+' : ''}${results.scenarios.best.roiOneYear}%</td>
        <td>${results.scenarios.best.paybackMonths ? formatMonths(results.scenarios.best.paybackMonths) : '-'}</td>
        <td class="pos">${formatWon(results.scenarios.best.threeYearNetBenefit)}</td>
      </tr>
      <tr>
        <td>📊 현실적 (기본 예측)</td>
        <td class="pos">${results.scenarios.realistic.roiOneYear > 0 ? '+' : ''}${results.scenarios.realistic.roiOneYear}%</td>
        <td>${results.scenarios.realistic.paybackMonths ? formatMonths(results.scenarios.realistic.paybackMonths) : '-'}</td>
        <td class="pos">${formatWon(results.scenarios.realistic.threeYearNetBenefit)}</td>
      </tr>
      <tr>
        <td>🛡️ 보수적 (성과 -30%)</td>
        <td>${results.scenarios.worst.roiOneYear > 0 ? '+' : ''}${results.scenarios.worst.roiOneYear}%</td>
        <td>${results.scenarios.worst.paybackMonths ? formatMonths(results.scenarios.worst.paybackMonths) : '-'}</td>
        <td>${formatWon(results.scenarios.worst.threeYearNetBenefit)}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="footer">
  <p><strong>FreeKit 주방 자동화 ROI</strong> | 문의: contact@freekit.co.kr | 상담 예약: 1588-0000</p>
  <p style="margin-top:6px">본 리포트는 시뮬레이션 자료이며 투자 보장을 의미하지 않습니다. © 2025 FreeKit Inc.</p>
</div>
</body>
</html>`;
}

export default function PDFReport({ state, results, onToast }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    trackPDFDownload();
    try {
      const html = generateHTMLReport({ state, results });
      const leadForFile = (state.leadName && String(state.leadName).trim()) || '';
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FreeKit_ROI_리포트_${leadForFile || '매장'}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast?.('✅ 리포트가 다운로드되었습니다');
    } catch (err) {
      console.error('Report error:', err);
      onToast?.('❌ 다운로드 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoShare = () => {
    trackShare('kakao');
    const text = `[FreeKit ROI 분석 결과]\n📈 1년 ROI: ${results.roiOneYear.toFixed(1)}%\n⏱️ 투자 회수: ${formatMonths(results.paybackMonths)}\n💰 연간 순이익: ${formatWon(results.annualNetBenefit)}\n\n주방 자동화 도입을 검토해보세요!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_APP_KEY&text=${encoded}`, '_blank');
    onToast?.('카카오톡 공유 준비 중...');
  };

  const handleEmailShare = () => {
    trackShare('email');
    const leadName = (state.leadName && String(state.leadName).trim()) || '';
    const greet = leadName ? `${leadName} 대표님` : '안녕하세요';
    const subject = leadName ? `[FreeKit] ${leadName} 대표님 ROI 분석 결과` : '[FreeKit] ROI 분석 결과';
    const body = `${leadName ? `안녕하세요, ${leadName} 대표님.\n\n` : `${greet}.\n\n`}FreeKit ROI 시뮬레이터 결과를 공유드립니다.\n\n📈 1년 ROI: ${results.roiOneYear.toFixed(1)}%\n⏱️ 투자 회수 기간: ${formatMonths(results.paybackMonths)}\n💰 연간 순이익: ${formatWon(results.annualNetBenefit)}\n🏛️ 정부 지원금: ${formatWon(results.govSubsidy)}\n\n더 자세한 상담을 원하시면 연락 주세요.`;
    const to = state.leadEmail && String(state.leadEmail).trim() ? state.leadEmail : '';
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onToast?.('이메일 앱이 열립니다');
  };

  return (
    <div className="action-section">
      <div className="action-section-title">📄 리포트 공유 및 상담 신청</div>
      <div className="action-buttons">
        <button className="btn-action-primary" onClick={handleDownload} disabled={loading} type="button">
          {loading ? '⏳ 생성 중...' : '📥 HTML 리포트 다운로드'}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn-action-secondary" onClick={handleEmailShare} type="button">
            ✉️ 이메일 공유
          </button>
          <button className="btn-action-secondary" onClick={handleKakaoShare} type="button">
            💬 카카오톡 공유
          </button>
        </div>
        {state.wantsConsultation && (
          <div className="success-box" style={{ margin: 0 }}>
            <span className="success-box-icon">🎉</span>
            <div className="success-box-text">
              <strong>무료 상담이 신청되었습니다!</strong> 담당 컨설턴트가 48시간 이내에 {state.leadPhone || state.leadEmail}로 연락드립니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
