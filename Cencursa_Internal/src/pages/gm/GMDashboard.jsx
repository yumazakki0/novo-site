import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const WEATHER_OPTIONS = ['rain', 'fog', 'storm', 'clear', 'blizzard', 'ash'];

export default function GMDashboard() {
  const qc = useQueryClient();
  const [alertText, setAlertText] = useState('');
  const [eventText, setEventText] = useState('');
  const [sysMsg, setSysMsg] = useState('');

  const { data: worldArr } = useQuery({
    queryKey: ['worldState'],
    queryFn: () => base44.entities.WorldState.list(),
    refetchInterval: 8000,
  });
  const world = worldArr?.[0];

  const { data: characters } = useQuery({
    queryKey: ['allCharacters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => base44.entities.Request.filter({ status: 'pending' }),
    refetchInterval: 15000,
  });

  const updateWorld = useMutation({
    mutationFn: async (data) => {
      if (world?.id) {
        return base44.entities.WorldState.update(world.id, data);
      } else {
        return base44.entities.WorldState.create(data);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worldState'] }),
  });

  const logEvent = useMutation({
    mutationFn: data => base44.entities.EventLog.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allLogs'] }),
  });

  const handleWeather = (w) => updateWorld.mutate({ ...world, weather: w });

  const handleAlert = () => {
    if (!alertText.trim()) return;
    updateWorld.mutate({ ...world, global_alert: alertText, global_alert_active: true });
    logEvent.mutate({ type: 'alert', message: `ALERTA GLOBAL: ${alertText}`, is_global: true });
    setAlertText('');
  };

  const handleClearAlert = () => updateWorld.mutate({ ...world, global_alert_active: false });

  const handleEvent = () => {
    if (!eventText.trim()) return;
    updateWorld.mutate({ ...world, world_event: eventText, world_event_active: true });
    logEvent.mutate({ type: 'system', message: `EVENTO: ${eventText}`, is_global: true });
    setEventText('');
  };

  const handleSysMsg = () => {
    if (!sysMsg.trim()) return;
    updateWorld.mutate({ ...world, system_message: sysMsg, system_message_active: true });
    setSysMsg('');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ PAINEL DE SUPERVISÃO — ACESSO TOTAL CONCEDIDO
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Controle do Mestre</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up-delay-1">
        {[
          { label: 'SUJEITOS', value: characters?.length || 0, to: '/gm/players', color: 'var(--gold)' },
          { label: 'SOLICITAÇÕES', value: pendingRequests?.length || 0, to: '/gm/requests', color: pendingRequests?.length > 0 ? 'var(--alert)' : 'var(--gold)' },
          { label: 'CLIMA', value: world?.weather?.toUpperCase() || '—', to: null, color: 'var(--gold-dark)' },
          { label: 'FASE', value: world?.session_number || 1, to: null, color: 'var(--gold-dark)' },
        ].map(stat => (
          <div key={stat.label}>
            {stat.to ? (
              <Link to={stat.to}>
                <div className="cencursa-card p-4 hover:ornament-border-gold transition-all">
                  <div className="text-xs font-terminal tracking-widest mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>{stat.label}</div>
                  <div className="font-terminal text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              </Link>
            ) : (
              <div className="cencursa-card p-4">
                <div className="text-xs font-terminal tracking-widest mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>{stat.label}</div>
                <div className="font-terminal text-2xl" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather */}
        <CencursaCard title="Controle Climático" subtitle="ESTADO DO MUNDO — AFTER LIFE">
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map(w => (
              <button key={w} onClick={() => handleWeather(w)}
                className="text-xs font-terminal px-3 py-2 transition-all"
                style={{
                  background: world?.weather === w ? 'rgba(196,169,90,0.15)' : 'transparent',
                  border: `1px solid ${world?.weather === w ? 'rgba(196,169,90,0.5)' : 'rgba(196,169,90,0.15)'}`,
                  color: world?.weather === w ? 'var(--gold)' : 'rgba(232,232,232,0.5)',
                  borderRadius: '2px', fontSize: '0.6rem', letterSpacing: '0.15em',
                }}>
                {w.toUpperCase()}
              </button>
            ))}
          </div>
        </CencursaCard>

        {/* Session */}
        <CencursaCard title="Sessão" subtitle="PARÂMETROS DA CAMPANHA">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                FASE / LOCALIZAÇÃO
              </label>
              <input
                defaultValue={world?.phase || ''}
                onBlur={e => updateWorld.mutate({ ...world, phase: e.target.value })}
                className="w-full p-2 text-xs font-terminal"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--gold)', borderRadius: '2px', outline: 'none' }}
              />
            </div>
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                DATA IN-GAME
              </label>
              <input
                defaultValue={world?.date_in_game || ''}
                onBlur={e => updateWorld.mutate({ ...world, date_in_game: e.target.value })}
                className="w-full p-2 text-xs font-terminal"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--gold)', borderRadius: '2px', outline: 'none' }}
              />
            </div>
          </div>
        </CencursaCard>
      </div>

      {/* Global Alert */}
      <CencursaCard title="Alerta Global" subtitle="TRANSMISSÃO PARA TODOS OS SUJEITOS">
        {world?.global_alert_active && (
          <div className="mb-4 p-3 pulse-blood"
            style={{ background: 'rgba(74,10,10,0.3)', border: '1px solid rgba(204,0,0,0.4)', borderRadius: '2px' }}>
            <div className="text-xs font-terminal mb-1" style={{ color: 'var(--alert)', fontSize: '0.55rem' }}>ALERTA ATIVO</div>
            <p className="text-sm font-body opacity-70" style={{ color: 'var(--cold-white)' }}>{world.global_alert}</p>
            <button onClick={handleClearAlert} className="mt-2 btn-cencursa btn-danger" style={{ fontSize: '0.6rem' }}>
              ✕ DESATIVAR ALERTA
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={alertText}
            onChange={e => setAlertText(e.target.value)}
            placeholder="Mensagem de alerta global..."
            className="flex-1 p-2 text-sm font-body"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(204,0,0,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}
          />
          <button onClick={handleAlert} className="btn-cencursa btn-danger">⚠ ENVIAR</button>
        </div>
      </CencursaCard>

      {/* World Event */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CencursaCard title="Evento Narrativo" subtitle="DISPARAR EVENTO DO MUNDO">
          {world?.world_event_active && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-terminal opacity-60" style={{ color: 'var(--gold)' }}>{world.world_event?.substring(0, 40)}...</span>
              <button onClick={() => updateWorld.mutate({ ...world, world_event_active: false })}
                className="text-xs font-terminal opacity-50 hover:opacity-80" style={{ color: 'var(--alert)' }}>✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={eventText}
              onChange={e => setEventText(e.target.value)}
              placeholder="Descrição do evento..."
              className="flex-1 p-2 text-sm font-body"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}
            />
            <button onClick={handleEvent} className="btn-cencursa">▶</button>
          </div>
        </CencursaCard>

        <CencursaCard title="Mensagem do Sistema" subtitle="BANNER PARA TODOS OS JOGADORES">
          {world?.system_message_active && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-terminal opacity-60" style={{ color: 'var(--cold-white)' }}>{world.system_message?.substring(0, 40)}...</span>
              <button onClick={() => updateWorld.mutate({ ...world, system_message_active: false })}
                className="text-xs font-terminal opacity-50 hover:opacity-80" style={{ color: 'var(--alert)' }}>✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={sysMsg}
              onChange={e => setSysMsg(e.target.value)}
              placeholder="Mensagem para o banner superior..."
              className="flex-1 p-2 text-sm font-body"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}
            />
            <button onClick={handleSysMsg} className="btn-cencursa">▶</button>
          </div>
        </CencursaCard>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: '/gm/players', icon: '◈', label: 'Gerenciar Jogadores', sub: 'fichas, hp, sanidade, itens' },
          { to: '/gm/documents', icon: '▣', label: 'Arquivos', sub: 'criar e desbloquear documentos' },
          { to: '/gm/requests', icon: '◉', label: 'Solicitações', sub: `${pendingRequests?.length || 0} pendente(s)` },
          { to: '/gm/logs', icon: '≡', label: 'Logs Globais', sub: 'histórico completo' },
          { to: '/gm/world', icon: '◎', label: 'Estado do Mundo', sub: 'configurações avançadas' },
        ].map(item => (
          <Link key={item.to} to={item.to}>
            <div className="cencursa-card p-4 hover:ornament-border-gold transition-all cursor-pointer">
              <div className="text-xl mb-2" style={{ color: 'var(--gold-dark)' }}>{item.icon}</div>
              <div className="font-grimoire text-sm" style={{ color: 'var(--cold-white)' }}>{item.label}</div>
              <div className="text-xs font-terminal opacity-40 mt-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}