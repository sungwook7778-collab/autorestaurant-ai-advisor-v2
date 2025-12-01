
import React, { useState, useEffect } from 'react';
import { analyzeEnvironment, generateAutomationPlan } from './services/geminiService';
import { AnalysisStatus, StoreInputData, AnalysisResult, InitialAnalysisResult, ConfirmedStoreData } from './types';
import ResultDashboard from './components/ResultDashboard';
import AnalysisReview from './components/AnalysisReview';
import { UploadCloud, ChefHat, DollarSign, Layout, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [inputData, setInputData] = useState<StoreInputData>({
    monthlySales: 0,
    monthlyFixedCost: 0,
    employeeCountFT: 0,
    employeeCostFT: 0,
    employeeCountPT: 0,
    employeeCostPT: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  
  // Stage 1 Result
  const [initialEnv, setInitialEnv] = useState<InitialAnalysisResult | null>(null);
  
  // Final Result
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        setImages(prev => [...prev, ...pastedFiles]);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
        alert("매장 이미지를 최소 1장 이상 업로드해주세요.");
        return;
    }

    setStatus('analyzing_env');
    setErrorMsg(null);

    try {
      const envResult = await analyzeEnvironment(images);
      setInitialEnv(envResult);
      setStatus('review');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || "이미지 분석 중 오류가 발생했습니다.");
    }
  };

  const handleReviewConfirm = async (confirmedData: ConfirmedStoreData) => {
    setStatus('analyzing_plan');
    try {
        const finalResult = await generateAutomationPlan(confirmedData, images);
        setResult(finalResult);
        setStatus('success');
    } catch (error: any) {
        setStatus('error');
        setErrorMsg(error.message || "최종 리포트 생성 중 오류가 발생했습니다.");
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setInitialEnv(null);
    setImages([]);
    setInputData({
        monthlySales: 0,
        monthlyFixedCost: 0,
        employeeCountFT: 0,
        employeeCostFT: 0,
        employeeCountPT: 0,
        employeeCostPT: 0,
    });
  };

  // Render Logic based on Status

  if (status === 'success' && result) {
    return <ResultDashboard result={result} onReset={handleReset} />;
  }

  if (status === 'review' && initialEnv) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AnalysisReview 
            initialEnvironment={initialEnv}
            userCosts={inputData}
            onConfirm={handleReviewConfirm}
            onCancel={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                 <ChefHat className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AutoRestaurant <span className="text-blue-600">AI Advisor</span></h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">매장 자동화 진단 시작하기</h2>
                <p className="text-slate-300">AI가 매장 사진과 비용 구조를 분석하여 최적의 로봇/장비 포트폴리오와 ROI 리포트를 제공합니다.</p>
            </div>

            <div className="p-8">
                {status === 'error' && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                        <Loader2 className="w-5 h-5" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {(status === 'analyzing_env' || status === 'analyzing_plan') ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="relative">
                             <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-pulse opacity-50"></div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {status === 'analyzing_env' ? '매장 환경을 분석하고 있습니다...' : '최종 ROI 리포트를 생성 중입니다...'}
                        </h3>
                        <p className="text-slate-500 max-w-md">
                            {status === 'analyzing_env' 
                                ? '이미지에서 업종, 크기, 테이블 수를 식별 중입니다.' 
                                : '확인된 데이터를 바탕으로 최적의 장비 조합과 수익성을 시뮬레이션하고 있습니다.'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleInitialSubmit} className="space-y-8">
                        
                        {/* Section 1: Images */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Layout className="w-4 h-4 text-blue-600" />
                                1. 매장 이미지 (필수)
                            </label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center group cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-slate-900 font-medium">클릭하거나 이미지를 드래그, 또는 붙여넣기(Ctrl+V) 하세요</p>
                                    <p className="text-slate-500 text-sm mt-1">캡처한 이미지를 바로 붙여넣을 수 있습니다 (최대 5장 권장)</p>
                                    {images.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                            <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                                                {images.length}개의 파일 선택됨
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Costs */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                2. 월 운영 비용 (만원 단위)
                            </label>
                            
                            {/* General Costs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">월 고정비 (임대료, 관리비 등)</label>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="예: 500"
                                        value={inputData.monthlyFixedCost || ''}
                                        onChange={(e) => setInputData({...inputData, monthlyFixedCost: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">월 추정 매출</label>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="예: 6000"
                                        value={inputData.monthlySales || ''}
                                        onChange={(e) => setInputData({...inputData, monthlySales: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Detailed Labor Costs */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-sm font-bold text-slate-700">정규직 (Full-time)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">인원수 (명)</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                placeholder="0"
                                                value={inputData.employeeCountFT || ''}
                                                onChange={(e) => setInputData({...inputData, employeeCountFT: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">월 총 인건비 (만원)</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                placeholder="0"
                                                value={inputData.employeeCostFT || ''}
                                                onChange={(e) => setInputData({...inputData, employeeCostFT: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-sm font-bold text-slate-700">아르바이트 (Part-time)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">인원수 (명)</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                placeholder="0"
                                                value={inputData.employeeCountPT || ''}
                                                onChange={(e) => setInputData({...inputData, employeeCountPT: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">월 총 인건비 (만원)</label>
                                            <input 
                                                type="number" 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                placeholder="0"
                                                value={inputData.employeeCostPT || ''}
                                                onChange={(e) => setInputData({...inputData, employeeCostPT: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                AI 분석 시작하기
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
