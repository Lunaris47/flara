import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getStoredToken } from "../api/api";
import "./ProfilePage.css";

// ===============================
// EDUCATION CONTENT
// ===============================
const EDUCATION_TOPICS = [
    {
        category: "Understanding IBD",
        icon: "🔬",
        articles: [
            {
                id: "crohns-vs-uc",
                title: "Crohn's vs Ulcerative Colitis",
                summary: "Both are IBD but they affect different parts of the gut and have different symptom profiles.",
                content: `Crohn's disease can affect any part of the digestive tract from mouth to rectum, and inflammation spreads through all layers of the bowel wall. It can cause skip lesions — patches of inflammation with healthy tissue in between.

Ulcerative Colitis affects only the colon and rectum, and inflammation is continuous — no skip lesions. It only affects the inner lining of the bowel.

Both conditions cause abdominal pain, diarrhea, fatigue, and weight loss during flares. However, UC more commonly causes rectal bleeding and urgency, while Crohn's more commonly causes perianal complications, mouth sores, and can affect the small intestine.

Understanding which condition you have helps your doctor choose the right treatment and helps you recognize your specific warning signs.`,
                tags: ["CROHNS", "UC"],
                readTime: "3 min",
            },
            {
                id: "what-is-a-flare",
                title: "What is a flare and what triggers one?",
                summary: "Flares are periods of active IBD symptoms. Understanding your triggers is key to managing them.",
                content: `A flare is a period when your IBD symptoms become active after a period of remission. Flares can range from mild — a few days of increased symptoms — to severe, requiring hospitalization.

Common triggers include:
- Stress and anxiety — the gut-brain connection means psychological stress can directly trigger inflammation
- Certain foods — while food doesn't cause IBD, some foods can trigger symptoms during a flare
- Missed medications — stopping biologics or immunosuppressants can trigger a flare within weeks
- Infections — gastrointestinal infections can trigger or worsen IBD
- NSAIDs — ibuprofen and naproxen can trigger flares in some IBD patients
- Smoking — smoking worsens Crohn's disease (though it has a complex relationship with UC)

Tracking your symptoms, stress levels, and meals over time — exactly what Flara helps you do — is one of the most effective ways to identify your personal triggers.`,
                tags: ["CROHNS", "UC"],
                readTime: "4 min",
            },
            {
                id: "remission",
                title: "What does remission mean for IBD?",
                summary: "Remission means different things clinically and personally. Here's what to know.",
                content: `Remission in IBD means the disease is not actively causing symptoms. There are two types:

Clinical remission means your symptoms have resolved — no significant pain, normal bowel frequency, no blood.

Endoscopic remission (also called mucosal healing) means the inflammation has healed at the tissue level, confirmed by colonoscopy. This is considered the gold standard because you can be in clinical remission while still having active inflammation that could flare.

Deep remission means both clinical and endoscopic remission together — this is the goal of modern IBD treatment.

Remission doesn't mean cured. IBD is a lifelong condition, and staying in remission usually requires ongoing medication even when you feel well. Stopping treatment when you feel good is one of the most common causes of relapse.`,
                tags: ["CROHNS", "UC"],
                readTime: "3 min",
            },
        ],
    },
    {
        category: "The Mind-Gut Connection",
        icon: "🧠",
        articles: [
            {
                id: "stress-gut",
                title: "How stress triggers gut inflammation",
                summary: "The gut-brain axis is real — stress directly affects your gut in measurable ways.",
                content: `The gut and brain are connected through a complex network called the gut-brain axis. This two-way communication system means that what happens in your brain affects your gut, and what happens in your gut affects your brain.

When you experience stress, your body releases cortisol and other stress hormones. In people with IBD, these hormones can:
- Increase intestinal permeability (leaky gut)
- Alter the gut microbiome composition
- Trigger immune activation and inflammation
- Speed up or slow down gut motility

Research has shown that stressful life events — job loss, relationship problems, bereavement — correlate with IBD flares in many patients. This isn't "all in your head." The inflammation is real; the stress is just one of its triggers.

This is why Flara tracks both your physical symptoms and your mental health together. The pattern of stress preceding symptom spikes is one of the most clinically meaningful things you can show your doctor.`,
                tags: ["CROHNS", "UC"],
                readTime: "4 min",
            },
            {
                id: "ibd-anxiety",
                title: "IBD and anxiety — breaking the cycle",
                summary: "Anxiety and IBD feed each other. Understanding this cycle is the first step to breaking it.",
                content: `Living with IBD means living with uncertainty — unpredictable symptoms, public bathroom anxiety, fear of flares, and the emotional weight of a chronic illness. It's no surprise that anxiety rates in IBD patients are significantly higher than in the general population.

The difficult part is that anxiety and IBD feed each other. Anxiety triggers gut symptoms through the gut-brain axis, and gut symptoms increase anxiety. Breaking this cycle is one of the most important things you can work on alongside your medical treatment.

Strategies that have evidence behind them:
- Cognitive Behavioral Therapy (CBT) — has been shown in clinical trials to reduce IBD symptoms alongside psychological distress
- Gut-directed hypnotherapy — particularly effective for IBS but also showing promise in IBD
- Mindfulness-based stress reduction (MBSR) — reduces anxiety and improves quality of life
- Regular moderate exercise — reduces systemic inflammation and improves mood
- Gut-brain dietary approaches — working with an IBD dietitian

You don't have to choose between treating your gut and treating your mind. The most effective IBD management addresses both.`,
                tags: ["CROHNS", "UC"],
                readTime: "5 min",
            },
            {
                id: "sleep-ibd",
                title: "Why sleep matters more than you think",
                summary: "Poor sleep worsens IBD symptoms and increases flare risk. Here's the science.",
                content: `Sleep and IBD have a bidirectional relationship. IBD symptoms — pain, urgency, nighttime bathroom trips — disrupt sleep. And poor sleep, in turn, worsens IBD.

Studies have shown that IBD patients who sleep fewer than 6 hours per night have higher rates of active disease and more frequent flares. Poor sleep increases levels of inflammatory cytokines and reduces the body's ability to regulate immune responses.

What you can do:
- Treat nighttime symptoms aggressively — if pain or urgency is waking you up, that's a sign your disease needs better control
- Keep a consistent sleep schedule — your gut has its own circadian rhythm
- Avoid eating large meals within 2-3 hours of bed
- Discuss sleep issues with your gastroenterologist — sleep quality is a meaningful clinical indicator
- Track your sleep quality in Flara alongside your symptoms to identify patterns

Sleep is not a luxury when you have IBD. It's part of your treatment plan.`,
                tags: ["CROHNS", "UC"],
                readTime: "4 min",
            },
        ],
    },
    {
        category: "Nutrition & Food",
        icon: "🥗",
        articles: [
            {
                id: "ibd-diet",
                title: "There's no single IBD diet — here's why",
                summary: "Food triggers are highly individual. What works for one person may worsen symptoms for another.",
                content: `One of the most frustrating things about IBD nutrition is that there's no universally agreed-upon IBD diet. Unlike celiac disease, where gluten is a clear trigger for everyone, IBD food triggers are highly individual.

What the research does support:
- During a flare, low-residue or low-fiber foods are often better tolerated
- In remission, a Mediterranean-style diet (fruits, vegetables, whole grains, lean proteins, olive oil) is associated with better outcomes
- Ultra-processed foods are consistently associated with worse IBD outcomes
- Adequate protein intake is important, especially if you've had bowel resections

Common triggers worth tracking:
- Dairy (lactose intolerance is more common in IBD)
- High-fiber raw vegetables during active disease
- Spicy foods
- Alcohol
- Caffeine
- High-fat foods

The most evidence-based approach is to track what you eat alongside your symptoms — over time, your personal pattern will emerge. This is exactly what Flara's meal log is designed to help you do.`,
                tags: ["CROHNS", "UC"],
                readTime: "5 min",
            },
            {
                id: "hydration",
                title: "Hydration and IBD",
                summary: "Diarrhea and malabsorption make dehydration a real risk. Here's what to know.",
                content: `Dehydration is one of the most common and underappreciated complications of IBD. During flares, frequent diarrhea causes significant fluid and electrolyte loss. Certain medications, particularly corticosteroids, also affect fluid balance.

Signs of dehydration to watch for:
- Dark urine
- Headaches
- Fatigue and brain fog
- Dizziness on standing
- Muscle cramps

Tips for staying hydrated with IBD:
- Aim for at least 8-10 cups of fluid daily, more during flares
- Electrolyte drinks or oral rehydration solutions help replace sodium and potassium lost during diarrhea
- Avoid sugary drinks and alcohol, which can worsen diarrhea
- Sip fluids throughout the day rather than drinking large amounts at once
- If you've had significant bowel removed (resections), discuss fluid and electrolyte needs with your gastroenterologist specifically

If you're experiencing severe dehydration during a flare, contact your medical team — IV fluids may be needed.`,
                tags: ["CROHNS", "UC"],
                readTime: "3 min",
            },
        ],
    },
    {
        category: "Managing IBD Day-to-Day",
        icon: "📋",
        articles: [
            {
                id: "doctor-appointments",
                title: "How to make the most of your GI appointments",
                summary: "Most GI appointments are short. Here's how to use your time effectively.",
                content: `The average gastroenterologist appointment is 15-20 minutes. In that time, you need to convey how you've been doing, discuss any medication changes, and get your questions answered. Coming prepared makes an enormous difference.

What to bring:
- A summary of your symptoms over the past weeks or months (this is what Flara's doctor report is designed for)
- A list of your current medications and dosages
- Any recent test results you have copies of
- A written list of questions — you'll forget them otherwise

Questions worth asking:
- Is my current disease activity at the level we'd expect given my treatment?
- Are there any signs I should watch for that would mean I need to come in sooner?
- Should we be monitoring any specific labs given my medications?
- What is my target — clinical remission or mucosal healing?
- Are there any newer treatments we should discuss?

Don't leave without understanding:
- What is the plan if my current treatment isn't working?
- When is my next appointment and what should prompt me to call sooner?

Bringing a printed summary of your recent Flara logs can give your GI doctor months of data in seconds — far more useful than trying to remember how you felt last Tuesday.`,
                tags: ["CROHNS", "UC"],
                readTime: "5 min",
            },
            {
                id: "medication-adherence",
                title: "Why staying on your medication matters",
                summary: "Stopping medication when you feel well is one of the most common causes of relapse.",
                content: `One of the most common patterns in IBD is this: a patient starts a biologic or immunosuppressant, goes into remission, feels great, decides they don't need the medication anymore, stops it — and then flares within weeks or months.

This happens because IBD medications don't cure the disease. They suppress the immune response that causes inflammation. When you stop them, the inflammation returns.

Why adherence is hard:
- The medications can have side effects that feel worse than the disease during remission
- Biologics are expensive and the insurance process is exhausting
- It's psychologically difficult to take medication when you feel well
- Fear of long-term side effects

Why adherence matters:
- Stopping and restarting biologics can cause you to develop antibodies against the medication, making it less effective or ineffective
- Each flare causes intestinal damage that accumulates over time
- Sustained remission is associated with significantly better long-term outcomes

If you're struggling with your medication — side effects, cost, fear, or simply forgetting — talk to your gastroenterologist. There are often solutions, including different formulations, financial assistance programs, or alternative medications.`,
                tags: ["CROHNS", "UC"],
                readTime: "4 min",
            },
        ],
    },
];

export default function ProfilePage() {
    const { user, handleLogout } = useAuth();
    const [activeSection, setActiveSection] = useState("profile");
    const [expandedArticle, setExpandedArticle] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);

    function toggleArticle(id) {
        setExpandedArticle(expandedArticle === id ? null : id);
    }

    function toggleCategory(category) {
        setExpandedCategory(expandedCategory === category ? null : category);
    }

    async function downloadReport(days) {
        try {
            const token = getStoredToken();
            const response = await fetch(
                `https://flara-api-production.up.railway.app/api/report/${days}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `flara-health-report-${days}days.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download report", err);
        }
    }

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1 className="page-header-title">
                    {activeSection === "profile" ? "👤 Profile" : "📚 Learn"}
                </h1>
            </header>

            {/* SECTION TOGGLE */}
            <div className="profile-toggle">
                <button
                    className={`toggle-btn ${activeSection === "profile" ? "active" : ""}`}
                    onClick={() => setActiveSection("profile")}
                >
                    👤 Profile
                </button>
                <button
                    className={`toggle-btn ${activeSection === "learn" ? "active" : ""}`}
                    onClick={() => setActiveSection("learn")}
                >
                    📚 Learn
                </button>
            </div>

            {/* PROFILE SECTION */}
            {activeSection === "profile" && (
                <div className="profile-content">
                    <section className="profile-section">
                        <div className="profile-avatar">
                            <span>🌿</span>
                        </div>
                        <h2 className="profile-username">{user?.username}</h2>
                        <span className="profile-condition">
                            {user?.condition === "CROHNS" ? "🔵 Crohn's Disease" : "🟠 Ulcerative Colitis"}
                        </span>
                    </section>

                    <section className="settings-section">
                        <h3 className="section-title">Account</h3>
                        <div className="settings-list">
                            <div className="settings-item">
                                <span className="settings-label">Username</span>
                                <span className="settings-value">{user?.username}</span>
                            </div>
                            <div className="settings-item">
                                <span className="settings-label">Condition</span>
                                <span className="settings-value">
                                    {user?.condition === "CROHNS" ? "Crohn's Disease" : "Ulcerative Colitis"}
                                </span>
                            </div>
                            <div className="settings-item">
                                <span className="settings-label">Email</span>
                                <span className="settings-value">{user?.email}</span>
                            </div>
                        </div>
                    </section>

                    {/* DOCTOR REPORT */}
                    <section className="settings-section">
                        <h3 className="section-title">Doctor Report</h3>
                        <p className="report-description">
                            Download a PDF summary of your health data to share with your gastroenterologist or care team.
                        </p>
                        <div className="report-buttons">
                            <button className="report-btn" onClick={() => downloadReport(30)}>
                                📄 Last 30 days
                            </button>
                            <button className="report-btn" onClick={() => downloadReport(60)}>
                                📄 Last 60 days
                            </button>
                            <button className="report-btn" onClick={() => downloadReport(90)}>
                                📄 Last 90 days
                            </button>
                        </div>
                    </section>

                    <button className="signout-btn" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            )}

            {/* LEARN SECTION */}
            {activeSection === "learn" && (
                <div className="learn-content">
                    <p className="learn-intro">
                        Evidence-based information about IBD, the mind-gut connection, nutrition, and living well with Crohn's or UC.
                    </p>

                    {EDUCATION_TOPICS.map((topic) => (
                        <div key={topic.category} className="topic-section">
                            <button
                                className="category-header"
                                onClick={() => toggleCategory(topic.category)}
                            >
                                <span className="category-icon">{topic.icon}</span>
                                <span className="category-title">{topic.category}</span>
                                <span className="category-count">{topic.articles.length} articles</span>
                                <span className="category-chevron">
                                    {expandedCategory === topic.category ? "▲" : "▼"}
                                </span>
                            </button>

                            {expandedCategory === topic.category && (
                                <div className="articles-list">
                                    {topic.articles.map((article) => (
                                        <div key={article.id} className="article-card">
                                            <button
                                                className="article-header"
                                                onClick={() => toggleArticle(article.id)}
                                            >
                                                <div className="article-header-text">
                                                    <p className="article-title">{article.title}</p>
                                                    <p className="article-summary">{article.summary}</p>
                                                </div>
                                                <div className="article-meta">
                                                    <span className="article-read-time">{article.readTime}</span>
                                                    <span className="article-chevron">
                                                        {expandedArticle === article.id ? "▲" : "▼"}
                                                    </span>
                                                </div>
                                            </button>

                                            {expandedArticle === article.id && (
                                                <div className="article-content">
                                                    {article.content.split("\n\n").map((paragraph, i) => (
                                                        <p key={i} className="article-paragraph">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}