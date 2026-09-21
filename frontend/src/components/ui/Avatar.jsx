export default function Avatar({
  src,
  alt,
  name = '',
  size = 40,
  online = false,
  ring = false,
  ringColor = 'var(--primary)',
  style = {},
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        ...style,
      }}
    >
      {ring && (
        <div style={{
          position: 'absolute', inset: -3,
          borderRadius: '50%',
          background: 'var(--gradient-brand)',
          zIndex: 0,
        }} />
      )}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          background: src ? 'transparent' : 'var(--primary-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          border: ring ? `3px solid var(--bg-deep)` : 'none',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.38,
            fontWeight: 700,
            color: 'var(--primary-light)',
          }}>
            {initials || '?'}
          </span>
        )}
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.25, height: size * 0.25,
          background: '#10B981',
          borderRadius: '50%',
          border: '2px solid var(--bg-deep)',
          zIndex: 2,
        }} />
      )}
    </div>
  );
}
