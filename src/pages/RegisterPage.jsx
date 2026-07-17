import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import "./RegisterPage.css";

// ===============================
// PASSWORD STRENGTH
// ===============================
function getPasswordStrength(password) {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Too weak", color: "#fc8181" };
    if (score === 2) return { score, label: "Weak", color: "#f6ad55" };
    if (score === 3) return { score, label: "Fair", color: "#f6e05e" };
    if (score === 4) return { score, label: "Strong", color: "#68d391" };
    return { score, label: "Very strong", color: "#48bb78" };
}

function validateUsername(username) {
    if (!username) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (username.length > 20) return "Username must be 20 characters or less.";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores.";
    return null;
}

export default function RegisterPage() {
    const { handleRegister } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        condition: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const passwordStrength = getPasswordStrength(form.password);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error for field being edited
        if (errors[name]) setErrors({ ...errors, [name]: null });
    }

    function validateStep1() {
        const newErrors = {};

        const usernameError = validateUsername(form.username);
        if (usernameError) newErrors.username = usernameError;

        if (!form.email) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!form.password) {
            newErrors.password = "Password is required.";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters.";
        } else if (passwordStrength.score < 2) {
            newErrors.password = "Password is too weak. Add numbers or special characters.";
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (step === 1) {
            if (validateStep1()) setStep(2);
            return;
        }

        if (!form.condition) {
            setErrors({ condition: "Please select your condition." });
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            await handleRegister(form);
        } catch (err) {
            setErrors({ general: err.response?.data?.message || "Registration failed. Please try again." });
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
                            {/* USERNAME */}
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="3-20 characters, letters and numbers only"
                                    autoComplete="username"
                                />
                                {errors.username && <p className="field-error">{errors.username}</p>}
                                {form.username && !errors.username && validateUsername(form.username) === null && (
                                    <p className="field-success">✓ Username looks good</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                                {errors.email && <p className="field-error">{errors.email}</p>}
                            </div>

                            {/* PASSWORD */}
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                />
                                {form.password && (
                                    <div className="password-strength">
                                        <div className="strength-bars">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className="strength-bar"
                                                    style={{
                                                        background: i <= passwordStrength.score
                                                            ? passwordStrength.color
                                                            : "var(--border-color)"
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span
                                            className="strength-label"
                                            style={{ color: passwordStrength.color }}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                )}
                                <div className="password-requirements">
                                    <span className={form.password.length >= 8 ? "req-met" : "req-unmet"}>
                                        {form.password.length >= 8 ? "✓" : "○"} At least 8 characters
                                    </span>
                                    <span className={/[0-9]/.test(form.password) ? "req-met" : "req-unmet"}>
                                        {/[0-9]/.test(form.password) ? "✓" : "○"} At least one number
                                    </span>
                                    <span className={/[^A-Za-z0-9]/.test(form.password) ? "req-met" : "req-unmet"}>
                                        {/[^A-Za-z0-9]/.test(form.password) ? "✓" : "○"} At least one special character
                                    </span>
                                </div>
                                {errors.password && <p className="field-error">{errors.password}</p>}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="form-group">
                                <label>Confirm password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && (
                                    <p className="field-error">{errors.confirmPassword}</p>
                                )}
                                {form.confirmPassword && form.password === form.confirmPassword && (
                                    <p className="field-success">✓ Passwords match</p>
                                )}
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

                            {errors.condition && <p className="field-error">{errors.condition}</p>}
                        </>
                    )}

                    {errors.general && <p className="auth-error">{errors.general}</p>}

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