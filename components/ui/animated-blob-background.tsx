import React from 'react';

const blobKeyframes = `
@keyframes blob1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  25% { transform: translate(60px, -80px) scale(1.05); }
  50% { transform: translate(-40px, 60px) scale(0.97); }
  75% { transform: translate(80px, 40px) scale(1.03); }
}
@keyframes blob2 {
  0%, 100% { transform: translate(0px, 0px) scale(1.02); }
  25% { transform: translate(-70px, 50px) scale(0.96); }
  50% { transform: translate(50px, -70px) scale(1.04); }
  75% { transform: translate(-60px, -40px) scale(0.98); }
}
@keyframes blob3 {
  0%, 100% { transform: translate(0px, 0px) scale(0.98); }
  25% { transform: translate(80px, 60px) scale(1.03); }
  50% { transform: translate(-60px, -50px) scale(1.05); }
  75% { transform: translate(40px, -80px) scale(0.96); }
}
@keyframes blob4 {
  0%, 100% { transform: translate(0px, 0px) scale(1.01); }
  25% { transform: translate(-50px, -60px) scale(0.97); }
  50% { transform: translate(70px, 40px) scale(1.04); }
  75% { transform: translate(-30px, 70px) scale(0.99); }
}
`;

interface AnimatedBlobBackgroundProps {
    className?: string;
    /** 'light' uses pale blue base + low opacity blobs, 'dark' uses navy base + higher opacity */
    variant?: 'light' | 'dark';
}

export function AnimatedBlobBackground({ className, variant = 'dark' }: AnimatedBlobBackgroundProps) {
    const isLight = variant === 'light';
    const baseBg = isLight ? '#eff6ff' : '#020817';
    const blobOpacity = isLight ? 0.12 : 0.3;
    const overlayGradient = isLight
        ? `radial-gradient(ellipse at center, transparent 30%, ${baseBg} 75%)`
        : `radial-gradient(ellipse at center, transparent 30%, ${baseBg} 75%)`;

    return (
        <div className={`absolute inset-0 overflow-hidden ${className ?? ''}`} style={{ backgroundColor: baseBg }}>
            <style>{blobKeyframes}</style>

            {/* Blob 1 — deep blue, top-left */}
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '15%',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    backgroundColor: '#1d4ed8',
                    opacity: blobOpacity,
                    filter: 'blur(120px)',
                    animation: 'blob1 27s ease-in-out infinite',
                }}
            />

            {/* Blob 2 — primary blue, bottom-right */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '10%',
                    width: '800px',
                    height: '800px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    opacity: blobOpacity * 0.85,
                    filter: 'blur(120px)',
                    animation: 'blob2 33s ease-in-out infinite',
                }}
            />

            {/* Blob 3 — sky blue, center-right */}
            <div
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '25%',
                    width: '650px',
                    height: '650px',
                    borderRadius: '50%',
                    backgroundColor: '#0ea5e9',
                    opacity: blobOpacity * 0.93,
                    filter: 'blur(120px)',
                    animation: 'blob3 20s ease-in-out infinite',
                }}
            />

            {/* Blob 4 — indigo, bottom-left */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '5%',
                    width: '750px',
                    height: '750px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    opacity: blobOpacity,
                    filter: 'blur(120px)',
                    animation: 'blob4 25s ease-in-out infinite',
                }}
            />

            {/* Radial gradient overlay — contains the blobs */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: overlayGradient,
                }}
            />
        </div>
    );
}
