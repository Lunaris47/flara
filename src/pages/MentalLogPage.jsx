import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMentalLog } from "../api/api";
import "./LogPage.css";

// ===============================
// GUIDED STRESS QUESTIONS
// ===============================
const STRESS_QUESTIONS = [
    {
        id: "overwhelmed",
        question: "How overwhelmed have you felt today?",
        options: [
            { label: "Not at all — I feel calm and in control", value: 0 },
            { label: "Slightly — a few things on my mind but manageable", value: 1 },
            { label: "Somewhat — I feel stretched thin", value: 2 },
            { label: "Very — I'm struggling to keep up", value: 3 },
            { label: "Extremely — I feel completely overwhelmed", value: 4 },
        ],
    },
    {
        id: "control",
        question: "Has anything happened today that felt out of your control?",
        options: [
            { label: "Nothing — things felt predictable", value: 0 },
            { label: "One small thing", value: 1 },
            { label: "A few things", value: 2 },
            { label: "Several things — it felt like nothing went right", value: 3 },
            { label: "Everything felt out of my control", value: 4 },
        ],
    },
    {
        id: "body",
        question: "How has your body felt today? (physical signs of stress)",
        options: [
            { label: "Relaxed — no tension", value: 0 },
            { label: "Slightly tense shoulders or jaw", value: 1 },
            { label: "Noticeable muscle tension or headache", value: 2 },
            { label: "Significant tension, headache, or restlessness", value: 3 },
            { label: "Chest tightness, racing heart, or difficulty breathing", value: 4 },
        ],
    },
    {
        id: "mind",
        question: "How has your mind felt today?",
        options: [
            { label: "Clear and focused", value: 0 },
            { label: "Slightly distracted", value: 1 },
            { label: "Hard to concentrate", value: 2 },
            { label: "Racing thoughts, hard to settle", value: 3 },
            { label: "Couldn't stop worrying or ruminating", value: 4 },
        ],
    },
    {
        id: "ibd",
        question: "Did you feel anxious or worried about your IBD specifically today?",
        options: [
            { label: "Not at all", value: 0 },
            { label: "A little — it crossed my mind", value: 1 },
            { label: "Somewhat — I spent some time worried about it", value: 2 },
            { label: "A lot — it was hard to think about anything else", value: 3 },
            { label: "Constantly — my IBD anxiety was very present today", value: 4 },
        ],
    },
];

function calculateStressScore(answers) {
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const max = 20;
    return Math.round((total / max) * 10);
}

export default function MentalLogPage() {
    const navigate = useNavigate();

    const [phase, setPhase] = useState("stress"); // stress | details | submit
    const [stressStep, setStressStep] = useState(0);
    const [stressAnswers, setStressAnswers] = useState({});
    const [details, setDetails] = useState({
        moodScore: "",
        anxietyScore: "",
        sleepQuality: "",
        sleepHours: "",
        stressEventType: "NONE",
        meditationDone: false,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleStressAnswer(value) {
        const question = STRESS_QUESTIONS[stressStep];
        const newAnswers = { ...stressAnswers, [question.id]: value };
        setStressAnswers(newAnswers);

        if (stressStep < STRESS_QUESTIONS.length - 1) {
            setStressStep(stressStep + 1);
        } else {
            setPhase("details");
        }
    }

    function handleDetailChange(e) {
        const { name, value, type, checked } = e.target;
        setDetails({
            ...details,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    async function handleSubmit() {
        setLoading(true);
        setError("");

        const stressScore = calculateStressScore(stressAnswers);

        try {
            await saveMentalLog({
                stressScore,
                stressAnswers: JSON.stringify(stressAnswers),
                moodScore: details.moodScore ? Number(details.moodScore) : null,
                anxietyScore: details.anxietyScore ? Number(details.anxietyScore) : null,
                sleepQuality: details.sleepQuality ? Number(details.sleepQuality) : null,
                sleepHours: details.sleepHours ? Number(details.sleepHours) : null,
                stressEventType: details.stressEventType,
                meditationDone: details.meditationDone,
                notes: details.notes || null,
            });
            navigate("/dashboard");
        } catch (err) {
            setError("Could not save your log. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ===============================
    // STRESS QUESTION PHASE
    // ===============================
    if (phase === "stress") {
        const question = STRESS_QUESTIONS[stressStep];
        const progress = (stressStep / STRESS_QUESTIONS.length) * 100;

        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
                    <h1 className="log-title">🧠 Mental Check-in</h1>
                </div>

                <div className="log-card">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="step-counter">Question {stressStep + 1} of {STRESS_QUESTIONS.length}</p>

                    <h2 className="guided-question">{question.question}</h2>

                    <div className="options-list">
                        {question.options.map((option) => (
                            <button
                                key={option.label}
                                className="option-btn"
                                onClick={() => handleStressAnswer(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {stressStep > 0 && (
                        <button
                            className="back-step-btn"
                            onClick={() => setStressStep(stressStep - 1)}
                        >
                            ← Previous question
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===============================
    // DETAILS PHASE
    // ===============================
    if (phase === "details") {
        const stressScore = calculateStressScore(stressAnswers);

        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => setPhase("stress")}>← Back</button>
                    <h1 className="log-title">🧠 Mental Check-in</h1>
                </div>

                <div className="log-card">

                    {/* STRESS SCORE RESULT */}
                    <div className="score-result">
                        <div className="score-circle">
                            <span className="score-num">{stressScore}</span>
                            <span className="score-denom">/10</span>
                        </div>
                        <div>
                            <p className="score-label">Your stress score today</p>
                            <p className="score-sublabel">
                                {stressScore <= 2 ? "Low stress — great day 🟢" :
                                 stressScore <= 4 ? "Mild stress 🟡" :
                                 stressScore <= 6 ? "Moderate stress 🟠" :
                                 stressScore <= 8 ? "High stress 🔴" :
                                 "Very high stress 🔴"}
                            </p>
                            <p className="score-sublabel" style={{ marginTop: 6, fontSize: "0.8rem", color: "#4a5568" }}>
                                High stress can affect gut inflammation. Try to build in some rest today if you can.
                            </p>
                        </div>
                    </div>

                    {/* MOOD & ANXIETY */}
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Mood & anxiety</h3>
                        <div className="form-row-log">
                            <div className="form-group-log">
                                <label>Mood today (1–10)</label>
                                <input
                                    type="number"
                                    name="moodScore"
                                    value={details.moodScore}
                                    onChange={handleDetailChange}
                                    placeholder="1 = very low, 10 = great"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div className="form-group-log">
                                <label>Anxiety level (1–10)</label>
                                <input
                                    type="number"
                                    name="anxietyScore"
                                    value={details.anxietyScore}
                                    onChange={handleDetailChange}
                                    placeholder="1 = none, 10 = severe"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SLEEP */}
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Sleep last night</h3>
                        <div className="form-row-log">
                            <div className="form-group-log">
                                <label>Sleep quality (1–10)</label>
                                <input
                                    type="number"
                                    name="sleepQuality"
                                    value={details.sleepQuality}
                                    onChange={handleDetailChange}
                                    placeholder="1 = terrible, 10 = great"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div className="form-group-log">
                                <label>Hours slept</label>
                                <input
                                    type="number"
                                    name="sleepHours"
                                    value={details.sleepHours}
                                    onChange={handleDetailChange}
                                    placeholder="e.g. 7.5"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STRESS EVENT */}
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Stress context</h3>
                        <div className="form-group-log">
                            <label>Was there a specific stressor today?</label>
                            <select
                                name="stressEventType"
                                value={details.stressEventType}
                                onChange={handleDetailChange}
                            >
                                <option value="NONE">No specific stressor</option>
                                <option value="WORK">Work stress</option>
                                <option value="RELATIONSHIPS">Relationship stress</option>
                                <option value="MEDICAL_ANXIETY">Medical anxiety</option>
                                <option value="FINANCIAL">Financial stress</option>
                                <option value="FAMILY">Family stress</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <label className="checkbox-item" style={{ marginTop: 8 }}>
                            <input
                                type="checkbox"
                                name="meditationDone"
                                checked={details.meditationDone}
                                onChange={handleDetailChange}
                            />
                            🧘 I meditated or did mindfulness today
                        </label>
                    </div>

                    {/* NOTES */}
                    <div className="symptom-section">
                        <div className="form-group-log">
                            <label>What's on your mind today? (optional)</label>
                            <textarea
                                name="notes"
                                value={details.notes}
                                onChange={handleDetailChange}
                                placeholder="Any emotional context you want to remember..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && <p className="log-error">{error}</p>}

                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "✓ Save mental check-in"}
                    </button>

                </div>
            </div>
        );
    }
}