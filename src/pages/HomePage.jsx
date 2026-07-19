import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPhysicalLogs, getMentalLogs, getFlares } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import "./HomePage.css";

// ===============================
// FLARE ALERT LOGIC
// ===============================
function checkForAlerts(physicalLogs, mentalLogs) {
    const alerts = [];
    const today = new Date();

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

// ===============================
// CONTEXTUAL EDUCATION CARDS
// ===============================
function getContextualCards(physicalLogs, mentalLogs) {
    const cards = [];
    const today = new Date();

    const last3Physical = physicalLogs.filter(log => {
        const diff = Math.floor((today - new Date(log.logDate)) / (1000 * 60 * 60 * 24));
        return diff <= 3;
    });

    const last3Mental = mentalLogs.filter(log => {
        const diff = Math.floor((today - new Date(log.logDate)) / (1000 * 60 * 60 * 24));
        return diff <= 3;
    });

    const highStress = last3Mental.filter(l => l.stressScore >= 6);
    if (highStress.length >= 1) {
        cards.push({
            icon: "🧠",
            title: "Did you know stress can trigger flares?",
            summary: "High stress activates the gut-brain axis and can increase gut inflammation.",
            articleId: "stress-gut",
            color: "#f6ad55",
        });
    }

    const poorSleep = last3Mental.filter(l => l.sleepQuality !== null && l.sleepQuality <= 4);
    if (poorSleep.length >= 1) {
        cards.push({
            icon: "😴",
            title: "Poor sleep and IBD",
            summary: "Sleep quality directly affects gut inflammation. Here's what the research says.",
            articleId: "sleep-ibd",
            color: "#76e4f7",
        });
    }

    const highPain = last3Physical.filter(l => l.painScore >= 6);
    if (highPain.length >= 1) {
        cards.push({
            icon: "🔬",
            title: "Understanding your flare triggers",
            summary: "Pain has been elevated recently. Learn what commonly triggers IBD flares.",
            articleId: "what-is-a-flare",
            color: "#fc8181",
        });
    }

    if (cards.length === 0 && physicalLogs.length > 0) {
        cards.push({
            icon: "💊",
            title: "Why staying on medication matters",
            summary: "One of the most common causes of IBD relapse is stopping medication during remission.",
            articleId: "medication-adherence",
            color: "#68d391",
        });
    }

    return cards.slice(0, 2);
}

// ===============================
// CATEGORY LOOKUP
// ===============================
function getCategoryForArticle(articleId) {
    const map = {
        "stress-gut": "The Mind-Gut Connection",
        "sleep-ibd": "The Mind-Gut Connection",
        "what-is-a-flare": "Understanding IBD",
        "medication-adherence": "Managing IBD Day-to-Day",
        "crohns-vs-uc": "Understanding IBD",
        "remission": "Understanding IBD",
        "ibd-anxiety": "The Mind-Gut Connection",
        "ibd-diet": "Nutrition & Food",
        "hydration": "Nutrition & Food",
        "doctor-appointments": "Managing IBD Day-to-Day",
    };
    return map[articleId] || null;
}

// ===============================
// WEEKLY RECAP
// ===============================
function getWeeklyRecap(physicalLogs, mentalLogs) {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekPhysical = physicalLogs.filter(l => new Date(l.logDate) >= weekAgo);
    const weekMental = mentalLogs.filter(l => new Date(l.logDate) >= weekAgo);

    if (weekPhysical.length === 0 && weekMental.length === 0) return null;

    const avgPain = weekPhysical.filter(l => l.painScore !== null).length > 0
        ? (weekPhysical.reduce((s, l) => s + (l.painScore || 0), 0) / weekPhysical.length).toFixed(1)
        : null;

    const avgStress = weekMental.filter(l => l.stressScore !== null).length > 0
        ? (weekMental.reduce((s, l) => s + (l.stressScore || 0), 0) / weekMental.length).toFixed(1)
        : null;

    const avgMood = weekMental.filter(l => l.moodScore !== null).length > 0
        ? (weekMental.reduce((s, l) => s + (l.moodScore || 0), 0) / weekMental.length).toFixed(1)
        : null;

    const avgSleep = weekMental.filter(l => l.sleepQuality !== null).length > 0
        ? (weekMental.reduce((s, l) => s + (l.sleepQuality || 0), 0) / weekMental.length).toFixed(1)
        : null;

    return { avgPain, avgStress, avgMood, avgSleep, days: weekPhysical.length };
}

// ===============================
// STREAK
// ===============================
function getStreak(physicalLogs) {
    if (physicalLogs.length === 0) return 0;

    const today = new Date().toLocaleDateString("en-CA");
    const logDates = new Set(physicalLogs.map(l => l.logDate));

    let streak = 0;
    let current = new Date();

    if (!logDates.has(today)) {
        current.setDate(current.getDate() - 1);
    }

    while (true) {
        const dateStr = current.toLocaleDateString("en-CA");
        if (logDates.has(dateStr)) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [physicalLogs, setPhysicalLogs] = useState([]);
    const [mentalLogs, setMentalLogs] = useState([]);
    const [flares, setFlares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [dismissedCards, setDismissedCards] = useState([]);

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
        let score = Math.round(100 - (pain * 5) - (stress * 3) + (mood * 3) + (sleep * 2));
        const hasActiveFlare = flares.some(f => !f.endDate);
        if (hasActiveFlare) score -= 20;
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
    const today = new Date().toLocaleDateString("en-CA");
    const todayPhysical = physicalLogs.find(l => l.logDate === today);
    const todayMental = mentalLogs.find(l => l.logDate === today);

    const alerts = checkForAlerts(physicalLogs, mentalLogs)
        .filter(a => !dismissedAlerts.includes(a.type));

    const contextualCards = getContextualCards(physicalLogs, mentalLogs)
        .filter(c => !dismissedCards.includes(c.articleId));

    const weeklyRecap = getWeeklyRecap(physicalLogs, mentalLogs);
    const streak = getStreak(physicalLogs);

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

            {/* STREAK */}
            {streak > 0 && (
                <section className="streak-banner">
                    <span className="streak-fire">🔥</span>
                    <div className="streak-text">
                        <p className="streak-number">{streak} day{streak !== 1 ? "s" : ""} in a row</p>
                        <p className="streak-label">Keep it up — consistency is everything</p>
                    </div>
                    {streak >= 30 && <span className="streak-badge">🏆 Month streak!</span>}
                    {streak >= 7 && streak < 30 && <span className="streak-badge">⭐ Week streak!</span>}
                </section>
            )}

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
                                    <p className="alert-title" style={{ color: alert.color }}>{alert.title}</p>
                                    <p className="alert-message">{alert.message}</p>
                                </div>
                            </div>
                            <button className="alert-dismiss" onClick={() => dismissAlert(alert.type)}>✕</button>
                        </div>
                    ))}
                </section>
            )}

            {/* CONTEXTUAL EDUCATION CARDS */}
            {contextualCards.length > 0 && (
                <section className="contextual-cards">
                    {contextualCards.map((card) => (
                        <div
                            key={card.articleId}
                            className="contextual-card"
                            style={{ borderLeftColor: card.color }}
                        >
                            <div className="contextual-card-content">
                                <span className="contextual-icon">{card.icon}</span>
                                <div className="contextual-text">
                                    <p className="contextual-title">{card.title}</p>
                                    <p className="contextual-summary">{card.summary}</p>
                                    <button
                                        className="contextual-read-btn"
                                        onClick={() => {
                                            navigate("/profile", {
                                                state: {
                                                    openArticle: card.articleId,
                                                    openCategory: getCategoryForArticle(card.articleId)
                                                }
                                            });
                                        }}
                                    >
                                        Read article →
                                    </button>
                                </div>
                            </div>
                            <button
                                className="alert-dismiss"
                                onClick={() => setDismissedCards([...dismissedCards, card.articleId])}
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
                    <Link to="/log/physical" className={`today-card ${todayPhysical ? "done" : "pending"}`}>
                        <span className="today-icon">🩺</span>
                        <span className="today-label">Physical</span>
                        <span className="today-status-badge">
                            {todayPhysical ? "✓ Logged" : "Not yet"}
                        </span>
                    </Link>
                    <Link to="/log/mental" className={`today-card ${todayMental ? "done" : "pending"}`}>
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

            {/* WEEKLY RECAP */}
            {weeklyRecap && (
                <section className="weekly-recap">
                    <h3 className="section-title">This week's averages</h3>
                    <div className="recap-card">
                        <div className="recap-header">
                            <span className="recap-icon">📊</span>
                            <div>
                                <p className="recap-title">Last 7 days</p>
                                <p className="recap-subtitle">{weeklyRecap.days} day{weeklyRecap.days !== 1 ? "s" : ""} logged</p>
                            </div>
                        </div>
                        <div className="recap-stats">
                            {weeklyRecap.avgPain && (
                                <div className="recap-stat">
                                    <span className="recap-stat-value" style={{
                                        color: weeklyRecap.avgPain <= 3 ? "#68d391" :
                                               weeklyRecap.avgPain <= 6 ? "#f6ad55" : "#fc8181"
                                    }}>
                                        {weeklyRecap.avgPain}
                                    </span>
                                    <span className="recap-stat-label">Avg pain</span>
                                </div>
                            )}
                            {weeklyRecap.avgStress && (
                                <div className="recap-stat">
                                    <span className="recap-stat-value" style={{
                                        color: weeklyRecap.avgStress <= 3 ? "#68d391" :
                                               weeklyRecap.avgStress <= 6 ? "#f6ad55" : "#fc8181"
                                    }}>
                                        {weeklyRecap.avgStress}
                                    </span>
                                    <span className="recap-stat-label">Avg stress</span>
                                </div>
                            )}
                            {weeklyRecap.avgMood && (
                                <div className="recap-stat">
                                    <span className="recap-stat-value" style={{ color: "#68d391" }}>
                                        {weeklyRecap.avgMood}
                                    </span>
                                    <span className="recap-stat-label">Avg mood</span>
                                </div>
                            )}
                            {weeklyRecap.avgSleep && (
                                <div className="recap-stat">
                                    <span className="recap-stat-value" style={{ color: "#76e4f7" }}>
                                        {weeklyRecap.avgSleep}
                                    </span>
                                    <span className="recap-stat-label">Avg sleep</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* RECENT ACTIVITY */}
            <section className="recent-activity">
                <h3 className="section-title">Recent activity</h3>
                {recentActivity.length === 0 ? (
                    <EmptyState
                        icon="🌿"
                        title="No activity yet"
                        message="Start your first daily check-in to see your activity here."
                    />
                ) : (
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
                )}
            </section>

        </div>
    );
}