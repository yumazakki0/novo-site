import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const LOG_ICONS = {
  sanity_loss: '◈', hp_change: '♥', status_applied: '⚡', status_removed: '✓',
  item_acquired: '⬡', item_removed: '⊗', souls_change: '◎', document_unlocked: '▣',
  power_granted: '✦', death: '☠', encounter: '◆', system: '▶', gm_action: '⬟',
  request_response: '◉', alert: '⚠',
};
const LOG_COLORS = {
  sanity_loss: '#CC0000', hp_change: '#CC3333', status_applied: '#9B59B6',
  status_removed: '#4A7A4A', item_acquired: '#C4A95A', item_removed: '#7A1515',
  souls_change: '#8B7536', document_unlocked: '#4A7A9B', power_granted: '#CC0000',
  death: '#CC0000', encounter: '#8B7536', system: 'rgba(232,232,232,0.5)',
  gm_action: '#C4A95A', request_response: '#8B7536', alert: '#CC0000',
};

export default function GMLogs() {
  const qc = useQueryClient();
  const [customMsg, setCustomMsg] = useState('');
  const [customType, setCustomType] = useState('system');
  const [customGlobal, setCustomGlobal] = useState(false);
  const [filterChar, setFilterChar] = useState('all');

  const { data: logs } = useQuery({
    queryKey: ['allLogs'],
    queryFn: () => client.entities.EventLog.list('-created_date', 100),
    refetchInterval: 10000,
  });

  const { data: characters } = useQuery({
    queryKey: ['allCharacters'],
    queryFn: () => client.entities.Character.list(),
  });

  const createLog = useMutation({
    mutationFn: data => client.entities.EventLog.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allLogs'] });
      setCustomMsg('');
    },
  });

  const deleteLog = useMutation({
    mutationFn: id => client.entities.EventLog.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allLogs'] }),
  });

  const handleCreateLog = () => {
    if (!customMsg.trim()) return;
    const data = { type: customType, message: customMsg, is_global: customGlobal };
    if (filterChar !== 'all') {
      const char = characters?.find(c => c.id === filterChar);
      data.character_id = filterChar;
      data.character_name = char?.name;
    }
    createLog.mutate(data);
  };

  const filtered = filterChar === 'all'
    ? (logs || [])
    : (logs || []).filter(l => l.character_id === filterChar || l.is_global);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ LOGS GLOBAIS — ACESSO TOTAL
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Registros Globais</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* Manual log */}
      <CencursaCard title="Inserir Registro Manualmente">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>TIPO</label>
              <select value={customType} onChange={e => setCustomType(e.target.value)}
                className="w-full p-2 text-xs font-terminal"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                {Object.keys(LOG_ICONS).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>SUJEITO (OPCIONAL)</label>
              <select value={filterChar} onChange={e => setFilterChar(e.target.value)}
                className="w-full p-2 text-xs font-terminal"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                <option value="all">Global / Nenhum</option>
                {(characters || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <input value={customMsg} onChange={e => setCustomMsg(e.target.value)}
            placeholder="Mensagem do log..."
            className="w-full p-2 text-sm font-body"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
          <div className="flex gap-3 items-center">
            <button onClick={() => setCustomGlobal(g => !g)}
              className="btn-cencursa"
              style={{ borderColor: customGlobal ? 'rgba(196,169,90,0.5)' : undefined, color: customGlobal ? 'var(--gold)' : undefined, fontSize: '0.6rem' }}>
              {customGlobal ? '⬟ GLOBAL' : '◇ MARCAR GLOBAL'}
            </button>
            <button onClick={handleCreateLog} disabled={createLog.isPending || !customMsg.trim()} className="btn-cencursa">
              ≡ INSERIR
            </button>
          </div>
        </div>
      </CencursaCard>

      {/* Log list */}
      <CencursaCard cornerOrnaments={false}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-terminal tracking-widest" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            {filtered.length} ENTRADA(S)
          </div>
          <div className="flex gap-2">
            <select value={filterChar} onChange={e => setFilterChar(e.target.value)}
              className="p-1.5 text-xs font-terminal"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none', fontSize: '0.6rem' }}>
              <option value="all">Todos</option>
              {(characters || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-0">
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-3 py-2 border-b group"
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
                      <span className="font-terminal mr-2" style={{ color: 'var(--alert)', fontSize: '0.6rem' }}>[GLOBAL]</span>
                    )}
                    {log.message}
                    {log.value !== undefined && log.value !== null && (
                      <span className="ml-2 font-terminal" style={{ color: log.value < 0 ? 'var(--alert)' : 'var(--gold-dark)', fontSize: '0.6rem' }}>
                        ({log.value > 0 ? '+' : ''}{log.value})
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button onClick={() => deleteLog.mutate(log.id)}
                      className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity text-xs"
                      style={{ color: 'var(--alert)' }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && (
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