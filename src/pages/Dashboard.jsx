import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPhysicalLogs, getMentalLogs, getFlares } from "../api/api";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
    const { user, handleLogout } = useAuth();
    const [physicalLogs, setPhysicalLogs] = useState([]);
    const [mentalLogs, setMentalLogs] = useState([]);
    const [flares, setFlares] = useState([]);
    const [loading, setLoading] = useState(true);

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
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // ===============================
    // GUT READINESS SCORE
    // Synthesizes last entry's sleep, stress, mood, pain
    // ===============================
    function getReadinessScore() {
        if (!physicalLogs.length || !mentalLogs.length) return null;

        const lastPhysical = physicalLogs[0];
        const lastMental = mentalLogs[0];

        const pain = lastPhysical.painScore || 0;
        const stress = lastMental.stressScore || 0;
        const mood = lastMental.moodScore || 5;
        const sleep = lastMental.sleepQuality || 5;

        // Higher pain/stress = lower score, higher mood/sleep = higher score
        const score = Math.round(
            100 - (pain * 5) - (stress * 3) + (mood * 3) + (sleep * 2)
        );

        return Math.max(0, Math.min(100, score));
    }

    function getReadinessLabel(score) {
        if (score === null) return { label: "No data yet", color: "#4a5568", emoji: "📊" };
        if (score >= 70) return { label: "Good day ahead", color: "#68d391", emoji: "🟢" };
        if (score >= 40) return { label: "Take it easy", color: "#f6ad55", emoji: "🟡" };
        return { label: "Be gentle with yourself", color: "#fc8181", emoji: "🔴" };
    }

    const readiness = getReadinessScore();
    const readinessInfo = getReadinessLabel(readiness);

    const todayLogged = physicalLogs.some(
        (l) => l.logDate === new Date().toISOString().split("T")[0]
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">🌿</div>
                <p>Loading your health data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* HEADER */}
            <header className="dashboard-header">
                <div className="header-left">
                    <span className="header-logo">🌿</span>
                    <span className="header-title">Flara</span>
                </div>
                <div className="header-right">
                    <span className="header-user">Hi, {user?.username}</span>
                    <button className="logout-btn" onClick={handleLogout}>Sign out</button>
                </div>
            </header>

            <main className="dashboard-main">

                {/* GUT READINESS SCORE */}
                <section className="readiness-card">
                    <div className="readiness-score-wrapper">
                        <div
                            className="readiness-circle"
                            style={{ borderColor: readinessInfo.color }}
                        >
                            <span className="readiness-number">
                                {readiness !== null ? readiness : "--"}
                            </span>
                            <span className="readiness-label-small">/ 100</span>
                        </div>
                        <div className="readiness-info">
                            <h2 className="readiness-title">
                                {readinessInfo.emoji} {readinessInfo.label}
                            </h2>
                            <p className="readiness-subtitle">
                                Your Gut Readiness Score is based on yesterday's pain, stress, mood, and sleep.
                            </p>
                            {readiness === null && (
                                <p className="readiness-hint">
                                    Log your first daily check-in to see your score.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* QUICK LOG PROMPT */}
                {!todayLogged && (
                    <section className="log-prompt">
                        <p>📋 You haven't logged today yet.</p>
                        <Link to="/log/physical" className="log-prompt-btn">
                            Start today's check-in →
                        </Link>
                    </section>
                )}

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
                        <span className="stat-label">Flares recorded</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🧠</span>
                        <span className="stat-number">{mentalLogs.length}</span>
                        <span className="stat-label">Mental check-ins</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">💊</span>
                        <span className="stat-number">
                            {physicalLogs.length > 0
                                ? Math.round(
                                    physicalLogs.filter(
                                        (l) => l.painScore !== null && l.painScore <= 3
                                    ).length / physicalLogs.length * 100
                                )
                                : "--"}%
                        </span>
                        <span className="stat-label">Low pain days</span>
                    </div>
                </section>

                {/* QUICK ACTIONS */}
                <section className="quick-actions">
                    <h3 className="section-title">Quick actions</h3>
                    <div className="actions-grid">
                        <Link to="/log/physical" className="action-card">
                            <span className="action-icon">🩺</span>
                            <span className="action-label">Log physical symptoms</span>
                        </Link>
                        <Link to="/log/mental" className="action-card">
                            <span className="action-icon">🧠</span>
                            <span className="action-label">Log mood & stress</span>
                        </Link>
                        <Link to="/meals" className="action-card">
                            <span className="action-icon">🥗</span>
                            <span className="action-label">Log a meal</span>
                        </Link>
                        <Link to="/flares" className="action-card">
                            <span className="action-icon">🔥</span>
                            <span className="action-label">Record a flare</span>
                        </Link>
                    </div>
                </section>

                {/* RECENT PHYSICAL LOGS */}
                {physicalLogs.length > 0 && (
                    <section className="recent-logs">
                        <h3 className="section-title">Recent physical logs</h3>
                        <div className="logs-list">
                            {physicalLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="log-row">
                                    <span className="log-date">{log.logDate}</span>
                                    <span className="log-pain">
                                        Pain: <strong>{log.painScore ?? "--"}/10</strong>
                                    </span>
                                    <span className="log-bowel">
                                        Bowel: <strong>{log.bowelFrequency ?? "--"}x</strong>
                                    </span>
                                    <span className="log-energy">
                                        Energy: <strong>{log.energyLevel ?? "--"}/10</strong>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}