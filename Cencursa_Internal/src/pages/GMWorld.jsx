import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { client } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const WEATHER_OPTIONS = [
  { value: 'rain',     label: 'CHUVA',       icon: '🌧' },
  { value: 'fog',      label: 'NÉVOA',       icon: '🌫' },
  { value: 'storm',    label: 'TEMPESTADE',  icon: '⛈' },
  { value: 'clear',    label: 'CLARO',       icon: '🌙' },
  { value: 'blizzard', label: 'NEVASCA',     icon: '❄' },
  { value: 'ash',      label: 'CINZAS',      icon: '🌋' },
];

export default function GMWorld() {
  const { user } = useOutletContext();
  const qc = useQueryClient();

  const { data: worldStates = [] } = useQuery({
    queryKey: ['world-state'],
    queryFn: () => client.entities.WorldState.list(),
    refetchInterval: 10000,
  });

  const worldState = worldStates[0];

  const createWorld = useMutation({
    mutationFn: data => client.entities.WorldState.create(data),
    onSuccess: () => qc.invalidateQueries(['world-state']),
  });

  const updateWorld = useMutation({
    mutationFn: ({ id, data }) => client.entities.WorldState.update(id, data),
    onSuccess: () => qc.invalidateQueries(['world-state']),
  });

  const handleUpdate = async (data) => {
    if (worldState) {
      updateWorld.mutate({ id: worldState.id, data });
    } else {
      createWorld.mutate(data);
    }
  };

  const sendAlert = async (msg) => {
    if (!msg.trim()) return;
    await handleUpdate({ global_alert: msg, global_alert_active: true });
    await client.entities.EventLog.create({
      type: 'alert', message: `ALERTA GLOBAL: ${msg}`, is_global: true,
    });
  };

  const sendSystemMsg = async (msg) => {
    if (!msg.trim()) return;
    await handleUpdate({ system_message: msg, system_message_active: true });
    await client.entities.EventLog.create({
      type: 'system', message: `MENSAGEM DO SISTEMA: ${msg}`, is_global: true,
    });
  };

  const [alertInput, setAlertInput] = useState('');
  const [sysInput, setSysInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [phaseInput, setPhaseInput] = useState('');

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
          CONTROLE DO MUNDO
        </div>
        <h1 className="font-grimoire text-4xl text-cold">Estado do Mundo</h1>
        {worldState && (
          <div className="font-terminal text-xs text-gold mt-1">
            {worldState.phase} • {worldState.date_in_game}
          </div>
        )}
      </div>
      <div className="divider-gold" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Weather */}
        <div className="cencursa-card p-6 rounded-sm fade-in-up-delay-1">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">CLIMA ATUAL</div>
          <div className="grid grid-cols-3 gap-2">
            {WEATHER_OPTIONS.map(w => (
              <button
                key={w.value}
                onClick={() => handleUpdate({ weather: w.value })}
                className={`p-3 rounded-sm border text-center transition-all ${
                  worldState?.weather === w.value
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-gold/10 text-muted-foreground hover:border-gold/30'
                }`}
              >
                <div className="text-2xl mb-1">{w.icon}</div>
                <div className="font-terminal text-xs">{w.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Phase & session */}
        <div className="cencursa-card p-6 rounded-sm fade-in-up-delay-1">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">FASE E SESSÃO</div>
          <div className="space-y-3">
            {[
              { key: 'phase', label: 'FASE', placeholder: 'AFTER LIFE — PHASE I' },
              { key: 'date_in_game', label: 'DATA IN-GAME', placeholder: 'London, 2014' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-terminal text-xs text-gold/60 block mb-1">{f.label}</label>
                <div className="flex gap-2">
                  <input
                    defaultValue={worldState?.[f.key] || ''}
                    placeholder={f.placeholder}
                    onBlur={e => handleUpdate({ [f.key]: e.target.value })}
                    className="flex-1 bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="font-terminal text-xs text-gold/60 block mb-1">Nº SESSÃO</label>
              <input
                type="number"
                defaultValue={worldState?.session_number || 1}
                onBlur={e => handleUpdate({ session_number: parseInt(e.target.value) || 1 })}
                className="w-20 bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Global alert */}
        <div className="cencursa-card p-6 rounded-sm fade-in-up-delay-2">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">ALERTA GLOBAL</div>
          {worldState?.global_alert_active && (
            <div className="font-terminal text-xs text-alert mb-3 p-2 rounded-sm" style={{ background: 'rgba(204,0,0,0.1)' }}>
              ATIVO: {worldState.global_alert}
            </div>
          )}
          <div className="flex gap-2 mb-2">
            <input
              value={alertInput}
              onChange={e => setAlertInput(e.target.value)}
              placeholder="Mensagem de alerta..."
              className="flex-1 bg-black/50 border border-alert/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-alert/50 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { sendAlert(alertInput); setAlertInput(''); }} className="btn-cencursa btn-danger rounded-sm flex-1">
              ⚠ DISPARAR ALERTA
            </button>
            {worldState?.global_alert_active && (
              <button onClick={() => handleUpdate({ global_alert_active: false })} className="btn-cencursa rounded-sm px-3">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* System message */}
        <div className="cencursa-card p-6 rounded-sm fade-in-up-delay-2">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">MENSAGEM DO SISTEMA</div>
          {worldState?.system_message_active && (
            <div className="font-terminal text-xs text-gold mb-3 p-2 rounded-sm" style={{ background: 'rgba(196,169,90,0.08)' }}>
              ATIVO: {worldState.system_message}
            </div>
          )}
          <div className="flex gap-2 mb-2">
            <input
              value={sysInput}
              onChange={e => setSysInput(e.target.value)}
              placeholder="Mensagem do sistema..."
              className="flex-1 bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { sendSystemMsg(sysInput); setSysInput(''); }} className="btn-cencursa rounded-sm flex-1">
              ✦ ENVIAR MENSAGEM
            </button>
            {worldState?.system_message_active && (
              <button onClick={() => handleUpdate({ system_message_active: false })} className="btn-cencursa rounded-sm px-3">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* World event */}
        <div className="cencursa-card p-6 rounded-sm fade-in-up-delay-3 md:col-span-2">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">EVENTO NARRATIVO</div>
          {worldState?.world_event_active && (
            <div className="font-terminal text-xs text-gold/80 mb-3 p-3 rounded-sm italic font-body" style={{ background: 'rgba(74,10,10,0.15)', border: '1px solid rgba(204,0,0,0.2)' }}>
              "{worldState.world_event}"
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={eventInput}
              onChange={e => setEventInput(e.target.value)}
              placeholder="Descreva o evento narrativo..."
              className="flex-1 bg-black/50 border border-gold/20 text-cold font-body text-sm p-2 rounded-sm focus:border-gold/50 outline-none"
            />
            <button
              onClick={async () => {
                if (!eventInput.trim()) return;
                await handleUpdate({ world_event: eventInput, world_event_active: true });
                await client.entities.EventLog.create({ type: 'encounter', message: `EVENTO: ${eventInput}`, is_global: true });
                setEventInput('');
              }}
              className="btn-cencursa rounded-sm shrink-0"
            >
              ◈ ATIVAR
            </button>
            {worldState?.world_event_active && (
              <button onClick={() => handleUpdate({ world_event_active: false })} className="btn-cencursa rounded-sm px-3">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}