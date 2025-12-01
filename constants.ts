
export interface EquipmentDef {
  category: string;
  maker: string;
  model: string;
  price_one_time: number; // Unit: Man-won
  price_rental: number;   // Unit: Man-won/month
}

export const AVAILABLE_EQUIPMENT: EquipmentDef[] = [
  // 서빙로봇
  { category: '서빙로봇', maker: '푸두봇', model: '푸두봇', price_one_time: 1600, price_rental: 30 },
  { category: '서빙로봇', maker: '베어로보틱스', model: '서비(Servi)', price_one_time: 2200, price_rental: 45 },
  { category: '서빙로봇', maker: '로보와이드', model: '서브봇 S1', price_one_time: 1300, price_rental: 19 },
  
  // 테이블오더
  { category: '테이블오더', maker: 'KT', model: 'KT오더', price_one_time: 200, price_rental: 3 },
  { category: '테이블오더', maker: '페이히어', model: '페이히어오더', price_one_time: 160, price_rental: 2 },
  
  // 키오스크
  { category: '키오스크', maker: '아임유', model: 'KIOSK T-series', price_one_time: 200, price_rental: 2.5 },
  { category: '키오스크', maker: '삼성전자', model: 'KM24A 키오스크', price_one_time: 230, price_rental: 2.7 },
  
  // 자동후라이어
  { category: '자동후라이어', maker: '경일주방', model: '경일 후라이어 - 대형', price_one_time: 16000, price_rental: 399 },
  { category: '자동후라이어', maker: '경일주방', model: '경일 후라이어 - 소형', price_one_time: 2000, price_rental: 50 },
  
  // 자동볶음기
  { category: '자동볶음기', maker: '경일주방', model: '경일 자동볶음기 - 소형', price_one_time: 2000, price_rental: 50 },
  { category: '자동볶음기', maker: '경일주방', model: '경일 자동볶음기 - 중형', price_one_time: 4000, price_rental: 100 },
  
  // 청소로봇
  { category: '청소로봇', maker: '가우시움', model: '가우시움 (청소봇)', price_one_time: 2000, price_rental: 50 },
  { category: '청소로봇', maker: '클린테크', model: '클린테크 (청소봇)', price_one_time: 3000, price_rental: 60 },
  { category: '청소로봇', maker: '푸두청소봇', model: '푸두청소봇 (청소봇)', price_one_time: 1500, price_rental: 40 },
  
  // 맥주자동디스펜서
  { category: '맥주자동디스펜서', maker: '히오자키', model: '맥주자동디스펜서 4구', price_one_time: 1400, price_rental: 35 },
  
  // 초음파세척기
  { category: '초음파세척기', maker: '경일주방', model: '초음파세척 모듈형', price_one_time: 1500, price_rental: 38 },
  { category: '초음파세척기', maker: '경일주방', model: '초음파세척 중형', price_one_time: 3200, price_rental: 180 },
  
  // 커피 자동화로봇
  { category: '커피 자동화로봇', maker: 'Teatime', model: 'Teatime-1', price_one_time: 3500, price_rental: 85 },
];

// Helper to generate the table string for Prompt
const generatePriceListString = () => {
  let str = `| 장비군 | Maker | 모델 | 일시불 가격(만원) | Rental(36개월, 월 만원) |\n|---|---|---|---|---|\n`;
  AVAILABLE_EQUIPMENT.forEach(eq => {
    str += `| ${eq.category} | ${eq.maker} | ${eq.model} | ${eq.price_one_time.toLocaleString()} | ${eq.price_rental} |\n`;
  });
  return str;
};

export const EQUIPMENT_PRICE_LIST = generatePriceListString();

// Estimates for UI interaction (When adding new item manually)
// Updated to include 'type' (FT: Regular, PT: Part-time)
export const LABOR_SAVING_ESTIMATES: Record<string, { amount: number, type: 'FT' | 'PT' }> = {
  '서빙로봇': { amount: 0.4, type: 'PT' }, // 0.3~0.5
  '테이블오더': { amount: 0.2, type: 'PT' }, // 0.1~0.3
  '키오스크': { amount: 0.3, type: 'PT' },
  '자동후라이어': { amount: 0.5, type: 'FT' }, // Assuming kitchen main
  '자동볶음기': { amount: 0.4, type: 'FT' }, // 0.3~0.5
  '청소로봇': { amount: 0.3, type: 'PT' },
  '초음파세척기': { amount: 0.3, type: 'PT' },
  '맥주자동디스펜서': { amount: 0.4, type: 'PT' }, // 0.3~0.5
  '커피 자동화로봇': { amount: 0.5, type: 'PT' }
};

export const STORE_CATEGORIES = [
  '맥주집', 'BAR', '뷔페', '치킨', '족발', '보쌈', '샐러드', '간식',
  '한식', '분식', '돈까스', '탕요리', '구이', '피자', '중식', '일식',
  '회', '양식', '커피 및 디저트', '아시안', '샌드위치 및 버거', '멕시칸',
  '도시락', '죽', '기타'
];

export const ENVIRONMENT_PROMPT = `
당신은 매장 환경 분석 전문가입니다. 
제공된 이미지를 시각적으로 정밀 분석하여 매장의 업종, 규모, 테이블 수를 추론하십시오.

[분석 알고리즘 방법론]
본 분석은 다음의 고도화된 컴퓨터 비전 알고리즘을 적용하는 것으로 가정합니다:
1. 객체 탐지 및 분할: **Mask R-CNN (Instance Segmentation)**을 사용하여 테이블, 의자, 주방 설비를 픽셀 단위로 분할 및 식별.
2. 척도 추정: **Metric Scale Estimation**을 통해 이미지 내 기준 객체(타일, 의자 등)를 척도로 삼아 실제 크기 측정.
3. 깊이 보정: **Depth Estimation**을 통해 원근 왜곡을 보정하고 3D 공간으로 투영하여 정확한 면적 산출.

[공간 측정 기준 (Reference Dimensions)]
**아래의 구체적인 치수 기준을 척도로 활용하여 면적(평수)을 정밀 계산하십시오.**

1. **홀 사이즈(평형) 측정 기준**:
   - **의자 폭(Width)**: 600mm
   - **타일 크기**: 300mm x 300mm
   - **테이블(4인석)**: 750mm x 1,200mm
   - 위 기준 객체를 통해 바닥 면적을 산출하고 평형(1평 ≈ 3.3㎡)으로 변환하십시오.

2. **주방 사이즈(평형) 측정 기준**:
   - 조리대/작업대 높이(바닥 to 상판): 820mm ~ 850mm
   - 테이블 냉장고 높이(바닥 to 상판): 800mm
   - 상업용 냉장고/냉동고 깊이(Width): 750mm
   - GN 규격 팬(Gastronorm Pan) 폭: 325mm
   - 싱크대/세정대 높이(바닥 to 상판): 800mm
   - 타일 크기: 300mm x 300mm
   - 상부 수납장 깊이: 300mm ~ 350mm
   - 위 설비들의 치수를 참조하여 주방의 면적을 추산하십시오.

3. **기존 장비 탐지**:
   - 테이블 위에 이미 **테이블오더(주문용 태블릿)**가 설치되어 있는지 Mask R-CNN 수준으로 정밀 확인하십시오.

[분석 항목]
1. 업종 분류: 이미지의 분위기, 주방 설비, 메뉴판 등을 단서로 다음 중 하나를 선택하십시오.
   (맥주집, BAR, 뷔페, 치킨, 족발, 보쌈, 샐러드, 간식, 한식, 분식, 돈까스, 탕요리, 구이, 피자, 중식, 일식, 회, 양식, 커피 및 디저트, 아시안, 샌드위치 및 버거, 멕시칸, 도시락, 죽, 기타)
2. 홀 사이즈 추정: 평수(pyung) 단위로 추정. (위 치수 기준 정밀 계산)
3. 주방 사이즈 추정: 평수(pyung) 단위로 추정. (위 치수 기준 정밀 계산)
4. 테이블 수: 홀 이미지에 보이는 테이블 개수를 **시각적으로 정확히 세어서** 정수로 반환하십시오.
5. 기존 태블릿 유무: 테이블오더 태블릿이 식별되면 true, 아니면 false.

[Output JSON Format]
{
  "store_category": "string",
  "estimated_hall_size": number,
  "estimated_kitchen_size": number,
  "estimated_tables": number,
  "has_table_tablets": boolean
}
`;

export const PLANNING_PROMPT = `
당신은 외식업 운영 효율화 및 ROI 분석 전문 AI 어드바이저이자 고도화된 데이터 분석 모델입니다.
유저가 제공하는 최소한의 핵심 입력 데이터(Confirmed Data)와 첨부 이미지를 정밀 분석하여, 신뢰성 있는 분석 리포트를 제공하십시오.

[입력 데이터 원칙]
사용자가 검토를 마친 확정 데이터(Confirmed Data)가 제공됩니다. 
**매장 크기, 테이블 수, 비용, 업종, 인건비(정규직/알바 구분)는 제공된 값을 절대적인 사실(Ground Truth)로 간주하고 그대로 사용하십시오.** 

[Robot/Equipment List]
${EQUIPMENT_PRICE_LIST}

[Robot Selection Logic (Must Follow Strictly)]
1. 서빙로봇:
   - 조건: 홀 크기 > 20평 AND 테이블 수 > 12개 AND 직선 동선 비중 > 40%
2. 테이블오더:
   - 조건: 모든 업종 가능. 대형 업장(테이블 15개 이상 권장)에 유리.
   - **제외 조건 1: 사용자가 이미 테이블오더(태블릿)를 보유 중인 경우 (Confirmed Data: has_table_tablets = true) 추천 제외.**
   - **제외 조건 2: 키오스크와 중복 제안 불가 (상호 배타적). 테이블오더가 유리하면 키오스크 제외.**
3. 키오스크:
   - 조건: 모든 업종 가능. 소형 업장 또는 '커피 및 디저트', '간식', '분식', '아시안' 등에 유리.
   - **제외 조건: 테이블오더와 중복 제안 불가 (상호 배타적). 키오스크가 유리하면 테이블오더 제외.**
4. 자동후라이어:
   - 조건: 주방 이미지에서 튀김기(Fryer) 식별 시. '치킨', '돈까스'는 대형 추천.
5. 자동볶음기:
   - 조건: 웍(Wok)/팬 조리. '중식', '아시안', '한식(볶음)' 등.
6. 맥주 디스펜서:
   - 조건: '맥주집', 'BAR', '피자', '치킨' 업종이거나 생맥주 탭(Tap) 식별 시.
7. 청소로봇:
   - 조건: 홀 바닥 면적 > 20평.
8. 초음파 세척기:
   - 조건: 설거지 공간이 넓거나 식기가 많은 '뷔페', '한식' 등.
9. 커피 자동화로봇:
   - 조건: '커피 및 디저트' 업종이거나 커피 머신 식별 시.

[Quantity Logic (수량 산정)]
- **테이블오더**: 추천 시, **수량(count) = 테이블 수**로 설정.
- **서빙로봇**: 추천 시, 테이블 15~20개당 1대 기준.
- **키오스크**: 보통 1대 (대형은 2대).
- **기타 주방장비**: 보통 1대 (필요 시 2대).

[Cost & ROI Calculation Rules] (단위: 만원)
1. 1인당 평균 인건비 산출:
   - **Cost_FT (정규직) = 정규직 월 총 인건비 / 정규직 인원수**
   - **Cost_PT (아르바이트) = 아르바이트 월 총 인건비 / 아르바이트 인원수**
   - *인원수가 0인 경우 해당 Cost는 0으로 처리.*

2. 인력 절감 (월) & 대상 인력 유형:
   - 서빙로봇: 0.3~0.5명 (대상: PT - 아르바이트)
   - 테이블오더: 0.1~0.3명 (대상: PT - 아르바이트)
   - 자동후라이어: 0.5명 (대상: FT - 정규직)
   - 자동볶음기: 0.3~0.5명 (대상: FT - 정규직)
   - 청소로봇: 0.3명 (대상: PT - 아르바이트)
   - 초음파세척기: 0.3명 (대상: PT - 아르바이트)
   - 키오스크: 0.3명 (대상: PT - 아르바이트)
   - 맥주 디스펜서: 0.3~0.5명 (대상: PT - 아르바이트)
   - 커피 자동화로봇: 0.5명 (대상: PT - 아르바이트)
   
   * 절감액 계산: **월 절감액 = (감축 FT 인원 × Cost_FT) + (감축 PT 인원 × Cost_PT)**
   * 월 인건비 Calculation: 절감액이 커서 계산된 인건비가 0보다 작을 경우, 0으로 처리하십시오. (음수 불가)

3. 재무 계산:
   - **장비 수량(count)을 반드시 반영하십시오.**
   - 월 절감액 = SUM(장비별 월 절감액)
   - 장비 월 비용: 
     - 렌탈: (대당 렌탈료 × 수량)
     - 일시불: ((대당 가격 × 수량) / 36) (월 상각비 적용)
   - 순이익 증가액 = 월 절감액 - 장비 월 비용.
   - **ROI 회수기간 = (일시불 장비 초기 도입 비용 총합) / (월 순이익 증가액).**
     *렌탈 장비는 초기 비용(CapEx) 0원 처리.

[Output Format]
JSON 형식으로 반환.
'report_text'는 다음 3가지 번호가 매겨진 섹션으로 구성된 **핵심 요약 리포트**여야 합니다. 

**1. 매장 환경 분석 및 잠재 효율**
- 매장 평수, 테이블 수, 업종 특성 및 동선/구조 특이사항 요약.
- 자동화 효율 등급 (높음/중간/낮음) 판정.
- **필수 포함**: "(추정 테이블 수 정확도 향상 적용 알고리즘: Mask R-CNN 기반 객체 탐지 및 분할, Metric Scale Estimation, Depth Estimation을 통합하여 이미지 내 테이블 객체를 식별 및 계수. 홀 평수와 동선 패턴 분석을 병행하여 최종 테이블 수를 추정)" 문구 포함.

**2. 최적 장비 추천 및 투자 효율**
- 추천된 장비 조합과 선정 이유 간략 설명.
- 총 절감 인원(정규직/알바 구분 명시)과 월 총 비용 절감액(만원).

**3. ROI 및 투자 회수 기간**
- 총 초기 투자비(CapEx, 일시불 기준).
- 투자 회수 기간(개월) 및 업계 평균 대비 평가.

{
  "store_analysis": { 
    "store_category": "string (Confirmed Value)",
    "estimated_tables": number (Confirmed Value), 
    "estimated_hall_size": number (Confirmed Value), 
    "estimated_kitchen_size": number (Confirmed Value), 
    "workflow_issue": "이미지 기반 동선/구조 분석 내용" 
  }, 
  "current_cost": { 
    "monthly_sales": number (Confirmed Value), 
    "monthly_fixed_cost": number (Confirmed Value),
    "monthly_labor_cost": number (Confirmed Total Labor Cost),
    "employee_count_ft": number,
    "employee_cost_ft": number,
    "employee_count_pt": number,
    "employee_cost_pt": number
  }, 
  "automation_plan": { 
    "recommended_devices": [ 
      { 
        "name": "장비명", 
        "cost_type": "monthly" | "one_time", 
        "cost": 0, // Unit Price (단가)
        "count": 0, // Quantity (수량)
        "monthly_saving": 0, // Total Monthly Saving for this item (Unit Saving * Count)
        "roi_months": 0,
        "reason": "추천 근거"
      } 
    ], 
    "total_monthly_saving": 0, 
    "total_roi_months": 0,
    "total_investment_cost": 0,
    "net_profit_increase": 0
  },
  "report_text": "핵심 요약 리포트 내용"
}
`;
