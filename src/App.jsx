import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import LogHubPage from "./pages/LogHubPage";
import TrendsPage from "./pages/TrendsPage";
import ProfilePage from "./pages/ProfilePage";
import PhysicalLogPage from "./pages/PhysicalLogPage";
import MentalLogPage from "./pages/MentalLogPage";

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function ProtectedLayout({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
}

export default function App() {
    return (
        <Routes>
            {/* AUTH ROUTES - no nav */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* APP ROUTES - with bottom nav */}
            <Route path="/home" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
            <Route path="/log" element={<ProtectedLayout><LogHubPage /></ProtectedLayout>} />
            <Route path="/trends" element={<ProtectedLayout><TrendsPage /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

            {/* LOG FLOW ROUTES - no nav (focused flow) */}
            <Route path="/log/physical" element={<ProtectedRoute><PhysicalLogPage /></ProtectedRoute>} />
            <Route path="/log/mental" element={<ProtectedRoute><MentalLogPage /></ProtectedRoute>} />

            {/* REDIRECTS */}
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}