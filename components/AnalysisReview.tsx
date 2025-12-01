
import React, { useState } from 'react';
import { ConfirmedStoreData, InitialAnalysisResult, StoreInputData } from '../types';
import { STORE_CATEGORIES } from '../constants';
import { CheckCircle2, Edit2, ArrowRight } from 'lucide-react';

interface AnalysisReviewProps {
  initialEnvironment: InitialAnalysisResult;
  userCosts: StoreInputData;
  onConfirm: (data: ConfirmedStoreData) => void;
  onCancel: () => void;
}

const AnalysisReview: React.FC<AnalysisReviewProps> = ({ 
  initialEnvironment, 
  userCosts, 
  onConfirm,
  onCancel 
}) => {
  const [formData, setFormData] = useState<ConfirmedStoreData>({
    ...userCosts,
    ...initialEnvironment
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const handleChange = (field: keyof ConfirmedStoreData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            매장 분석 데이터 확인
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            AI가 추론한 정보가 맞는지 확인하고, 필요한 경우 수정해주세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Section 1: Environment (AI Inferred) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              매장 환경 정보 (AI 추론)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">업종</label>
                <select 
                  value={formData.store_category}
                  onChange={(e) => handleChange('store_category', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {STORE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">홀 규모 (평)</label>
                  <input 
                    type="number" 
                    value={formData.estimated_hall_size}
                    onChange={(e) => handleChange('estimated_hall_size', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 leading-tight">
                    * 기준: 의자 폭 600mm, 4인 테이블 750x1200mm, 타일 300x300mm
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">주방 규모 (평)</label>
                  <input 
                    type="number" 
                    value={formData.estimated_kitchen_size}
                    onChange={(e) => handleChange('estimated_kitchen_size', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 leading-tight">
                    * 기준: 조리대 높이 820mm, 냉장고 깊이 750mm, 타일 300x300mm
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">테이블 수 (개)</label>
                <input 
                  type="number" 
                  value={formData.estimated_tables}
                  onChange={(e) => handleChange('estimated_tables', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Costs (User Input) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-green-600" />
              월 운영 비용 정보
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                   월 고정비 (임대료, 공과금, 관리비, 기타)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.monthlyFixedCost}
                    onChange={(e) => handleChange('monthlyFixedCost', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                  />
                  <span className="absolute right-4 top-2 text-slate-400 text-sm">만원</span>
                </div>
              </div>

              {/* Labor Costs Detailed */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                 <h4 className="text-sm font-bold text-slate-700">정규직 (Full-time)</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">인원수 (명)</label>
                        <input 
                            type="number" 
                            value={formData.employeeCountFT}
                            onChange={(e) => handleChange('employeeCountFT', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">월 총 인건비 (만원)</label>
                        <input 
                            type="number" 
                            value={formData.employeeCostFT}
                            onChange={(e) => handleChange('employeeCostFT', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                 <h4 className="text-sm font-bold text-slate-700">아르바이트 (Part-time)</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">인원수 (명)</label>
                        <input 
                            type="number" 
                            value={formData.employeeCountPT}
                            onChange={(e) => handleChange('employeeCountPT', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">월 총 인건비 (만원)</label>
                        <input 
                            type="number" 
                            value={formData.employeeCostPT}
                            onChange={(e) => handleChange('employeeCostPT', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">월 예상 매출액</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.monthlySales}
                    onChange={(e) => handleChange('monthlySales', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                  />
                   <span className="absolute right-4 top-2 text-slate-400 text-sm">만원</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            다시 시작
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
          >
            이 정보로 최종 분석 실행
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnalysisReview;
