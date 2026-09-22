import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Question } from '@phosphor-icons/react';

export default function LandingFAQ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about tracking anime and web series on ListIt.",
  faqs = []
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section style={{
      padding: '80px 0',
      background: 'var(--bg-elevated)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary)',
            color: 'var(--primary-light)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            <Question size={16} weight="bold" />
            <span>Got Questions?</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            {subtitle}
          </p>
        </div>

        {/* FAQs Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isOpen ? '0 8px 24px var(--primary-glow)' : 'none',
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ flexShrink: 0, color: isOpen ? 'var(--primary-light)' : 'var(--text-muted)' }}
                  >
                    <CaretDown size={20} weight="bold" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div style={{
                        padding: '0 24px 24px 24px',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        borderTop: '1px solid var(--border)',
                        paddingTop: '16px',
                      }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
