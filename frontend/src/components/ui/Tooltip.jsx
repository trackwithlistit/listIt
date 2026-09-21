import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 0.2,
  style = {},
}) {
  const [active, setActive] = useState(false);
  let timeout;

  const show = () => {
    timeout = setTimeout(() => setActive(true), delay * 1000);
  };

  const hide = () => {
    clearTimeout(timeout);
    setActive(false);
  };

  const posMap = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
  };

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {children}
      <AnimatePresence>
        {active && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              padding: '6px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              zIndex: 'var(--z-toast)',
              pointerEvents: 'none',
              ...posMap[position],
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
