import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/constitution', icon: '🏛️', label: 'Constitution' },
    { to: '/legislature', icon: '📜', label: 'Legislature' },
    { to: '/judiciary', icon: '⚖️', label: 'Judiciary' },
    { to: '/executive', icon: '🎖️', label: 'Executive' },
];

export default function Sidebar({ republicName, motto, isOpen, onClose }) {
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

                <div className="sidebar-footer">
                    <div className="sidebar-footer-text">
                        Govern yourself wisely
                    </div>
                </div>
            </aside>
        </>
    );
}
