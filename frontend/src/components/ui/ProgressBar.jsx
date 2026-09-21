export default function ProgressBar({
  value = 0,
  max = 100,
  height = 8,
  color = 'var(--primary)',
  glow = false,
  showLabel = false,
  className = '',
  style = {},
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }} className={className}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
          <span>Progress</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {value}/{max} ({pct.toFixed(0)}%)
          </span>
        </div>
      )}
      <div style={{
        height,
        background: 'var(--bg-elevated)',
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--border)',
      }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: height / 2,
            boxShadow: glow ? `0 0 12px ${color}` : 'none',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}
