import { calculateHealthScore, getScoreTier, formatDate, formatRelativeTime, calculateStreak } from '../utils';

export default function Dashboard({ republic }) {
    const { data } = republic;
    const score = calculateHealthScore(data);
    const tier = getScoreTier(score);

    const activeLaws = data.legislature.bills.filter((b) => b.status === 'enacted').length;
    const pendingCases = data.judiciary.cases.filter((c) => c.verdict === 'pending').length;
    const todayOrders = data.executive.orders.filter((o) => {
        if (o.status !== 'active') return false;
        const today = new Date().toDateString();
        const issued = new Date(o.issuedDate).toDateString();
        return issued === today || !o.deadline;
    }).length;
    const streak = calculateStreak(data.executive.orders);

    // SVG gauge
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const gaugeColor = score >= 90 ? '#c9a94e' : score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <span className="icon">📊</span>
                    State of the Republic
                </h1>
                <p className="page-subtitle">
                    {data.republic.name} — Founded {formatDate(data.republic.foundedDate)}
                </p>
            </div>

            {/* Health Score */}
            <div className="card card-gold" style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-2xl)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="health-gauge">
                    <div className="health-gauge-ring">
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            <circle className="health-gauge-bg" cx="90" cy="90" r={radius} />
                            <circle
                                className="health-gauge-fill"
                                cx="90" cy="90" r={radius}
                                stroke={gaugeColor}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="health-gauge-score" data-testid="health-score">
                            <div className="health-gauge-value" style={{ color: gaugeColor }}>
                                {score}
                            </div>
                            <div className="health-gauge-max">/100</div>
                        </div>
                    </div>
                    <div className={`health-gauge-tier ${tier.class}`}>
                        {tier.icon} {tier.name}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)', fontFamily: 'var(--font-heading)' }}>Republic Health</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        {score >= 90
                            ? 'Your republic is thriving. Keep up the exemplary governance!'
                            : score >= 70
                                ? 'Your republic is stable. Some areas could use attention.'
                                : score >= 50
                                    ? 'Your republic is under pressure. Time to recommit to your laws.'
                                    : 'State of emergency! Review your constitution and get back on track.'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">📜</div>
                    <div className="stat-card-value">{activeLaws}</div>
                    <div className="stat-card-label">Active Laws</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">⚖️</div>
                    <div className="stat-card-value">{pendingCases}</div>
                    <div className="stat-card-label">Pending Cases</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">🎖️</div>
                    <div className="stat-card-value">{todayOrders}</div>
                    <div className="stat-card-label">Orders Today</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">🔥</div>
                    <div className="stat-card-value">{streak}</div>
                    <div className="stat-card-label">Day Streak</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="section-header">
                <h3 className="section-title">📰 Recent Activity</h3>
            </div>

            {data.activity.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📰</div>
                        <div className="empty-state-title">No Activity Yet</div>
                        <div className="empty-state-desc">
                            Start governing! Add articles to your constitution, enact laws, or issue executive orders.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="activity-feed">
                        {data.activity.slice(0, 10).map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-icon">{item.icon}</div>
                                <div className="activity-content">
                                    <div className="activity-text">{item.text}</div>
                                    <div className="activity-time">
                                        {formatRelativeTime(item.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
