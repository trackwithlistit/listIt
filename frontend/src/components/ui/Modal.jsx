import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } },
  exit:    { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.18, ease: 'easeIn' } },
};

const sizeMap = {
  sm:   { maxWidth: '400px' },
  md:   { maxWidth: '560px' },
  lg:   { maxWidth: '780px' },
  xl:   { maxWidth: '1000px' },
  full: { maxWidth: '100vw', margin: 0, borderRadius: 0 },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
  noPadding = false,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            zIndex: 'var(--z-modal)',
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl), var(--shadow-glow-purple)',
              overflow: 'hidden',
              ...sizeMap[size],
            }}
          >
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
                  fontWeight: 700, color: 'var(--text-primary)',
                }}>
                  {title}
                </h3>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-hover)', color: 'var(--text-muted)',
                      cursor: 'pointer', border: 'none',
                      transition: 'color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div style={{ padding: noPadding ? 0 : '24px', overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
