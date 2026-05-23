import { useEffect, useState } from 'react';

// Overlay atmosférico baseado na sanidade — muda visuais do site inteiro
export default function SanityAtmosphere({ sanityPct }) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [noiseFrame, setNoiseFrame] = useState(0);

  // Glitch aleatório em sanidade baixa
  useEffect(() => {
    if (sanityPct > 30) return;
    const interval = setInterval(() => {
      if (Math.random() < (sanityPct < 10 ? 0.4 : 0.15)) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150 + Math.random() * 200);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [sanityPct]);

  // Noise animation
  useEffect(() => {
    if (sanityPct > 20) return;
    const interval = setInterval(() => setNoiseFrame(f => f + 1), 100);
    return () => clearInterval(interval);
  }, [sanityPct]);

  if (sanityPct > 70) return null;

  return (
    <>
      {/* Red vignette at low sanity */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: `radial-gradient(ellipse at center, transparent 50%, rgba(74,10,10,${
          sanityPct < 10 ? 0.7 : sanityPct < 20 ? 0.5 : sanityPct < 40 ? 0.3 : 0.15
        }) 100%)`,
        transition: 'background 2s ease',
      }} />

      {/* Horizontal scanline distortion */}
      {sanityPct < 30 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {glitchActive && (
            <div style={{
              position: 'absolute',
              top: `${20 + Math.random() * 60}%`,
              left: 0,
              right: 0,
              height: `${1 + Math.random() * 4}px`,
              background: `rgba(204,0,0,${0.3 + Math.random() * 0.4})`,
              transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
            }} />
          )}
        </div>
      )}

      {/* Noise overlay at critical sanity */}
      {sanityPct < 15 && (
        <div className="fixed inset-0 pointer-events-none z-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${64 + noiseFrame % 3} 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          opacity: sanityPct < 5 ? 0.15 : 0.08,
        }} />
      )}

      {/* Sanidade 0 — tela de horror total */}
      {sanityPct === 0 && (
        <div className="fixed inset-0 pointer-events-none z-40" style={{
          background: 'rgba(20,0,0,0.3)',
          animation: 'pulse-blood 2s infinite',
        }} />
      )}
    </>
  );
}