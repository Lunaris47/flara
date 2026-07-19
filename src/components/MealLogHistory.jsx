import { useState, useEffect } from "react";
import { getMealLogs, deleteMealLog } from "../api/api";
import EmptyState from "./EmptyState";
import "./LogHistory.css";

export default function MealLogHistory() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getMealLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to load meal logs", err);
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
            await deleteMealLog(id);
            setLogs(logs.filter((l) => l.id !== id));
        } catch (err) {
            console.error("Failed to delete meal log", err);
        }
    }

    function getSafetyLabel(rating) {
        const map = { SAFE: "✅ Safe", NEUTRAL: "😐 Neutral", TRIGGER: "⚠️ Trigger" };
        return map[rating] || "😐 Neutral";
    }

    function getSafetyColor(rating) {
        const map = { SAFE: "#68d391", NEUTRAL: "#f6ad55", TRIGGER: "#fc8181" };
        return map[rating] || "#f6ad55";
    }

    function formatTags(tags) {
        if (!tags) return [];
        return tags.split(",").filter(Boolean).map((t) => t.trim());
    }

    function formatTagLabel(tag) {
        const map = {
            dairy: "🥛 Dairy",
            gluten: "🌾 Gluten",
            spicy: "🌶️ Spicy",
            highFiber: "🥦 High fiber",
            rawVegetables: "🥗 Raw vegetables",
            redMeat: "🥩 Red meat",
            caffeine: "☕ Caffeine",
            alcohol: "🍺 Alcohol",
            processed: "🍟 Processed food",
            fattyFood: "🧈 Fatty food",
        };
        return map[tag] || tag;
    }

    if (loading) return <div className="history-loading">Loading...</div>;
    if (logs.length === 0) return (
		<EmptyState
			icon="🥗"
			title="No meals logged yet"
			message="Logging meals helps you identify food triggers over time. Even a few meals a week adds up."
		/>
	);

    // Group logs by date
    const grouped = logs.reduce((acc, log) => {
        const date = log.logDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="log-history">
            {sortedDates.map((date) => (
                <div key={date} className="meal-day-group">
                    <p className="meal-day-header">{date}</p>
                    {grouped[date].map((log) => {
                        const isExpanded = expandedId === log.id;
                        const tags = formatTags(log.triggerTags);

                        return (
                            <div
                                key={log.id}
                                className={`history-row ${isExpanded ? "expanded" : ""}`}
                                onClick={() => toggle(log.id)}
                            >
                                <div className="history-summary">
                                    <div className="history-summary-left">
                                        <div className="history-pills">
                                            <span
                                                className="history-pill"
                                                style={{ color: getSafetyColor(log.safetyRating) }}
                                            >
                                                {getSafetyLabel(log.safetyRating)}
                                            </span>
                                            <span className="history-pill meal-desc">
                                                {log.description?.length > 40
                                                    ? log.description.substring(0, 40) + "..."
                                                    : log.description}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
                                </div>

                                {isExpanded && (
                                    <div className="history-details" onClick={(e) => e.stopPropagation()}>
                                        <div className="history-detail-section" style={{ marginBottom: 14 }}>
                                            <h4>🥗 Meal</h4>
                                            <p className="meal-full-desc">{log.description}</p>
                                        </div>

                                        {tags.length > 0 && (
                                            <div className="history-detail-section" style={{ marginBottom: 14 }}>
                                                <h4>⚠️ Trigger ingredients</h4>
                                                <div className="symptom-tags">
                                                    {tags.map((t) => (
                                                        <span key={t} className="symptom-tag">{formatTagLabel(t)}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="detail-items" style={{ marginBottom: 12 }}>
                                            <div className="detail-item">
                                                <span className="detail-label">Safety rating</span>
                                                <span className="detail-value" style={{ color: getSafetyColor(log.safetyRating) }}>
                                                    {getSafetyLabel(log.safetyRating)}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Preceded a flare</span>
                                                <span className="detail-value">{log.precededFlare ? "🔥 Yes" : "No"}</span>
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
            ))}
        </div>
    );
}