import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, visible, onHide }) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onHide, 2500);
            return () => clearTimeout(timer);
        }
    }, [visible, onHide]);

    if (!visible) return null;

    return (
        <div className="toast-notification">
            <span className="toast-check">✓</span>
            <span className="toast-message">{message}</span>
        </div>
    );
}