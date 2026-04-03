// ============================================================
// FILE: src/components/AreaSelector.jsx
// Area selection component — dropdown or multi-select chips
// ============================================================

import { AREAS } from '../context/AuthContext';

/**
 * Area selector component.
 * @param {object} props
 * @param {string|string[]} props.value - Selected area(s)
 * @param {function} props.onChange - Callback with selected value
 * @param {boolean} props.multiple - Allow multiple selection (chips mode)
 * @param {string} props.label - Label text
 * @param {string} props.placeholder - Placeholder for dropdown mode
 */
export default function AreaSelector({
  value,
  onChange,
  multiple = false,
  label = 'Select Area',
  placeholder = 'All Areas',
  id = 'area-selector',
}) {
  // ── Multi-select chip mode ─────────────────────────────
  if (multiple) {
    const selectedAreas = Array.isArray(value) ? value : [];

    const toggleArea = (area) => {
      if (selectedAreas.includes(area)) {
        onChange(selectedAreas.filter((a) => a !== area));
      } else {
        onChange([...selectedAreas, area]);
      }
    };

    return (
      <div id={id}>
        {label && (
          <label className="block text-sm font-semibold text-surface-700 mb-2">
            {label}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`chip transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                  }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {area}
              </button>
            );
          })}
        </div>
        {selectedAreas.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-2 text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    );
  }

  // ── Single select dropdown mode ────────────────────────
  return (
    <div id={id}>
      {label && (
        <label className="block text-sm font-semibold text-surface-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="select-field"
      >
        <option value="">{placeholder}</option>
        {AREAS.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </div>
  );
}
