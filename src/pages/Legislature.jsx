import { useState } from 'react';
import { formatDate, DEPARTMENTS, getDepartment, getBillStatusLabel, getNextBillAction } from '../utils';
import Modal from '../components/Modal';

export default function Legislature({ republic, showToast }) {
    const { data, proposeBill, advanceBill, repealBill, addDebatePoint, removeDebatePoint, concludeDebate, amendBillText } = republic;
    const { bills } = data.legislature;

    const [activeTab, setActiveTab] = useState('enacted');
    const [showPropose, setShowPropose] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('health');
    const [repealingId, setRepealingId] = useState(null);
    const [repealReason, setRepealReason] = useState('');

    // Debate state
    const [proInput, setProInput] = useState('');
    const [conInput, setConInput] = useState('');
    const [conclusionInput, setConclusionInput] = useState('');

    // Amendment state
    const [amendingBillId, setAmendingBillId] = useState(null);
    const [amendTitle, setAmendTitle] = useState('');
    const [amendDesc, setAmendDesc] = useState('');

    const enacted = bills.filter((b) => b.status === 'enacted');
    const inProgress = bills.filter((b) => b.status === 'draft' || b.status === 'proposed');
    const inSession = bills.filter((b) => b.status === 'deliberation');
    const repealed = bills.filter((b) => b.status === 'repealed' || b.status === 'rejected');

    const handlePropose = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        proposeBill(title.trim(), description.trim(), department);
        setTitle('');
        setDescription('');
        setDepartment('health');
        setShowPropose(false);
        showToast('📜', 'Bill drafted successfully');
    };

    const handleAdvance = (bill) => {
        advanceBill(bill.id);
        if (bill.status === 'draft') {
            showToast('📜', 'Bill proposed!');
        } else if (bill.status === 'proposed') {
            showToast('🏛️', 'Parliament session opened!');
            setActiveTab('session');
        }
    };

    const handleRepeal = (e) => {
        e.preventDefault();
        repealBill(repealingId, repealReason.trim());
        setRepealingId(null);
        setRepealReason('');
        showToast('📜', 'Law repealed');
    };

    const handleAddPro = (billId) => {
        if (!proInput.trim()) return;
        addDebatePoint(billId, 'pro', proInput.trim());
        setProInput('');
    };

    const handleAddCon = (billId) => {
        if (!conInput.trim()) return;
        addDebatePoint(billId, 'con', conInput.trim());
        setConInput('');
    };

    const handleConclude = (billId, decision) => {
        concludeDebate(billId, decision, conclusionInput.trim());
        setConclusionInput('');
        setAmendingBillId(null);
        setActiveTab(decision === 'enact' ? 'enacted' : 'repealed');
        showToast(
            decision === 'enact' ? '✅' : '❌',
            decision === 'enact' ? 'Bill enacted into law!' : 'Bill rejected by parliament'
        );
    };

    const startAmending = (bill) => {
        setAmendingBillId(bill.id);
        setAmendTitle(bill.title);
        setAmendDesc(bill.description || '');
    };

    const saveAmendment = (billId) => {
        if (!amendTitle.trim()) return;
        amendBillText(billId, amendTitle.trim(), amendDesc.trim());
        setAmendingBillId(null);
        showToast('✏️', 'Bill amended');
    };

    const tabData = {
        enacted: { items: enacted, label: 'Active Laws' },
        progress: { items: inProgress, label: 'Bills in Progress' },
        session: { items: inSession, label: 'In Session' },
        repealed: { items: repealed, label: 'Repealed / Rejected' },
    };

    const currentItems = tabData[activeTab].items;

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <span className="icon">📜</span>
                    Legislature
                </h1>
                <p className="page-subtitle">
                    Propose, deliberate, and enact the laws of your republic
                </p>
            </div>

            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    {Object.entries(tabData).map(([key, { items, label }]) => (
                        <button
                            key={key}
                            className={`tab ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                            <span className="tab-count">{items.length}</span>
                        </button>
                    ))}
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowPropose(true)}
                >
                    + Propose Bill
                </button>
            </div>

            <hr className="divider" style={{ marginTop: 0 }} />

            {/* Session View */}
            {activeTab === 'session' && inSession.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {inSession.map((bill) => {
                        const dept = getDepartment(bill.department);
                        const debate = bill.debate || { pros: [], cons: [] };
                        const totalPoints = debate.pros.length + debate.cons.length;
                        const proPercent = totalPoints > 0 ? (debate.pros.length / totalPoints) * 100 : 50;
                        const conPercent = totalPoints > 0 ? (debate.cons.length / totalPoints) * 100 : 50;

                        return (
                            <div key={bill.id} className="session-panel">
                                {/* Banner */}
                                <div className="session-banner">
                                    <div>
                                        <div className="session-banner-title">
                                            🏛️ Parliament Session
                                        </div>
                                        <div className="session-banner-sub">
                                            Deliberate on this bill — add pros and cons, then cast your vote
                                        </div>
                                    </div>
                                    <span className="badge badge-deliberation">IN SESSION</span>
                                </div>

                                {/* Bill info — inline editable */}
                                <div className="session-bill-info">
                                    {amendingBillId === bill.id ? (
                                        /* Edit mode */
                                        <div>
                                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                                <label className="form-label">Bill Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={amendTitle}
                                                    onChange={(e) => setAmendTitle(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    value={amendDesc}
                                                    onChange={(e) => setAmendDesc(e.target.value)}
                                                    style={{ minHeight: '70px' }}
                                                />
                                            </div>
                                            <div className="btn-group">
                                                <button className="btn btn-ghost btn-sm" onClick={() => setAmendingBillId(null)}>
                                                    Cancel
                                                </button>
                                                <button className="btn btn-primary btn-sm" onClick={() => saveAmendment(bill.id)} disabled={!amendTitle.trim()}>
                                                    ✓ Save Amendment
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Display mode */
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div className="session-bill-number">{bill.number}</div>
                                                    <div className="session-bill-title">{bill.title}</div>
                                                    {bill.description && (
                                                        <div className="session-bill-desc">{bill.description}</div>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => startAmending(bill)}
                                                    style={{ flexShrink: 0, marginLeft: 'var(--space-md)' }}
                                                >
                                                    ✏️ Amend
                                                </button>
                                            </div>
                                            <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)' }}>
                                                <span className={`badge ${dept.badgeClass}`}>{dept.icon} {dept.label}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Debate columns */}
                                <div className="debate-columns">
                                    {/* Pros */}
                                    <div className="debate-column debate-column-pro">
                                        <div className="debate-column-header">
                                            <div className="debate-column-title pro">
                                                👍 Arguments For
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--not-guilty)' }}>
                                                {debate.pros.length}
                                            </span>
                                        </div>
                                        <div className="debate-points">
                                            {debate.pros.map((p) => (
                                                <div key={p.id} className="debate-point debate-point-pro">
                                                    <span className="debate-point-icon">✓</span>
                                                    <span>{p.text}</span>
                                                    <button
                                                        className="debate-point-remove"
                                                        onClick={() => removeDebatePoint(bill.id, 'pro', p.id)}
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="debate-add-form">
                                            <input
                                                type="text"
                                                placeholder="Add an argument for..."
                                                value={proInput}
                                                onChange={(e) => setProInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddPro(bill.id)}
                                            />
                                            <button
                                                className="debate-add-btn pro"
                                                onClick={() => handleAddPro(bill.id)}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cons */}
                                    <div className="debate-column">
                                        <div className="debate-column-header">
                                            <div className="debate-column-title con">
                                                👎 Arguments Against
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--guilty)' }}>
                                                {debate.cons.length}
                                            </span>
                                        </div>
                                        <div className="debate-points">
                                            {debate.cons.map((p) => (
                                                <div key={p.id} className="debate-point debate-point-con">
                                                    <span className="debate-point-icon">✗</span>
                                                    <span>{p.text}</span>
                                                    <button
                                                        className="debate-point-remove"
                                                        onClick={() => removeDebatePoint(bill.id, 'con', p.id)}
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="debate-add-form">
                                            <input
                                                type="text"
                                                placeholder="Add an argument against..."
                                                value={conInput}
                                                onChange={(e) => setConInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCon(bill.id)}
                                            />
                                            <button
                                                className="debate-add-btn con"
                                                onClick={() => handleAddCon(bill.id)}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Score bar */}
                                {totalPoints > 0 && (
                                    <div className="debate-score">
                                        <span style={{ color: 'var(--not-guilty)' }}>{debate.pros.length} for</span>
                                        <div className="debate-score-bar">
                                            <div className="debate-score-pro" style={{ width: `${proPercent}%` }} />
                                            <div className="debate-score-con" style={{ width: `${conPercent}%` }} />
                                        </div>
                                        <span style={{ color: 'var(--guilty)' }}>{debate.cons.length} against</span>
                                    </div>
                                )}

                                {/* Conclusion */}
                                <div className="session-conclusion">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Final Conclusion (optional)</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Summarize your deliberation and reasoning..."
                                            value={conclusionInput}
                                            onChange={(e) => setConclusionInput(e.target.value)}
                                            style={{ minHeight: '80px' }}
                                        />
                                    </div>
                                </div>

                                {/* Vote buttons */}
                                <div className="session-actions">
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleConclude(bill.id, 'reject')}
                                    >
                                        ❌ Reject Bill
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleConclude(bill.id, 'enact')}
                                        style={{ fontWeight: 600 }}
                                    >
                                        ✅ Enact into Law
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : currentItems.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            {activeTab === 'enacted' ? '⚖️' : activeTab === 'progress' ? '📝' : activeTab === 'session' ? '🏛️' : '🗄️'}
                        </div>
                        <div className="empty-state-title">
                            {activeTab === 'enacted'
                                ? 'No Active Laws'
                                : activeTab === 'progress'
                                    ? 'No Bills in Progress'
                                    : activeTab === 'session'
                                        ? 'No Active Sessions'
                                        : 'No Repealed or Rejected Laws'}
                        </div>
                        <div className="empty-state-desc">
                            {activeTab === 'enacted'
                                ? 'Propose and deliberate on bills to establish the laws of your republic.'
                                : activeTab === 'progress'
                                    ? 'All bills have been processed. Propose a new one!'
                                    : activeTab === 'session'
                                        ? 'Open a parliament session on a proposed bill to deliberate before enacting.'
                                        : 'No laws have been repealed or rejected yet.'}
                        </div>
                        {(activeTab === 'enacted' || activeTab === 'progress') && (
                            <button className="btn btn-primary" onClick={() => setShowPropose(true)}>
                                + Propose Bill
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="cards-grid cards-grid-2">
                    {currentItems.map((bill) => {
                        const dept = getDepartment(bill.department);
                        const nextAction = getNextBillAction(bill.status);
                        return (
                            <div key={bill.id} className="card">
                                <div className="card-header">
                                    <span className="card-number">{bill.number}</span>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span className={`badge badge-${bill.status}`}>
                                            {getBillStatusLabel(bill.status)}
                                        </span>
                                        <span className={`badge ${dept.badgeClass}`}>
                                            {dept.icon} {dept.label}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="card-title">{bill.title}</h4>
                                {bill.description && (
                                    <p className="card-body" style={{ marginTop: 'var(--space-sm)' }}>
                                        {bill.description}
                                    </p>
                                )}

                                <div className="card-footer">
                                    <span className="card-meta">
                                        {bill.status === 'enacted'
                                            ? `Enacted ${formatDate(bill.enactedDate)}`
                                            : bill.status === 'repealed'
                                                ? `Repealed ${formatDate(bill.repealedDate)}`
                                                : bill.status === 'rejected'
                                                    ? `Rejected ${formatDate(bill.debate?.decidedDate)}`
                                                    : `Proposed ${formatDate(bill.proposedDate)}`}
                                    </span>

                                    <div className="btn-group">
                                        {nextAction && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleAdvance(bill)}
                                            >
                                                {nextAction.icon} {nextAction.label}
                                            </button>
                                        )}
                                        {bill.status === 'enacted' && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => { setRepealingId(bill.id); setRepealReason(''); }}
                                            >
                                                Repeal
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Show debate summary for enacted/rejected bills with debate history */}
                                {bill.debate && bill.debate.conclusion && (bill.status === 'enacted' || bill.status === 'rejected') && (
                                    <div style={{
                                        marginTop: 'var(--space-sm)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'var(--bg-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.82rem',
                                    }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Session conclusion: </span>
                                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{bill.debate.conclusion}</span>
                                        <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {bill.debate.pros?.length || 0} for · {bill.debate.cons?.length || 0} against
                                        </div>
                                    </div>
                                )}

                                {bill.status === 'repealed' && bill.repealReason && (
                                    <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Reason: {bill.repealReason}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Propose Bill Modal */}
            <Modal
                title="Propose New Bill"
                isOpen={showPropose}
                onClose={() => setShowPropose(false)}
            >
                <form onSubmit={handlePropose}>
                    <div className="form-group">
                        <label className="form-label">Bill Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "No Screens After 10 PM"'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe the rule in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
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
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowPropose(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                            Draft Bill
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Repeal Modal */}
            <Modal
                title="Repeal Law"
                isOpen={!!repealingId}
                onClose={() => setRepealingId(null)}
            >
                <form onSubmit={handleRepeal}>
                    <div className="form-group">
                        <label className="form-label">Reason for Repeal</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Why is this law being repealed?"
                            value={repealReason}
                            onChange={(e) => setRepealReason(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setRepealingId(null)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-danger">
                            Repeal Law
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
