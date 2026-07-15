import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveFlare } from "../api/api";
import "./LogPage.css";

export default function FlareLogPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        severity: "",
        physicalContext: "",
        mentalContext: "",
        potentialTriggers: "",
        resolvedNaturally: false,
        requiredMedicalAttention: false,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }

    async function handleSubmit() {
        if (!form.severity) {
            setError("Please rate the severity of this flare.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await saveFlare({
                startDate: form.startDate,
                endDate: form.endDate || null,
                severity: Number(form.severity),
                physicalContext: form.physicalContext || null,
                mentalContext: form.mentalContext || null,
                potentialTriggers: form.potentialTriggers || null,
                resolvedNaturally: form.resolvedNaturally,
                requiredMedicalAttention: form.requiredMedicalAttention,
                notes: form.notes || null,
            });
            navigate("/log");
        } catch (err) {
            setError("Could not save flare. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="log-page">
            <div className="log-header">
                <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                <h1 className="log-title">🔥 Record a Flare</h1>
            </div>

            <div className="log-card">

                {/* DATES */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Flare dates</h3>
                    <div className="form-row-log">
                        <div className="form-group-log">
                            <label>Start date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group-log">
                            <label>End date (if resolved)</label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* SEVERITY */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Severity</h3>
                    <div className="form-group-log">
                        <label>How severe was this flare? (1–10)</label>
                        <input
                            type="number"
                            name="severity"
                            value={form.severity}
                            onChange={handleChange}
                            placeholder="1 = mild, 10 = severe"
                            min="1"
                            max="10"
                        />
                    </div>
                </div>

                {/* CONTEXT — this is Flara's differentiator */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Context (what was happening before this flare?)</h3>
                    <div className="form-group-log">
                        <label>Physical context</label>
                        <textarea
                            name="physicalContext"
                            value={form.physicalContext}
                            onChange={handleChange}
                            placeholder="e.g. Had been eating poorly, pain increasing over 3 days..."
                            rows={2}
                        />
                    </div>
                    <div className="form-group-log">
                        <label>Mental & emotional context</label>
                        <textarea
                            name="mentalContext"
                            value={form.mentalContext}
                            onChange={handleChange}
                            placeholder="e.g. Very stressed at work, hadn't been sleeping well..."
                            rows={2}
                        />
                    </div>
                    <div className="form-group-log">
                        <label>Potential triggers</label>
                        <textarea
                            name="potentialTriggers"
                            value={form.potentialTriggers}
                            onChange={handleChange}
                            placeholder="e.g. Dairy, high stress period, missed medication dose..."
                            rows={2}
                        />
                    </div>
                </div>

                {/* RESOLUTION */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Resolution</h3>
                    <div className="checkbox-grid">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="resolvedNaturally"
                                checked={form.resolvedNaturally}
                                onChange={handleChange}
                            />
                            ✅ Resolved naturally
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="requiredMedicalAttention"
                                checked={form.requiredMedicalAttention}
                                onChange={handleChange}
                            />
                            🏥 Required medical attention
                        </label>
                    </div>
                </div>

                {/* NOTES */}
                <div className="symptom-section">
                    <div className="form-group-log">
                        <label>Additional notes (optional)</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Anything else you want to remember about this flare..."
                            rows={2}
                        />
                    </div>
                </div>

                {error && <p className="log-error">{error}</p>}

                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "✓ Record flare"}
                </button>

            </div>
        </div>
    );
}