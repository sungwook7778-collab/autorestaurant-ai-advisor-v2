import React, { useEffect } from 'react';
import { formatWon } from '../utils/formatters.js';
import { EquipmentConceptIcon } from './EquipmentConceptIcon.jsx';

/** 옵션 id별 예시 스펙 (데모·영업 시뮬용 가상 수치) */
const DEMO_SPECS = {
  dishwasher_rack_s: ['외형(예시) W600×D700×H1400mm', '랙 2단·시간당 약 35바구니급(가정)', '급수·배수 15A / 전원 220V 3kW급'],
  dishwasher_door_m: ['외형(예시) W720×D780×H1650mm', '도어형·고온 살균rinse', '전원 380V 3상·약 12kW급(가정)'],
  dishwasher_conv_l: ['컨베어 길이 라인(예시 3~5m)', '시간당 대용량 랙 처리', '스팀후드·정수기 연동 권장'],
  stir_single: ['1구 인덕션·프로그램 12레시피(예시)', '터치 패널·온도 PID', '상판 스테인리스'],
  stir_multi: ['4~6구 멀티존·레시피 동시 가동', 'POS·KDS 연동 가능(가정)', '배기 400φ 권장'],
  stir_noodle: ['면 바스켓 자동 리프트(예시)', '삶기·데우기 2챔버', '급탕 보일러 연동'],
  prep_wash: ['드럼·노즐 세척(예시)', '채소 손상 최소화 RPM', '배수 필터 내장'],
  prep_slice: ['슬라이스 두께 가변(가정 1~14mm)', '다지기·슬라이스 교체 블레이드', '안전 인터록'],
  prep_vac: ['진공 챔버 용량(예시 30L)', '브라인·저온 숙성 모드', '터치 HMI'],
  fry_open: ['탱크 2구·각 15L급(예시)', '온도 제어 ±2℃', '오일 필터 카트리지'],
  fry_pressure: ['압력캡·단축 조리(가정)', '고온 180~190℃', '에너지 스타 등급(예시)'],
  fry_induction: ['인덕션 가열·연기 저감', '오일 수명 연장 센서(가정)', '후드 연동'],
  combi_small: ['6~10단 GN1/1(예시)', '증기·대류·혼합', 'USB 레시피 업로드'],
  combi_pro: ['대형 단일 챔버·다층 랙', 'ClimaPlus급 습도 제어(가정)', '원격 모니터링'],
  combi_stack: ['2단 스택·독립 제어', '피크타임 동시 조리', '3상 380V 고용량'],
};

export default function EquipmentDetailModal({ category, option, tier = 0, onClose, onConfirmSelect }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!category || !option) return null;

  const demoLines = DEMO_SPECS[option.id] || ['상세 스펙은 제조사 카탈로그를 확인해 주세요.'];

  return (
    <div
      className="equipment-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="equipment-modal-title"
      onClick={onClose}
    >
      <div className="equipment-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="equipment-modal-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        <div className="equipment-modal-visual" aria-hidden>
          <EquipmentConceptIcon categoryId={category.id} tier={tier} />
        </div>
        <p className="equipment-modal-category">{category.name}</p>
        <h2 id="equipment-modal-title" className="equipment-modal-title">
          {option.name}
        </h2>
        <p className="equipment-modal-maker">{option.manufacturer}</p>

        <div className="equipment-modal-section">
          <h3>가격·운영(시뮬레이션)</h3>
          <ul>
            <li>도입가(참고): <strong>{formatWon(option.price)}</strong></li>
            <li>{option.priceNote}</li>
            <li>
              월 유지비 + 전기(가정): <strong>{formatWon(option.monthlyCost + option.powerCostPerMonth)}</strong>
            </li>
          </ul>
        </div>

        <div className="equipment-modal-section">
          <h3>ROI 모델 반영 지표</h3>
          <ul>
            <li>인력 절감 환산계수: <strong>{option.staffEquiv}</strong> (FTE 상당, 합산 시 정수명으로 반영)</li>
            <li>출고·회전 가중치: <strong>{option.throughputPts}</strong></li>
            <li>폐기·손실 감소 가중치: <strong>{option.wastePts}</strong></li>
          </ul>
        </div>

        <div className="equipment-modal-section">
          <h3>장비 컨셉 스펙 (예시)</h3>
          <ul>
            {demoLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <p className="equipment-modal-disclaimer">
          본 내용은 ROI 시뮬레이터용 예시이며, 실제 제품 스펙·인증·견적은 제조사·대리점 기준입니다.
        </p>

        <div className="equipment-modal-actions">
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            닫기
          </button>
          <button
            type="button"
            className="btn-modal-primary"
            onClick={() => {
              onConfirmSelect(category.id, option.id);
              onClose();
            }}
          >
            이 구성으로 선택
          </button>
        </div>
      </div>
    </div>
  );
}
