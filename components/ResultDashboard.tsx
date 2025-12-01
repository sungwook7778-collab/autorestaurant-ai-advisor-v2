
import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisResult, EquipmentRecommendation } from '../types';
import ChartSection from './ChartSection';
import { CheckCircle, AlertCircle, BarChart3, Table as TableIcon, FileText, Tag, Info, Trash2, Plus, RefreshCw } from 'lucide-react';
import { AVAILABLE_EQUIPMENT, LABOR_SAVING_ESTIMATES } from '../constants';

interface ResultDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onReset }) => {
  const { store_analysis, report_text, current_cost } = result;

  // Local State for Interactive Recommendations
  const [localDevices, setLocalDevices] = useState<EquipmentRecommendation[]>(
    result.automation_plan.recommended_devices
  );
  
  const [newDeviceName, setNewDeviceName] = useState<string>('');

  // Calculate Unit Costs for FT and PT based on current_cost data
  const ftUnitCost = current_cost.employee_count_ft > 0 
      ? current_cost.employee_cost_ft / current_cost.employee_count_ft 
      : 0;
  
  const ptUnitCost = current_cost.employee_count_pt > 0
      ? current_cost.employee_cost_pt / current_cost.employee_count_pt
      : 0;

  // -- Recalculation Logic --
  const calculatedPlan = useMemo(() => {
    let totalMonthlySaving = 0;
    let totalInvestmentCost = 0;
    let totalMonthlyEquipmentCost = 0;
    let totalReducedFT = 0;
    let totalReducedPT = 0;

    const recalculatedDevices = localDevices.map(device => {
        // Calculate saving based on category's labor type
        const category = getCategoryFromDeviceName(device.name);
        const laborInfo = LABOR_SAVING_ESTIMATES[category || ''] || { amount: 0, type: 'PT' };
        
        let unitSaving = 0;
        if (laborInfo.type === 'FT') {
            unitSaving = laborInfo.amount * ftUnitCost;
        } else {
            unitSaving = laborInfo.amount * ptUnitCost;
        }

        const monthlySaving = Math.round(unitSaving * device.count);

        // Aggregate for total
        totalMonthlySaving += monthlySaving;
        if (laborInfo.type === 'FT') totalReducedFT += (laborInfo.amount * device.count);
        else totalReducedPT += (laborInfo.amount * device.count);

        return { ...device, monthly_saving: monthlySaving };
    });

    recalculatedDevices.forEach(device => {
       // Costs
       if (device.cost_type === 'one_time') {
           totalInvestmentCost += (device.cost * device.count);
           totalMonthlyEquipmentCost += ((device.cost * device.count) / 36); // Amortized
       } else {
           totalMonthlyEquipmentCost += (device.cost * device.count); // Rental
       }
    });

    const netProfitIncrease = totalMonthlySaving - totalMonthlyEquipmentCost;
    
    // ROI Calculation (Strictly based on CapEx / Monthly Net Profit)
    let totalRoiMonths = 0;
    if (totalInvestmentCost > 0) {
        if (netProfitIncrease > 0) {
            totalRoiMonths = parseFloat((totalInvestmentCost / netProfitIncrease).toFixed(1));
        } else {
            totalRoiMonths = 999; 
        }
    }

    return {
        recommended_devices: recalculatedDevices,
        total_monthly_saving: Math.round(totalMonthlySaving),
        total_investment_cost: Math.round(totalInvestmentCost),
        total_monthly_equipment_cost: Math.round(totalMonthlyEquipmentCost),
        net_profit_increase: Math.round(netProfitIncrease),
        total_roi_months: totalRoiMonths,
        totalReducedFT,
        totalReducedPT
    };
  }, [localDevices, ftUnitCost, ptUnitCost]);

  // Construct a new AnalysisResult object to pass to ChartSection
  const updatedResult: AnalysisResult = {
      ...result,
      automation_plan: {
          ...result.automation_plan,
          recommended_devices: calculatedPlan.recommended_devices,
          total_monthly_saving: calculatedPlan.total_monthly_saving,
          total_investment_cost: calculatedPlan.total_investment_cost,
          net_profit_increase: calculatedPlan.net_profit_increase,
          total_roi_months: calculatedPlan.total_roi_months
      }
  };

  // -- Helpers --
  // Helper function must be defined before use or hoisted. In this file structure, distinct function works.
  function getCategoryFromDeviceName(name: string): string | undefined {
      let def = AVAILABLE_EQUIPMENT.find(e => `${e.category} - ${e.model}` === name);
      if (def) return def.category;
      
      def = AVAILABLE_EQUIPMENT.find(e => name.includes(e.model) || name.includes(e.maker));
      if (def) return def.category;

      const categories = Array.from(new Set(AVAILABLE_EQUIPMENT.map(e => e.category)));
      for (const cat of categories) {
          if (name.includes(cat)) return cat;
      }
      return undefined;
  }

  // -- Handlers --

  const handleRemoveDevice = (index: number) => {
      const newDevices = [...localDevices];
      newDevices.splice(index, 1);
      setLocalDevices(newDevices);
  };

  const handleUpdateDevice = (index: number, updates: Partial<EquipmentRecommendation>) => {
      const newDevices = [...localDevices];
      const device = { ...newDevices[index], ...updates };
      
      if (updates.cost_type !== undefined && updates.cost_type !== newDevices[index].cost_type) {
         let matchedDef = AVAILABLE_EQUIPMENT.find(e => device.name.includes(e.model) || device.name.includes(e.maker));
         
         if (!matchedDef) {
             const category = getCategoryFromDeviceName(device.name);
             if (category) {
                 matchedDef = AVAILABLE_EQUIPMENT.find(e => e.category === category);
             }
         }

         if (matchedDef) {
             device.cost = updates.cost_type === 'monthly' ? matchedDef.price_rental : matchedDef.price_one_time;
         }
      }

      newDevices[index] = device;
      setLocalDevices(newDevices);
  };

  const handleAddDevice = () => {
      if (!newDeviceName) return;
      
      const def = AVAILABLE_EQUIPMENT.find(e => `${e.category} - ${e.model}` === newDeviceName);
      if (!def) return;

      const existingIndex = localDevices.findIndex(d => {
          const cat = getCategoryFromDeviceName(d.name);
          return cat === def.category;
      });

      // Saving calculation handled in useMemo, init with 0 here is fine as it will update immediately
      // But for UX, let's calculate initial value
      const laborInfo = LABOR_SAVING_ESTIMATES[def.category] || { amount: 0, type: 'PT' };
      const unitSaving = laborInfo.type === 'FT' ? (laborInfo.amount * ftUnitCost) : (laborInfo.amount * ptUnitCost);

      if (existingIndex !== -1) {
          // -- REPLACE EXISTING --
          const newDevices = [...localDevices];
          const existingDevice = newDevices[existingIndex];
          const count = existingDevice.count; 

          const newDevice: EquipmentRecommendation = {
              name: `${def.maker} ${def.model}`,
              cost_type: 'monthly', 
              cost: def.price_rental,
              count: count,
              monthly_saving: Math.round(unitSaving * count),
              roi_months: 0,
              reason: '사용자 변경 (모델 교체)'
          };
          
          newDevices[existingIndex] = newDevice;
          setLocalDevices(newDevices);

      } else {
          // -- ADD NEW --
          const newDevice: EquipmentRecommendation = {
              name: `${def.maker} ${def.model}`,
              cost_type: 'monthly', 
              cost: def.price_rental,
              count: 1,
              monthly_saving: Math.round(unitSaving), 
              roi_months: 0,
              reason: '사용자 추가'
          };
          setLocalDevices([...localDevices, newDevice]);
      }
      
      setNewDeviceName('');
  };


  const predictedLaborCost = Math.max(0, current_cost.monthly_labor_cost - calculatedPlan.total_monthly_saving);
  
  const currentTotalCost = current_cost.monthly_labor_cost + current_cost.monthly_fixed_cost;
  const predictedTotalCost = predictedLaborCost + current_cost.monthly_fixed_cost + calculatedPlan.total_monthly_equipment_cost;
  
  const currentNetProfit = current_cost.monthly_sales - currentTotalCost;
  const predictedNetProfit = current_cost.monthly_sales - predictedTotalCost;
  const netProfitIncrease = calculatedPlan.net_profit_increase;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
          <div className="text-blue-100 text-sm font-medium mb-1">월 예상 절감액</div>
          <div className="text-4xl font-bold">
            {calculatedPlan.total_monthly_saving.toLocaleString()} <span className="text-2xl">만원</span>
          </div>
        </div>
        <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
          <div className="text-emerald-100 text-sm font-medium mb-1">예상 순이익 증가</div>
          <div className="text-4xl font-bold">
            {netProfitIncrease.toLocaleString()} <span className="text-2xl">만원</span>
          </div>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
          <div className="text-slate-300 text-sm font-medium mb-1">투자 회수 기간 (ROI)</div>
          <div className="text-4xl font-bold">
            {calculatedPlan.total_roi_months === 999 ? '불가' : calculatedPlan.total_roi_months} <span className="text-2xl">개월</span>
          </div>
        </div>
      </div>

      {/* Store Analysis Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          매장 분석 요약
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-500 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> 업종</div>
            <div className="font-semibold text-slate-900 text-lg">{store_analysis.store_category}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-500 mb-1">추정 테이블 수</div>
            <div className="font-semibold text-slate-900 text-lg">{store_analysis.estimated_tables}개</div>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
               (추정 테이블 수 정확도 향상 적용 알고리즘: Mask R-CNN 기반 객체 탐지 및 분할, Metric Scale Estimation, Depth Estimation을 통합하여 이미지 내 테이블 객체를 식별 및 계수. 홀 평수와 동선 패턴 분석을 병행하여 최종 테이블 수를 추정)
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-500 mb-1">추정 홀 규모</div>
            <div className="font-semibold text-slate-900 text-lg">{store_analysis.estimated_hall_size}평</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-500 mb-1">추정 주방 규모</div>
            <div className="font-semibold text-slate-900 text-lg">{store_analysis.estimated_kitchen_size}평</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg col-span-2 md:col-span-1">
            <div className="text-slate-500 mb-1">동선/구조 이슈</div>
            <div className="font-semibold text-slate-900 text-sm leading-tight whitespace-pre-wrap">
              {store_analysis.workflow_issue}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cost Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
           <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <TableIcon className="w-5 h-5 text-blue-600" />
            월 운영 비용 구조 비교
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">구분</th>
                <th className="px-6 py-4">현재 월 운영 비용 (만원)</th>
                <th className="px-6 py-4">자동화 도입 후 예상 월 운영 비용 (만원)</th>
                <th className="px-6 py-4 text-left">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">월 예상 매출액</td>
                <td className="px-6 py-4">{current_cost.monthly_sales.toLocaleString()}</td>
                <td className="px-6 py-4">{current_cost.monthly_sales.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-slate-500">변동 없음</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">월 고정비 (임대료 등)</td>
                <td className="px-6 py-4">{current_cost.monthly_fixed_cost.toLocaleString()}</td>
                <td className="px-6 py-4">{current_cost.monthly_fixed_cost.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-slate-500">변동 없음</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">월 인건비</td>
                <td className="px-6 py-4 text-red-600">{current_cost.monthly_labor_cost.toLocaleString()}</td>
                <td className="px-6 py-4 text-blue-600 font-bold">{predictedLaborCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-blue-600 font-medium">
                   예상 절감: 정규직 {calculatedPlan.totalReducedFT.toFixed(1)}명, 아르바이트 {calculatedPlan.totalReducedPT.toFixed(1)}명
                </td>
              </tr>
              <tr className="hover:bg-slate-50 bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-slate-900">장비 도입 비용 (월 환산)</td>
                <td className="px-6 py-4">0</td>
                <td className="px-6 py-4 font-bold text-slate-900">{calculatedPlan.total_monthly_equipment_cost.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-slate-500 text-xs">
                  CapEx 또는 OpEx 반영
                </td>
              </tr>
              <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                <td className="px-6 py-4 text-slate-900">총 월 비용</td>
                <td className="px-6 py-4">{currentTotalCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-blue-700">{predictedTotalCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-blue-700">
                   {Math.abs(currentTotalCost - predictedTotalCost).toLocaleString()}만원 감소
                </td>
              </tr>
              <tr className="bg-emerald-50/50 font-bold border-t border-emerald-100">
                <td className="px-6 py-4 text-emerald-900">월 순이익</td>
                <td className="px-6 py-4 text-emerald-700">{currentNetProfit.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-700">{predictedNetProfit.toLocaleString()}</td>
                <td className="px-6 py-4 text-left text-emerald-700">
                  순이익 증가액: {netProfitIncrease.toLocaleString()}만원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <ChartSection result={updatedResult} />

      {/* Recommendation Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
             <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <TableIcon className="w-5 h-5 text-blue-600" />
              장비 추천 상세
            </h3>
            
            {/* Add Device Control */}
            <div className="flex gap-2 w-full md:w-auto">
                <select 
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">장비 추가 선택...</option>
                    {AVAILABLE_EQUIPMENT.map((eq, i) => (
                        <option key={i} value={`${eq.category} - ${eq.model}`}>
                            {eq.category} - {eq.model}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleAddDevice}
                    disabled={!newDeviceName}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-3 whitespace-nowrap">장비군</th>
                 <th className="px-6 py-3 whitespace-nowrap">추천 장비명</th>
                 <th className="px-6 py-3 whitespace-nowrap">비용 유형 (변경가능)</th>
                 <th className="px-6 py-3 whitespace-nowrap">도입 비용(단가)</th>
                 <th className="px-6 py-3 whitespace-nowrap">도입 수량</th>
                 <th className="px-6 py-3 whitespace-nowrap">총 도입 비용</th>
                 <th className="px-6 py-3 text-green-700 whitespace-nowrap">월 예상 절감액(TOTAL)</th>
                 <th className="px-6 py-3 whitespace-nowrap">ROI 회수</th>
                 <th className="px-6 py-3 whitespace-nowrap">관리</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {calculatedPlan.recommended_devices.map((device, idx) => (
                 <tr key={idx} className="hover:bg-slate-50">
                   <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                     {getCategoryFromDeviceName(device.name) || '기타'}
                   </td>
                   <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{device.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <button 
                        onClick={() => handleUpdateDevice(idx, { cost_type: device.cost_type === 'monthly' ? 'one_time' : 'monthly' })}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            device.cost_type === 'monthly' 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                     >
                       <RefreshCw className="w-3 h-3" />
                       {device.cost_type === 'monthly' ? '월 렌탈' : '일시불'}
                     </button>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">{device.cost.toLocaleString()} 만원</td>
                   <td className="px-6 py-4 whitespace-nowrap font-bold flex items-center gap-2">
                       <input 
                          type="number" 
                          min="1" 
                          max="99"
                          value={device.count}
                          onChange={(e) => handleUpdateDevice(idx, { count: parseInt(e.target.value) || 1 })}
                          className="w-16 border border-slate-300 rounded px-2 py-1 text-center"
                       />
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap font-semibold">{(device.cost * device.count).toLocaleString()} 만원</td>
                   <td className="px-6 py-4 text-green-600 font-semibold whitespace-nowrap">
                     -{device.monthly_saving.toLocaleString()} 만원
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">{device.roi_months === 0 ? '즉시' : `${device.roi_months}개월`}</td>
                   <td className="px-6 py-4">
                       <button 
                        onClick={() => handleRemoveDevice(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                       >
                           <Trash2 className="w-5 h-5" />
                       </button>
                   </td>
                 </tr>
               ))}
               {calculatedPlan.recommended_devices.length === 0 && (
                   <tr>
                       <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                           추천된 장비가 없습니다. 장비를 추가해보세요.
                       </td>
                   </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* AI Report */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          종합 분석 리포트 (핵심 요약)
        </h3>
        <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-lg border border-slate-100">
           <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-base font-medium">
             {report_text}
           </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          새로운 분석 시작하기
        </button>
      </div>
    </div>
  );
};

export default ResultDashboard;
