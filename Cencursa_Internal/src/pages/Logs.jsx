import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const LOG_TYPE_CONFIG = {
  sanity_loss:      { icon: '🌀', color: '#CC0000', label: 'SANIDADE' },
  hp_change:        { icon: '💀', color: '#8B7536', label: 'VITALIDADE' },
  status_applied:   { icon: '⚠', color: '#CC4400', label: 'STATUS' },
  status_removed:   { icon: '✓', color: '#4A7A4A', label: 'STATUS' },
  item_acquired:    { icon: '◈', color: '#8B7536', label: 'ITEM' },
  item_removed:     { icon: '◦', color: '#888', label: 'ITEM' },
  souls_change:     { icon: '✦', color: '#C4A95A', label: 'ALMAS' },
  document_unlocked:{ icon: '▤', color: '#4A7A4A', label: 'ARQUIVO' },
  power_granted:    { icon: '⛧', color: '#CC0000', label: 'PODER' },
  death:            { icon: '☠', color: '#CC0000', label: 'MORTE' },
  encounter:        { icon: '◎', color: '#7828A0', label: 'ENCONTRO' },
  system:           { icon: '⊹', color: '#8B7536', label: 'SISTEMA' },
  gm_action:        { icon: '◊', color: '#C4A95A', label: 'CONTROLE' },
  request_response: { icon: '→', color: '#4A7A4A', label: 'RESP.' },
  alert:            { icon: '⚡', color: '#CC0000', label: 'ALERTA' },
};

export default function Logs() {
  const { character } = useOutletContext();

  const { data: personalLogs = [] } = useQuery({
    queryKey: ['logs', character?.id],
    queryFn: () => base44.entities.EventLog.filter({ character_id: character.id }, '-created_date', 50),
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const { data: globalLogs = [] } = useQuery({
    queryKey: ['global-logs'],
    queryFn: () => base44.entities.EventLog.filter({ is_global: true }, '-created_date', 20),
    refetchInterval: 15000,
  });

  if (!character) return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
          HISTÓRICO DE EVENTOS
        </div>
        <h1 className="font-grimoire text-4xl text-cold">Logs</h1>
      </div>

      <div className="divider-gold" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Personal logs */}
        <div className="lg:col-span-2 fade-in-up-delay-1">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">
            ─ REGISTRO PESSOAL ─
          </div>
          <div className="space-y-1.5">
            {personalLogs.map(log => <LogEntry key={log.id} log={log} />)}
            {personalLogs.length === 0 && (
              <div className="font-terminal text-xs text-muted-foreground opacity-40 py-8 text-center">
                NENHUM REGISTRO ENCONTRADO
              </div>
            )}
          </div>
        </div>

        {/* Global logs */}
        <div className="fade-in-up-delay-2">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">
            ─ EVENTOS GLOBAIS ─
          </div>
          <div className="space-y-1.5">
            {globalLogs.map(log => <LogEntry key={log.id} log={log} compact />)}
            {globalLogs.length === 0 && (
              <div className="font-terminal text-xs text-muted-foreground opacity-40 py-8 text-center">
                NENHUM EVENTO GLOBAL
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogEntry({ log, compact = false }) {
  const cfg = LOG_TYPE_CONFIG[log.type] || { icon: '◦', color: '#888', label: log.type };
  return (
    <div
      className="flex gap-3 p-2 rounded-sm transition-colors hover:bg-white/2"
      style={{ borderLeft: `2px solid ${cfg.color}33` }}
    >
      <span className="shrink-0 mt-0.5" style={{ color: cfg.color }}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-terminal text-xs tracking-wider" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="font-terminal text-xs text-muted-foreground opacity-40 shrink-0">
            {new Date(log.created_date).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit',
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <p className="font-body text-sm text-cold/80 leading-snug mt-0.5">{log.message}</p>
        {!compact && log.character_name && (
          <div className="font-terminal text-xs text-muted-foreground opacity-50 mt-0.5">{log.character_name}</div>
        )}
      </div>
    </div>
  );
}