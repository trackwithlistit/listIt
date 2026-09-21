import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  icon,
  iconRight,
  disabled = false,
  required = false,
  className = '',
  style = {},
  id,
  name,
  autoComplete,
  onFocus,
  onBlur,
}, ref) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'var(--danger)'
    : focused
    ? 'var(--primary)'
    : 'var(--border)';

  const boxShadow = error
    ? '0 0 0 3px var(--danger-subtle)'
    : focused
    ? '0 0 0 3px var(--primary-subtle)'
    : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: focused ? 'var(--primary-light)' : 'var(--text-secondary)',
            transition: 'color 0.2s ease',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--warm)', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '12px',
            color: focused ? 'var(--primary-light)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.2s ease',
            pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); onBlur?.(e); }}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 40px' : '10px 16px',
            paddingRight: iconRight ? '40px' : '16px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow,
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.6 : 1,
          }}
        />

        {iconRight && (
          <span style={{
            position: 'absolute', right: '12px',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
          }}>
            {iconRight}
          </span>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: '2px' }}
          >
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Input;
