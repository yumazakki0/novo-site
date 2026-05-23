const STATUS_CONFIG = {
  bleeding:   { label: 'Sangramento', icon: '🩸', color: '#CC0000' },
  fear:       { label: 'Medo',        icon: '👁',  color: '#8B4513' },
  corruption: { label: 'Corrupção',   icon: '☠',  color: '#7828A0' },
  exhaustion: { label: 'Exaustão',    icon: '💀',  color: '#8B7536' },
  insanity:   { label: 'Insanidade',  icon: '🌀',  color: '#CC0000' },
  curse:      { label: 'Maldição',    icon: '⛧',  color: '#4A0A0A' },
  infection:  { label: 'Infecção',    icon: '🧫',  color: '#2A5C1A' },
};

export default function StatusBadge({ type, duration, intensity = 'mild' }) {
  const cfg = STATUS_CONFIG[type] || { label: type, icon: '?', color: '#888' };
  const intensityAlpha = intensity === 'severe' ? 'ff' : intensity === 'moderate' ? 'bb' : '77';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border status-badge"
      style={{
        borderColor: `${cfg.color}44`,
        backgroundColor: `${cfg.color}11`,
        color: `${cfg.color}${intensityAlpha}`,
      }}
      title={`${cfg.label}${duration ? ` — ${duration}` : ''}`}
    >
      <span className="text-xs">{cfg.icon}</span>
      <span>{cfg.label}</span>
      {duration && <span className="opacity-60 ml-1">({duration})</span>}
    </div>
  );
}