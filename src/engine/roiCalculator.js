/**
 * FreeKit ROI 계산 엔진
 * 표준 ROI 공식: ROI = (Gains - Costs) / Costs × 100
 * 시간의 가치(NPV), 임금 상승률, 운영 효율 등 종합 반영
 */
import { aggregateKitchenFromState } from './aggregateKitchenSelections.js';
import { INDUSTRY_DEFAULTS } from './industryDefaults.js';

const DISCOUNT_RATE_MONTHLY = 0.03 / 12; // 연 3% 할인율
const PROFIT_MARGIN_MULTIPLIER = 0.25; // 매출 증가분의 25%를 순이익으로 가정

// 업종별 피크타임 손실 계수 (throughput gap × 기회비용율)
const INDUSTRY_PEAK_MULTIPLIER = {
  fastfood: 0.75, buffet: 0.60, korean: 0.70,
  japanese: 0.68, western: 0.65, cafe: 0.55,
};

/**
 * 메인 ROI 계산 함수 (제품군별 주방 장비 선택 집계 기준)
 */
export function calculateROI(inputs) {
  const {
    industry,
    seats,
    staffCount,
    avgMonthlyWagePerPerson,
    workHoursPerWeek,
    annualWageIncreaseRate,
    monthlyRevenue,
    applySubsidy,
    subsidyAmount,
  } = inputs;

  const agg = aggregateKitchenFromState(inputs);
  const analysisMonths = 36; // 3년 분석

  if (!agg.hasSelection || agg.equipmentBasePrice <= 0) {
    return null;
  }

  const {
    equipmentBasePrice: robotBasePrice,
    monthlyEquipmentCost: monthlyRobotCost,
    staffReduction,
    throughputImprovement,
    wasteReductionRate,
    trainingCost,
    equipmentUnitCount: robotCount,
    summaryLines: equipmentSummaryLines,
  } = agg;

  // ────────────────────────────────────────────
  // 1. 투자 비용 계산
  // ────────────────────────────────────────────
  const installationCost = robotBasePrice * 0.05;
  const totalInvestment = robotBasePrice + installationCost + trainingCost;
  const govSubsidy = applySubsidy ? Math.min(subsidyAmount, totalInvestment * 0.5) : 0;
  const netInvestment = totalInvestment - govSubsidy;

  // ────────────────────────────────────────────
  // 2. 월별 수익 계산 (임금 상승률 반영)
  // ────────────────────────────────────────────

  function getMonthlyData(month) {
    // 연 임금 상승률 반영
    const yearIdx = Math.floor(month / 12);
    const wageMultiplier = Math.pow(1 + annualWageIncreaseRate / 100, yearIdx);
    const wagePerPerson = avgMonthlyWagePerPerson * wageMultiplier;

    // 인건비 절감
    const laborSavings = staffReduction * wagePerPerson;

    // 매출 처리량 증가 (Throughput) → 순이익 기여
    const throughputGain = (monthlyRevenue * (throughputImprovement / 100)) * PROFIT_MARGIN_MULTIPLIER;

    // 폐기물 감소 (Waste Reduction)
    const wasteBeforeCost = monthlyRevenue * 0.04; // 식재료비의 약 4%가 폐기
    const wasteSavings = wasteBeforeCost * (wasteReductionRate / 100);

    const totalGains = laborSavings + throughputGain + wasteSavings;
    const netMonthlyBenefit = totalGains - monthlyRobotCost;

    return { laborSavings, throughputGain, wasteSavings, totalGains, monthlyRobotCost, netMonthlyBenefit };
  }

  // ────────────────────────────────────────────
  // 3. 핵심 KPI 계산 (현실 시나리오)
  // ────────────────────────────────────────────
  const m0 = getMonthlyData(0);
  const paybackMonths = m0.netMonthlyBenefit > 0 ? netInvestment / m0.netMonthlyBenefit : null;
  const annualNetBenefit = m0.netMonthlyBenefit * 12;
  const roiOneYear = ((annualNetBenefit - netInvestment) / netInvestment) * 100;

  // 3년 누적 NPV
  let cumulativeNPV = -netInvestment;
  const monthlyTimeline = [];
  let cumulativeSum = -netInvestment;

  for (let m = 0; m < analysisMonths; m++) {
    const d = getMonthlyData(m);
    const discounted = d.netMonthlyBenefit / Math.pow(1 + DISCOUNT_RATE_MONTHLY, m + 1);
    cumulativeNPV += discounted;
    cumulativeSum += d.netMonthlyBenefit;
    monthlyTimeline.push({
      month: m + 1,
      cumulative: Math.round(cumulativeSum),
      npv: Math.round(cumulativeNPV),
      monthly: Math.round(d.netMonthlyBenefit),
    });
  }

  const threeYearNetBenefit = m0.netMonthlyBenefit * 36 - netInvestment;
  const threeYearROI = ((m0.netMonthlyBenefit * 36) / netInvestment - 1) * 100;

  // ────────────────────────────────────────────
  // 4. 시나리오 분석 (Best / Realistic / Worst)
  // ────────────────────────────────────────────
  function calcScenario(multiplier) {
    const g = m0.totalGains * multiplier;
    const net = g - monthlyRobotCost;
    const pb = net > 0 ? netInvestment / net : null;
    const roi1y = ((net * 12 - netInvestment) / netInvestment) * 100;
    const roi3y = ((net * 36) / netInvestment - 1) * 100;
    return {
      multiplier,
      monthlyGains: Math.round(g),
      monthlyNetBenefit: Math.round(net),
      paybackMonths: pb ? Math.round(pb * 10) / 10 : null,
      roiOneYear: Math.round(roi1y * 10) / 10,
      threeYearNetBenefit: Math.round(net * 36 - netInvestment),
    };
  }

  const scenarios = {
    best: calcScenario(1.3),
    realistic: calcScenario(1.0),
    worst: calcScenario(0.7),
  };

  // ────────────────────────────────────────────
  // 5. 정부 지원 전/후 비교
  // ────────────────────────────────────────────
  const withoutSubsidy = calcScenario(1.0);
  const netInvestmentWithoutSubsidy = totalInvestment;
  const roiWithout = (((m0.netMonthlyBenefit * 12) - netInvestmentWithoutSubsidy) / netInvestmentWithoutSubsidy) * 100;
  const paybackWithout = m0.netMonthlyBenefit > 0 ? netInvestmentWithoutSubsidy / m0.netMonthlyBenefit : null;

  // ────────────────────────────────────────────
  // 6. Before / After 월 비용 비교
  // ────────────────────────────────────────────
  const beforeMonthlyCost = staffCount * avgMonthlyWagePerPerson;
  const afterMonthlyCost = (staffCount - staffReduction) * avgMonthlyWagePerPerson + monthlyRobotCost;
  const beforeMonthlyWaste = monthlyRevenue * 0.04;
  const afterMonthlyWaste = beforeMonthlyWaste * (1 - wasteReductionRate / 100);

  return {
    // 투자 정보
    totalInvestment: Math.round(totalInvestment),
    govSubsidy: Math.round(govSubsidy),
    netInvestment: Math.round(netInvestment),
    installationCost: Math.round(installationCost),
    trainingCost,

    // 월별 수익 분해
    monthlyLaborSavings: Math.round(m0.laborSavings),
    monthlyThroughputGain: Math.round(m0.throughputGain),
    monthlyWasteSavings: Math.round(m0.wasteSavings),
    monthlyTotalGains: Math.round(m0.totalGains),
    monthlyRobotCost: Math.round(monthlyRobotCost),
    monthlyNetBenefit: Math.round(m0.netMonthlyBenefit),

    // KPI
    paybackMonths: paybackMonths ? Math.round(paybackMonths * 10) / 10 : null,
    annualNetBenefit: Math.round(annualNetBenefit),
    roiOneYear: Math.round(roiOneYear * 10) / 10,
    threeYearNetBenefit: Math.round(threeYearNetBenefit),
    threeYearROI: Math.round(threeYearROI * 10) / 10,
    npv3Year: Math.round(cumulativeNPV),

    // 타임라인 (차트용)
    monthlyTimeline,

    // 시나리오
    scenarios,

    // 정부 지원 비교
    subsidyComparison: {
      withSubsidy: {
        netInvestment: Math.round(netInvestment),
        roiOneYear: Math.round(roiOneYear * 10) / 10,
        paybackMonths: paybackMonths ? Math.round(paybackMonths * 10) / 10 : null,
      },
      withoutSubsidy: {
        netInvestment: Math.round(netInvestmentWithoutSubsidy),
        roiOneYear: Math.round(roiWithout * 10) / 10,
        paybackMonths: paybackWithout ? Math.round(paybackWithout * 10) / 10 : null,
      },
    },

    // Before/After 비교
    beforeAfter: {
      before: {
        monthlyCost: Math.round(beforeMonthlyCost),
        monthlyWaste: Math.round(beforeMonthlyWaste),
        staffCount,
      },
      after: {
        monthlyCost: Math.round(afterMonthlyCost),
        monthlyWaste: Math.round(afterMonthlyWaste),
        staffCount: staffCount - staffReduction,
        robotCount,
      },
    },

    // 요약 인사이트 텍스트
    insights: generateInsights({
      paybackMonths,
      roiOneYear,
      monthlyNetBenefit: m0.netMonthlyBenefit,
      govSubsidy,
      threeYearNetBenefit,
    }),

    equipmentSummaryLines,
    proposalRationale: agg.rationale,

    // AS-IS 매몰 비용 분석
    asIsLoss: computeAsIsLoss(inputs),
  };
}

/**
 * AS-IS 운영 손실 (현재 자동화 미도입 시 매몰 비용) 계산
 * 4개 카테고리: 인적 리스크 / 운영 효율성 손실 / 품질 관리 손실 / 재무적 기타 손실
 */
function computeAsIsLoss({ staffCount, avgMonthlyWagePerPerson, monthlyRevenue, industry }) {
  const ind = INDUSTRY_DEFAULTS[industry] || INDUSTRY_DEFAULTS.korean;
  const throughputPct = (ind.avgThroughputImprovement || 15) / 100;
  const wasteRate = ind.avgWasteRate || 0.05;
  const peakMult = INDUSTRY_PEAK_MULTIPLIER[industry] || 0.68;

  // 1. 인적 리스크: 신규 채용 및 교육 배용비 (월환산)
  //    음식업 연 이직률 ~40%, 채용+교육 비용 = 인건비 1.8개월
  const hrRisk = Math.round((staffCount * 0.40 * avgMonthlyWagePerPerson * 1.8) / 12);

  // 2. 운영 효율성 손실: 피크타임 주문 처리 한계 손실
  //    현재 놓치는 throughput 기회 × 실현 가능 매출 대비 손실율
  const operEfficiency = Math.round(monthlyRevenue * throughputPct * peakMult);

  // 3. 품질 관리 손실: 조리 실수·식재료 폐기비용
  //    식재료 폐기(wasteRate × 매출) + 조리 실수 재처리(매출 1.5%)
  const qualityLoss = Math.round(monthlyRevenue * (wasteRate + 0.015));

  // 4. 재무적 기타 손실: 운영 공수 및 간접 관리 비용
  //    직원당 간접 부담 12% (야근·잔업·공수 낭비)
  const otherLoss = Math.round(staffCount * avgMonthlyWagePerPerson * 0.12);

  const totalMonthly = hrRisk + operEfficiency + qualityLoss + otherLoss;
  const annualSunkImpact = totalMonthly * 12;

  return { hrRisk, operEfficiency, qualityLoss, otherLoss, totalMonthly, annualSunkImpact };
}

function generateInsights({ paybackMonths, roiOneYear, monthlyNetBenefit, govSubsidy, threeYearNetBenefit }) {
  const insights = [];

  if (paybackMonths && paybackMonths <= 12) {
    insights.push(`🎯 투자금은 단 <strong>${Math.round(paybackMonths)}개월</strong> 이내에 회수됩니다`);
  } else if (paybackMonths && paybackMonths <= 24) {
    insights.push(`📅 투자금은 <strong>${Math.round(paybackMonths)}개월</strong> 이내에 회수됩니다`);
  }

  if (roiOneYear > 0) {
    insights.push(`📈 1년 후 투자 대비 <strong>${Math.round(roiOneYear)}%</strong>의 수익률이 기대됩니다`);
  }

  if (monthlyNetBenefit > 0) {
    insights.push(`💰 매달 <strong>${(monthlyNetBenefit / 10000).toFixed(0)}만 원</strong>의 순이익이 발생합니다`);
  }

  if (govSubsidy > 0) {
    insights.push(`🏛️ 정부 지원금 <strong>${(govSubsidy / 10000).toFixed(0)}만 원</strong>으로 초기 투자 부담이 줄어듭니다`);
  }

  if (threeYearNetBenefit > 0) {
    insights.push(`🚀 3년간 누적 순이익은 약 <strong>${(threeYearNetBenefit / 10000).toFixed(0)}만 원</strong>입니다`);
  }

  return insights;
}
