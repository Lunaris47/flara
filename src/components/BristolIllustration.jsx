export default function BristolIllustration({ type, size = 60 }) {
    const illustrations = {
        1: (
            // Type 1 - Separate hard lumps
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <circle cx="15" cy="42" r="7" fill="#8B6347" />
                <circle cx="30" cy="38" r="8" fill="#7A5538" />
                <circle cx="45" cy="42" r="7" fill="#8B6347" />
                <circle cx="22" cy="30" r="6" fill="#8B6347" />
                <circle cx="38" cy="30" r="6" fill="#7A5538" />
                <circle cx="30" cy="22" r="5" fill="#8B6347" />
            </svg>
        ),
        2: (
            // Type 2 - Lumpy sausage shape
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="30" cy="32" rx="22" ry="12" fill="#8B6347" />
                <circle cx="12" cy="30" r="5" fill="#7A5538" />
                <circle cx="20" cy="26" r="4" fill="#6B4528" />
                <circle cx="30" cy="24" r="5" fill="#7A5538" />
                <circle cx="40" cy="26" r="4" fill="#6B4528" />
                <circle cx="48" cy="30" r="5" fill="#7A5538" />
                <ellipse cx="30" cy="32" rx="22" ry="12" fill="#8B634788" />
            </svg>
        ),
        3: (
            // Type 3 - Sausage with cracks
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="30" cy="32" rx="22" ry="11" fill="#8B6347" />
                <path d="M14 28 Q18 32 14 36" stroke="#6B4528" strokeWidth="1.5" fill="none" />
                <path d="M24 26 Q28 32 24 38" stroke="#6B4528" strokeWidth="1.5" fill="none" />
                <path d="M34 26 Q38 32 34 38" stroke="#6B4528" strokeWidth="1.5" fill="none" />
                <path d="M44 28 Q48 32 44 36" stroke="#6B4528" strokeWidth="1.5" fill="none" />
            </svg>
        ),
        4: (
            // Type 4 - Smooth sausage (ideal)
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="30" cy="32" rx="22" ry="10" fill="#8B6347" />
                <ellipse cx="30" cy="30" rx="20" ry="7" fill="#9B7357" />
                <ellipse cx="25" cy="28" rx="8" ry="3" fill="#AB8367" opacity="0.5" />
                <circle cx="48" cy="32" r="10" fill="#8B6347" />
                <circle cx="12" cy="32" r="10" fill="#8B6347" />
            </svg>
        ),
        5: (
            // Type 5 - Soft blobs
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="14" cy="38" rx="8" ry="6" fill="#8B6347" />
                <ellipse cx="28" cy="34" rx="9" ry="7" fill="#7A5538" />
                <ellipse cx="42" cy="38" rx="8" ry="6" fill="#8B6347" />
                <ellipse cx="21" cy="26" rx="7" ry="5" fill="#7A5538" />
                <ellipse cx="38" cy="26" rx="7" ry="5" fill="#8B6347" />
            </svg>
        ),
        6: (
            // Type 6 - Fluffy/mushy
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="30" cy="35" rx="20" ry="10" fill="#8B634766" />
                <ellipse cx="18" cy="32" rx="10" ry="7" fill="#8B6347" />
                <ellipse cx="30" cy="28" rx="12" ry="8" fill="#7A5538" />
                <ellipse cx="42" cy="32" rx="10" ry="7" fill="#8B6347" />
                <ellipse cx="24" cy="40" rx="8" ry="5" fill="#7A553888" />
                <ellipse cx="38" cy="40" rx="8" ry="5" fill="#8B634788" />
            </svg>
        ),
        7: (
            // Type 7 - Watery
            <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
                <ellipse cx="30" cy="40" rx="22" ry="8" fill="#8B634744" />
                <path d="M10 35 Q15 25 20 35 Q25 45 30 35 Q35 25 40 35 Q45 45 50 35" stroke="#8B6347" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M12 42 Q20 32 28 42 Q36 52 44 42" stroke="#8B634788" strokeWidth="1.5" fill="none" />
                <ellipse cx="30" cy="38" rx="18" ry="5" fill="#8B634733" />
            </svg>
        ),
    };

    return illustrations[type] || null;
}