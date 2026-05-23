import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const NAV_PLAYER = [
  { path: '/dashboard', label: 'REGISTRO', icon: '◈' },
  { path: '/inventory', label: 'INVENTÁRIO', icon: '⚔' },
  { path: '/documents', label: 'DOCUMENTOS', icon: '▤' },
  { path: '/requests', label: 'SOLICITAÇÕES', icon: '⊹' },
  { path: '/logs', label: 'EVENTOS', icon: '◉' },
];

const NAV_GM = [
  { path: '/gm', label: 'CONTROLE', icon: '◈' },
  { path: '/gm/characters', label: 'AGENTES', icon: '◎' },
  { path: '/gm/documents', label: 'ARQUIVOS', icon: '▤' },
  { path: '/gm/world', label: 'MUNDO', icon: '✦' },
  { path: '/gm/logs', label: 'LOGS', icon: '◉' },
  { path: '/gm/requests', label: 'SOLICITAÇÕES', icon: '⊹' },
];

export default function Sidebar({ user, character }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const isGM = user?.role === 'admin';
  const nav = isGM ? NAV_GM : NAV_PLAYER;

  const sanity = character?.sanity ?? 100;
  const sanityPct = (sanity / (character?.sanity_max ?? 100)) * 100;

  return (
    <aside
      className="w-56 shrink-0 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0D0D0D 0%, #090909 100%)',
        borderRight: '1px solid rgba(196,169,90,0.1)',
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-6 pb-4 border-b border-gold/10">
        <div className="font-grimoire text-lg text-cold tracking-widest text-center">CENCURSA</div>
        <div className="font-terminal text-xs text-muted-foreground text-center tracking-[0.3em] mt-0.5 opacity-60">
          {isGM ? '//ADMIN//' : '//AGENT//'}
        </div>
      </div>

      {/* Character mini card */}
      {character && !isGM && (
        <div className="px-4 py-3 border-b border-gold/10">
          <div className="font-grimoire text-sm text-cold truncate">{character.name}</div>
          <div className="font-terminal text-xs text-muted-foreground truncate mb-2 opacity-70">{character.occupation}</div>
          <div className="space-y-1">
            <div className="flex justify-between font-terminal text-xs">
              <span className="text-muted-foreground">HP</span>
              <span style={{ color: '#4A7A4A' }}>{character.hp}/{character.hp_max}</span>
            </div>
            <div className="h-1 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(character.hp / character.hp_max) * 100}%`, background: '#4A7A4A' }}
              />
            </div>
            <div className="flex justify-between font-terminal text-xs mt-1">
              <span className="text-muted-foreground">SAN</span>
              <span style={{ color: sanityPct > 50 ? '#4A7A4A' : sanityPct > 20 ? '#8B7536' : '#CC0000' }}>
                {sanity}/{character.sanity_max}
              </span>
            </div>
            <div className="h-1 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sanityPct}%`,
                  background: sanityPct > 50 ? '#4A7A4A' : sanityPct > 20 ? '#8B7536' : '#CC0000'
                }}
              />
            </div>
          </div>
          {character.is_marked && (
            <div className="mt-2 font-terminal text-xs text-alert tracking-widest text-center pulse-blood py-0.5">
              ⛧ MARCADO ⛧
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {nav.map(item => {
          const active = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group ${
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted-foreground hover:text-cold hover:bg-white/3'
              }`}
            >
              <span className={`text-sm transition-colors ${active ? 'text-gold' : 'text-muted-foreground group-hover:text-gold-dark'}`}>
                {item.icon}
              </span>
              <span className="font-terminal text-xs tracking-[0.15em]">{item.label}</span>
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </nav>

      {/* User & logout */}
      <div className="px-4 py-4 border-t border-gold/10">
        <div className="font-terminal text-xs text-muted-foreground truncate mb-2 opacity-60">
          {user?.email}
        </div>
        <button
          onClick={() => logout('/')}
          className="font-terminal text-xs text-muted-foreground hover:text-alert transition-colors tracking-widest w-full text-left"
        >
          ← DESCONECTAR
        </button>
      </div>
    </aside>
  );
}