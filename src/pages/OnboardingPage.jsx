import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OnboardingPage.css";

const STEPS = [
    {
        id: "welcome",
        emoji: "🌿",
        title: "Welcome to Flara",
        subtitle: "Know your body. Understand your flares.",
        body: "Flara is a holistic IBD health tracker built around one insight most apps miss: your mental health and your gut health are deeply connected. Flara tracks both — and helps you find the patterns between them.",
        cta: "Get started →",
    },
    {
        id: "how",
        emoji: "📋",
        title: "How Flara works",
        subtitle: "Three minutes a day. A lifetime of insight.",
        body: null,
        features: [
            { icon: "🩺", title: "Daily physical check-in", desc: "Guided questions calculate your pain score and track your symptoms" },
            { icon: "🧠", title: "Daily mental check-in", desc: "Guided stress scoring, mood, sleep, and anxiety tracking" },
            { icon: "📈", title: "Mind-gut trends", desc: "See correlations between your stress, sleep, and physical symptoms over time" },
            { icon: "📄", title: "Doctor reports", desc: "Download a professional PDF summary to bring to your GI appointment" },
        ],
        cta: "Sounds good →",
    },
    {
        id: "ready",
        emoji: "✨",
        title: "You're all set",
        subtitle: "A few things to know before you start",
        body: null,
        tips: [
            { icon: "📅", text: "Log once a day — morning or evening, whatever works for you" },
            { icon: "🧘", text: "The more consistently you log, the more meaningful your trends become" },
            { icon: "💙", text: "Be honest — this data is for you and your doctor, not anyone else" },
            { icon: "📚", text: "Check the Learn section for evidence-based IBD articles anytime" },
        ],
        cta: "Start logging →",
    },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();

    function handleNext() {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            localStorage.setItem("flara_onboarded", "true");
            navigate("/home");
        }
    }

    const current = STEPS[step];

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">

                {/* PROGRESS DOTS */}
                <div className="onboarding-dots">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot ${i === step ? "active" : i < step ? "done" : ""}`}
                        />
                    ))}
                </div>

                {/* EMOJI */}
                <div className="onboarding-emoji">{current.emoji}</div>

                {/* TITLE */}
                <h1 className="onboarding-title">{current.title}</h1>
                <p className="onboarding-subtitle">{current.subtitle}</p>

                {/* BODY TEXT */}
                {current.body && (
                    <p className="onboarding-body">{current.body}</p>
                )}

                {/* FEATURES LIST */}
                {current.features && (
                    <div className="onboarding-features">
                        {current.features.map((f) => (
                            <div key={f.title} className="onboarding-feature">
                                <span className="feature-icon">{f.icon}</span>
                                <div>
                                    <p className="feature-title">{f.title}</p>
                                    <p className="feature-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TIPS LIST */}
                {current.tips && (
                    <div className="onboarding-tips">
                        {current.tips.map((t) => (
                            <div key={t.text} className="onboarding-tip">
                                <span className="tip-icon">{t.icon}</span>
                                <p className="tip-text">{t.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA BUTTON */}
                <button className="onboarding-btn" onClick={handleNext}>
                    {current.cta}
                </button>

                {/* SKIP */}
                {step < STEPS.length - 1 && (
                    <button
                        className="onboarding-skip"
                        onClick={() => {
                            localStorage.setItem("flara_onboarded", "true");
                            navigate("/home");
                        }}
                    >
                        Skip
                    </button>
                )}

            </div>
        </div>
    );
}