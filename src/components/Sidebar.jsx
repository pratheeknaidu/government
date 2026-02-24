import { NavLink } from 'react-router-dom';
import { auth } from '../firebase';

const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/constitution', icon: '🏛️', label: 'Constitution' },
    { to: '/legislature', icon: '📜', label: 'Legislature' },
    { to: '/judiciary', icon: '⚖️', label: 'Judiciary' },
    { to: '/executive', icon: '🎖️', label: 'Executive' },
];

export default function Sidebar({ user, republicName, motto, isOpen, onClose }) {
    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-seal">🏛️</div>
                        <div>
                            <div className="sidebar-republic-name">
                                {republicName || 'MyRepublic'}
                            </div>
                            {motto && (
                                <div className="sidebar-republic-motto">"{motto}"</div>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                />
                            )}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {user.displayName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>President</div>
                            </div>
                        </div>
                    )}
                    <button
                        className="btn btn-ghost"
                        onClick={() => auth.signOut()}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
