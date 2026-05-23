const STATUS_CONFIG = {
  bleeding:   { icon: '🩸', label: 'Sangramento', color: '#CC0000', bg: 'rgba(204,0,0,0.15)' },
  fear:       { icon: '👁', label: 'Medo',        color: '#9B59B6', bg: 'rgba(155,89,182,0.15)' },
  corruption: { icon: '☠', label: 'Corrupção',   color: '#7A1515', bg: 'rgba(122,21,21,0.2)' },
  exhaustion: { icon: '⚡', label: 'Exaustão',    color: '#8B7536', bg: 'rgba(139,117,54,0.15)' },
  insanity:   { icon: '◈', label: 'Insanidade',  color: '#CC0000', bg: 'rgba(204,0,0,0.2)' },
  curse:      { icon: '⛧', label: 'Maldição',    color: '#4A0A0A', bg: 'rgba(74,10,10,0.3)', border: '#7A1515' },
  infection:  { icon: '☣', label: 'Infecção',    color: '#2D6A2D', bg: 'rgba(45,106,45,0.2)' },
};

export default function StatusBadge({ type, intensity, duration, description, onRemove }) {
  const cfg = STATUS_CONFIG[type] || { icon: '◆', label: type, color: 'var(--gold)', bg: 'rgba(196,169,90,0.1)' };

  return (
    <div
      className="relative group flex items-center gap-2 px-2 py-1.5 rounded-sm status-badge"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border || cfg.color}40`,
        color: cfg.color,
      }}
      title={description || cfg.label}
    >
      <span style={{ fontSize: '0.75rem' }}>{cfg.icon}</span>
      <div className="flex flex-col">
        <span className="font-terminal" style={{ fontSize: '0.55rem', letterSpacing: '0.15em' }}>
          {cfg.label.toUpperCase()}
        </span>
        {duration && (
          <span className="font-terminal opacity-50" style={{ fontSize: '0.5rem' }}>
            {duration}
          </span>
        )}
      </div>
      {intensity && (
        <span className="ml-1 font-terminal opacity-50" style={{ fontSize: '0.5rem' }}>
          [{intensity}]
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-xs"
          style={{ color: 'var(--alert)' }}
        >×</button>
      )}
    </div>
  );
}