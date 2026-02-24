import { useState } from 'react';
import { formatDate, toRoman } from '../utils';
import Modal from '../components/Modal';

export default function Constitution({ republic, showToast }) {
    const { data, setPreamble, addArticle, amendArticle } = republic;
    const { preamble, articles } = data.constitution;

    const [editingPreamble, setEditingPreamble] = useState(false);
    const [preambleText, setPreambleText] = useState(preamble);
    const [showAddArticle, setShowAddArticle] = useState(false);
    const [articleTitle, setArticleTitle] = useState('');
    const [articleBody, setArticleBody] = useState('');
    const [amendingId, setAmendingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const handleSavePreamble = () => {
        setPreamble(preambleText);
        setEditingPreamble(false);
        showToast('🏛️', 'Preamble updated');
    };

    const handleAddArticle = (e) => {
        e.preventDefault();
        if (!articleTitle.trim()) return;
        addArticle(articleTitle.trim(), articleBody.trim());
        setArticleTitle('');
        setArticleBody('');
        setShowAddArticle(false);
        showToast('🏛️', 'Article ratified');
    };

    const handleAmend = (e) => {
        e.preventDefault();
        if (!articleTitle.trim()) return;
        amendArticle(amendingId, articleTitle.trim(), articleBody.trim());
        setArticleTitle('');
        setArticleBody('');
        setAmendingId(null);
        showToast('🏛️', 'Amendment ratified');
    };

    const startAmend = (article) => {
        setArticleTitle(article.title);
        setArticleBody(article.body);
        setAmendingId(article.id);
    };

    const activeArticles = articles.filter((a) => a.status === 'active');
    const amendedArticles = articles.filter((a) => a.status === 'amended');

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <span className="icon">🏛️</span>
                    Constitution
                </h1>
                <p className="page-subtitle">
                    The foundational principles and values of your republic
                </p>
            </div>

            {/* Preamble */}
            {!preamble && !editingPreamble ? (
                <div className="card card-gold" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">📜</div>
                        <div className="empty-state-title">
                            Every great nation begins with a declaration
                        </div>
                        <div className="empty-state-desc">
                            Write your preamble — a personal mission statement that defines who you aspire to be.
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setEditingPreamble(true)}
                        >
                            ✍️ Write Your Preamble
                        </button>
                    </div>
                </div>
            ) : editingPreamble ? (
                <div className="preamble-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="preamble-label">✦ Preamble ✦</div>
                    <textarea
                        className="form-textarea"
                        style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.1rem',
                            fontStyle: 'italic',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            minHeight: '120px',
                        }}
                        value={preambleText}
                        onChange={(e) => setPreambleText(e.target.value)}
                        placeholder="We, the self-governing entity, in order to form a more perfect self..."
                        autoFocus
                    />
                    <div className="form-actions" style={{ justifyContent: 'center', marginTop: 'var(--space-md)' }}>
                        <button className="btn btn-ghost" onClick={() => { setEditingPreamble(false); setPreambleText(preamble); }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSavePreamble}>
                            Save Preamble
                        </button>
                    </div>
                </div>
            ) : (
                <div className="preamble-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <button
                        className="btn btn-ghost btn-icon preamble-edit-btn"
                        onClick={() => setEditingPreamble(true)}
                        title="Edit preamble"
                    >
                        ✏️
                    </button>
                    <div className="preamble-label">✦ Preamble ✦</div>
                    <div className="preamble-text">{preamble}</div>
                </div>
            )}

            {/* Active Articles */}
            <div className="section-header">
                <h3 className="section-title">Articles of Governance</h3>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setShowAddArticle(true); setArticleTitle(''); setArticleBody(''); }}
                >
                    + Add Article
                </button>
            </div>

            {activeArticles.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📃</div>
                        <div className="empty-state-title">No Articles Yet</div>
                        <div className="empty-state-desc">
                            Establish your founding articles — the core principles you live by.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cards-grid" style={{ gap: 'var(--space-md)' }}>
                    {activeArticles.map((article) => (
                        <div
                            key={article.id}
                            className="article-card"
                            onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className="article-number">
                                        Article {toRoman(article.number)}
                                    </div>
                                    <div className="article-title">{article.title}</div>
                                </div>
                                <div className="flex gap-sm items-center">
                                    <span className={`badge ${article.isOriginal ? 'badge-original' : 'badge-amendment'}`}>
                                        {article.isOriginal ? 'Original' : 'Amendment'}
                                    </span>
                                </div>
                            </div>

                            {expandedId === article.id && (
                                <>
                                    <div className="article-body" style={{ marginTop: 'var(--space-md)' }}>
                                        {article.body || <span className="text-muted" style={{ fontStyle: 'italic' }}>No detailed description</span>}
                                    </div>
                                    <div className="card-footer">
                                        <span className="card-meta">
                                            Ratified {formatDate(article.ratifiedDate)}
                                        </span>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={(e) => { e.stopPropagation(); startAmend(article); }}
                                        >
                                            📝 Amend
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Amended Articles */}
            {amendedArticles.length > 0 && (
                <>
                    <div className="section-header" style={{ marginTop: 'var(--space-2xl)' }}>
                        <h3 className="section-title" style={{ color: 'var(--text-muted)' }}>
                            📜 Amended Articles
                        </h3>
                    </div>
                    <div className="cards-grid" style={{ gap: 'var(--space-md)' }}>
                        {amendedArticles.map((article) => (
                            <div key={article.id} className="article-card" style={{ opacity: 0.5, borderLeftColor: 'var(--text-muted)' }}>
                                <div className="article-number" style={{ color: 'var(--text-muted)' }}>
                                    Article {toRoman(article.number)}
                                </div>
                                <div className="article-title" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                    {article.title}
                                </div>
                                <div className="card-meta" style={{ marginTop: 'var(--space-sm)' }}>
                                    <span className="badge badge-amended">Amended</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Article Modal */}
            <Modal
                title="Ratify New Article"
                isOpen={showAddArticle}
                onClose={() => setShowAddArticle(false)}
            >
                <form onSubmit={handleAddArticle}>
                    <div className="form-group">
                        <label className="form-label">Article Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "Physical Health Above All"'
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe this principle in detail..."
                            value={articleBody}
                            onChange={(e) => setArticleBody(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowAddArticle(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!articleTitle.trim()}>
                            Ratify Article
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Amend Article Modal */}
            <Modal
                title="Amend Article"
                isOpen={!!amendingId}
                onClose={() => setAmendingId(null)}
            >
                <form onSubmit={handleAmend}>
                    <div className="form-group">
                        <label className="form-label">New Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Description</label>
                        <textarea
                            className="form-textarea"
                            value={articleBody}
                            onChange={(e) => setArticleBody(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setAmendingId(null)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!articleTitle.trim()}>
                            Ratify Amendment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
