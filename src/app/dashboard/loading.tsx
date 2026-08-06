export default function DashboardLoading() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 140, height: 40, borderRadius: 10 }} />
      </div>

      {/* Stats grid skeleton */}
      <div className="dashboard-stats-grid" style={{ marginBottom: 40 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 220, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  )
}
