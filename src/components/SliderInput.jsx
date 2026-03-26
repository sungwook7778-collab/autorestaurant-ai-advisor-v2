import React, { useCallback } from 'react';

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  unit = '',
  hint = '',
  minLabel,
  maxLabel,
}) {
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((e) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const displayValue = formatValue ? formatValue(value) : value.toLocaleString();

  return (
    <div className="slider-group">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value-display">
          {displayValue}
          {unit && <span className="slider-unit">{unit}</span>}
        </span>
      </div>
      {hint && <div className="slider-hint">{hint}</div>}
      <div className="slider-track-wrap">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={{ '--pct': `${pct}%` }}
          aria-label={label}
        />
      </div>
      {(minLabel || maxLabel) && (
        <div className="slider-range-labels">
          <span className="slider-range-label">{minLabel || min}</span>
          <span className="slider-range-label">{maxLabel || max}</span>
        </div>
      )}
    </div>
  );
}
