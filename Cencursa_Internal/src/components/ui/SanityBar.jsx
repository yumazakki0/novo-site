export default function SanityBar({ value, max = 100, showLabel = true }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = pct > 60 ? '#4A7A4A' : pct > 30 ? '#8B7536' : pct > 10 ? '#CC0000' : '#FF0000';
  const label = pct > 60 ? 'ESTÁVEL' : pct > 30 ? 'INSTÁVEL' : pct > 10 ? 'CRÍTICO' : 'MARCADO';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="font-terminal text-xs text-muted-foreground tracking-widest">SANIDADE</span>
          <span className="font-terminal text-xs" style={{ color }}>
            {value}/{max} — {label}
          </span>
        </div>
      )}
      <div className="h-2 bg-black/50 rounded-full border border-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}