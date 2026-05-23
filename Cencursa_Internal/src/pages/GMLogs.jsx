import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const LOG_TYPE_CONFIG = {
  sanity_loss:       { icon: '🌀', color: '#CC0000' },
  hp_change:         { icon: '💀', color: '#8B7536' },
  status_applied:    { icon: '⚠', color: '#CC4400' },
  status_removed:    { icon: '✓', color: '#4A7A4A' },
  item_acquired:     { icon: '◈', color: '#8B7536' },
  item_removed:      { icon: '◦', color: '#888' },
  souls_change:      { icon: '✦', color: '#C4A95A' },
  document_unlocked: { icon: '▤', color: '#4A7A4A' },
  power_granted:     { icon: '⛧', color: '#CC0000' },
  death:             { icon: '☠', color: '#CC0000' },
  encounter:         { icon: '◎', color: '#7828A0' },
  system:            { icon: '⊹', color: '#8B7536' },
  gm_action:         { icon: '◊', color: '#C4A95A' },
  request_response:  { icon: '→', color: '#4A7A4A' },
  alert:             { icon: '⚡', color: '#CC0000' },
};

export default function GMLogs() {
  const { user } = useOutletContext();

  const { data: logs = [] } = useQuery({
    queryKey: ['all-logs'],
    queryFn: () => base44.entities.EventLog.list('-created_date', 100),
    refetchInterval: 15000,
  });

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
          MONITORAMENTO GLOBAL
        </div>
        <h1 className="font-grimoire text-4xl text-cold">Logs Globais</h1>
        <div className="font-terminal text-xs text-gold mt-1">{logs.length} REGISTROS</div>
      </div>
      <div className="divider-gold" />

      <div className="mt-6 space-y-1 fade-in-up-delay-1">
        {logs.map(log => {
          const cfg = LOG_TYPE_CONFIG[log.type] || { icon: '◦', color: '#888' };
          return (
            <div
              key={log.id}
              className="flex gap-3 p-2 rounded-sm hover:bg-white/2 transition-colors"
              style={{ borderLeft: `2px solid ${cfg.color}33` }}
            >
              <span className="shrink-0 mt-0.5 text-sm" style={{ color: cfg.color }}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex gap-3">
                    {log.character_name && (
                      <span className="font-terminal text-xs text-gold/70">{log.character_name}</span>
                    )}
                    {log.is_global && (
                      <span className="font-terminal text-xs text-muted-foreground">GLOBAL</span>
                    )}
                  </div>
                  <span className="font-terminal text-xs text-muted-foreground opacity-40 shrink-0">
                    {new Date(log.created_date).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="font-body text-sm text-cold/80 leading-snug mt-0.5">{log.message}</p>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center py-16 font-terminal text-xs text-muted-foreground opacity-30">
            NENHUM REGISTRO
          </div>
        )}
      </div>
    </div>
  );
}