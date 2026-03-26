/**
 * 제품군별 선택(미선택 포함)을 ROI 입력값으로 집계
 */
import { EQUIPMENT_CATEGORIES, findOptionByProductId } from './kitchenEquipmentCatalog.js';

const INDUSTRY_THROUGHPUT = {
  fastfood: 6,
  buffet: 5,
  korean: 4,
  japanese: 4,
  western: 4,
  cafe: 3,
};

const INDUSTRY_WASTE = {
  buffet: 8,
  korean: 5,
  western: 4,
  japanese: 3,
  fastfood: 3,
  cafe: 4,
};

/**
 * @param {Record<string, string|null>} kitchenSelections — 카테고리 id → 제품 id 또는 null
 */
export function aggregateKitchenFromState(state) {
  const { kitchenSelections, industry, seats, staffCount, monthlyRevenue } = state;
  const ind = industry || 'korean';

  const selected = [];
  for (const cat of EQUIPMENT_CATEGORIES) {
    const pid = kitchenSelections?.[cat.id];
    if (!pid) continue;
    const found = findOptionByProductId(pid);
    if (found) selected.push({ category: found.category, option: found.option });
  }

  const hasSelection = selected.length > 0;
  if (!hasSelection) {
    return {
      hasSelection: false,
      equipmentBasePrice: 0,
      equipmentUnitCount: 0,
      monthlyEquipmentCost: 0,
      staffReduction: 0,
      throughputImprovement: 0,
      wasteReductionRate: 0,
      trainingCost: 0,
      rationale: ['도입할 장비를 한 가지 이상 선택해 주세요.'],
      summaryLines: [],
      selectedItems: [],
    };
  }

  let equipmentBasePrice = 0;
  let monthlyEquipmentCost = 0;
  let sumStaff = 0;
  let sumThroughput = 0;
  let sumWaste = 0;

  const summaryLines = [];
  for (const { category, option } of selected) {
    equipmentBasePrice += option.price;
    monthlyEquipmentCost += option.monthlyCost + option.powerCostPerMonth;
    sumStaff += option.staffEquiv;
    sumThroughput += option.throughputPts;
    sumWaste += option.wastePts;
    summaryLines.push(`${category.name}: ${option.name} (${(option.price / 10000).toFixed(0)}만 원)`);
  }

  const equipmentUnitCount = selected.length;

  const maxCut = Math.max(0, (staffCount || 1) - 1);
  let staffReduction = Math.min(maxCut, Math.round(sumStaff));
  if ((staffCount || 0) >= 2 && maxCut >= 1 && staffReduction < 1 && sumStaff >= 0.25) {
    staffReduction = 1;
  }
  staffReduction = Math.min(staffReduction, maxCut);

  const tExtra = INDUSTRY_THROUGHPUT[ind] ?? 4;
  let throughputImprovement = 6 + sumThroughput + tExtra + Math.min(6, Math.floor((seats || 40) / 35));
  throughputImprovement = Math.min(42, Math.max(8, throughputImprovement));

  const wExtra = INDUSTRY_WASTE[ind] ?? 4;
  let wasteReductionRate = 4 + sumWaste + wExtra + Math.min(6, Math.floor((seats || 40) / 45));
  wasteReductionRate = Math.min(55, Math.max(5, wasteReductionRate));
  wasteReductionRate = Math.round(wasteReductionRate / 5) * 5;

  const trainingCost = 280000 + 120000 * Math.max(0, equipmentUnitCount - 1);

  const rationale = [
    `선택된 ${equipmentUnitCount}개 라인(제품군별 1종) 기준으로 투자·운영비를 합산했습니다.`,
    `좌석 ${seats || 0}석·직원 ${staffCount || 0}명·업종 특성을 반영해 인력 절감·출고 효율·폐기 감소율을 산출했습니다.`,
    `미선택한 제품군은 투자·효과에 포함하지 않았습니다.`,
  ];
  if (monthlyRevenue >= 35000000) {
    rationale.push('월 매출 규모가 커 출고 효율 가정을 보수적으로 상향 조정했습니다.');
  }

  return {
    hasSelection: true,
    equipmentBasePrice,
    equipmentUnitCount,
    monthlyEquipmentCost,
    staffReduction,
    throughputImprovement,
    wasteReductionRate,
    trainingCost,
    rationale,
    summaryLines,
    selectedItems: selected.map(({ category, option }) => ({
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      categoryDesc: category.desc,
      name: option.name,
      manufacturer: option.manufacturer,
      price: option.price,
      priceNote: option.priceNote,
      monthlyCost: option.monthlyCost + option.powerCostPerMonth,
      throughputPts: option.throughputPts,
      wastePts: option.wastePts,
      staffEquiv: option.staffEquiv,
    })),
  };
}

export function formatKitchenEquipmentHeadline(state) {
  const agg = aggregateKitchenFromState(state);
  if (!agg.hasSelection) return '선택된 주방 장비 없음';
  return `${agg.equipmentUnitCount}개 라인 · ${agg.summaryLines.join(' / ')}`;
}
