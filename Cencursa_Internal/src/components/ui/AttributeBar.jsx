export default function AttributeBar({ label, value, max = 10 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const modifier = value >= 10 ? `+${value - 10}` : value >= 6 ? `+${Math.floor((value - 10) / 2)}` : `${Math.floor((value - 10) / 2)}`;

  return (
    <div className="flex items-center gap-3 group">
      <div className="w-24 font-terminal text-xs text-muted-foreground tracking-wider uppercase shrink-0">
        {label}
      </div>
      <div className="flex-1 h-1.5 bg-black/50 rounded-full border border-white/5 overflow-hidden">
        <div
          className="h-full rounded-full attr-bar-fill transition-all duration-1000"
          style={{
            '--bar-width': `${pct}%`,
            background: `linear-gradient(90deg, #4A0A0A, #C4A95A)`,
            boxShadow: '0 0 6px rgba(196,169,90,0.3)',
          }}
        />
      </div>
      <div className="w-6 font-terminal text-sm text-gold text-right shrink-0">{value}</div>
      <div className="w-8 font-terminal text-xs text-muted-foreground text-right shrink-0">{modifier}</div>
    </div>
  );
}