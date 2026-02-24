import { useState } from 'react';
import { formatDate, DEPARTMENTS, getDepartment, getPriorityLabel, calculateStreak } from '../utils';
import Modal from '../components/Modal';

export default function Executive({ republic, showToast }) {
    const { data, issueOrder, completeOrder, cancelOrder } = republic;
    const { orders } = data.executive;

    const [activeTab, setActiveTab] = useState('active');
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('health');
    const [priority, setPriority] = useState('standard');
    const [deadline, setDeadline] = useState('');

    const today = new Date().toDateString();

    const activeOrders = orders.filter((o) => o.status === 'active');
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const todayOrders = activeOrders.filter((o) => {
        const issued = new Date(o.issuedDate).toDateString();
        return issued === today || !o.deadline;
    });
    const streak = calculateStreak(orders);

    // Completion rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentCompleted = orders.filter((o) => o.status === 'completed' && o.issuedDate >= thirtyDaysAgo).length;
    const recentTotal = orders.filter((o) => o.issuedDate >= thirtyDaysAgo && (o.status === 'completed' || o.status === 'expired')).length;
    const completionRate = recentTotal > 0 ? Math.round((recentCompleted / recentTotal) * 100) : 100;

    const handleNewOrder = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        issueOrder(title.trim(), department, priority, deadline || null);
        setTitle('');
        setDepartment('health');
        setPriority('standard');
        setDeadline('');
        setShowNewOrder(false);
        showToast('🎖️', 'Executive order issued');
    };

    const handleComplete = (order) => {
        completeOrder(order.id);
        showToast('✅', `Order completed: ${order.title}`);
    };

    const handleCancel = (order) => {
        cancelOrder(order.id);
        showToast('🗑️', `Order cancelled`);
    };

    const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <span className="icon">🎖️</span>
                    Executive
                </h1>
                <p className="page-subtitle">
                    Issue and enforce executive orders — your daily commitments
                </p>
            </div>

            {/* Stats Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon">📋</div>
                    <div className="stat-card-value">{todayOrders.length}</div>
                    <div className="stat-card-label">Orders Today</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">🔥</div>
                    <div className="stat-card-value">{streak}</div>
                    <div className="stat-card-label">Day Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">📊</div>
                    <div className="stat-card-value">{completionRate}%</div>
                    <div className="stat-card-label">Completion Rate</div>
                </div>
            </div>

            {/* Tabs + New button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    <button
                        className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Orders
                        <span className="tab-count">{activeOrders.length}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                        <span className="tab-count">{completedOrders.length}</span>
                    </button>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowNewOrder(true)}
                >
                    + New Order
                </button>
            </div>

            <hr className="divider" style={{ marginTop: 0 }} />

            {/* Orders list */}
            {displayOrders.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            {activeTab === 'active' ? '🎖️' : '✅'}
                        </div>
                        <div className="empty-state-title">
                            {activeTab === 'active' ? 'No Active Orders' : 'No Completed Orders'}
                        </div>
                        <div className="empty-state-desc">
                            {activeTab === 'active'
                                ? 'Issue executive orders to set your daily commitments.'
                                : 'Completed orders will appear here.'}
                        </div>
                        {activeTab === 'active' && (
                            <button className="btn btn-primary" onClick={() => setShowNewOrder(true)}>
                                + New Order
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="cards-grid" style={{ gap: 'var(--space-sm)' }}>
                    {displayOrders.map((order) => {
                        const dept = getDepartment(order.department);
                        const isCompleted = order.status === 'completed';
                        return (
                            <div
                                key={order.id}
                                className={`order-item ${isCompleted ? 'completed' : ''}`}
                            >
                                <button
                                    className={`order-checkbox ${isCompleted ? 'checked' : ''}`}
                                    onClick={() => !isCompleted && handleComplete(order)}
                                    disabled={isCompleted}
                                >
                                    {isCompleted ? '✓' : ''}
                                </button>

                                <div className="order-info">
                                    <div className={`order-title ${isCompleted ? 'completed-text' : ''}`}>
                                        {order.title}
                                    </div>
                                    <div className="order-meta">
                                        <span className={`priority-dot ${order.priority}`} />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {getPriorityLabel(order.priority)}
                                        </span>
                                        <span className={`badge ${dept.badgeClass}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                            {dept.icon} {dept.label}
                                        </span>
                                        {order.deadline && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Due {formatDate(order.deadline)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-sm items-center">
                                    <span className="card-number" style={{ fontSize: '0.7rem' }}>{order.number}</span>
                                    {!isCompleted && (
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleCancel(order)}
                                            title="Cancel order"
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Order Modal */}
            <Modal
                title="Issue Executive Order"
                isOpen={showNewOrder}
                onClose={() => setShowNewOrder(false)}
            >
                <form onSubmit={handleNewOrder}>
                    <div className="form-group">
                        <label className="form-label">Order Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "Morning run — 5K"'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                className="form-select"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                {DEPARTMENTS.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.icon} {d.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="standard">Standard</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deadline (Optional)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowNewOrder(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                            Issue Order
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
