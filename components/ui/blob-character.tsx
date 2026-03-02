import React, { useEffect, useRef, useState } from 'react';

const bobKeyframes = `
@keyframes blobBob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
`;

interface BlobCharacterProps {
    className?: string;
}

export function BlobCharacter({ className }: BlobCharacterProps) {
    const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
    const blobRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!blobRef.current) return;
            const rect = blobRef.current.getBoundingClientRect();
            const blobCenterX = rect.left + rect.width / 2;
            const blobCenterY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - blobCenterY, e.clientX - blobCenterX);
            setPupilOffset({
                x: Math.cos(angle) * 4,
                y: Math.sin(angle) * 4,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={blobRef} className={className} style={{ animation: 'blobBob 3s ease-in-out infinite' }}>
            <style>{bobKeyframes}</style>
            <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Blob body — organic irregular shape */}
                <path
                    d="M110 18C60 18 28 48 22 82C16 116 30 148 56 168C82 188 138 192 166 172C194 152 206 118 198 82C190 46 160 18 110 18Z"
                    fill="#2563eb"
                />
                {/* Highlight spot — upper left */}
                <ellipse cx="75" cy="60" rx="28" ry="22" fill="#3b82f6" opacity="0.5" />
                <ellipse cx="68" cy="54" rx="12" ry="9" fill="#60a5fa" opacity="0.4" />

                {/* Left eye — white */}
                <ellipse cx="82" cy="95" rx="16" ry="18" fill="white" />
                {/* Left pupil */}
                <circle
                    cx={82 + pupilOffset.x}
                    cy={95 + pupilOffset.y}
                    r="7"
                    fill="#1e293b"
                />
                {/* Left eye shine */}
                <circle cx={79 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="3" fill="white" opacity="0.8" />

                {/* Right eye — white */}
                <ellipse cx="138" cy="95" rx="16" ry="18" fill="white" />
                {/* Right pupil */}
                <circle
                    cx={138 + pupilOffset.x}
                    cy={95 + pupilOffset.y}
                    r="7"
                    fill="#1e293b"
                />
                {/* Right eye shine */}
                <circle cx={135 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="3" fill="white" opacity="0.8" />

                {/* Smile */}
                <path
                    d="M95 130 Q110 146 125 130"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}
