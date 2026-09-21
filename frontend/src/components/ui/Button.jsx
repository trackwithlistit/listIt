import { motion } from 'framer-motion';

const variants = {
  primary: {
    base:    'btn btn-primary',
    style:   { background: 'var(--gradient-brand)', color: '#fff', border: 'none' },
  },
  secondary: {
    base:    'btn btn-secondary',
    style:   { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  },
  ghost: {
    base:    'btn btn-ghost',
    style:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  },
  danger: {
    base:    'btn btn-danger',
    style:   { background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' },
  },
  accent: {
    base:    'btn btn-accent',
    style:   { background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(6,182,212,0.2)' },
  },
};

const sizes = {
  xs: { padding: '6px 12px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-sm)' },
  sm: { padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)' },
  md: { padding: '10px 20px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' },
  lg: { padding: '12px 28px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)' },
  xl: { padding: '16px 36px', fontSize: 'var(--text-lg)', borderRadius: 'var(--radius-lg)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  style: customStyle = {},
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'box-shadow 0.2s ease, background 0.2s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        ...v.style,
        ...s,
        ...customStyle,
      }}
    >
      {loading ? (
        <span
          style={{
            width: 16, height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      ) : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  );
}
