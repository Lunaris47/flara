import { useState, useEffect } from "react";
import { getFlares, deleteFlare } from "../api/api";
import "./LogHistory.css";

export default function FlareHistory() {
    const [flares, setFlares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getFlares();
                setFlares(res.data);
            } catch (err) {
                console.error("Failed to load flares", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function toggle(id) {
        setExpandedId(expandedId === id ? null : id);
    }

    async function handleDelete(e, id) {
        e.stopPropagation();
        try {
            await deleteFlare(id);
            setFlares(flares.filter((f) => f.id !== id));
        } catch (err) {
            console.error("Failed to delete flare", err);
        }
    }

    function getSeverityLabel(severity) {
        if (!severity) return "--";
        if (severity <= 3) return `${severity}/10 🟢 Mild`;
        if (severity <= 6) return `${severity}/10 🟡 Moderate`;
        if (severity <= 8) return `${severity}/10 🟠 Severe`;
        return `${severity}/10 🔴 Very severe`;
    }

    if (loading) return <div className="history-loading">Loading...</div>;
    if (flares.length === 0) return <div className="history-empty">No flares recorded yet.</div>;

    return (
        <div className="log-history">
            {flares.map((flare) => {
                const isExpanded = expandedId === flare.id;
                const isOngoing = !flare.endDate;

                return (
                    <div
                        key={flare.id}
                        className={`history-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggle(flare.id)}
                    >
                        {/* SUMMARY */}
                        <div className="history-summary">
                            <div className="history-summary-left">
                                <span className="history-date">
                                    {flare.startDate}
                                    {flare.endDate ? ` → ${flare.endDate}` : " → ongoing"}
                                </span>
                                <div className="history-pills">
                                    <span className="history-pill">
                                        Severity {flare.severity ?? "--"}/10
                                    </span>
                                    {isOngoing && (
                                        <span className="history-pill ongoing-badge">🔥 Ongoing</span>
                                    )}
                                </div>
                            </div>
                            <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* EXPANDED */}
                        {isExpanded && (
                            <div className="history-details" onClick={(e) => e.stopPropagation()}>

                                <div className="detail-items" style={{ marginBottom: 14 }}>
                                    <div className="detail-item">
                                        <span className="detail-label">Severity</span>
                                        <span className="detail-value">{getSeverityLabel(flare.severity)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Resolved naturally</span>
                                        <span className="detail-value">{flare.resolvedNaturally ? "✅ Yes" : "No"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Medical attention</span>
                                        <span className="detail-value">{flare.requiredMedicalAttention ? "🏥 Yes" : "No"}</span>
                                    </div>
                                </div>

                                {flare.physicalContext && (
                                    <div className="history-notes" style={{ marginBottom: 10 }}>
                                        <h4>🩺 Physical context</h4>
                                        <p>{flare.physicalContext}</p>
                                    </div>
                                )}

                                {flare.mentalContext && (
                                    <div className="history-notes" style={{ marginBottom: 10 }}>
                                        <h4>🧠 Mental context</h4>
                                        <p>{flare.mentalContext}</p>
                                    </div>
                                )}

                                {flare.potentialTriggers && (
                                    <div className="history-notes" style={{ marginBottom: 10 }}>
                                        <h4>⚠️ Potential triggers</h4>
                                        <p>{flare.potentialTriggers}</p>
                                    </div>
                                )}

                                {flare.notes && (
                                    <div className="history-notes">
                                        <h4>📝 Notes</h4>
                                        <p>{flare.notes}</p>
                                    </div>
                                )}

                                <button
                                    className="delete-log-btn"
                                    onClick={(e) => handleDelete(e, flare.id)}
                                >
                                    🗑 Delete this entry
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}