import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  glow = false,
  glowColor = 'purple',
  hover = true,
  style = {},
  onClick,
}) {
  const glowMap = {
    purple: 'var(--shadow-glow-purple)',
    cyan:   'var(--shadow-glow-cyan)',
    warm:   '0 0 32px var(--warm-glow)',
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: glow
          ? `var(--shadow-card), ${glowMap[glowColor] || glowMap.purple}`
          : 'var(--shadow-card)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
