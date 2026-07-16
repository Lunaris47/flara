import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPhysicalLogs, getMentalLogs, getFlares } from "../api/api";
import { Link } from "react-router-dom";
import "./HomePage.css";

// ===============================
// FLARE ALERT LOGIC
// ===============================
function checkForAlerts(physicalLogs, mentalLogs) {
    const alerts = [];
    const today = new Date();

    // Get last 3 days of logs
    const last3Days = physicalLogs.filter(log => {
        const logDate = new Date(log.logDate);
        const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    });

    const last3MentalDays = mentalLogs.filter(log => {
        const logDate = new Date(log.logDate);
        const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    });

    // Check for elevated pain (>= 6) for 2+ consecutive days
    const highPainDays = last3Days.filter(l => l.painScore !== null && l.painScore >= 6);
    if (highPainDays.length >= 2) {
        alerts.push({
            type: "pain",
            icon: "🩺",
            title: "Pain has been elevated",
            message: "You've reported high pain for 2 or more days. Consider reaching out to your care team if this continues.",
            color: "#fc8181",
        });
    }

    // Check for elevated stress (>= 6) for 3+ consecutive days
    const highStressDays = last3MentalDays.filter(l => l.stressScore !== null && l.stressScore >= 6);
    if (highStressDays.length >= 2) {
        alerts.push({
            type: "stress",
            icon: "🧠",
            title: "Stress has been elevated",
            message: "High stress can trigger gut inflammation. Try to build in some rest or mindfulness today if you can.",
            color: "#f6ad55",
        });
    }

    // Check for low mood (<=3) for 2+ days
    const lowMoodDays = last3MentalDays.filter(l => l.moodScore !== null && l.moodScore <= 3);
    if (lowMoodDays.length >= 2) {
        alerts.push({
            type: "mood",
            icon: "💙",
            title: "Your mood has been low",
            message: "Living with IBD is hard. If you're struggling emotionally, reaching out to a therapist or support group can help.",
            color: "#76e4f7",
        });
    }

    // Positive reinforcement — low pain and low stress
    const recentPhysical = physicalLogs[0];
    const recentMental = mentalLogs[0];
    if (
        recentPhysical?.painScore !== null && recentPhysical?.painScore <= 2 &&
        recentMental?.stressScore !== null && recentMental?.stressScore <= 3
    ) {
        alerts.push({
            type: "positive",
            icon: "✨",
            title: "You're having a good stretch",
            message: "Low pain and low stress — keep doing what you're doing. This is what remission feels like.",
            color: "#68d391",
        });
    }

    return alerts;
}

export default function HomePage() {
    const { user } = useAuth();
    const [physicalLogs, setPhysicalLogs] = useState([]);
    const [mentalLogs, setMentalLogs] = useState([]);
    const [flares, setFlares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [physRes, mentRes, flareRes] = await Promise.all([
                    getPhysicalLogs(),
                    getMentalLogs(),
                    getFlares(),
                ]);
                setPhysicalLogs(physRes.data);
                setMentalLogs(mentRes.data);
                setFlares(flareRes.data);
            } catch (err) {
                console.error("Failed to load home data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    function getReadinessScore() {
        if (!physicalLogs.length || !mentalLogs.length) return null;
        const lastPhysical = physicalLogs[0];
        const lastMental = mentalLogs[0];
        const pain = lastPhysical.painScore || 0;
        const stress = lastMental.stressScore || 0;
        const mood = lastMental.moodScore || 5;
        const sleep = lastMental.sleepQuality || 5;
        const score = Math.round(100 - (pain * 5) - (stress * 3) + (mood * 3) + (sleep * 2));
        return Math.max(0, Math.min(100, score));
    }

    function getReadinessLabel(score) {
        if (score === null) return { label: "No data yet", color: "#4a5568", emoji: "📊" };
        if (score >= 70) return { label: "Good day ahead", color: "#68d391", emoji: "🟢" };
        if (score >= 40) return { label: "Take it easy", color: "#f6ad55", emoji: "🟡" };
        return { label: "Be gentle with yourself", color: "#fc8181", emoji: "🔴" };
    }

    function dismissAlert(type) {
        setDismissedAlerts([...dismissedAlerts, type]);
    }

    const readiness = getReadinessScore();
    const readinessInfo = getReadinessLabel(readiness);
    const today = new Date().toISOString().split("T")[0];
    const todayPhysical = physicalLogs.find(l => l.logDate === today);
    const todayMental = mentalLogs.find(l => l.logDate === today);
    const alerts = checkForAlerts(physicalLogs, mentalLogs)
        .filter(a => !dismissedAlerts.includes(a.type));

    const recentActivity = [
        ...physicalLogs.slice(0, 3).map(l => ({ ...l, type: "physical" })),
        ...mentalLogs.slice(0, 3).map(l => ({ ...l, type: "mental" })),
    ].sort((a, b) => new Date(b.logDate) - new Date(a.logDate)).slice(0, 5);

    if (loading) {
        return (
            <div className="home-loading">
                <div className="loading-spinner">🌿</div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="home-page">

            {/* HEADER */}
            <header className="home-header">
                <div className="home-header-left">
                    <span className="home-logo">🌿</span>
                    <span className="home-title">Flara</span>
                </div>
                <span className="home-greeting">Hi, {user?.username}</span>
            </header>

            {/* FLARE ALERTS */}
            {alerts.length > 0 && (
                <section className="alerts-section">
                    {alerts.map((alert) => (
                        <div
                            key={alert.type}
                            className="alert-card"
                            style={{ borderColor: alert.color + "44" }}
                        >
                            <div className="alert-content">
                                <span className="alert-icon">{alert.icon}</span>
                                <div className="alert-text">
                                    <p className="alert-title" style={{ color: alert.color }}>
                                        {alert.title}
                                    </p>
                                    <p className="alert-message">{alert.message}</p>
                                </div>
                            </div>
                            <button
                                className="alert-dismiss"
                                onClick={() => dismissAlert(alert.type)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* READINESS SCORE */}
            <section className="readiness-card">
                <div className="readiness-score-wrapper">
                    <div className="readiness-circle" style={{ borderColor: readinessInfo.color }}>
                        <span className="readiness-number">{readiness !== null ? readiness : "--"}</span>
                        <span className="readiness-label-small">/ 100</span>
                    </div>
                    <div className="readiness-info">
                        <h2 className="readiness-title">{readinessInfo.emoji} {readinessInfo.label}</h2>
                        <p className="readiness-subtitle">
                            Your Gut Readiness Score based on yesterday's pain, stress, mood, and sleep.
                        </p>
                        {readiness === null && (
                            <p className="readiness-hint">Log your first check-in to see your score.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* TODAY'S STATUS */}
            <section className="today-status">
                <h3 className="section-title">Today's check-ins</h3>
                <div className="today-cards">
                    <Link to="/log" className={`today-card ${todayPhysical ? "done" : "pending"}`}>
                        <span className="today-icon">🩺</span>
                        <span className="today-label">Physical</span>
                        <span className="today-status-badge">
                            {todayPhysical ? "✓ Logged" : "Not yet"}
                        </span>
                    </Link>
                    <Link to="/log" className={`today-card ${todayMental ? "done" : "pending"}`}>
                        <span className="today-icon">🧠</span>
                        <span className="today-label">Mental</span>
                        <span className="today-status-badge">
                            {todayMental ? "✓ Logged" : "Not yet"}
                        </span>
                    </Link>
                </div>
            </section>

            {/* STATS ROW */}
            <section className="stats-row">
                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <span className="stat-number">{physicalLogs.length}</span>
                    <span className="stat-label">Days logged</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-number">{flares.length}</span>
                    <span className="stat-label">Flares</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🧠</span>
                    <span className="stat-number">{mentalLogs.length}</span>
                    <span className="stat-label">Check-ins</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💚</span>
                    <span className="stat-number">
                        {physicalLogs.length > 0
                            ? Math.round(physicalLogs.filter(l => l.painScore !== null && l.painScore <= 3).length / physicalLogs.length * 100)
                            : "--"}%
                    </span>
                    <span className="stat-label">Low pain</span>
                </div>
            </section>

            {/* RECENT ACTIVITY */}
            {recentActivity.length > 0 && (
                <section className="recent-activity">
                    <h3 className="section-title">Recent activity</h3>
                    <div className="activity-feed">
                        {recentActivity.map((entry) => (
                            <div key={`${entry.type}-${entry.id}`} className="activity-item">
                                <span className="activity-icon">
                                    {entry.type === "physical" ? "🩺" : "🧠"}
                                </span>
                                <div className="activity-info">
                                    <span className="activity-type">
                                        {entry.type === "physical" ? "Physical log" : "Mental check-in"}
                                    </span>
                                    <span className="activity-date">{entry.logDate}</span>
                                </div>
                                <div className="activity-scores">
                                    {entry.type === "physical" && (
                                        <>
                                            <span className="activity-score">Pain {entry.painScore ?? "--"}/10</span>
                                            <span className="activity-score">Energy {entry.energyLevel ?? "--"}/10</span>
                                        </>
                                    )}
                                    {entry.type === "mental" && (
                                        <>
                                            <span className="activity-score">Stress {entry.stressScore ?? "--"}/10</span>
                                            <span className="activity-score">Mood {entry.moodScore ?? "--"}/10</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}