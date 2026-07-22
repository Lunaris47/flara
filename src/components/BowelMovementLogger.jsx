import { useState } from "react";
import BristolIllustration from "./BristolIllustration";
import "./BowelMovementLogger.css";

const BRISTOL_TYPES = [
    { type: 1, label: "Type 1", desc: "Separate hard lumps", clinical: "Severe constipation" },
    { type: 2, label: "Type 2", desc: "Lumpy sausage", clinical: "Mild constipation" },
    { type: 3, label: "Type 3", desc: "Cracked sausage", clinical: "Normal" },
    { type: 4, label: "Type 4", desc: "Smooth sausage", clinical: "Ideal" },
    { type: 5, label: "Type 5", desc: "Soft blobs", clinical: "Lacking fiber" },
    { type: 6, label: "Type 6", desc: "Fluffy & mushy", clinical: "Mild diarrhea" },
    { type: 7, label: "Type 7", desc: "Watery", clinical: "Severe diarrhea" },
];

const BLOOD_OPTIONS = [
    { value: "NONE", label: "None" },
    { value: "TRACE", label: "Trace" },
    { value: "MODERATE", label: "Moderate" },
    { value: "SIGNIFICANT", label: "Significant" },
];

export default function BowelMovementLogger({ movements, onChange }) {
    const [showBristolGuide, setShowBristolGuide] = useState(null);

    function addMovement() {
        onChange([...movements, { type: null, blood: "NONE" }]);
    }

    function removeMovement(index) {
        onChange(movements.filter((_, i) => i !== index));
    }

    function updateMovement(index, field, value) {
        const updated = movements.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        );
        onChange(updated);
    }

    return (
        <div className="bm-logger">
            {movements.length === 0 ? (
                <p className="bm-empty">No bowel movements logged yet.</p>
            ) : (
                <div className="bm-list">
                    {movements.map((movement, index) => (
                        <div key={index} className="bm-entry">
                            <div className="bm-entry-header">
                                <span className="bm-entry-label">BM #{index + 1}</span>
                                <button
                                    className="bm-remove-btn"
                                    onClick={() => removeMovement(index)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* BRISTOL TYPE SELECTOR */}
                            <p className="bm-field-label">Bristol Stool Type</p>
                            <div className="bristol-grid">
                                {BRISTOL_TYPES.map((bt) => (
                                    <button
                                        key={bt.type}
                                        className={`bristol-btn ${movement.type === bt.type ? "selected" : ""}`}
                                        onClick={() => updateMovement(index, "type", bt.type)}
                                        onMouseEnter={() => setShowBristolGuide(bt.type)}
                                        onMouseLeave={() => setShowBristolGuide(null)}
                                    >
                                        <BristolIllustration type={bt.type} size={44} />
                                        <span className="bristol-btn-label">{bt.label}</span>
                                        <span className="bristol-btn-desc">{bt.desc}</span>
                                    </button>
                                ))}
                            </div>

                            {/* TOOLTIP */}
                            {showBristolGuide && (
                                <div className="bristol-tooltip">
                                    <BristolIllustration type={showBristolGuide} size={80} />
                                    <div>
                                        <p className="bristol-tooltip-label">
                                            Type {showBristolGuide} — {BRISTOL_TYPES[showBristolGuide - 1].desc}
                                        </p>
                                        <p className="bristol-tooltip-clinical">
                                            {BRISTOL_TYPES[showBristolGuide - 1].clinical}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* BLOOD PRESENCE */}
                            <p className="bm-field-label" style={{ marginTop: 12 }}>Blood presence</p>
                            <div className="blood-selector">
                                {BLOOD_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`blood-btn ${movement.blood === opt.value ? "selected" : ""}`}
                                        onClick={() => updateMovement(index, "blood", opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="bm-add-btn" onClick={addMovement}>
                + Add bowel movement
            </button>
        </div>
    );
}