import { useState, useEffect } from "react";
import { getPhysicalLogs, getMentalLogs, getFlares } from "../api/api";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import "./TrendsPage.css";

export default function TrendsPage() {
    const [physicalLogs, setPhysicalLogs] = useState([]);
    const [mentalLogs, setMentalLogs] = useState([]);
    const [flares, setFlares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState(30);

    useEffect(() => {
        async function load() {
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
                console.error("Failed to load trends data", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ===============================
    // BUILD CHART DATA
    // Merge physical and mental logs by date
    // ===============================
    function buildChartData() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - activeRange);

        const dateMap = {};

        physicalLogs
            .filter(l => new Date(l.logDate) >= cutoff)
            .forEach(l => {
                if (!dateMap[l.logDate]) dateMap[l.logDate] = { date: l.logDate };
                dateMap[l.logDate].pain = l.painScore ?? null;
                dateMap[l.logDate].energy = l.energyLevel ?? null;
                dateMap[l.logDate].bowel = l.bowelFrequency ?? null;
            });

        mentalLogs
            .filter(l => new Date(l.logDate) >= cutoff)
            .forEach(l => {
                if (!dateMap[l.logDate]) dateMap[l.logDate] = { date: l.logDate };
                dateMap[l.logDate].stress = l.stressScore ?? null;
                dateMap[l.logDate].mood = l.moodScore ?? null;
                dateMap[l.logDate].sleep = l.sleepQuality ?? null;
                dateMap[l.logDate].anxiety = l.anxietyScore ?? null;
            });

        return Object.values(dateMap).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    }

    // ===============================
    // FLARE DATES for reference lines
    // ===============================
    function getFlareData() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - activeRange);
        return flares
            .filter(f => new Date(f.startDate) >= cutoff)
            .map(f => f.startDate);
    }

    // ===============================
    // INSIGHTS
    // ===============================
    function generateInsights() {
		const insights = [];
		const chartData = buildChartData();

		if (chartData.length < 3) return insights;

		// Check stress before flare pattern
		flares.forEach(flare => {
			const flareDate = new Date(flare.startDate);
			const threeDaysBefore = new Date(flareDate);
			threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

			const stressBeforeFlare = chartData.filter(d => {
				const date = new Date(d.date);
				return date >= threeDaysBefore && date < flareDate && d.stress !== null;
			});

			if (stressBeforeFlare.length > 0) {
				const avgStress = stressBeforeFlare.reduce((s, d) => s + d.stress, 0) / stressBeforeFlare.length;
				if (avgStress >= 6) {
					insights.push({
						type: "warning",
						text: `High stress (avg ${avgStress.toFixed(1)}/10) was recorded in the 3 days before your flare on ${flare.startDate}.`,
					});
				}
			}
		});

		// Average pain
		const painDays = chartData.filter(d => d.pain !== null && d.pain !== undefined);
		if (painDays.length > 0) {
			const avgPain = painDays.reduce((s, d) => s + d.pain, 0) / painDays.length;
			insights.push({
				type: avgPain <= 3 ? "positive" : avgPain <= 6 ? "neutral" : "warning",
				text: `Your average pain score over the last ${activeRange} days is ${avgPain.toFixed(1)}/10.`,
			});
		}

		// Average stress — only if we have stress data
		const stressDays = chartData.filter(d => d.stress !== null && d.stress !== undefined);
		if (stressDays.length > 0) {
			const avgStress = stressDays.reduce((s, d) => s + d.stress, 0) / stressDays.length;
			insights.push({
				type: avgStress <= 3 ? "positive" : avgStress <= 6 ? "neutral" : "warning",
				text: `Your average stress score over the last ${activeRange} days is ${avgStress.toFixed(1)}/10.`,
			});
		}

		// Average sleep — only if we have sleep data
		const sleepDays = chartData.filter(d => d.sleep !== null && d.sleep !== undefined);
		if (sleepDays.length > 0) {
			const avgSleep = sleepDays.reduce((s, d) => s + d.sleep, 0) / sleepDays.length;
			insights.push({
				type: avgSleep >= 7 ? "positive" : avgSleep >= 5 ? "neutral" : "warning",
				text: `Your average sleep quality over the last ${activeRange} days is ${avgSleep.toFixed(1)}/10.`,
			});
		}

		return insights;
	}

    const chartData = buildChartData();
    const flareDates = getFlareData();
    const insights = generateInsights();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-date">{label}</p>
                    {payload.map((entry) => (
                        <p key={entry.name} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}/10
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="trends-page">
                <header className="page-header">
                    <h1 className="page-header-title">📈 Trends</h1>
                </header>
                <div className="coming-soon">
                    <div className="loading-spinner">🌿</div>
                    <p>Loading your trends...</p>
                </div>
            </div>
        );
    }

    const hasEnoughData = chartData.length >= 2;

    return (
        <div className="trends-page">
            <header className="page-header">
                <h1 className="page-header-title">📈 Trends</h1>
            </header>

            <div className="trends-content">

                {/* RANGE SELECTOR */}
                <div className="range-selector">
                    {[7, 14, 30, 90].map((days) => (
                        <button
                            key={days}
                            className={`range-btn ${activeRange === days ? "active" : ""}`}
                            onClick={() => setActiveRange(days)}
                        >
                            {days}d
                        </button>
                    ))}
                </div>

                {!hasEnoughData ? (
                    <div className="not-enough-data">
                        <span className="not-enough-icon">📊</span>
                        <h3>Not enough data yet</h3>
                        <p>Log at least 2 days of physical and mental check-ins to see your trends.</p>
                    </div>
                ) : (
                    <>
                        {/* MIND-GUT CORRELATION CHART */}
                        <section className="chart-section">
                            <h3 className="chart-title">🧠🩺 Mind-Gut Correlation</h3>
                            <p className="chart-subtitle">Pain, stress, mood, and sleep overlaid — look for patterns before flares</p>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d4a7a44" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: "#8892a4", fontSize: 10 }}
                                            tickFormatter={(d) => d.slice(5)}
                                        />
                                        <YAxis
                                            domain={[0, 10]}
                                            tick={{ fill: "#8892a4", fontSize: 10 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            wrapperStyle={{ fontSize: "11px", color: "#8892a4" }}
                                        />
                                        {flareDates.map((date) => (
                                            <ReferenceLine
                                                key={date}
                                                x={date}
                                                stroke="#fc8181"
                                                strokeDasharray="4 2"
                                                label={{ value: "🔥", position: "top", fontSize: 12 }}
                                            />
                                        ))}
                                        <Line
                                            type="monotone"
                                            dataKey="pain"
                                            stroke="#fc8181"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Pain"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="stress"
                                            stroke="#f6ad55"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Stress"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="mood"
                                            stroke="#68d391"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Mood"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="sleep"
                                            stroke="#76e4f7"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Sleep"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            {flareDates.length > 0 && (
                                <p className="chart-legend-note">🔥 Red dashed lines mark flare start dates</p>
                            )}
                        </section>

                        {/* ENERGY & ANXIETY CHART */}
                        <section className="chart-section">
                            <h3 className="chart-title">⚡ Energy & Anxiety</h3>
                            <p className="chart-subtitle">Track how your energy and anxiety levels shift over time</p>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d4a7a44" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: "#8892a4", fontSize: 10 }}
                                            tickFormatter={(d) => d.slice(5)}
                                        />
                                        <YAxis
                                            domain={[0, 10]}
                                            tick={{ fill: "#8892a4", fontSize: 10 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: "11px", color: "#8892a4" }} />
                                        <Line
                                            type="monotone"
                                            dataKey="energy"
                                            stroke="#c8a97e"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Energy"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="anxiety"
                                            stroke="#b794f4"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                            name="Anxiety"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
						
						{/* BOWEL FREQUENCY CHART */}
						<section className="chart-section">
							<h3 className="chart-title">🚽 Bowel Frequency</h3>
							<p className="chart-subtitle">Daily bowel movements — a key clinical indicator for IBD activity</p>
							<div className="chart-wrapper">
								<ResponsiveContainer width="100%" height={220}>
									<LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="#2d4a7a44" />
										<XAxis
											dataKey="date"
											tick={{ fill: "#8892a4", fontSize: 10 }}
											tickFormatter={(d) => d.slice(5)}
										/>
										<YAxis
											domain={[0, 'auto']}
											tick={{ fill: "#8892a4", fontSize: 10 }}
										/>
										<Tooltip content={({ active, payload, label }) => {
											if (active && payload && payload.length) {
												return (
													<div className="chart-tooltip">
														<p className="tooltip-date">{label}</p>
														{payload.map((entry) => (
															<p key={entry.name} style={{ color: entry.color }}>
																{entry.name}: {entry.value} movements
															</p>
														))}
													</div>
												);
											}
											return null;
										}} />
										<Legend wrapperStyle={{ fontSize: "11px", color: "#8892a4" }} />
										{flareDates.map((date) => (
											<ReferenceLine
												key={date}
												x={date}
												stroke="#fc8181"
												strokeDasharray="4 2"
											/>
										))}
										<Line
											type="monotone"
											dataKey="bowel"
											stroke="#c8a97e"
											strokeWidth={2}
											dot={{ r: 3 }}
											connectNulls
											name="Bowel movements"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</section>

                        {/* INSIGHTS */}
                        <section className="insights-section">
							<h3 className="chart-title">💡 Insights</h3>
							{insights.length > 0 ? (
								<div className="insights-list">
									{insights.map((insight, i) => (
										<div key={i} className={`insight-card ${insight.type}`}>
											<span className="insight-icon">
												{insight.type === "positive" ? "✅" :
												insight.type === "warning" ? "⚠️" : "ℹ️"}
											</span>
											<p>{insight.text}</p>
										</div>
									))}
								</div>
							) : (
								<div className="insight-card neutral" style={{ marginTop: 12 }}>
									<span className="insight-icon">📊</span>
									<p>Continue logging to generate insights. At least 3 days of data is needed to identify patterns.</p>
								</div>
							)}
						</section>

                        {/* FLARE SUMMARY */}
                        {flares.length > 0 && (
                            <section className="chart-section">
                                <h3 className="chart-title">🔥 Flare History</h3>
                                <div className="flare-summary-list">
                                    {flares.slice(0, 5).map((flare) => (
                                        <div key={flare.id} className="flare-summary-card">
                                            <div className="flare-summary-header">
                                                <span className="flare-summary-date">{flare.startDate}</span>
                                                <span className="flare-summary-severity">
                                                    Severity {flare.severity ?? "--"}/10
                                                </span>
                                            </div>
                                            {flare.mentalContext && (
                                                <p className="flare-summary-context">
                                                    🧠 {flare.mentalContext}
                                                </p>
                                            )}
                                            {flare.potentialTriggers && (
                                                <p className="flare-summary-triggers">
                                                    ⚠️ {flare.potentialTriggers}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}