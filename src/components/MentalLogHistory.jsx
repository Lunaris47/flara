import { useState, useEffect } from "react";
import { getMentalLogs, deleteMentalLog } from "../api/api";
import EmptyState from "./EmptyState";
import "./LogHistory.css";

export default function MentalLogHistory() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getMentalLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to load mental logs", err);
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
            await deleteMentalLog(id);
            setLogs(logs.filter((l) => l.id !== id));
        } catch (err) {
            console.error("Failed to delete mental log", err);
        }
    }

    function getStressLabel(score) {
        if (score === null || score === undefined) return "--";
        if (score <= 2) return `${score}/10 🟢`;
        if (score <= 4) return `${score}/10 🟡`;
        if (score <= 6) return `${score}/10 🟠`;
        return `${score}/10 🔴`;
    }

    function getStressEventLabel(type) {
        const map = {
            NONE: "None",
            WORK: "Work stress",
            RELATIONSHIPS: "Relationship stress",
            MEDICAL_ANXIETY: "Medical anxiety",
            FINANCIAL: "Financial stress",
            FAMILY: "Family stress",
            OTHER: "Other",
        };
        return map[type] || "None";
    }

    if (loading) return <div className="history-loading">Loading...</div>;
    if (logs.length === 0) return (
		<EmptyState
			icon="🧠"
			title="No mental check-ins yet"
			message="Tracking your stress, mood, and sleep alongside physical symptoms is what makes Flara different."
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
                                    <span className="history-pill">Stress {getStressLabel(log.stressScore)}</span>
                                    <span className="history-pill">Mood {log.moodScore ?? "--"}/10</span>
                                    <span className="history-pill">Sleep {log.sleepQuality ?? "--"}/10</span>
                                </div>
                            </div>
                            <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* EXPANDED */}
                        {isExpanded && (
                            <div className="history-details" onClick={(e) => e.stopPropagation()}>
                                <div className="history-details-grid">
                                    <div className="history-detail-section">
                                        <h4>🧠 Mental health</h4>
                                        <div className="detail-items">
                                            <div className="detail-item">
                                                <span className="detail-label">Stress score</span>
                                                <span className="detail-value">{log.stressScore ?? "--"}/10</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Mood</span>
                                                <span className="detail-value">{log.moodScore ?? "--"}/10</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Anxiety</span>
                                                <span className="detail-value">{log.anxietyScore ?? "--"}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="history-detail-section">
                                        <h4>😴 Sleep</h4>
                                        <div className="detail-items">
                                            <div className="detail-item">
                                                <span className="detail-label">Sleep quality</span>
                                                <span className="detail-value">{log.sleepQuality ?? "--"}/10</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Hours slept</span>
                                                <span className="detail-value">{log.sleepHours ?? "--"}h</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Stressor</span>
                                                <span className="detail-value">{getStressEventLabel(log.stressEventType)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Meditation</span>
                                                <span className="detail-value">{log.meditationDone ? "✓ Yes" : "No"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {log.notes && (
                                    <div className="history-notes">
                                        <h4>💭 Notes</h4>
                                        <p>{log.notes}</p>
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