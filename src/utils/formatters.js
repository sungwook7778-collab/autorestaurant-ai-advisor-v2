/**
 * 숫자 포매팅 유틸리티
 */

/** 원화 포맷 (만원 단위) */
export function formatWon(value, showUnit = true) {
  if (value === null || value === undefined) return '-';
  const man = Math.round(value / 10000);
  if (Math.abs(man) >= 10000) {
    return `${(man / 10000).toFixed(1)}억${showUnit ? ' 원' : ''}`;
  }
  return `${man.toLocaleString()}${showUnit ? '만 원' : '만'}`;
}

/** 원화 전체 포맷 */
export function formatWonFull(value) {
  if (value === null || value === undefined) return '-';
  return `${Math.round(value).toLocaleString()}원`;
}

/** 퍼센트 포맷 */
export function formatPct(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/** 개월 포맷 */
export function formatMonths(months) {
  if (!months || months <= 0) return '즉시';
  if (months < 1) return `${Math.round(months * 30)}일`;
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const rem = Math.round(months % 12);
    return rem > 0 ? `${years}년 ${rem}개월` : `${years}년`;
  }
  return `${Math.round(months * 10) / 10}개월`;
}

/** 숫자 축약 */
export function formatCompact(value) {
  if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString();
}

/** 날짜 포맷 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}
