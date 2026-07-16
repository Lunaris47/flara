import { useState, useEffect } from "react";
import { getPhysicalLogs, deletePhysicalLog } from "../api/api";
import "./LogHistory.css";

export default function PhysicalLogHistory() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getPhysicalLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to load physical logs", err);
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
            await deletePhysicalLog(id);
            setLogs(logs.filter((l) => l.id !== id));
        } catch (err) {
            console.error("Failed to delete physical log", err);
        }
    }

    function getBloodLabel(value) {
        const map = { NONE: "None", TRACE: "Trace", MODERATE: "Moderate", SIGNIFICANT: "Significant" };
        return map[value] || "None";
    }

    function getBristolLabel(type) {
        const map = {
            1: "Type 1 — Hard lumps",
            2: "Type 2 — Lumpy sausage",
            3: "Type 3 — Cracked sausage",
            4: "Type 4 — Smooth sausage",
            5: "Type 5 — Soft blobs",
            6: "Type 6 — Fluffy pieces",
            7: "Type 7 — Watery",
        };
        return map[type] || "--";
    }

    function getActiveSymptoms(log) {
        const symptoms = [];
        if (log.fatigue) symptoms.push("😴 Fatigue");
        if (log.jointPain) symptoms.push("🦴 Joint pain");
        if (log.nausea) symptoms.push("🤢 Nausea");
        if (log.fever) symptoms.push("🌡️ Fever");
        if (log.bloating) symptoms.push("💨 Bloating");
        if (log.perianalDiscomfort) symptoms.push("⚠️ Perianal discomfort");
        if (log.mouthSores) symptoms.push("💊 Mouth sores");
        if (log.skinIssues) symptoms.push("🔴 Skin issues");
        if (log.rectalBleeding) symptoms.push("🩸 Rectal bleeding");
        if (log.urgency) symptoms.push("⚡ Urgency");
        if (log.tenesmus) symptoms.push("😣 Tenesmus");
        return symptoms;
    }

    function getPainLabel(score) {
        if (score === null || score === undefined) return "--";
        if (score <= 2) return `${score}/10 🟢`;
        if (score <= 5) return `${score}/10 🟡`;
        if (score <= 7) return `${score}/10 🟠`;
        return `${score}/10 🔴`;
    }

    if (loading) return <div className="history-loading">Loading...</div>;
    if (logs.length === 0) return <div className="history-empty">No physical logs yet. Start your first check-in!</div>;

    return (
        <div className="log-history">
            {logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const symptoms = getActiveSymptoms(log);

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
                                    <span className="history-pill">Pain {getPainLabel(log.painScore)}</span>
                                    <span className="history-pill">Bowel {log.bowelFrequency ?? "--"}x</span>
                                    <span className="history-pill">Energy {log.energyLevel ?? "--"}/10</span>
                                </div>
                            </div>
                            <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* EXPANDED */}
                        {isExpanded && (
                            <div className="history-details" onClick={(e) => e.stopPropagation()}>
                                <div className="history-details-grid">
                                    <div className="history-detail-section">
                                        <h4>🩺 Physical</h4>
                                        <div className="detail-items">
                                            <div className="detail-item">
                                                <span className="detail-label">Pain score</span>
                                                <span className="detail-value">{log.painScore ?? "--"}/10</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Bowel movements</span>
                                                <span className="detail-value">{log.bowelFrequency ?? "--"}x</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Bristol type</span>
                                                <span className="detail-value">{log.bristolType ? getBristolLabel(log.bristolType) : "--"}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Blood presence</span>
                                                <span className="detail-value">{getBloodLabel(log.bloodPresence)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Energy level</span>
                                                <span className="detail-value">{log.energyLevel ?? "--"}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="history-detail-section">
                                        <h4>😷 Symptoms</h4>
                                        {symptoms.length > 0 ? (
                                            <div className="symptom-tags">
                                                {symptoms.map((s) => (
                                                    <span key={s} className="symptom-tag">{s}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-symptoms">No symptoms reported</p>
                                        )}
                                    </div>
                                </div>

                                {log.notes && (
                                    <div className="history-notes">
                                        <h4>📝 Notes</h4>
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