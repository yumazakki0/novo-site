import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CencursaCard from '@/components/ui/CencursaCard';

const WEATHER_ICONS = { rain: '🌧', fog: '🌫', storm: '⛈', clear: '◎', blizzard: '❄', ash: '🌑' };
const WEATHER_DESCRIPTIONS = {
  rain: 'Chuva persistente. A névoa da cidade corrói a sanidade.',
  fog: 'Névoa densa. A visibilidade colapsa. O After Life sangra.',
  storm: 'Tempestade violenta. O véu entre dimensões se rasga.',
  clear: 'Silêncio perturbador. Calma antes da catástrofe.',
  blizzard: 'Nevasca sobrenatural. O frio apaga memórias.',
  ash: 'Cinzas caem do céu. Algo foi consumido.',
};

export default function GMWorld() {
  const qc = useQueryClient();

  const { data: worldArr } = useQuery({
    queryKey: ['worldState'],
    queryFn: () => base44.entities.WorldState.list(),
  });
  const world = worldArr?.[0];

  const updateWorld = useMutation({
    mutationFn: async (data) => {
      if (world?.id) return base44.entities.WorldState.update(world.id, data);
      return base44.entities.WorldState.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worldState'] }),
  });

  const set = (key, val) => updateWorld.mutate({ ...world, [key]: val });

  const inputStyle = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ ESTADO DO MUNDO — AFTER LIFE
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Estado do Mundo</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* Climate */}
      <CencursaCard title="Clima" subtitle="CONDIÇÃO ATMOSFÉRICA DO AFTER LIFE">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(WEATHER_ICONS).map(([w, icon]) => (
            <button key={w} onClick={() => set('weather', w)}
              className={`p-4 text-left transition-all cencursa-card ${world?.weather === w ? 'ornament-border-gold' : ''}`}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-terminal" style={{ color: world?.weather === w ? 'var(--gold)' : 'rgba(232,232,232,0.6)', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                {w.toUpperCase()}
              </div>
              <div className="text-xs font-body mt-1 opacity-50 line-clamp-2" style={{ color: 'var(--cold-white)', fontSize: '0.7rem' }}>
                {WEATHER_DESCRIPTIONS[w]}
              </div>
            </button>
          ))}
        </div>
      </CencursaCard>

      {/* Session info */}
      <CencursaCard title="Sessão" subtitle="PARÂMETROS DA CAMPANHA">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'phase', label: 'FASE / LOCALIZAÇÃO', placeholder: 'Ex: AFTER LIFE — PHASE I' },
            { key: 'date_in_game', label: 'DATA IN-GAME', placeholder: 'Ex: London, 2014' },
            { key: 'session_number', label: 'NÚMERO DA SESSÃO', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>{f.label}</label>
              <input
                type={f.type || 'text'}
                defaultValue={world?.[f.key] || ''}
                key={`${world?.id}-${f.key}`}
                placeholder={f.placeholder}
                onBlur={e => set(f.key, f.type === 'number' ? parseInt(e.target.value) || 1 : e.target.value)}
                className="w-full p-2 text-sm font-body"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </CencursaCard>

      {/* Active broadcasts */}
      <CencursaCard title="Transmissões Ativas" subtitle="MENSAGENS EM EXIBIÇÃO PARA OS JOGADORES">
        <div className="space-y-4">
          {/* Alert */}
          <div className="p-3 rounded-sm" style={{ background: world?.global_alert_active ? 'rgba(74,10,10,0.3)' : 'rgba(0,0,0,0.3)', border: `1px solid ${world?.global_alert_active ? 'rgba(204,0,0,0.4)' : 'rgba(196,169,90,0.08)'}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-terminal" style={{ color: world?.global_alert_active ? 'var(--alert)' : 'var(--gold-dark)', fontSize: '0.6rem' }}>
                ⚠ ALERTA GLOBAL
              </div>
              <button
                onClick={() => set('global_alert_active', !world?.global_alert_active)}
                className="text-xs font-terminal px-2 py-0.5 transition-all"
                style={{
                  background: world?.global_alert_active ? 'rgba(204,0,0,0.2)' : 'transparent',
                  border: `1px solid ${world?.global_alert_active ? 'rgba(204,0,0,0.5)' : 'rgba(196,169,90,0.2)'}`,
                  color: world?.global_alert_active ? 'var(--alert)' : 'rgba(232,232,232,0.4)',
                  borderRadius: '2px', fontSize: '0.55rem',
                }}>
                {world?.global_alert_active ? 'ATIVO — DESATIVAR' : 'INATIVO — ATIVAR'}
              </button>
            </div>
            <p className="text-sm font-body opacity-60" style={{ color: 'var(--cold-white)' }}>
              {world?.global_alert || 'Nenhum alerta configurado.'}
            </p>
          </div>

          {/* Event */}
          <div className="p-3 rounded-sm" style={{ background: world?.world_event_active ? 'rgba(139,117,54,0.1)' : 'rgba(0,0,0,0.3)', border: `1px solid ${world?.world_event_active ? 'rgba(196,169,90,0.3)' : 'rgba(196,169,90,0.08)'}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-terminal" style={{ color: world?.world_event_active ? 'var(--gold)' : 'var(--gold-dark)', fontSize: '0.6rem' }}>
                ◆ EVENTO NARRATIVO
              </div>
              <button
                onClick={() => set('world_event_active', !world?.world_event_active)}
                className="text-xs font-terminal px-2 py-0.5 transition-all"
                style={{
                  background: world?.world_event_active ? 'rgba(196,169,90,0.1)' : 'transparent',
                  border: `1px solid ${world?.world_event_active ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.15)'}`,
                  color: world?.world_event_active ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                  borderRadius: '2px', fontSize: '0.55rem',
                }}>
                {world?.world_event_active ? 'ATIVO — DESATIVAR' : 'INATIVO — ATIVAR'}
              </button>
            </div>
            <p className="text-sm font-body opacity-60" style={{ color: 'var(--cold-white)' }}>
              {world?.world_event || 'Nenhum evento configurado.'}
            </p>
          </div>

          {/* System msg */}
          <div className="p-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,169,90,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-terminal" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                ▶ MENSAGEM DO SISTEMA (BANNER)
              </div>
              <button
                onClick={() => set('system_message_active', !world?.system_message_active)}
                className="text-xs font-terminal px-2 py-0.5 transition-all"
                style={{
                  background: world?.system_message_active ? 'rgba(196,169,90,0.1)' : 'transparent',
                  border: `1px solid ${world?.system_message_active ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.15)'}`,
                  color: world?.system_message_active ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                  borderRadius: '2px', fontSize: '0.55rem',
                }}>
                {world?.system_message_active ? 'ATIVO — DESATIVAR' : 'INATIVO — ATIVAR'}
              </button>
            </div>
            <p className="text-sm font-body opacity-60" style={{ color: 'var(--cold-white)' }}>
              {world?.system_message || 'Nenhuma mensagem configurada.'}
            </p>
          </div>
        </div>
      </CencursaCard>
    </div>
  );
}