import { useState } from 'react';
import { formatDate, DEPARTMENTS, getDepartment, getVerdictLabel } from '../utils';
import Modal from '../components/Modal';

export default function Judiciary({ republic, showToast }) {
    const { data, fileCase, issueVerdict, completeSentence } = republic;
    const { cases } = data.judiciary;

    const [activeTab, setActiveTab] = useState('pending');
    const [showFileCase, setShowFileCase] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [relatedLawId, setRelatedLawId] = useState('');
    const [department, setDepartment] = useState('health');

    // Verdict form
    const [judgingId, setJudgingId] = useState(null);
    const [verdict, setVerdict] = useState('');
    const [verdictNotes, setVerdictNotes] = useState('');
    const [sentence, setSentence] = useState('');

    // AI Judge
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiApplied, setAiApplied] = useState(false);

    const pendingCases = cases.filter((c) => c.verdict === 'pending');
    const resolvedCases = cases.filter((c) => c.verdict !== 'pending');
    const enactedLaws = data.legislature.bills.filter((b) => b.status === 'enacted');

    const handleFileCase = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        fileCase(title.trim(), description.trim(), relatedLawId || null, department);
        setTitle('');
        setDescription('');
        setRelatedLawId('');
        setDepartment('health');
        setShowFileCase(false);
        showToast('⚖️', 'Case filed');
    };

    const handleVerdict = (e) => {
        e.preventDefault();
        if (!verdict) return;
        issueVerdict(judgingId, verdict, verdictNotes.trim(), sentence.trim());
        setJudgingId(null);
        setVerdict('');
        setVerdictNotes('');
        setSentence('');
        showToast('⚖️', `Verdict issued: ${getVerdictLabel(verdict)}`);
    };

    const startJudging = (cs) => {
        setJudgingId(cs.id);
        setVerdict('');
        setVerdictNotes('');
        setSentence('');
        setAiLoading(false);
        setAiError('');
        setAiApplied(false);
    };

    const askTheJudge = async () => {
        const cs = cases.find((c) => c.id === judgingId);
        if (!cs) return;

        setAiLoading(true);
        setAiError('');
        setAiApplied(false);

        // Gather context
        const activeArticles = data.constitution.articles.filter((a) => a.status === 'active');
        const constitutionText = activeArticles.length > 0
            ? activeArticles.map((a) => `Article ${a.number}: ${a.title} — ${a.text}`).join('\n')
            : '';

        let relatedLaw = '';
        if (cs.relatedLawId) {
            const law = data.legislature.bills.find((b) => b.id === cs.relatedLawId);
            if (law) relatedLaw = `${law.number}: ${law.title}`;
        }

        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseTitle: cs.title,
                    caseDescription: cs.description || '',
                    relatedLaw,
                    constitution: constitutionText,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to consult the Judge');
            }

            const result = await res.json();
            setVerdict(result.verdict);
            setVerdictNotes(result.notes);
            setSentence(result.sentence);
            setAiApplied(true);
        } catch (err) {
            setAiError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    const getLawTitle = (lawId) => {
        const law = data.legislature.bills.find((b) => b.id === lawId);
        return law ? `${law.number}: ${law.title}` : null;
    };

    const currentCases = activeTab === 'pending' ? pendingCases : resolvedCases;

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <span className="icon">⚖️</span>
                    Judiciary
                </h1>
                <p className="page-subtitle">
                    Hold yourself accountable — file cases, issue verdicts, serve justice
                </p>
            </div>

            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Cases
                        <span className="tab-count">{pendingCases.length}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resolved')}
                    >
                        Resolved
                        <span className="tab-count">{resolvedCases.length}</span>
                    </button>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowFileCase(true)}
                >
                    + File a Case
                </button>
            </div>

            <hr className="divider" style={{ marginTop: 0 }} />

            {/* Case list */}
            {currentCases.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            {activeTab === 'pending' ? '⚖️' : '📁'}
                        </div>
                        <div className="empty-state-title">
                            {activeTab === 'pending' ? 'No Pending Cases' : 'No Resolved Cases'}
                        </div>
                        <div className="empty-state-desc">
                            {activeTab === 'pending'
                                ? 'When you break a rule, file a case to hold yourself accountable.'
                                : 'Resolved cases will appear here after you issue verdicts.'}
                        </div>
                        {activeTab === 'pending' && (
                            <button className="btn btn-primary" onClick={() => setShowFileCase(true)}>
                                + File a Case
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="cards-grid cards-grid-2">
                    {currentCases.map((cs) => {
                        const dept = getDepartment(cs.department);
                        const lawTitle = getLawTitle(cs.relatedLawId);
                        return (
                            <div key={cs.id} className="card">
                                <div className="card-header">
                                    <span className="card-number">{cs.number}</span>
                                    <div className="flex gap-sm items-center">
                                        <span className={`badge badge-${cs.verdict}`}>
                                            {getVerdictLabel(cs.verdict)}
                                        </span>
                                        <span className={`badge ${dept.badgeClass}`}>
                                            {dept.icon} {dept.label}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="card-title">{cs.title}</h4>
                                {cs.description && (
                                    <p className="card-body" style={{ marginTop: 'var(--space-sm)' }}>
                                        {cs.description}
                                    </p>
                                )}

                                {lawTitle && (
                                    <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Related Law: <span style={{ color: 'var(--text-gold)' }}>{lawTitle}</span>
                                    </div>
                                )}

                                {cs.verdict === 'guilty' && cs.sentence && (
                                    <div style={{
                                        marginTop: 'var(--space-md)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'var(--guilty-bg)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div>
                                            <strong style={{ color: 'var(--guilty)' }}>Sentence:</strong>{' '}
                                            <span style={{ color: 'var(--text-primary)' }}>{cs.sentence}</span>
                                        </div>
                                        {!cs.sentenceCompleted ? (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => {
                                                    completeSentence(cs.id);
                                                    showToast('✅', 'Sentence completed');
                                                }}
                                            >
                                                ✓ Done
                                            </button>
                                        ) : (
                                            <span className="badge badge-completed">Served</span>
                                        )}
                                    </div>
                                )}

                                {cs.verdictNotes && cs.verdict !== 'pending' && (
                                    <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Notes: {cs.verdictNotes}
                                    </div>
                                )}

                                <div className="card-footer">
                                    <span className="card-meta">
                                        Filed {formatDate(cs.filedDate)}
                                        {cs.verdictDate && ` · Verdict ${formatDate(cs.verdictDate)}`}
                                    </span>

                                    {cs.verdict === 'pending' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => startJudging(cs)}
                                        >
                                            ⚖️ Judge
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* File Case Modal */}
            <Modal
                title="File a New Case"
                isOpen={showFileCase}
                onClose={() => setShowFileCase(false)}
            >
                <form onSubmit={handleFileCase}>
                    <div className="form-group">
                        <label className="form-label">What Happened?</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "Skipped morning workout"'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Details</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe the incident..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Related Law</label>
                            <select
                                className="form-select"
                                value={relatedLawId}
                                onChange={(e) => setRelatedLawId(e.target.value)}
                            >
                                <option value="">None</option>
                                {enactedLaws.map((law) => (
                                    <option key={law.id} value={law.id}>
                                        {law.number}: {law.title}
                                    </option>
                                ))}
                            </select>
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
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowFileCase(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                            File Case
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Verdict Modal */}
            <Modal
                title="Issue Verdict"
                isOpen={!!judgingId}
                onClose={() => setJudgingId(null)}
            >
                <form onSubmit={handleVerdict}>
                    {/* AI Judge */}
                    <div style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={aiLoading}
                            onClick={askTheJudge}
                            style={{ width: '100%' }}
                        >
                            {aiLoading ? 'Consulting the Judge...' : 'Ask the Judge'}
                        </button>
                        {aiError && (
                            <div style={{ color: 'var(--guilty)', fontSize: '0.85rem', marginTop: 'var(--space-sm)' }}>
                                {aiError}
                            </div>
                        )}
                        {aiApplied && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 'var(--space-sm)', fontStyle: 'italic' }}>
                                AI recommendation applied below. Review and edit before issuing.
                            </div>
                        )}
                    </div>

                    <hr className="divider" />

                    <div className="form-group">
                        <label className="form-label">Verdict</label>
                        <div className="verdict-selector">
                            <button
                                type="button"
                                className={`verdict-btn ${verdict === 'guilty' ? 'guilty-selected' : ''}`}
                                onClick={() => setVerdict('guilty')}
                            >
                                Guilty
                            </button>
                            <button
                                type="button"
                                className={`verdict-btn ${verdict === 'not-guilty' ? 'not-guilty-selected' : ''}`}
                                onClick={() => setVerdict('not-guilty')}
                            >
                                Not Guilty
                            </button>
                            <button
                                type="button"
                                className={`verdict-btn ${verdict === 'pardoned' ? 'pardoned-selected' : ''}`}
                                onClick={() => setVerdict('pardoned')}
                            >
                                Pardoned
                            </button>
                        </div>
                    </div>

                    {verdict === 'guilty' && (
                        <div className="form-group">
                            <label className="form-label">Sentence (Corrective Action)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder='e.g., "30 minutes extra workout"'
                                value={sentence}
                                onChange={(e) => setSentence(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Reasoning for this verdict..."
                            value={verdictNotes}
                            onChange={(e) => setVerdictNotes(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setJudgingId(null)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!verdict}>
                            Issue Verdict
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
