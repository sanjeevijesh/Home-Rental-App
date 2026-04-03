// ============================================================
// FILE: src/components/BudgetSlider.jsx
// Dual-handle budget range slider (min/max rent)
// ============================================================

import { useState, useCallback, useEffect } from 'react';

// Budget presets common in Tuticorin rental market
const MIN_RENT = 1000;
const MAX_RENT = 50000;
const STEP = 500;

/**
 * Budget range slider with min/max handles.
 * @param {object} props
 * @param {number} props.minValue - Current minimum rent
 * @param {number} props.maxValue - Current maximum rent
 * @param {function} props.onChange - Callback with { min, max }
 */
export default function BudgetSlider({
  minValue = MIN_RENT,
  maxValue = MAX_RENT,
  onChange,
  label = 'Budget Range',
  id = 'budget-slider',
}) {
  const [min, setMin] = useState(minValue);
  const [max, setMax] = useState(maxValue);

  // Sync with parent
  useEffect(() => {
    setMin(minValue);
    setMax(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = useCallback((e) => {
    const newMin = Math.min(Number(e.target.value), max - STEP);
    setMin(newMin);
    onChange?.({ min: newMin, max });
  }, [max, onChange]);

  const handleMaxChange = useCallback((e) => {
    const newMax = Math.max(Number(e.target.value), min + STEP);
    setMax(newMax);
    onChange?.({ min, max: newMax });
  }, [min, onChange]);

  // Calculate the slider fill position (percentage)
  const minPercent = ((min - MIN_RENT) / (MAX_RENT - MIN_RENT)) * 100;
  const maxPercent = ((max - MIN_RENT) / (MAX_RENT - MIN_RENT)) * 100;

  // Format currency in Indian style (₹)
  const formatRent = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div id={id} className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-surface-700 mb-1">
          {label}
        </label>
      )}

      {/* Current values display */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
          {formatRent(min)}
        </span>
        <span className="text-xs text-surface-700/50 font-medium">to</span>
        <span className="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
          {formatRent(max)}
        </span>
      </div>

      {/* Dual range slider */}
      <div className="relative h-2 mb-2">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-surface-200 rounded-full" />
        
        {/* Active track fill */}
        <div
          className="absolute h-2 gradient-brand rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={MIN_RENT}
          max={MAX_RENT}
          step={STEP}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                   [&::-moz-range-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:appearance-none
                   [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-brand-500 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: min > MAX_RENT - 100 ? 5 : 3 }}
        />

        {/* Max slider */}
        <input
          type="range"
          min={MIN_RENT}
          max={MAX_RENT}
          step={STEP}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                   [&::-moz-range-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:appearance-none
                   [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
                   [&::-moz-range-thumb]:border-brand-500 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-surface-700/50">
        <span>{formatRent(MIN_RENT)}</span>
        <span>{formatRent(MAX_RENT)}</span>
      </div>
    </div>
  );
}
