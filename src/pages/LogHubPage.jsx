import { useState } from "react";
import { Link } from "react-router-dom";
import PhysicalLogHistory from "../components/PhysicalLogHistory";
import MentalLogHistory from "../components/MentalLogHistory";
import MealLogHistory from "../components/MealLogHistory";
import FlareHistory from "../components/FlareHistory";
import "./LogHubPage.css";

export default function LogHubPage() {
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
                    {[
                        { key: "physical", label: "🩺 Physical" },
                        { key: "mental", label: "🧠 Mental" },
                        { key: "meals", label: "🥗 Meals" },
                        { key: "flares", label: "🔥 Flares" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`history-tab ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="history-content">
                    {activeTab === "physical" && <PhysicalLogHistory />}
                    {activeTab === "mental" && <MentalLogHistory />}
                    {activeTab === "meals" && <MealLogHistory />}
					{activeTab === "flares" && <FlareHistory />}
                </div>
            </section>
        </div>
    );
}