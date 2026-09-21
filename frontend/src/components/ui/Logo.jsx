import { Link } from 'react-router-dom';
import { BookmarkSimple } from '@phosphor-icons/react';

export default function Logo({ size = 'md', onClick, to = '/' }) {
  const dimensions = {
    sm: { iconBox: 30, iconSize: 17, fontSize: '1.1rem', borderRadius: 8 },
    md: { iconBox: 38, iconSize: 22, fontSize: '1.35rem', borderRadius: 10 },
    lg: { iconBox: 54, iconSize: 30, fontSize: '1.9rem', borderRadius: 14 },
  }[size] || { iconBox: 38, iconSize: 22, fontSize: '1.35rem', borderRadius: 10 };

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'pointer' }}>
      {/* Icon Container with multi-tone gradient & glow */}
      <div style={{
        width: dimensions.iconBox,
        height: dimensions.iconBox,
        borderRadius: dimensions.borderRadius,
        background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #06B6D4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        transition: 'transform 0.25s ease, boxShadow 0.25s ease',
      }}>
        <BookmarkSimple size={dimensions.iconSize} weight="fill" color="#fff" />
      </div>

      {/* Brand text: listIt */}
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: dimensions.fontSize,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
        }}>
          list
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: dimensions.fontSize,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 10px rgba(124, 58, 237, 0.6))',
          marginLeft: '1px',
        }}>
          It
        </span>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
}
