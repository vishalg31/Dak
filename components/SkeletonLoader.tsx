'use client'

interface Props {
  template: 'launch' | 'progress'
}

export function SkeletonLoader({ template }: Props) {
  return (
    <div
      style={{
        width: 800,
        minWidth: 800,
        background: '#fff',
        padding: 36,
        boxSizing: 'border-box',
      }}
    >
      {/* Hero header */}
      <div
        className="skeleton-box-dark"
        style={{ height: 100, borderRadius: 8, marginBottom: 24 }}
      />

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: '#f0f4f8',
          borderRadius: 8,
          padding: 18,
        }}
      >
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="skeleton-box"
            style={{ flex: 1, height: 48, borderRadius: 6 }}
          />
        ))}
      </div>

      {/* Paragraph lines */}
      {[100, 85, 95].map((w, i) => (
        <div
          key={i}
          className="skeleton-box"
          style={{ width: `${w}%`, height: 10, marginBottom: 8, borderRadius: 4 }}
        />
      ))}

      <div style={{ height: 24 }} />

      {template === 'launch' ? (
        <>
          {/* Table rows */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div className="skeleton-box" style={{ flex: 1, height: 32, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ flex: 1, height: 32, borderRadius: 4 }} />
            </div>
          ))}
          <div style={{ height: 16 }} />
          {/* Dark banner */}
          <div
            className="skeleton-box-dark"
            style={{ height: 80, borderRadius: 8, marginBottom: 24 }}
          />
          {/* Bullet lines */}
          {[80, 90, 70].map((w, i) => (
            <div
              key={i}
              className="skeleton-box"
              style={{ width: `${w}%`, height: 10, marginBottom: 8, borderRadius: 4 }}
            />
          ))}
        </>
      ) : (
        <>
          {/* Dark banner */}
          <div
            className="skeleton-box-dark"
            style={{ height: 80, borderRadius: 8, marginBottom: 24 }}
          />
          {/* Table rows */}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div className="skeleton-box" style={{ flex: 1, height: 32, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ flex: 2, height: 32, borderRadius: 4 }} />
            </div>
          ))}
          {/* Changelog items */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div className="skeleton-box" style={{ width: 8, height: 28, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ flex: 1, height: 28, borderRadius: 4 }} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
