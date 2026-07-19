import { useState, useEffect } from "react";
import { getMedicationLogs, deleteMedicationLog } from "../api/api";
import EmptyState from "./EmptyState";
import "./LogHistory.css";

export default function MedicationLogHistory() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getMedicationLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to load medication logs", err);
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
            await deleteMedicationLog(id);
            setLogs(logs.filter((l) => l.id !== id));
        } catch (err) {
            console.error("Failed to delete medication log", err);
        }
    }

    function getMedTypeLabel(type) {
        const map = {
            BIOLOGIC: "💉 Biologic",
            IMMUNOSUPPRESSANT: "🧬 Immunosuppressant",
            STEROID: "⚡ Steroid",
            AMINOSALICYLATE: "💊 Aminosalicylate",
            ANTIBIOTIC: "🦠 Antibiotic",
            SUPPLEMENT: "🌿 Supplement",
            OTHER: "📦 Other",
        };
        return map[type] || type;
    }

    if (loading) return <div className="history-loading">Loading...</div>;
    if (logs.length === 0) return (
		<EmptyState
			icon="💊"
			title="No medications logged yet"
			message="Track your medications to monitor adherence and note any side effects over time."
		/>
	);

    return (
        <div className="log-history">
            {logs.map((log) => {
                const isExpanded = expandedId === log.id;

                return (
                    <div
                        key={log.id}
                        className={`history-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggle(log.id)}
                    >
                        {/* SUMMARY */}
                        <div className="history-summary">
                            <div className="history-summary-left">
                                <span className="history-date">{log.logDate}</span>
                                <div className="history-pills">
                                    <span className="history-pill">
                                        {log.taken ? "✅ Taken" : "❌ Missed"}
                                    </span>
                                    <span className="history-pill">{log.medicationName}</span>
                                    {log.dosage && (
                                        <span className="history-pill">{log.dosage}</span>
                                    )}
                                </div>
                            </div>
                            <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* EXPANDED */}
                        {isExpanded && (
                            <div className="history-details" onClick={(e) => e.stopPropagation()}>
                                <div className="detail-items" style={{ marginBottom: 12 }}>
                                    <div className="detail-item">
                                        <span className="detail-label">Medication</span>
                                        <span className="detail-value">{log.medicationName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Type</span>
                                        <span className="detail-value">{getMedTypeLabel(log.medicationType)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Dosage</span>
                                        <span className="detail-value">{log.dosage || "--"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status</span>
                                        <span className="detail-value">
                                            {log.taken ? "✅ Taken" : "❌ Missed dose"}
                                        </span>
                                    </div>
                                    {log.biologicDate && (
                                        <div className="detail-item">
                                            <span className="detail-label">Infusion/injection date</span>
                                            <span className="detail-value">{log.biologicDate}</span>
                                        </div>
                                    )}
                                </div>

                                {log.sideEffectNotes && (
                                    <div className="history-notes">
                                        <h4>⚠️ Side effect notes</h4>
                                        <p>{log.sideEffectNotes}</p>
                                    </div>
                                )}

                                <button
                                    className="delete-log-btn"
                                    onClick={(e) => handleDelete(e, log.id)}
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