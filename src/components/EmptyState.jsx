import "./EmptyState.css";

export default function EmptyState({ icon, title, message, action, onAction }) {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">{icon}</span>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {action && (
                <button className="empty-state-btn" onClick={onAction}>
                    {action}
                </button>
            )}
        </div>
    );
}