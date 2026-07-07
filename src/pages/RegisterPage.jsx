import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./LoginPage.css";

export default function RegisterPage() {
    const { handleRegister } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        condition: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (step === 1) {
            if (!form.username || !form.email || !form.password) {
                setError("Please fill out all fields.");
                return;
            }
            setError("");
            setStep(2);
            return;
        }

        if (!form.condition) {
            setError("Please select your condition.");
            return;
        }

        setError("");
        setLoading(true);
        try {
            await handleRegister(form);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setStep(1);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🌿</div>
                <h1 className="auth-title">Flara</h1>
                <p className="auth-subtitle">
                    {step === 1 ? "Create your account" : "Tell us about your condition"}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">

                    {step === 1 && (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="condition-intro">
                                <p>Flara is designed specifically for IBD. Knowing your condition helps us personalize your symptom checklists and insights.</p>
                            </div>

                            <div className="form-group">
                                <label>My condition is</label>
                                <select
                                    name="condition"
                                    value={form.condition}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your condition</option>
                                    <option value="CROHNS">Crohn's Disease</option>
                                    <option value="UC">Ulcerative Colitis</option>
                                </select>
                            </div>

                            {form.condition === "CROHNS" && (
                                <div className="condition-note">
                                    🔵 Crohn's can affect any part of the digestive tract. Your symptom checklist will include Crohn's-specific symptoms like perianal discomfort and skip lesions.
                                </div>
                            )}

                            {form.condition === "UC" && (
                                <div className="condition-note">
                                    🟠 UC affects the colon and rectum. Your symptom checklist will include UC-specific symptoms like rectal bleeding and urgency.
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating account..." : step === 1 ? "Continue →" : "Create Account"}
                    </button>

                    {step === 2 && (
                        <button
                            type="button"
                            className="auth-btn-back"
                            onClick={() => setStep(1)}
                        >
                            ← Back
                        </button>
                    )}
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}