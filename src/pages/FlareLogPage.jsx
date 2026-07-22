import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveFlare, updateFlare, getFlares } from "../api/api";
import Toast from "../components/Toast";
import "./LogPage.css";

export default function FlareLogPage() {
    const navigate = useNavigate();
    const [ongoingFlare, setOngoingFlare] = useState(null);
    const [checkingFlares, setCheckingFlares] = useState(true);
    const [mode, setMode] = useState(null);
    const [form, setForm] = useState({
        startDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        endDate: "",
        severity: "",
        physicalContext: "",
        mentalContext: "",
        potentialTriggers: "",
        resolvedNaturally: false,
        requiredMedicalAttention: false,
        notes: "",
    });
    const [symptomDate, setSymptomDate] = useState(new Date().toLocaleDateString("en-CA"));
    const [symptomNotes, setSymptomNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        async function checkOngoing() {
            try {
                const res = await getFlares();
                const ongoing = res.data.find(f => !f.endDate);
                setOngoingFlare(ongoing || null);
            } catch (err) {
                console.error("Failed to check flares", err);
            } finally {
                setCheckingFlares(false);
            }
        }
        checkOngoing();
    }, []);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }

    function formatStartDate(dateStr) {
		if (!dateStr) return "--";
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-CA") + " " +
			date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
	}

    async function handleSubmitNew() {
        setLoading(true);
        setError("");
        try {
            await saveFlare({
                startDate: form.startDate ? form.startDate.replace("Z", "") : null,
                endDate: form.endDate ? form.endDate.replace("Z", "") : null,
                severity: form.severity ? Number(form.severity) : null,
                physicalContext: form.physicalContext || null,
                mentalContext: form.mentalContext || null,
                potentialTriggers: form.potentialTriggers || null,
                resolvedNaturally: form.endDate ? form.resolvedNaturally : false,
                requiredMedicalAttention: form.endDate ? form.requiredMedicalAttention : false,
                notes: form.notes || null,
            });
            setToastMessage("Flare recorded! 🔥");
            setShowToast(true);
            setTimeout(() => navigate("/log"), 2000);
        } catch (err) {
            setError("Could not save flare. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResolve() {
        if (!form.endDate) {
            setError("Please enter an end date and time to resolve the flare.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await updateFlare(ongoingFlare.id, {
                ...ongoingFlare,
                endDate: form.endDate.replace("Z", ""),
                resolvedNaturally: form.resolvedNaturally,
                requiredMedicalAttention: form.requiredMedicalAttention,
                notes: form.notes || ongoingFlare.notes,
            });
            setToastMessage("Flare resolved! ✅");
            setShowToast(true);
            setTimeout(() => navigate("/log"), 2000);
        } catch (err) {
            setError("Could not resolve flare. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSymptoms() {
        if (!symptomNotes.trim()) {
            setError("Please describe your symptoms for this date.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const existingNotes = ongoingFlare.notes || "";
            const updatedNotes = existingNotes
                ? `${existingNotes}\n\n[${symptomDate}] ${symptomNotes}`
                : `[${symptomDate}] ${symptomNotes}`;
            await updateFlare(ongoingFlare.id, { ...ongoingFlare, notes: updatedNotes });
            setToastMessage("Symptoms added! 📝");
            setShowToast(true);
            setTimeout(() => navigate("/log"), 2000);
        } catch (err) {
            setError("Could not update flare. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (checkingFlares) {
        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                    <h1 className="log-title">🔥 Flare</h1>
                </div>
                <div className="log-card">
                    <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Checking flare status...</p>
                </div>
            </div>
        );
    }

    if (ongoingFlare && mode === null) {
        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                    <h1 className="log-title">🔥 Flare</h1>
                </div>
                <div className="log-card">
                    <div className="ongoing-flare-banner">
                        <span className="ongoing-icon">🔥</span>
                        <div>
                            <p className="ongoing-title">You have an ongoing flare</p>
                            <p className="ongoing-subtitle">
                                Started {formatStartDate(ongoingFlare.startDate)}
                            </p>
                        </div>
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center" }}>
                        What would you like to do?
                    </p>
                    <div className="flare-mode-grid">
                        <button className="flare-mode-btn" onClick={() => setMode("symptoms")}>
                            <span className="flare-mode-icon">📝</span>
                            <span className="flare-mode-label">Log symptoms for a specific date</span>
                            <span className="flare-mode-desc">Add notes for a day during the ongoing flare</span>
                        </button>
                        <button className="flare-mode-btn" onClick={() => setMode("resolve")}>
                            <span className="flare-mode-icon">✅</span>
                            <span className="flare-mode-label">Resolve this flare</span>
                            <span className="flare-mode-desc">Mark the flare as ended and record resolution details</span>
                        </button>
                        <button className="flare-mode-btn" onClick={() => setMode("new")}>
                            <span className="flare-mode-icon">➕</span>
                            <span className="flare-mode-label">Log a new separate flare</span>
                            <span className="flare-mode-desc">Record a different flare episode</span>
                        </button>
                    </div>
                </div>
                <Toast message={toastMessage} visible={showToast} onHide={() => setShowToast(false)} />
            </div>
        );
    }

    if (mode === "symptoms") {
        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
                    <h1 className="log-title">📝 Log Symptoms</h1>
                </div>
                <div className="log-card">
                    <div className="ongoing-flare-banner">
                        <span className="ongoing-icon">🔥</span>
                        <div>
                            <p className="ongoing-title">Adding to ongoing flare</p>
                            <p className="ongoing-subtitle">
                                Started {formatStartDate(ongoingFlare.startDate)}
                            </p>
                        </div>
                    </div>
                    <div className="symptom-section">
                        <div className="form-group-log">
                            <label>Date of symptoms</label>
                            <input
                                type="date"
                                value={symptomDate}
                                onChange={(e) => setSymptomDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group-log">
                            <label>Symptoms on this date</label>
                            <textarea
                                value={symptomNotes}
                                onChange={(e) => setSymptomNotes(e.target.value)}
                                placeholder="Describe your symptoms for this specific day..."
                                rows={4}
                            />
                        </div>
                    </div>
                    {error && <p className="log-error">{error}</p>}
                    <button className="submit-btn" onClick={handleAddSymptoms} disabled={loading}>
                        {loading ? "Saving..." : "✓ Add symptoms"}
                    </button>
                </div>
                <Toast message={toastMessage} visible={showToast} onHide={() => setShowToast(false)} />
            </div>
        );
    }

    if (mode === "resolve") {
        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
                    <h1 className="log-title">✅ Resolve Flare</h1>
                </div>
                <div className="log-card">
                    <div className="ongoing-flare-banner">
                        <span className="ongoing-icon">🔥</span>
                        <div>
                            <p className="ongoing-title">Resolving flare</p>
                            <p className="ongoing-subtitle">
                                Started {formatStartDate(ongoingFlare.startDate)}
                            </p>
                        </div>
                    </div>
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">End date & time</h3>
                        <div className="form-group-log">
                            <label>When did the flare end?</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {form.endDate && (
                        <>
                            <div className="symptom-section">
                                <h3 className="symptom-section-title">Resolution</h3>
                                <div className="checkbox-grid">
                                    <label className="checkbox-item">
                                        <input type="checkbox" name="resolvedNaturally" checked={form.resolvedNaturally} onChange={handleChange} />
                                        ✅ Resolved naturally
                                    </label>
                                    <label className="checkbox-item">
                                        <input type="checkbox" name="requiredMedicalAttention" checked={form.requiredMedicalAttention} onChange={handleChange} />
                                        🏥 Required medical attention
                                    </label>
                                </div>
                            </div>
                            <div className="symptom-section">
                                <div className="form-group-log">
                                    <label>Additional notes (optional)</label>
                                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any final notes about this flare..." rows={2} />
                                </div>
                            </div>
                        </>
                    )}
                    {error && <p className="log-error">{error}</p>}
                    <button
                        className="submit-btn"
                        onClick={handleResolve}
                        disabled={loading || !form.endDate}
                        style={{ opacity: !form.endDate ? 0.5 : 1 }}
                    >
                        {loading ? "Saving..." : "✓ Resolve flare"}
                    </button>
                </div>
                <Toast message={toastMessage} visible={showToast} onHide={() => setShowToast(false)} />
            </div>
        );
    }

    return (
        <div className="log-page">
            <div className="log-header">
                <button className="back-btn" onClick={() => ongoingFlare ? setMode(null) : navigate("/log")}>← Back</button>
                <h1 className="log-title">🔥 Record a Flare</h1>
            </div>
            <div className="log-card">
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Flare dates & times</h3>
                    <div className="form-row-log">
                        <div className="form-group-log">
                            <label>Start date & time</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group-log">
                            <label>End date & time (leave blank if ongoing)</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="symptom-section">
                    <h3 className="symptom-section-title">Severity</h3>
                    <div className="form-group-log">
                        <label>How severe is this flare? (1–10)</label>
                        <input type="number" name="severity" value={form.severity} onChange={handleChange} placeholder="1 = mild, 10 = severe" min="1" max="10" />
                    </div>
                </div>

                <div className="symptom-section">
                    <h3 className="symptom-section-title">Context</h3>
                    <div className="form-group-log">
                        <label>Physical context</label>
                        <textarea name="physicalContext" value={form.physicalContext} onChange={handleChange} placeholder="e.g. Had been eating poorly, pain increasing over 3 days..." rows={2} />
                    </div>
                    <div className="form-group-log">
                        <label>Mental & emotional context</label>
                        <textarea name="mentalContext" value={form.mentalContext} onChange={handleChange} placeholder="e.g. Very stressed at work, hadn't been sleeping well..." rows={2} />
                    </div>
                    <div className="form-group-log">
                        <label>Potential triggers</label>
                        <textarea name="potentialTriggers" value={form.potentialTriggers} onChange={handleChange} placeholder="e.g. Dairy, high stress period, missed medication dose..." rows={2} />
                    </div>
                </div>

                {form.endDate && (
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Resolution</h3>
                        <div className="checkbox-grid">
                            <label className="checkbox-item">
                                <input type="checkbox" name="resolvedNaturally" checked={form.resolvedNaturally} onChange={handleChange} />
                                ✅ Resolved naturally
                            </label>
                            <label className="checkbox-item">
                                <input type="checkbox" name="requiredMedicalAttention" checked={form.requiredMedicalAttention} onChange={handleChange} />
                                🏥 Required medical attention
                            </label>
                        </div>
                    </div>
                )}

                <div className="symptom-section">
                    <div className="form-group-log">
                        <label>Additional notes (optional)</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Anything else to remember about this flare..." rows={2} />
                    </div>
                </div>

                {error && <p className="log-error">{error}</p>}

                <button className="submit-btn" onClick={handleSubmitNew} disabled={loading}>
                    {loading ? "Saving..." : "✓ Record flare"}
                </button>
            </div>
            <Toast message={toastMessage} visible={showToast} onHide={() => setShowToast(false)} />
        </div>
    );
}