import { useState } from 'react';

export default function Setup({ onSetup }) {
    const [name, setName] = useState('');
    const [motto, setMotto] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSetup(name.trim(), motto.trim());
    };

    return (
        <div className="setup-overlay">
            <div className="setup-card">
                <div className="setup-seal">🏛️</div>
                <h1 className="setup-title">Found Your Republic</h1>
                <p className="setup-subtitle">
                    Every great nation begins with a declaration.
                    <br />
                    Name your republic and establish your founding motto.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Republic Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "The Republic of Pratheek"'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Founding Motto (optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder='e.g., "Discipline is freedom"'
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        disabled={!name.trim()}
                    >
                        Establish Republic
                    </button>
                </form>
            </div>
        </div>
    );
}
