import { useEffect, useState } from 'react';

export default function SoulsCounter({ value }) {
  const [displayed, setDisplayed] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value === displayed) return;
    setAnimating(true);
    const diff = value - displayed;
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayed(prev => {
        const next = prev + Math.round(diff / steps);
        if (step >= steps) { clearInterval(interval); setAnimating(false); return value; }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className={`flex items-center gap-3 ${animating ? 'gold-glow' : ''}`}>
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* Spectral rings */}
        <div className="absolute inset-0 rounded-full border animate-ping"
          style={{ borderColor: 'rgba(196,169,90,0.2)', animationDuration: '2s' }} />
        <div className="absolute inset-1 rounded-full border"
          style={{ borderColor: 'rgba(196,169,90,0.3)' }} />
        <span style={{ fontSize: '1rem', zIndex: 1 }}>◈</span>
      </div>

      <div>
        <div className="text-xs font-terminal tracking-widest mb-0.5" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
          ALMAS
        </div>
        <div className="font-terminal text-xl" style={{ color: 'var(--gold)', textShadow: '0 0 10px rgba(196,169,90,0.5)' }}>
          {displayed.toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
}