import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMealLog } from "../api/api";
import "./LogPage.css";
import "./MealLogPage.css";

const TRIGGER_TAGS = [
    { key: "dairy", label: "🥛 Dairy" },
    { key: "gluten", label: "🌾 Gluten" },
    { key: "spicy", label: "🌶️ Spicy" },
    { key: "highFiber", label: "🥦 High fiber" },
    { key: "rawVegetables", label: "🥗 Raw vegetables" },
    { key: "redMeat", label: "🥩 Red meat" },
    { key: "caffeine", label: "☕ Caffeine" },
    { key: "alcohol", label: "🍺 Alcohol" },
    { key: "processed", label: "🍟 Processed food" },
    { key: "fattyFood", label: "🧈 Fatty food" },
];

export default function MealLogPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        description: "",
        safetyRating: "NEUTRAL",
        selectedTags: [],
        precededFlare: false,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }

    function toggleTag(key) {
        setForm((prev) => ({
            ...prev,
            selectedTags: prev.selectedTags.includes(key)
                ? prev.selectedTags.filter((t) => t !== key)
                : [...prev.selectedTags, key],
        }));
    }

    async function handleSubmit() {
        if (!form.description.trim()) {
            setError("Please describe what you ate.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await saveMealLog({
				logDate: new Date().toLocaleDateString("en-CA"), // formats as YYYY-MM-DD in local time
                description: form.description,
                safetyRating: form.safetyRating,
                triggerTags: form.selectedTags.join(","),
                precededFlare: form.precededFlare,
                notes: form.notes || null,
                mealTime: new Date().toISOString(),
            });
            navigate("/log");
        } catch (err) {
            setError("Could not save your meal. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="log-page">
            <div className="log-header">
                <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                <h1 className="log-title">🥗 Log a Meal</h1>
            </div>

            <div className="log-card">

                {/* DESCRIPTION */}
                <div className="symptom-section">
                    <div className="form-group-log">
                        <label>What did you eat?</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="e.g. Grilled chicken with rice and steamed broccoli"
                            rows={3}
                        />
                    </div>
                </div>

                {/* SAFETY RATING */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">How did this meal feel?</h3>
                    <div className="safety-rating-group">
                        {[
                            { value: "SAFE", label: "✅ Safe", desc: "No issues, felt fine" },
                            { value: "NEUTRAL", label: "😐 Neutral", desc: "Uncertain or too early to tell" },
                            { value: "TRIGGER", label: "⚠️ Trigger", desc: "Caused discomfort or symptoms" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                className={`safety-btn ${form.safetyRating === option.value ? "selected" : ""}`}
                                onClick={() => setForm({ ...form, safetyRating: option.value })}
                            >
                                <span className="safety-label">{option.label}</span>
                                <span className="safety-desc">{option.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* TRIGGER TAGS */}
                <div className="symptom-section">
                    <h3 className="symptom-section-title">IBD trigger ingredients (select all that apply)</h3>
                    <div className="tag-grid">
                        {TRIGGER_TAGS.map((tag) => (
                            <button
                                key={tag.key}
                                className={`tag-btn ${form.selectedTags.includes(tag.key) ? "selected" : ""}`}
                                onClick={() => toggleTag(tag.key)}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRECEDED FLARE */}
                <div className="symptom-section">
                    <label className="checkbox-item">
                        <input
                            type="checkbox"
                            name="precededFlare"
                            checked={form.precededFlare}
                            onChange={handleChange}
                        />
                        🔥 This meal was followed by a flare or worsening symptoms
                    </label>
                </div>

                {/* NOTES */}
                <div className="symptom-section">
                    <div className="form-group-log">
                        <label>Notes (optional)</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Any other details about this meal..."
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
                    {loading ? "Saving..." : "✓ Save meal"}
                </button>

            </div>
        </div>
    );
}