import { useEffect, useState } from 'react';

const SANITY_MESSAGES = [
  'A REALIDADE SE FRAGMENTA',
  'ELES ESTÃO OBSERVANDO',
  'OS SINOS NUNCA PARAM',
  'VOCÊ NÃO DEVERIA TER VINDO',
  'A CENCURSA SABE',
  'NÃO CONFIE NOS SEUS OLHOS',
];

export default function SanityBar({ value, maxValue = 100, showEffects = true }) {
  const [hiddenMsg, setHiddenMsg] = useState('');
  const pct = Math.max(0, Math.min(100, (value / maxValue) * 100));

  useEffect(() => {
    setHiddenMsg(SANITY_MESSAGES[Math.floor(Math.random() * SANITY_MESSAGES.length)]);
  }, [value]);

  const getSanityColor = () => {
    if (pct > 70) return 'var(--gold)';
    if (pct > 40) return '#C4A020';
    if (pct > 20) return 'var(--crimson)';
    return 'var(--alert)';
  };

  const getSanityLabel = () => {
    if (pct > 80) return 'ESTÁVEL';
    if (pct > 60) return 'ABALADO';
    if (pct > 40) return 'INSTÁVEL';
    if (pct > 20) return 'FRAGMENTADO';
    if (pct > 0)  return 'CRÍTICO';
    return 'MARCADO';
  };

  const getShakeClass = () => {
    if (!showEffects) return '';
    if (pct <= 20 && pct > 0) return 'sanity-shake-low';
    if (pct === 0) return 'sanity-shake-critical';
    return '';
  };

  return (
    <div className={`${getShakeClass()}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-terminal tracking-widest" style={{ color: 'var(--gold-dark)' }}>
          SANIDADE
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-terminal" style={{ color: getSanityColor() }}>
            {getSanityLabel()}
          </span>
          <span className="text-xs font-terminal" style={{ color: getSanityColor() }}>
            {value}/{maxValue}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 rounded-sm overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(196,169,90,0.15)' }}>
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${getSanityColor()}aa, ${getSanityColor()})`,
            boxShadow: `0 0 8px ${getSanityColor()}60`,
          }}
        />
        {/* Flicker overlay at low sanity */}
        {pct < 30 && pct > 0 && (
          <div className="absolute inset-0 flicker"
            style={{ background: `linear-gradient(90deg, transparent ${pct - 5}%, rgba(204,0,0,0.15) ${pct}%)` }} />
        )}
      </div>

      {/* Hidden messages that appear at low sanity */}
      {showEffects && pct < 40 && (
        <div className="mt-1 text-center overflow-hidden" style={{ height: '0.9rem' }}>
          <div
            className="text-xs font-terminal tracking-widest"
            style={{
              color: 'var(--alert)',
              opacity: pct < 20 ? 0.4 : 0.15,
              fontSize: '0.5rem',
              letterSpacing: '0.3em',
            }}
          >
            {hiddenMsg}
          </div>
        </div>
      )}

      {/* MARKED */}
      {value === 0 && showEffects && (
        <div className="mt-2 text-center pulse-blood py-1 px-2 rounded-sm"
          style={{ border: '1px solid rgba(204,0,0,0.5)', background: 'rgba(74,10,10,0.4)' }}>
          <span className="text-xs font-terminal tracking-[0.4em]" style={{ color: 'var(--alert)' }}>
            ◈ MARCADO ◈
          </span>
        </div>
      )}
    </div>
  );
}