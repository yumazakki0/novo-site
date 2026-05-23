import { useEffect, useState } from 'react';

export default function SoulsCounter({ value = 0 }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const diff = value - display;
    if (diff === 0) return;
    const step = diff > 0 ? 1 : -1;
    const interval = setInterval(() => {
      setDisplay(prev => {
        const next = prev + step;
        if (step > 0 && next >= value) { clearInterval(interval); return value; }
        if (step < 0 && next <= value) { clearInterval(interval); return value; }
        return next;
      });
    }, Math.max(20, 300 / Math.abs(diff)));
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg" style={{ filter: 'drop-shadow(0 0 6px #C4A95A88)' }}>✦</span>
      <span className="font-terminal text-gold text-xl tracking-wider">{display.toLocaleString()}</span>
      <span className="font-terminal text-xs text-muted-foreground tracking-[0.2em]">ALMAS</span>
    </div>
  );
}