import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useState } from 'react';

export default function Auth() {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div className="sidebar-seal" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', color: 'var(--text-gold)', marginBottom: '0.5rem' }}>
                MyRepublic
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '400px', lineHeight: 1.6 }}>
                Govern yourself wisely by tracking your laws, cases, and daily executive orders.
            </p>

            <button
                className="btn btn-primary btn-lg"
                onClick={() => signInWithGoogle()}
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1.1rem',
                    backgroundColor: isHovered ? 'var(--gold-light)' : 'var(--gold-primary)',
                    color: '#000',
                    boxShadow: isHovered ? '0 0 20px rgba(201, 169, 78, 0.4)' : 'none',
                    transition: 'all 0.2s ease'
                }}
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    style={{ width: '24px', height: '24px' }}
                />
                {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            {error && (
                <div style={{ marginTop: '1rem', color: 'var(--verdict-guilty)', fontSize: '0.9rem' }}>
                    Error signing in: {error.message}
                </div>
            )}

            <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Your republic's data will be securely synced across all your devices.
            </p>
        </div>
    );
}
