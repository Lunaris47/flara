import { NavLink } from "react-router-dom";
import PageTransition from "./PageTransition";
import "./Layout.css";

export default function Layout({ children }) {
    return (
        <div className="app-shell">
            {/* MAIN CONTENT */}
            <main className="app-content">
				<PageTransition key={location.pathname}>
					{children}
				</PageTransition>	
            </main>

            {/* BOTTOM NAV */}
            <nav className="bottom-nav">
                <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </NavLink>
                <NavLink to="/log" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">Log</span>
                </NavLink>
                <NavLink to="/trends" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">📈</span>
                    <span className="nav-label">Trends</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Profile</span>
                </NavLink>
            </nav>
        </div>
    );
}