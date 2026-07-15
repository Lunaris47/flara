import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { savePhysicalLog, getPhysicalLogByDate } from "../api/api";
import "./LogPage.css";

// ===============================
// GUIDED PAIN QUESTIONS
// ===============================
const PAIN_QUESTIONS = [
    {
        id: "location",
        question: "Where is your pain right now?",
        options: [
            { label: "No pain at all", value: 0 },
            { label: "Mild discomfort I can ignore", value: 1 },
            { label: "Noticeable pain but I can go about my day", value: 2 },
            { label: "Pain that's hard to ignore and slowing me down", value: 3 },
            { label: "Severe pain that's stopping me from normal activities", value: 4 },
            { label: "Unbearable pain", value: 5 },
        ],
    },
    {
        id: "type",
        question: "How would you describe the pain?",
        options: [
            { label: "No pain", value: 0 },
            { label: "Dull ache or pressure", value: 1 },
            { label: "Cramping that comes and goes", value: 2 },
            { label: "Constant cramping or sharp pain", value: 3 },
            { label: "Intense cramping with no relief", value: 4 },
        ],
    },
    {
        id: "eating",
        question: "Has pain affected your ability to eat today?",
        options: [
            { label: "No — I ate normally", value: 0 },
            { label: "I ate less than usual because of discomfort", value: 1 },
            { label: "I could only manage small amounts", value: 2 },
            { label: "I couldn't eat at all", value: 3 },
        ],
    },
    {
        id: "activity",
        question: "Has pain affected your ability to move or do normal activities?",
        options: [
            { label: "No — I moved normally", value: 0 },
            { label: "I slowed down a little", value: 1 },
            { label: "I avoided certain activities", value: 2 },
            { label: "I stayed in bed or on the couch for most of the day", value: 3 },
        ],
    },
];

function calculatePainScore(answers) {
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const max = 16;
    return Math.round((total / max) * 10);
}

export default function PhysicalLogPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [alreadyLogged, setAlreadyLogged] = useState(false);
    const [checkingLog, setCheckingLog] = useState(true);
    const [phase, setPhase] = useState("pain");
    const [painStep, setPainStep] = useState(0);
    const [painAnswers, setPainAnswers] = useState({});
    const [symptoms, setSymptoms] = useState({
        bowelFrequency: "",
        bristolType: "",
        bloodPresence: "NONE",
        fatigue: false,
        jointPain: false,
        nausea: false,
        fever: false,
        bloating: false,
        perianalDiscomfort: false,
        mouthSores: false,
        skinIssues: false,
        rectalBleeding: false,
        urgency: false,
        tenesmus: false,
        energyLevel: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isCrohns = user?.condition === "CROHNS";

    useEffect(() => {
        async function checkToday() {
            try {
                const today = new Date().toISOString().split("T")[0];
                const res = await getPhysicalLogByDate(today);
                if (res.data) setAlreadyLogged(true);
            } catch (err) {
                // No log found for today — that's fine
            } finally {
                setCheckingLog(false);
            }
        }
        checkToday();
    }, []);

    function handlePainAnswer(value) {
        const question = PAIN_QUESTIONS[painStep];
        const newAnswers = { ...painAnswers, [question.id]: value };
        setPainAnswers(newAnswers);
        if (painStep < PAIN_QUESTIONS.length - 1) {
            setPainStep(painStep + 1);
        } else {
            setPhase("symptoms");
        }
    }

    function handleSymptomChange(e) {
        const { name, value, type, checked } = e.target;
        setSymptoms({
            ...symptoms,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    async function handleSubmit() {
        setLoading(true);
        setError("");
        const painScore = calculatePainScore(painAnswers);
        try {
            await savePhysicalLog({
                painScore,
                painAnswers: JSON.stringify(painAnswers),
                bowelFrequency: symptoms.bowelFrequency ? Number(symptoms.bowelFrequency) : null,
                bristolType: symptoms.bristolType ? Number(symptoms.bristolType) : null,
                bloodPresence: symptoms.bloodPresence,
                fatigue: symptoms.fatigue,
                jointPain: symptoms.jointPain,
                nausea: symptoms.nausea,
                fever: symptoms.fever,
                bloating: symptoms.bloating,
                perianalDiscomfort: symptoms.perianalDiscomfort,
                mouthSores: symptoms.mouthSores,
                skinIssues: symptoms.skinIssues,
                rectalBleeding: symptoms.rectalBleeding,
                urgency: symptoms.urgency,
                tenesmus: symptoms.tenesmus,
                energyLevel: symptoms.energyLevel ? Number(symptoms.energyLevel) : null,
                notes: symptoms.notes || null,
            });
            navigate("/log");
        } catch (err) {
            setError("Could not save your log. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ===============================
    // CHECKING
    // ===============================
    if (checkingLog) {
        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                    <h1 className="log-title">🩺 Physical Check-in</h1>
                </div>
                <div className="log-card">
                    <p style={{ color: "#8892a4", textAlign: "center" }}>Checking today's log...</p>
                </div>
            </div>
        );
    }

    // ===============================
    // ALREADY LOGGED
    // ===============================
    if (alreadyLogged) {
    return (
        <div className="log-page">
            <div className="log-header">
                <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                <h1 className="log-title">🩺 Physical Check-in</h1>
            </div>
            <div className="log-card">
                <div className="already-logged">
                    <span className="already-logged-icon">✅</span>
                    <h3>Already logged today</h3>
                    <p>You've already completed your physical check-in for today.</p>
                    <button
                        className="submit-btn"
                        onClick={() => setAlreadyLogged(false)}
                        style={{ marginTop: 8 }}
                    >
                        ✏️ Edit today's log
                    </button>
                    <button
                        className="back-step-btn"
                        onClick={() => navigate("/log")}
                        style={{ marginTop: 12 }}
					>
							← Back to Log
						</button>
					</div>
				</div>
			</div>
		);
	}

    // ===============================
    // PAIN QUESTION PHASE
    // ===============================
    if (phase === "pain") {
        const question = PAIN_QUESTIONS[painStep];
        const progress = ((painStep) / PAIN_QUESTIONS.length) * 100;

        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                    <h1 className="log-title">🩺 Physical Check-in</h1>
                </div>
                <div className="log-card">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="step-counter">Question {painStep + 1} of {PAIN_QUESTIONS.length}</p>
                    <h2 className="guided-question">{question.question}</h2>
                    <div className="options-list">
                        {question.options.map((option) => (
                            <button
                                key={option.label}
                                className="option-btn"
                                onClick={() => handlePainAnswer(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {painStep > 0 && (
                        <button className="back-step-btn" onClick={() => setPainStep(painStep - 1)}>
                            ← Previous question
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===============================
    // SYMPTOMS PHASE
    // ===============================
    if (phase === "symptoms") {
        const painScore = calculatePainScore(painAnswers);

        return (
            <div className="log-page">
                <div className="log-header">
                    <button className="back-btn" onClick={() => setPhase("pain")}>← Back</button>
                    <h1 className="log-title">🩺 Physical Check-in</h1>
                </div>
                <div className="log-card">

                    <div className="score-result">
                        <div className="score-circle">
                            <span className="score-num">{painScore}</span>
                            <span className="score-denom">/10</span>
                        </div>
                        <div>
                            <p className="score-label">Your pain score today</p>
                            <p className="score-sublabel">
                                {painScore <= 2 ? "Low pain — great day 🟢" :
                                 painScore <= 5 ? "Moderate pain 🟡" :
                                 painScore <= 7 ? "High pain 🟠" :
                                 "Very high pain 🔴"}
                            </p>
                        </div>
                    </div>

                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Bowel tracking</h3>
                        <div className="form-row-log">
                            <div className="form-group-log">
                                <label>Bowel movements today</label>
                                <input
                                    type="number"
                                    name="bowelFrequency"
                                    value={symptoms.bowelFrequency}
                                    onChange={handleSymptomChange}
                                    placeholder="e.g. 3"
                                    min="0"
                                    max="20"
                                />
                            </div>
                            <div className="form-group-log">
                                <label>Bristol Stool Type (1–7)</label>
                                <select name="bristolType" value={symptoms.bristolType} onChange={handleSymptomChange}>
                                    <option value="">Select type</option>
                                    <option value="1">Type 1 — Separate hard lumps</option>
                                    <option value="2">Type 2 — Lumpy sausage</option>
                                    <option value="3">Type 3 — Cracked sausage</option>
                                    <option value="4">Type 4 — Smooth sausage</option>
                                    <option value="5">Type 5 — Soft blobs</option>
                                    <option value="6">Type 6 — Fluffy pieces</option>
                                    <option value="7">Type 7 — Watery</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group-log">
                            <label>Blood presence</label>
                            <select name="bloodPresence" value={symptoms.bloodPresence} onChange={handleSymptomChange}>
                                <option value="NONE">None</option>
                                <option value="TRACE">Trace</option>
                                <option value="MODERATE">Moderate</option>
                                <option value="SIGNIFICANT">Significant</option>
                            </select>
                        </div>
                    </div>

                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Symptoms today</h3>
                        <div className="checkbox-grid">
                            {[
                                { name: "fatigue", label: "😴 Fatigue" },
                                { name: "jointPain", label: "🦴 Joint pain" },
                                { name: "nausea", label: "🤢 Nausea" },
                                { name: "fever", label: "🌡️ Fever" },
                                { name: "bloating", label: "💨 Bloating" },
                            ].map((s) => (
                                <label key={s.name} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        name={s.name}
                                        checked={symptoms[s.name]}
                                        onChange={handleSymptomChange}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {isCrohns && (
                        <div className="symptom-section">
                            <h3 className="symptom-section-title">Crohn's specific</h3>
                            <div className="checkbox-grid">
                                {[
                                    { name: "perianalDiscomfort", label: "⚠️ Perianal discomfort" },
                                    { name: "mouthSores", label: "💊 Mouth sores" },
                                    { name: "skinIssues", label: "🔴 Skin issues" },
                                ].map((s) => (
                                    <label key={s.name} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name={s.name}
                                            checked={symptoms[s.name]}
                                            onChange={handleSymptomChange}
                                        />
                                        {s.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isCrohns && (
                        <div className="symptom-section">
                            <h3 className="symptom-section-title">UC specific</h3>
                            <div className="checkbox-grid">
                                {[
                                    { name: "rectalBleeding", label: "🩸 Rectal bleeding" },
                                    { name: "urgency", label: "⚡ Urgency" },
                                    { name: "tenesmus", label: "😣 Tenesmus" },
                                ].map((s) => (
                                    <label key={s.name} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name={s.name}
                                            checked={symptoms[s.name]}
                                            onChange={handleSymptomChange}
                                        />
                                        {s.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="symptom-section">
                        <div className="form-group-log">
                            <label>Energy level (1–10)</label>
                            <input
                                type="number"
                                name="energyLevel"
                                value={symptoms.energyLevel}
                                onChange={handleSymptomChange}
                                placeholder="1 = exhausted, 10 = great"
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="form-group-log">
                            <label>Notes (optional)</label>
                            <textarea
                                name="notes"
                                value={symptoms.notes}
                                onChange={handleSymptomChange}
                                placeholder="Anything else you want to remember about today..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && <p className="log-error">{error}</p>}

                    <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "✓ Save physical log"}
                    </button>
                </div>
            </div>
        );
    }
}