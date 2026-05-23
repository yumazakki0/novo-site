import { useState } from 'react';

const DEFAULT_ICONS = ['◈', '◆', '⬟', '✦', '◉', '⬡', '▣', '◎'];

export default function CharacterAvatar({ character, size = 'md', onUpload = null }) {
  const [hovering, setHovering] = useState(false);

  const sizes = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    const { client } = await import('@/api/client');
    const { file_url } = await client.integrations.Core.UploadFile({ file });
    onUpload(file_url);
  };

  // Deterministic icon based on name
  const iconIndex = character?.name
    ? character.name.charCodeAt(0) % DEFAULT_ICONS.length
    : 0;
  const defaultIcon = DEFAULT_ICONS[iconIndex];

  const isCritical = character?.sanity === 0;
  const isLow = character?.sanity > 0 && (character?.sanity / (character?.sanity_max || 100)) < 0.2;

  return (
    <div
      className={`relative ${sizes[size]} rounded-sm flex items-center justify-center shrink-0 overflow-hidden`}
      style={{
        background: character?.avatar_url
          ? 'transparent'
          : 'linear-gradient(135deg, var(--shadow), var(--abyss))',
        border: isCritical
          ? '2px solid rgba(204,0,0,0.8)'
          : isLow
          ? '1px solid rgba(204,0,0,0.4)'
          : '1px solid rgba(196,169,90,0.25)',
        boxShadow: isCritical
          ? '0 0 20px rgba(204,0,0,0.5), inset 0 0 10px rgba(74,10,10,0.5)'
          : isLow
          ? '0 0 10px rgba(204,0,0,0.2)'
          : '0 0 10px rgba(0,0,0,0.5)',
        cursor: onUpload ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {character?.avatar_url ? (
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span style={{ color: isCritical ? 'var(--alert)' : 'var(--gold-dark)' }}>
          {defaultIcon}
        </span>
      )}

      {/* Upload overlay */}
      {onUpload && hovering && (
        <label className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <span className="text-xs font-terminal" style={{ color: 'var(--gold)', fontSize: '0.5rem', letterSpacing: '0.1em' }}>
            FOTO
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      )}

      {/* Marked overlay */}
      {character?.is_marked && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(74,10,10,0.4)' }}>
          <div className="absolute bottom-0 left-0 right-0 text-center"
            style={{ fontSize: size === 'lg' ? '0.5rem' : '0.4rem', fontFamily: 'var(--font-terminal)', color: 'var(--alert)', letterSpacing: '0.1em', padding: '2px' }}>
            MARCADO
          </div>
        </div>
      )}
    </div>
  );
}