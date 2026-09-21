export function Skeleton({ width = '100%', height = 20, borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, gap = 8, lastWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastWidth : '100%'}
          height={16}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style,
    }}>
      <Skeleton height={220} borderRadius={0} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton height={18} width="80%" />
        <Skeleton height={14} width="60%" />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Skeleton height={22} width={60} borderRadius="6px" />
          <Skeleton height={22} width={50} borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAnimeGrid({ count = 12 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '20px',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
