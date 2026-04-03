// FILE: src/components/StatusBadge.jsx
export default function StatusBadge({ status, createdAt }) {
  const isNew = createdAt && (Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000);

  let bg, color, dot, label;

  if (isNew && status === 'available') {
    bg = 'rgba(217,119,6,0.12)'; color = '#b45309'; dot = '#d97706'; label = 'New';
  } else if (status === 'available') {
    bg = 'rgba(22,163,74,0.1)'; color = '#15803d'; dot = '#16a34a'; label = 'Available';
  } else {
    bg = 'rgba(220,38,38,0.1)'; color = '#b91c1c'; dot = '#dc2626'; label = 'Occupied';
  }

  return (
    <span
      id={`status-badge-${status}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: bg,
        color,
        padding: '3px 9px',
        borderRadius: 99,
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: dot,
          flexShrink: 0,
          animation: isNew && status === 'available' ? 'pulse 1.5s ease infinite' : 'none',
        }}
      />
      {label}
    </span>
  );
}