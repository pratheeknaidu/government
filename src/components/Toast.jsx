import { useState, useCallback } from 'react';

export default function Toast({ children }) {
    return <div className="toast-container">{children}</div>;
}

export function ToastItem({ icon, message }) {
    return (
        <div className="toast">
            <span className="toast-icon">{icon}</span>
            <span>{message}</span>
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((icon, message) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, icon, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const ToastContainer = useCallback(() => (
        <div className="toast-container">
            {toasts.map((t) => (
                <ToastItem key={t.id} icon={t.icon} message={t.message} />
            ))}
        </div>
    ), [toasts]);

    return { showToast, ToastContainer };
}
