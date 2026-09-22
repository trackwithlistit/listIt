import { Check, X, Sparkle } from '@phosphor-icons/react';

export default function ComparisonTable({
  title = "Why Choose ListIt Over Traditional Notes or Spreadsheets?",
  subtitle = "Stop struggling with messy text documents or complex spreadsheets. ListIt gives you a purpose-built tracking platform with rich media data.",
}) {
  const comparisons = [
    {
      feature: 'Real-Time Episode Tracking (+1 Click)',
      listit: true,
      spreadsheet: false,
      notes: false,
    },
    {
      feature: 'Automatic Cover Art & Synopses',
      listit: true,
      spreadsheet: false,
      notes: false,
    },
    {
      feature: 'Seasonal Airing Schedule & Air Countdowns',
      listit: true,
      spreadsheet: false,
      notes: false,
    },
    {
      feature: 'Anime & Web Series in One Unified App',
      listit: true,
      spreadsheet: 'Manual Setup',
      notes: 'Manual Setup',
    },
    {
      feature: 'Instant Cloud Sync & Mobile Responsive',
      listit: true,
      spreadsheet: 'Partial',
      notes: 'Partial',
    },
    {
      feature: 'Watch Statistics & Genre Analytics',
      listit: true,
      spreadsheet: 'Requires Formulas',
      notes: false,
    },
    {
      feature: 'Fast, Dark Mode Modern Interface',
      listit: true,
      spreadsheet: false,
      notes: false,
    },
  ];

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-deep)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
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

        {/* Table Container */}
        <div style={{
          overflowX: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
              }}>
                <th style={{ padding: '20px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Feature
                </th>
                <th style={{
                  padding: '20px 24px',
                  fontSize: 'var(--text-base)',
                  color: 'var(--primary-light)',
                  fontWeight: 800,
                  background: 'var(--primary-subtle)',
                  borderLeft: '1px solid var(--primary)',
                  borderRight: '1px solid var(--primary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkle size={16} weight="fill" />
                    <span>ListIt</span>
                  </div>
                </th>
                <th style={{ padding: '20px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Spreadsheets (Excel/Sheets)
                </th>
                <th style={{ padding: '20px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Notes App
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx === comparisons.length - 1 ? 'none' : '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '18px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {row.feature}
                  </td>
                  <td style={{
                    padding: '18px 24px',
                    background: 'var(--primary-subtle)',
                    borderLeft: '1px solid var(--primary)',
                    borderRight: '1px solid var(--primary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      <Check size={18} weight="bold" />
                      <span>Included</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {typeof row.spreadsheet === 'boolean' ? (
                      row.spreadsheet ? (
                        <Check size={18} color="#10B981" weight="bold" />
                      ) : (
                        <X size={18} color="#EF4444" weight="bold" />
                      )
                    ) : (
                      <span>{row.spreadsheet}</span>
                    )}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {typeof row.notes === 'boolean' ? (
                      row.notes ? (
                        <Check size={18} color="#10B981" weight="bold" />
                      ) : (
                        <X size={18} color="#EF4444" weight="bold" />
                      )
                    ) : (
                      <span>{row.notes}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
