import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LogHubPage.css";

export default function LogHubPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("physical");

    return (
        <div className="log-hub-page">
            <header className="page-header">
                <h1 className="page-header-title">📋 Log</h1>
            </header>

            {/* LOG TYPE CARDS */}
            <section className="log-type-section">
                <h3 className="section-title">Log something new</h3>
                <div className="log-type-grid">
                    <Link to="/log/physical" className="log-type-card">
                        <span className="log-type-icon">🩺</span>
                        <span className="log-type-label">Physical symptoms</span>
                        <span className="log-type-arrow">→</span>
                    </Link>
                    <Link to="/log/mental" className="log-type-card">
                        <span className="log-type-icon">🧠</span>
                        <span className="log-type-label">Mood & stress</span>
                        <span className="log-type-arrow">→</span>
                    </Link>
                    <Link to="/log/meal" className="log-type-card">
                        <span className="log-type-icon">🥗</span>
                        <span className="log-type-label">Meal</span>
                        <span className="log-type-arrow">→</span>
                    </Link>
                    <Link to="/log/flare" className="log-type-card">
                        <span className="log-type-icon">🔥</span>
                        <span className="log-type-label">Flare</span>
                        <span className="log-type-arrow">→</span>
                    </Link>
                </div>
            </section>

            {/* HISTORY TABS */}
            <section className="history-section">
                <h3 className="section-title">Past logs</h3>
                <div className="history-tabs">
                    {["physical", "mental", "meals", "flares"].map((tab) => (
                        <button
                            key={tab}
                            className={`history-tab ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="history-content">
                    <p className="history-coming-soon">
                        History for {activeTab} logs coming next — we're building it now!
                    </p>
                </div>
            </section>
        </div>
    );
}