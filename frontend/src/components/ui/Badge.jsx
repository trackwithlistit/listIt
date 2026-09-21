const statusConfig = {
  watching:    { label: 'Watching',      color: '#22D3EE', bg: 'rgba(6,182,212,0.12)' },
  completed:   { label: 'Completed',     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  on_hold:     { label: 'On Hold',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  dropped:     { label: 'Dropped',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  plan_to_watch: { label: 'Plan to Watch', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  rewatching:  { label: 'Rewatching',    color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  airing:      { label: 'Airing',        color: '#22D3EE', bg: 'rgba(6,182,212,0.12)' },
  finished:    { label: 'Finished',      color: '#64748B', bg: 'rgba(100,116,139,0.12)' },
  upcoming:    { label: 'Upcoming',      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  cancelled:   { label: 'Cancelled',     color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  new:         { label: 'New',           color: '#F43F5E', bg: 'rgba(244,63,94,0.12)' },
  admin:       { label: 'Admin',         color: '#F43F5E', bg: 'rgba(244,63,94,0.12)' },
  user:        { label: 'User',          color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
};

export default function Badge({
  children,
  status,
  variant = 'default',
  size = 'sm',
  dot = false,
  style: customStyle = {},
}) {
  const config = statusConfig[status];
  const color = config?.color || 'var(--text-muted)';
  const bg    = config?.bg    || 'var(--bg-elevated)';
  const label = children || config?.label || status;

  const sizeMap = {
    xs: { fontSize: '10px', padding: '2px 7px', borderRadius: '4px' },
    sm: { fontSize: '11px', padding: '3px 9px',  borderRadius: '6px' },
    md: { fontSize: '12px', padding: '4px 12px', borderRadius: '8px' },
  };
  const s = sizeMap[size] || sizeMap.sm;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        color,
        background: bg,
        border: `1px solid ${color}30`,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...s,
        ...customStyle,
      }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}
