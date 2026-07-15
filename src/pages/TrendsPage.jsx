import "./TrendsPage.css";

export default function TrendsPage() {
    return (
        <div className="trends-page">
            <header className="page-header">
                <h1 className="page-header-title">📈 Trends</h1>
            </header>
            <div className="coming-soon">
                <span className="coming-soon-icon">📈</span>
                <h2>Mind-Gut Trends</h2>
                <p>Charts showing correlations between your stress, mood, sleep, and physical symptoms — coming soon.</p>
            </div>
        </div>
    );
}