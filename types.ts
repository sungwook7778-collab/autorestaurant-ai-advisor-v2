
export type StoreCategory = 
  | '맥주집' | 'BAR' | '뷔페' | '치킨' | '족발' | '보쌈' | '샐러드' | '간식' 
  | '한식' | '분식' | '돈까스' | '탕요리' | '구이' | '피자' | '중식' | '일식' 
  | '회' | '양식' | '커피 및 디저트' | '아시안' | '샌드위치 및 버거' | '멕시칸' 
  | '도시락' | '죽' | '기타';

export interface StoreInputData {
  monthlySales: number;
  monthlyFixedCost: number; // Rent + Utilities + Misc
  
  // Detailed Labor Data
  employeeCountFT: number; // Regular (Full-time)
  employeeCostFT: number;  // Total cost for FT
  employeeCountPT: number; // Part-time
  employeeCostPT: number;  // Total cost for PT
}

export interface InitialAnalysisResult {
  store_category: string;
  estimated_hall_size: number;
  estimated_kitchen_size: number;
  estimated_tables: number;
  has_table_tablets: boolean; // Field for detection of existing tablets
}

export interface ConfirmedStoreData extends StoreInputData, InitialAnalysisResult {}

export interface EquipmentRecommendation {
  name: string;
  cost_type: 'monthly' | 'one_time';
  cost: number; // Unit Price in 'Man-won'
  count: number; // Quantity
  monthly_saving: number; // Total estimated saving in 'Man-won' (Unit Saving * Count)
  roi_months: number;
  reason?: string; // Added for UI display
}

export interface AutomationPlan {
  recommended_devices: EquipmentRecommendation[];
  total_monthly_saving: number;
  total_roi_months: number;
  total_investment_cost: number; // Derived field for chart
  net_profit_increase: number; // Derived field for chart
}

export interface StoreAnalysis {
  store_category: string;
  estimated_tables: number;
  estimated_hall_size: number; // Pyung
  estimated_kitchen_size: number; // Pyung
  workflow_issue: string;
}

export interface CurrentCost {
  monthly_sales: number;
  monthly_fixed_cost: number;
  // Detailed Labor Data for Dashboard Display
  employee_count_ft: number;
  employee_cost_ft: number;
  employee_count_pt: number;
  employee_cost_pt: number;
  // Totals for backward compatibility/easy access
  monthly_labor_cost: number; 
}

// The root object returned by the AI JSON
export interface AnalysisResult {
  store_analysis: StoreAnalysis;
  current_cost: CurrentCost;
  automation_plan: AutomationPlan;
  report_text: string;
}

// For the UI state
export type AnalysisStatus = 'idle' | 'analyzing_env' | 'review' | 'analyzing_plan' | 'success' | 'error';
