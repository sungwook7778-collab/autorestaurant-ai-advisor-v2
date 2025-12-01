
import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { AnalysisResult } from '../types';

interface ChartSectionProps {
  result: AnalysisResult;
}

const ChartSection: React.FC<ChartSectionProps> = ({ result }) => {
  const { current_cost, automation_plan } = result;

  // Calculate Monthly Equipment Cost (Considering Quantity)
  // 1. Monthly Rental Fees
  const monthlyRentalCost = automation_plan.recommended_devices
    .filter(d => d.cost_type === 'monthly')
    .reduce((sum, d) => sum + (d.cost * d.count), 0);

  // 2. One-Time Costs Amortized over 36 months
  const oneTimeAmortizedCost = automation_plan.recommended_devices
    .filter(d => d.cost_type === 'one_time')
    .reduce((sum, d) => sum + ((d.cost * d.count) / 36), 0);
  
  const totalMonthlyEquipmentCost = monthlyRentalCost + oneTimeAmortizedCost;

  // 1. Cost Structure Comparison Data
  const currentTotal = current_cost.monthly_labor_cost + current_cost.monthly_fixed_cost;
  const predictedLabor = Math.max(0, current_cost.monthly_labor_cost - automation_plan.total_monthly_saving);
  const predictedEquipment = Math.round(totalMonthlyEquipmentCost);
  const predictedTotal = predictedLabor + current_cost.monthly_fixed_cost + predictedEquipment;

  const costData = [
    {
      name: '현재 (Current)',
      인건비: current_cost.monthly_labor_cost,
      고정비: current_cost.monthly_fixed_cost,
      장비비용: 0,
      total: currentTotal
    },
    {
      name: '도입 후 (Predicted)',
      인건비: predictedLabor,
      고정비: current_cost.monthly_fixed_cost,
      장비비용: predictedEquipment,
      total: predictedTotal
    },
  ];

  // 2. ROI Simulation (Cumulative Profit)
  const roiData = [];
  const monthlyNetBenefit = automation_plan.net_profit_increase;
  
  // Initial Investment (Only One-Time Costs * Quantity)
  const initialInvestment = automation_plan.recommended_devices
    .filter(d => d.cost_type === 'one_time')
    .reduce((sum, d) => sum + (d.cost * d.count), 0);

  for (let i = 0; i <= 24; i++) {
    roiData.push({
      month: `${i}개월`,
      순이익누적: (monthlyNetBenefit * i) - initialInvestment,
      zero: 0
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Cost Structure Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">월 운영 비용 구조 비교</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={costData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
              <YAxis axisLine={false} tickLine={false} unit="만" />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} 만원`} />
              <Legend />
              
              {/* Stacked Bars */}
              <Bar dataKey="인건비" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} name="인건비" />
              <Bar dataKey="고정비" stackId="a" fill="#94a3b8" name="고정비" />
              <Bar dataKey="장비비용" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="장비비용(렌탈/상각)" />
              
              {/* Invisible Line for Total Label */}
              <Line type="monotone" dataKey="total" stroke="none" isAnimationActive={false} name="총 비용" legendType="none">
                <LabelList 
                  position="top" 
                  offset={10} 
                  formatter={(value: number) => value.toLocaleString()} 
                  style={{ fill: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">* 장비비용은 월 렌탈료 및 일시불(36개월 상각) 기준입니다.</p>
      </div>

      {/* ROI Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">예상 누적 손익 (ROI Analysis)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={roiData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" minTickGap={3} axisLine={false} tickLine={false} tick={false} />
              <YAxis axisLine={false} tickLine={false} unit="만" />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} 만원`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="순이익누적" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
                name="누적 순이익"
              />
              {/* Zero line */}
              <Line type="monotone" dataKey="zero" stroke="#64748b" strokeWidth={1} dot={false} strokeDasharray="5 5" name="손익분기점(BEP)" /> 
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">* 초기 투자비(일시불 구매비) 회수 시점을 나타냅니다.</p>
      </div>
    </div>
  );
};

export default ChartSection;
