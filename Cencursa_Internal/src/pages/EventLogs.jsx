import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const LOG_ICONS = {
  sanity_loss: '◈', hp_change: '♥', status_applied: '⚡', status_removed: '✓',
  item_acquired: '⬡', item_removed: '⊗', souls_change: '◎', document_unlocked: '▣',
  power_granted: '✦', death: '☠', encounter: '◆', system: '▶', gm_action: '⬟',
  request_response: '◉', alert: '⚠',
};
const LOG_COLORS = {
  sanity_loss: 'var(--alert)', hp_change: '#CC3333', status_applied: '#9B59B6',
  status_removed: '#4A7A4A', item_acquired: 'var(--gold)', item_removed: 'var(--crimson)',
  souls_change: 'var(--gold-dark)', document_unlocked: '#4A7A9B', power_granted: 'var(--alert)',
  death: 'var(--alert)', encounter: 'var(--gold-dark)', system: 'rgba(232,232,232,0.4)',
  gm_action: 'var(--gold)', request_response: 'var(--gold-dark)', alert: 'var(--alert)',
};

export default function EventLogs() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data: characters } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => base44.entities.Character.filter({ player_email: user?.email }),
    enabled: !!user?.email,
  });
  const character = characters?.[0];

  const { data: logs } = useQuery({
    queryKey: ['allLogs', character?.id],
    queryFn: async () => {
      const personal = character?.id
        ? await base44.entities.EventLog.filter({ character_id: character.id }, '-created_date', 50)
        : [];
      const global = await base44.entities.EventLog.filter({ is_global: true }, '-created_date', 20);
      const all = [...personal, ...global].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const filtered = filter === 'all' ? (logs || []) : (logs || []).filter(l => l.type === filter);

  const types = [...new Set((logs || []).map(l => l.type))];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--gold-dark)', opacity: 0.5 }}>
          REGISTRO DE OCORRÊNCIAS — AFTER LIFE PROTOCOL
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Registros</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className="text-xs font-terminal px-2 py-1 transition-all"
          style={{
            background: filter === 'all' ? 'rgba(196,169,90,0.15)' : 'transparent',
            border: `1px solid ${filter === 'all' ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.1)'}`,
            color: filter === 'all' ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
            borderRadius: '2px', fontSize: '0.55rem', letterSpacing: '0.15em',
          }}>
          TODOS
        </button>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className="text-xs font-terminal px-2 py-1 transition-all"
            style={{
              background: filter === t ? `${LOG_COLORS[t]}20` : 'transparent',
              border: `1px solid ${filter === t ? `${LOG_COLORS[t]}60` : 'rgba(196,169,90,0.1)'}`,
              color: filter === t ? LOG_COLORS[t] : 'rgba(232,232,232,0.4)',
              borderRadius: '2px', fontSize: '0.55rem', letterSpacing: '0.15em',
            }}>
            {LOG_ICONS[t]} {t.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Log list */}
      <CencursaCard cornerOrnaments={false}>
        <div className="font-terminal text-xs mb-4 tracking-widest opacity-40" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
          {filtered.length} ENTRADA(S) — ACESSO PARCIAL CONCEDIDO
        </div>
        <div className="space-y-0">
          {filtered.map((log, i) => (
            <div key={log.id}
              className="flex items-start gap-3 py-2.5 border-b transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: 'rgba(196,169,90,0.06)' }}>
              <span className="shrink-0 text-xs mt-0.5" style={{ color: LOG_COLORS[log.type] || 'var(--gold-dark)' }}>
                {LOG_ICONS[log.type] || '◆'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-body" style={{ color: 'var(--cold-white)', opacity: 0.75, lineHeight: 1.5 }}>
                    {log.character_name && (
                      <span className="font-terminal mr-2" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                        [{log.character_name}]
                      </span>
                    )}
                    {log.is_global && (
                      <span className="font-terminal mr-2" style={{ color: 'var(--alert)', fontSize: '0.6rem' }}>
                        [GLOBAL]
                      </span>
                    )}
                    {log.message}
                    {log.value !== undefined && log.value !== null && (
                      <span className="ml-2 font-terminal" style={{ color: log.value < 0 ? 'var(--alert)' : 'var(--gold-dark)', fontSize: '0.6rem' }}>
                        ({log.value > 0 ? '+' : ''}{log.value})
                      </span>
                    )}
                  </p>
                  <span className="shrink-0 text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 opacity-30">
              <div className="text-3xl mb-3">≡</div>
              <p className="font-terminal text-xs" style={{ color: 'var(--gold-dark)' }}>NENHUM REGISTRO</p>
            </div>
          )}
        </div>
      </CencursaCard>
    </div>
  );
}