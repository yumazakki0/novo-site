const ATTR_LABELS = {
  str: 'FORÇA',
  agi: 'AGILIDADE',
  res: 'RESISTÊNCIA',
  int: 'INTELIGÊNCIA',
  per: 'PERCEPÇÃO',
  pre: 'PRESENÇA',
  will: 'VONTADE',
};

const getModifier = (val) => {
  const mod = Math.floor((val - 5) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export default function AttributeBar({ attrKey, value, maxValue = 10 }) {
  const pct = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const mod = getModifier(value);

  return (
    <div className="flex items-center gap-3 group">
      {/* Label */}
      <div className="w-24 shrink-0">
        <span className="text-xs font-terminal tracking-wider"
          style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
          {ATTR_LABELS[attrKey] || attrKey.toUpperCase()}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 relative h-1.5 rounded-sm overflow-hidden"
        style={{ background: 'rgba(196,169,90,0.1)', border: '1px solid rgba(196,169,90,0.1)' }}>
        <div
          className="attr-bar-fill h-full rounded-sm"
          style={{
            '--bar-width': `${pct}%`,
            background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
            boxShadow: '0 0 6px rgba(196,169,90,0.4)',
          }}
        />
      </div>

      {/* Value */}
      <div className="flex items-center gap-1 shrink-0 w-14 justify-end">
        <span className="text-sm font-terminal" style={{ color: 'var(--gold)' }}>
          {value}
        </span>
        <span className="text-xs font-terminal"
          style={{ color: parseInt(mod) >= 0 ? 'rgba(196,169,90,0.5)' : 'rgba(204,0,0,0.6)', fontSize: '0.6rem' }}>
          ({mod})
        </span>
      </div>
    </div>
  );
}