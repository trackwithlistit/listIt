import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const overlayVariants = {
  initial: { scaleX: 0, transformOrigin: 'left' },
  animate: { scaleX: 1, transformOrigin: 'left', transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { scaleX: 0, transformOrigin: 'right', transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function PageTransition({ children }) {
  const location = useLocation();
  const overlayRef = useRef(null);

  return (
    <>
      {/* Progress bar overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
          background: 'var(--gradient-brand)',
          transformOrigin: 'left',
          zIndex: 'var(--z-toast)',
          pointerEvents: 'none',
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
