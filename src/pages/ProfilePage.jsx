import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";

export default function ProfilePage() {
    const { user, handleLogout } = useAuth();

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1 className="page-header-title">👤 Profile</h1>
            </header>

            <div className="profile-content">

                {/* USER INFO */}
                <section className="profile-section">
                    <div className="profile-avatar">
                        <span>🌿</span>
                    </div>
                    <h2 className="profile-username">{user?.username}</h2>
                    <span className="profile-condition">
                        {user?.condition === "CROHNS" ? "🔵 Crohn's Disease" : "🟠 Ulcerative Colitis"}
                    </span>
                </section>

                {/* SETTINGS */}
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

                {/* SIGN OUT */}
                <button className="signout-btn" onClick={handleLogout}>
                    Sign out
                </button>

            </div>
        </div>
    );
}