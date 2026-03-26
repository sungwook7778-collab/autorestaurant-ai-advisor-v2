import React, { useEffect, useMemo, useState } from 'react';
import NavigationButtons from '../components/NavigationButtons.jsx';
import EquipmentDetailModal from '../components/EquipmentDetailModal.jsx';
import { EquipmentConceptIcon } from '../components/EquipmentConceptIcon.jsx';
import { EQUIPMENT_CATEGORIES } from '../engine/kitchenEquipmentCatalog.js';
import { aggregateKitchenFromState } from '../engine/aggregateKitchenSelections.js';
import { formatWon } from '../utils/formatters.js';

export default function Step4Robot({ state, dispatch, onNext, onPrev }) {
  const [detailModal, setDetailModal] = useState(null);

  const aggregate = useMemo(
    () => aggregateKitchenFromState(state),
    [state.kitchenSelections, state.industry, state.seats, state.staffCount, state.monthlyRevenue]
  );

  useEffect(() => {
    if (!aggregate.hasSelection) {
      if (
        state.robotCount !== 0 ||
        state.staffReduction !== 0 ||
        state.throughputImprovement !== 0 ||
        state.wasteReductionRate !== 0
      ) {
        dispatch({
          type: 'UPDATE',
          payload: {
            robotCount: 0,
            staffReduction: 0,
            throughputImprovement: 0,
            wasteReductionRate: 0,
          },
        });
      }
      return;
    }
    const { equipmentUnitCount, staffReduction, throughputImprovement, wasteReductionRate } = aggregate;
    if (
      state.robotCount === equipmentUnitCount &&
      state.staffReduction === staffReduction &&
      state.throughputImprovement === throughputImprovement &&
      state.wasteReductionRate === wasteReductionRate
    ) {
      return;
    }
    dispatch({
      type: 'UPDATE',
      payload: {
        robotCount: equipmentUnitCount,
        staffReduction,
        throughputImprovement,
        wasteReductionRate,
      },
    });
  }, [aggregate, dispatch, state.robotCount, state.staffReduction, state.throughputImprovement, state.wasteReductionRate]);

  const setCategory = (categoryId, productId) => {
    dispatch({
      type: 'UPDATE',
      payload: {
        kitchenSelections: {
          ...state.kitchenSelections,
          [categoryId]: productId,
        },
      },
    });
  };

  const canProceed = aggregate.hasSelection;

  return (
    <div className="step-card">
      <div className="step-icon-wrap">🍳</div>
      <h2 className="step-title">주방 자동화 장비 선택</h2>
      <p className="step-subtitle">
        제품군별로 <strong>라인업 3종 중 1종</strong>을 고르거나, 해당 군은 <strong>이번에 도입하지 않음(미선택)</strong>으로 둘 수 있습니다. 제품을 누르면 상세 스펙을 확인할 수 있습니다.
      </p>

      {EQUIPMENT_CATEGORIES.map((cat) => {
        const current = state.kitchenSelections[cat.id];
        return (
          <section key={cat.id} className="equipment-category">
            <div className="equipment-category-head">
              <span className="equipment-category-icon">{cat.icon}</span>
              <div>
                <h3 className="equipment-category-name">{cat.name}</h3>
                <p className="equipment-category-desc">{cat.desc}</p>
              </div>
            </div>
            <div className="equipment-option-grid">
              {cat.options.map((opt, tier) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`equipment-option equipment-option-with-icon ${current === opt.id ? 'selected' : ''}`}
                  onClick={() => setDetailModal({ category: cat, option: opt, tier })}
                >
                  <div className="equipment-concept-wrap" aria-hidden>
                    <EquipmentConceptIcon categoryId={cat.id} tier={tier} />
                  </div>
                  <div className="equipment-option-text">
                    <span className="equipment-option-name">{opt.name}</span>
                    <span className="equipment-option-maker">{opt.manufacturer}</span>
                    <span className="equipment-option-price">{formatWon(opt.price)}</span>
                    {opt.priceNote && <span className="equipment-option-note">{opt.priceNote}</span>}
                  </div>
                </button>
              ))}
              <button
                type="button"
                className={`equipment-option equipment-option-none ${current == null ? 'selected' : ''}`}
                onClick={() => setCategory(cat.id, null)}
              >
                <span className="equipment-option-name">이번 도입 없음</span>
                <span className="equipment-option-note">해당 제품군은 투자·효과에 넣지 않습니다</span>
              </button>
            </div>
          </section>
        );
      })}

      <EquipmentDetailModal
        category={detailModal?.category}
        option={detailModal?.option}
        tier={detailModal?.tier ?? 0}
        onClose={() => setDetailModal(null)}
        onConfirmSelect={(categoryId, optionId) => setCategory(categoryId, optionId)}
      />

      <div className="proposal-panel">
        <div className="proposal-panel-title">
          <span>✨</span> 집계된 도입 제안
        </div>
        <p className="proposal-panel-desc">
          선택한 라인만 합산합니다. 아래 수치는 다음 단계·ROI 계산에 자동 반영됩니다.
        </p>
        {!aggregate.hasSelection ? (
          <p className="equipment-warning">한 가지 이상 제품을 선택해야 다음 단계로 진행할 수 있습니다.</p>
        ) : (
          <>
            <ul className="equipment-summary-list">
              {aggregate.summaryLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="proposal-metrics">
              <div className="proposal-metric">
                <span className="proposal-metric-label">도입 라인 수</span>
                <span className="proposal-metric-value">{aggregate.equipmentUnitCount}식</span>
              </div>
              <div className="proposal-metric">
                <span className="proposal-metric-label">주방 인력 절감</span>
                <span className="proposal-metric-value">{aggregate.staffReduction}명</span>
              </div>
              <div className="proposal-metric">
                <span className="proposal-metric-label">출고·회전 효율</span>
                <span className="proposal-metric-value">+{aggregate.throughputImprovement}%</span>
              </div>
              <div className="proposal-metric">
                <span className="proposal-metric-label">폐기·손실 감소</span>
                <span className="proposal-metric-value">{aggregate.wasteReductionRate}%</span>
              </div>
            </div>
            <ul className="proposal-rationale">
              {aggregate.rationale.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {aggregate.hasSelection && (
        <div className="success-box" style={{ marginTop: 16 }}>
          <span className="success-box-icon">✅</span>
          <div className="success-box-text">
            장비 합산 약 <strong>{formatWon(aggregate.equipmentBasePrice)}</strong> · 월 유지(유지+전기) 약{' '}
            <strong>{formatWon(aggregate.monthlyEquipmentCost)}</strong>
          </div>
        </div>
      )}

      <NavigationButtons onNext={onNext} onPrev={onPrev} disabled={!canProceed} />
    </div>
  );
}
