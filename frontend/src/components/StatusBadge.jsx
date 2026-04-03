// ============================================================
// FILE: src/components/StatusBadge.jsx
// Colored status badge for property cards
// ============================================================

/**
 * Status badge with color coding:
 * - green = available
 * - red = occupied
 * - yellow = new (posted < 24 hours ago)
 */
export default function StatusBadge({ status, createdAt }) {
  // Check if the property was posted within the last 24 hours
  const isNew = createdAt && (Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000);

  let colorClasses, label, dotColor;

  if (isNew && status === 'available') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    label = '🆕 New';
  } else if (status === 'available') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    label = 'Available';
  } else {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
    label = 'Occupied';
  }

  return (
    <span
      className={`chip border ${colorClasses} gap-1.5`}
      id={`status-badge-${status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isNew ? 'animate-pulse-soft' : ''}`} />
      {label}
    </span>
  );
}
