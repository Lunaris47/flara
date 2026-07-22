import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMedicationLog } from "../api/api";
import Toast from "../components/Toast";
import "./LogPage.css";
import "./MedicationLogPage.css";

const COMMON_MEDICATIONS = [
    "Humira (adalimumab)", "Remicade (infliximab)", "Stelara (ustekinumab)",
    "Skyrizi (risankizumab)", "Entyvio (vedolizumab)", "Rinvoq (upadacitinib)",
    "Azathioprine", "6-Mercaptopurine", "Methotrexate", "Prednisone",
    "Budesonide", "Mesalamine", "Sulfasalazine", "Ciprofloxacin",
    "Metronidazole", "Iron supplement", "Vitamin D", "Vitamin B12",
    "Folic acid", "Other",
];

const MEDICATION_TYPES = [
    { value: "BIOLOGIC", label: "💉 Biologic" },
    { value: "IMMUNOSUPPRESSANT", label: "🧬 Immunosuppressant" },
    { value: "STEROID", label: "⚡ Steroid" },
    { value: "AMINOSALICYLATE", label: "💊 Aminosalicylate" },
    { value: "ANTIBIOTIC", label: "🦠 Antibiotic" },
    { value: "SUPPLEMENT", label: "🌿 Supplement" },
    { value: "OTHER", label: "📦 Other" },
];

const MEDICATION_TYPE_MAP = {
    "Humira (adalimumab)": "BIOLOGIC",
    "Remicade (infliximab)": "BIOLOGIC",
    "Stelara (ustekinumab)": "BIOLOGIC",
    "Skyrizi (risankizumab)": "BIOLOGIC",
    "Entyvio (vedolizumab)": "BIOLOGIC",
    "Rinvoq (upadacitinib)": "IMMUNOSUPPRESSANT",
    "Azathioprine": "IMMUNOSUPPRESSANT",
    "6-Mercaptopurine": "IMMUNOSUPPRESSANT",
    "Methotrexate": "IMMUNOSUPPRESSANT",
    "Prednisone": "STEROID",
    "Budesonide": "STEROID",
    "Mesalamine": "AMINOSALICYLATE",
    "Sulfasalazine": "AMINOSALICYLATE",
    "Ciprofloxacin": "ANTIBIOTIC",
    "Metronidazole": "ANTIBIOTIC",
    "Iron supplement": "SUPPLEMENT",
    "Vitamin D": "SUPPLEMENT",
    "Vitamin B12": "SUPPLEMENT",
    "Folic acid": "SUPPLEMENT",
    "Other": "OTHER",
};

export default function MedicationLogPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        medicationName: "",
        customName: "",
        dosage: "",
        medicationType: "OTHER",
        taken: true,
        takenAt: new Date().toISOString().slice(0, 16),
        biologicDate: "",
        sideEffectNotes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        if (name === "medicationName" && MEDICATION_TYPE_MAP[value]) {
            setForm({
                ...form,
                medicationName: value,
                medicationType: MEDICATION_TYPE_MAP[value],
            });
        } else {
            setForm({ ...form, [name]: type === "checkbox" ? checked : value });
        }
    }

    async function handleSubmit() {
        const name = form.medicationName === "Other" ? form.customName : form.medicationName;
        if (!name.trim()) {
            setError("Please select or enter a medication name.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await saveMedicationLog({
                logDate: new Date().toLocaleDateString("en-CA"),
                medicationName: name,
                dosage: form.dosage || null,
                medicationType: form.medicationType,
                taken: form.taken,
                takenAt: form.taken ? new Date(form.takenAt).toISOString() : null,
                biologicDate: form.biologicDate || null,
                sideEffectNotes: form.sideEffectNotes || null,
            });
            setShowToast(true);
            setTimeout(() => navigate("/log"), 2000);
        } catch (err) {
            setError("Could not save medication log. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const isBiologic = form.medicationType === "BIOLOGIC";

    return (
        <div className="log-page">
            <div className="log-header">
                <button className="back-btn" onClick={() => navigate("/log")}>← Back</button>
                <h1 className="log-title">💊 Log Medication</h1>
            </div>
            <div className="log-card">
                <div className="symptom-section">
                    <h3 className="symptom-section-title">Medication</h3>
                    <div className="form-group-log">
                        <label>Select medication</label>
                        <select name="medicationName" value={form.medicationName} onChange={handleChange}>
                            <option value="">Choose a medication</option>
                            {COMMON_MEDICATIONS.map((med) => (
                                <option key={med} value={med}>{med}</option>
                            ))}
                        </select>
                    </div>
                    {form.medicationName === "Other" && (
                        <div className="form-group-log">
                            <label>Medication name</label>
                            <input type="text" name="customName" value={form.customName} onChange={handleChange} placeholder="Enter medication name" />
                        </div>
                    )}
                    <div className="form-group-log">
                        <label>Dosage (optional)</label>
                        <input type="text" name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 40mg, 1 tablet" />
                    </div>
                </div>

                <div className="symptom-section">
                    <h3 className="symptom-section-title">Type</h3>
                    <div className="med-type-grid">
                        {MEDICATION_TYPES.map((type) => (
                            <button
                                key={type.value}
                                className={`med-type-btn ${form.medicationType === type.value ? "selected" : ""}`}
                                onClick={() => setForm({ ...form, medicationType: type.value })}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="symptom-section">
                    <h3 className="symptom-section-title">Did you take it?</h3>
                    <div className="taken-toggle">
                        <button className={`taken-btn ${form.taken ? "yes" : ""}`} onClick={() => setForm({ ...form, taken: true })}>
                            ✅ Yes, I took it
                        </button>
                        <button className={`taken-btn ${!form.taken ? "no" : ""}`} onClick={() => setForm({ ...form, taken: false })}>
                            ❌ Missed dose
                        </button>
                    </div>
                    {form.taken && (
                        <div className="form-group-log" style={{ marginTop: 12 }}>
                            <label>Time taken</label>
                            <input type="datetime-local" name="takenAt" value={form.takenAt} onChange={handleChange} />
                        </div>
                    )}
                </div>

                {isBiologic && (
                    <div className="symptom-section">
                        <h3 className="symptom-section-title">Biologic infusion/injection date</h3>
                        <div className="form-group-log">
                            <label>Date of infusion or injection</label>
                            <input type="date" name="biologicDate" value={form.biologicDate} onChange={handleChange} />
                        </div>
                    </div>
                )}

                <div className="symptom-section">
                    <div className="form-group-log">
                        <label>Side effect notes (optional)</label>
                        <textarea name="sideEffectNotes" value={form.sideEffectNotes} onChange={handleChange} placeholder="Any side effects or reactions to note..." rows={2} />
                    </div>
                </div>

                {error && <p className="log-error">{error}</p>}

                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "✓ Save medication log"}
                </button>
            </div>
            <Toast message="Medication logged! 💊" visible={showToast} onHide={() => setShowToast(false)} />
        </div>
    );
}