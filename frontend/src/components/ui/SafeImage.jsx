import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdultStore } from '../../store';

// Client-side session cache to prevent duplicate safety checks on navigation
const safetyCache = new Map();

export default function SafeImage({
  src,
  alt,
  isAdult = false,
  isBanner = false,
  style = {},
  className = '',
  onError,
  hovered = false,
  ...props
}) {
  const { unblurAdult } = useAdultStore();
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(isAdult);
  const [safety, setSafety] = useState('safe');
  const [nuditySpots, setNuditySpots] = useState([]);

  useEffect(() => {
    if (!isAdult || !src) {
      setLoading(false);
      return;
    }

    if (safetyCache.has(src)) {
      const cached = safetyCache.get(src);
      setSafety(cached.safety);
      setNuditySpots(cached.nuditySpots || []);
      setLoading(false);
      return;
    }

    // Run Safety classification
    setLoading(true);
    axios.post('/api/search/check-image-safety', { imageUrl: src })
      .then((res) => {
        const data = res.data || { safety: 'safe', nuditySpots: [] };
        setSafety(data.safety);
        setNuditySpots(data.nuditySpots || []);
        safetyCache.set(src, data);
      })
      .catch((err) => {
        console.warn('[Safety API Error] Defaulting to safe:', err);
        setSafety('safe');
        setNuditySpots([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [src, isAdult]);

  if (imgError || !src) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 12,
        ...style
      }}>
        No Image
      </div>
    );
  }

  // Active blur filter level during initial loading
  const blurFilter = isAdult && loading ? 'blur(28px)' : 'none';

  // Render dynamic white spot blur circles ONLY at AI-detected nudity/blur spots for each unique card
  let activeSpots = [];
  if (!isBanner && (isAdult || safety === 'nudity' || safety === 'explicit')) {
    if (nuditySpots && nuditySpots.length > 0) {
      activeSpots = nuditySpots.map((spot) => {
        // Calculate center coordinate
        const cx = spot.x + spot.width / 2;
        const cy = spot.y + spot.height / 2;
        // Compute adaptive width & height radii (1.45x multiplier)
        // This creates an anatomical elliptical blur that covers wide cleavage/groin without overflowing top/bottom
        const rx = Math.min(Math.max((spot.width / 2) * 1.45, 10), 38);
        const ry = Math.min(Math.max((spot.height / 2) * 1.45, 10), 38);
        return { cx, cy, rx, ry };
      });
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          setImgError(true);
          onError?.(e);
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: blurFilter,
          transition: 'filter 0.3s ease, transform 0.4s ease',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          ...style
        }}
        {...props}
      />

      {/* Layer 1: Dynamic Anatomical White Spot Blur (Soft radial gradient with precise coverage) */}
      {!loading && activeSpots.length > 0 && activeSpots.map((spot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${spot.cx - spot.rx}%`,
            top: `${spot.cy - spot.ry}%`,
            width: `${spot.rx * 2}%`,
            height: `${spot.ry * 2}%`,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 50%, rgba(255,255,255,0.4) 80%, rgba(255,255,255,0) 100%)',
            filter: 'blur(8px)',
            boxShadow: '0 0 16px rgba(255, 255, 255, 0.85)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      ))}

      {/* Layer 2: Full Cover Blur Overlay when Adult Unblur Toggle is OFF (Default State) */}
      {isAdult && !unblurAdult && !loading && !isBanner && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 5, 8, 0.55)',
          backdropFilter: 'blur(28px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 6,
          padding: 8,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 20, marginBottom: 4 }}>🔞</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Adult Cover Blurred
          </span>
        </div>
      )}
    </div>
  );
}
