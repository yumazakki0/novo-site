import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { client } from '@/api/client';
import SanityAtmosphere from './SanityAtmosphere';

const NAV_PLAYER = [
  { path: '/', label: 'PAINEL', icon: '◈' },
  { path: '/sheet', label: 'FICHA', icon: '◆' },
  { path: '/inventory', label: 'INVENTÁRIO', icon: '⬡' },
  { path: '/documents', label: 'ARQUIVOS', icon: '▣' },
  { path: '/requests', label: 'SOLICITAÇÕES', icon: '◉' },
  { path: '/logs', label: 'REGISTROS', icon: '≡' },
];

const NAV_GM = [
  { path: '/gm', label: 'CONTROLE', icon: '⬟' },
  { path: '/gm/players', label: 'JOGADORES', icon: '◈' },
  { path: '/gm/documents', label: 'ARQUIVOS', icon: '▣' },
  { path: '/gm/requests', label: 'SOLICITAÇÕES', icon: '◉' },
  { path: '/gm/logs', label: 'LOGS', icon: '≡' },
  { path: '/gm/world', label: 'MUNDO', icon: '◎' },
  { path: '/gm/players/new', label: 'NOVO SUJEITO', icon: '✦' },
];

const WEATHER_ICONS = { rain: '🌧', fog: '🌫', storm: '⛈', clear: '◎', blizzard: '❄', ash: '🌑' };

export default function AppLayout({ isGM }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const { data: worldState } = useQuery({
    queryKey: ['worldState'],
    queryFn: () => client.entities.WorldState.list(),
    select: d => d[0],
    refetchInterval: 8000,
  });

  // Fetch player's character for sanity atmosphere (only for players)
  const { data: myCharacter } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => client.entities.Character.filter({ player_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email && !isGM,
    refetchInterval: 15000,
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nav = isGM ? NAV_GM : NAV_PLAYER;

  const sanityPct = myCharacter
    ? (myCharacter.sanity / (myCharacter.sanity_max || 100)) * 100
    : 100;

  // Clima tenso quando sanidade = 0
  const isSanityZero = !isGM && myCharacter && myCharacter.sanity === 0;
  const bgStyle = isSanityZero
    ? { background: 'radial-gradient(ellipse at center, #1a0000 0%, #080000 100%)' }
    : { background: 'var(--void)' };

  return (
    <div className="min-h-screen flex" style={bgStyle}>
      {/* Sanity atmosphere overlay — only for players */}
      {!isGM && <SanityAtmosphere sanityPct={sanityPct} />}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 flex flex-col
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `} style={{
        background: isSanityZero ? 'rgba(10,0,0,0.95)' : 'var(--abyss)',
        borderRight: `1px solid ${isSanityZero ? 'rgba(204,0,0,0.2)' : 'rgba(196,169,90,0.12)'}`,
      }}>

        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: isSanityZero ? 'rgba(204,0,0,0.15)' : 'rgba(196,169,90,0.1)' }}>
          <div className="text-xs font-terminal tracking-widest mb-1" style={{ color: isSanityZero ? 'rgba(204,0,0,0.5)' : 'var(--gold-dark)', opacity: 0.7 }}>
            CENCURSA CORP.
          </div>
          <div className={`font-grimoire text-sm ${isSanityZero ? 'flicker' : ''}`}
            style={{ color: isSanityZero ? 'var(--alert)' : 'var(--gold)', lineHeight: 1.3 }}>
            Quando Os Sinos Tocam
          </div>
          <div className="text-xs font-terminal mt-1 opacity-30" style={{ color: 'var(--cold-white)' }}>
            {worldState?.phase || 'AFTER LIFE — PHASE I'}
          </div>
        </div>

        {/* Player mini card on sidebar */}
        {!isGM && myCharacter && (
          <div className="mx-3 mt-3 p-2 rounded-sm" style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${isSanityZero ? 'rgba(204,0,0,0.3)' : 'rgba(196,169,90,0.1)'}`,
          }}>
            <div className="font-grimoire text-sm truncate" style={{ color: isSanityZero ? 'var(--alert)' : 'var(--gold)' }}>
              {myCharacter.name}
            </div>
            <div className="flex gap-2 mt-1 text-xs font-terminal" style={{ fontSize: '0.55rem' }}>
              <span style={{ color: myCharacter.hp < myCharacter.hp_max * 0.3 ? 'var(--alert)' : 'rgba(232,232,232,0.5)' }}>
                HP {myCharacter.hp}/{myCharacter.hp_max}
              </span>
              <span style={{ color: isSanityZero ? 'var(--alert)' : 'rgba(196,169,90,0.5)' }}>
                SAN {myCharacter.sanity}/{myCharacter.sanity_max}
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {isGM && (
            <div className="text-xs font-terminal tracking-widest mb-3 px-2" style={{ color: 'var(--alert)', opacity: 0.7 }}>
              ◈ GM ACCESS
            </div>
          )}
          {nav.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-terminal tracking-widest transition-all duration-200"
                style={{
                  color: active ? (isSanityZero ? 'var(--alert)' : 'var(--gold)') : 'rgba(232,232,232,0.4)',
                  background: active ? (isSanityZero ? 'rgba(204,0,0,0.1)' : 'rgba(196,169,90,0.08)') : 'transparent',
                  borderLeft: active ? `2px solid ${isSanityZero ? 'var(--alert)' : 'var(--gold)'}` : '2px solid transparent',
                  borderRadius: '2px',
                }}>
                <span style={{ color: active ? (isSanityZero ? 'var(--alert)' : 'var(--gold)') : 'var(--gold-dark)' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Alert banner */}
        {worldState?.global_alert_active && (
          <div className="mx-3 mb-3 p-2 pulse-blood"
            style={{ border: '1px solid rgba(204,0,0,0.4)', borderRadius: '2px', background: 'rgba(74,10,10,0.3)' }}>
            <div className="text-xs font-terminal" style={{ color: 'var(--alert)' }}>⚠ ALERTA ATIVO</div>
            <div className="text-xs font-body mt-1 opacity-70 line-clamp-2" style={{ color: 'var(--cold-white)' }}>
              {worldState.global_alert}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(196,169,90,0.08)' }}>
          <div className="text-xs font-terminal opacity-30 mb-1" style={{ color: 'var(--cold-white)' }}>
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs font-terminal mb-2 opacity-40" style={{ color: isSanityZero ? 'var(--alert)' : 'var(--gold-dark)' }}>
            {user?.full_name || user?.email?.split('@')[0]}
            {isGM && <span className="ml-1 opacity-70" style={{ color: 'var(--alert)' }}>[GM]</span>}
          </div>
          <button
            onClick={() => logout('/')}
            className="text-xs font-terminal tracking-widest opacity-40 hover:opacity-70 transition-opacity w-full text-left"
            style={{ color: 'var(--alert)' }}>
            ⊗ DESCONECTAR
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
          style={{
            background: isSanityZero ? 'rgba(10,0,0,0.95)' : 'rgba(9,9,9,0.9)',
            borderBottom: `1px solid ${isSanityZero ? 'rgba(204,0,0,0.2)' : 'rgba(196,169,90,0.1)'}`,
            backdropFilter: 'blur(8px)',
          }}>
          <button
            className="lg:hidden p-1 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            style={{ color: 'var(--gold-dark)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {worldState && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-terminal opacity-50"
                style={{ color: isSanityZero ? 'var(--alert)' : 'var(--gold)' }}>
                <span>{WEATHER_ICONS[worldState.weather] || '◎'}</span>
                <span>{worldState.weather?.toUpperCase()}</span>
                <span className="opacity-40">|</span>
                <span>{worldState.date_in_game}</span>
              </div>
            )}
            {/* Sanity indicator */}
            {!isGM && myCharacter && (
              <div className="text-xs font-terminal px-2 py-0.5 rounded-sm hidden sm:block"
                style={{
                  background: isSanityZero ? 'rgba(74,10,10,0.5)' : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${isSanityZero ? 'rgba(204,0,0,0.5)' : 'rgba(196,169,90,0.15)'}`,
                  color: isSanityZero ? 'var(--alert)' : sanityPct < 30 ? 'var(--crimson)' : 'rgba(196,169,90,0.6)',
                  fontSize: '0.55rem',
                }}>
                {isSanityZero ? '◈ MARCADO' : `SAN ${myCharacter.sanity}%`}
              </div>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${isSanityZero ? 'bg-red-700 pulse-blood' : 'bg-green-600 animate-pulse'}`} />
          </div>
        </header>

        {/* System message banner */}
        {worldState?.system_message_active && worldState?.system_message && (
          <div className="px-4 py-2 text-center text-xs font-terminal tracking-widest flicker"
            style={{ background: 'rgba(74,10,10,0.5)', color: 'var(--cold-white)', borderBottom: '1px solid rgba(204,0,0,0.3)' }}>
            ▶ {worldState.system_message}
          </div>
        )}

        {/* Sanity 0 — horror banner */}
        {isSanityZero && (
          <div className="px-4 py-3 text-center pulse-blood"
            style={{ background: 'rgba(74,10,10,0.6)', borderBottom: '1px solid rgba(204,0,0,0.5)' }}>
            <div className="font-grimoire text-sm flicker" style={{ color: 'var(--alert)', letterSpacing: '0.3em' }}>
              ◈ OS SINOS TOCAM PARA VOCÊ ◈
            </div>
            <div className="text-xs font-terminal mt-1 opacity-50" style={{ color: 'var(--cold-white)' }}>
              SANIDADE COMPROMETIDA — SUJEITO MARCADO PELA CENCURSA
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <Outlet context={{ character: myCharacter }} />
        </div>
      </main>
    </div>
  );
}