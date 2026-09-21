import { BookmarkSimple } from '@phosphor-icons/react';
import Button from './Button';

export default function EmptyState({
  title = 'No entries found',
  description = 'Try adjusting your filters or start browsing to add new titles.',
  actionLabel,
  onAction,
  icon,
  style = {},
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 32px', textAlign: 'center',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      ...style,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, color: 'var(--text-muted)',
      }}>
        {icon || <BookmarkSimple size={28} />}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 'var(--text-lg)', color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{
        color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
        maxWidth: 360, lineHeight: 1.6, marginBottom: actionLabel ? 24 : 0,
      }}>
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
