export default function HPBar({ value, max = 10, showLabel = true }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = pct > 50 ? '#4A7A4A' : pct > 25 ? '#CC4400' : '#CC0000';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="font-terminal text-xs text-muted-foreground tracking-widest">VITALIDADE</span>
          <span className="font-terminal text-xs" style={{ color }}>{value}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-black/50 rounded-full border border-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}