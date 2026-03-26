import React from 'react';

/** 제품군·라인별 가상 컨셉 일러스트 (SVG, 예시용) */
export function EquipmentConceptIcon({ categoryId, tier }) {
  const t = tier % 3;
  const common = { width: 72, height: 56, viewBox: '0 0 80 60', 'aria-hidden': true };

  if (categoryId === 'dishwasher') {
    const h = 22 + t * 4;
    return (
      <svg {...common}>
        <rect x="8" y="10" width="64" height={h} rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="14" y1="18" x2="66" y2="18" stroke="#0369A1" strokeWidth="1" />
        <line x1="14" y1="26" x2="66" y2="26" stroke="#0369A1" strokeWidth="1" />
        <path d="M40 6 Q44 12 40 18 Q36 12 40 6" fill="#38BDF8" opacity="0.6" />
        <rect x="30" y={38 + t * 2} width="20" height="8" rx="1" fill="#94A3B8" />
      </svg>
    );
  }
  if (categoryId === 'stirCook') {
    return (
      <svg {...common}>
        <ellipse cx="42" cy="32" rx="26" ry="14" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.5" />
        <path d="M28 28 Q42 20 56 28" fill="none" stroke="#C2410C" strokeWidth="2" />
        <circle cx="42" cy="22" r={4 + t} fill="#F97316" opacity="0.85" />
        <rect x="58" y="14" width="4" height="18" rx="1" fill="#78716C" />
      </svg>
    );
  }
  if (categoryId === 'prep') {
    return (
      <svg {...common}>
        <rect x="12" y="16" width="56" height="32" rx="4" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
        <ellipse cx="32" cy="32" rx="10" ry="6" fill="#86EFAC" opacity="0.8" />
        <ellipse cx="50" cy="30" rx="8" ry="5" fill="#4ADE80" opacity="0.7" />
        <line x1="20" y1="24" x2="60" y2="24" stroke="#15803D" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx={44 + t * 3} cy="38" r="3" fill="#22C55E" />
      </svg>
    );
  }
  if (categoryId === 'fryer') {
    const w = 20 + t * 4;
    return (
      <svg {...common}>
        <rect x="10" y="18" width={w} height="28" rx="2" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
        <rect x={16 + w} y="18" width={w} height="28" rx="2" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
        <ellipse cx={10 + w / 2} cy="32" rx="8" ry="5" fill="#FDE047" opacity="0.5" />
        <ellipse cx={16 + w + w / 2} cy="32" rx="8" ry="5" fill="#FDE047" opacity="0.5" />
        <rect x="36" y="8" width="8" height="10" rx="1" fill="#A16207" />
      </svg>
    );
  }
  if (categoryId === 'combi') {
    const bh = 38 + t * 4;
    return (
      <svg {...common}>
        <rect x="18" y={60 - bh - 8} width="44" height={bh} rx="2" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5" />
        <rect x="22" y={60 - bh - 4} width="36" height="12" rx="1" fill="#CBD5E1" />
        <line x1="22" y1={60 - bh + 14} x2="58" y2={60 - bh + 14} stroke="#64748B" strokeWidth="1" />
        <path d="M28 12 Q40 6 52 12" fill="none" stroke="#94A3B8" strokeWidth="1.5" opacity="0.8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="16" y="14" width="48" height="36" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
    </svg>
  );
}
