import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SanityBar from '@/components/character/SanityBar';
import SoulsCounter from '@/components/character/SoulsCounter';
import StatusBadge from '@/components/character/StatusBadge';
import CencursaCard from '@/components/ui/CencursaCard';
import CharacterAvatar from '@/components/character/CharacterAvatar';
import { Link } from 'react-router-dom';

const LOG_ICONS = {
  sanity_loss: '◈', hp_change: '🩸', status_applied: '⚡', status_removed: '✓',
  item_acquired: '⬡', item_removed: '✕', souls_change: '◆', document_unlocked: '▣',
  power_granted: '✦', death: '☠', encounter: '◉', system: '▶', gm_action: '◈',
  request_response: '◉', alert: '⚠',
};

export default function PlayerDashboard() {
  const { user } = useAuth();

  const { data: characters, isLoading } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => base44.entities.Character.filter({ player_email: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });
  const character = characters?.[0];

  const { data: statuses } = useQuery({
    queryKey: ['statuses', character?.id],
    queryFn: () => base44.entities.StatusEffect.filter({ character_id: character.id, is_active: true }),
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const { data: worldState } = useQuery({
    queryKey: ['worldState'],
    queryFn: () => base44.entities.WorldState.list(),
    select: d => d[0],
    refetchInterval: 8000,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['recentLogs', character?.id],
    queryFn: () => base44.entities.EventLog.filter({ character_id: character.id }, '-created_date', 6),
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingRequests', character?.id],
    queryFn: () => base44.entities.Request.filter({ character_id: character.id, status: 'pending' }),
    enabled: !!character?.id,
    refetchInterval: 20000,
  });

  const { data: recentApproved } = useQuery({
    queryKey: ['approvedRequests', character?.id],
    queryFn: () => base44.entities.Request.filter({ character_id: character.id, status: 'approved' }, '-updated_date', 2),
    enabled: !!character?.id,
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xs font-terminal tracking-widest opacity-40 animate-pulse" style={{ color: 'var(--gold)' }}>
          CARREGANDO DADOS...
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-5xl mb-5 opacity-20" style={{ color: 'var(--gold)' }}>◈</div>
          <div className="font-grimoire text-2xl mb-3" style={{ color: 'var(--gold)' }}>
            Nenhum Personagem Vinculado
          </div>
          <p className="text-sm font-terminal opacity-40 max-w-xs" style={{ color: 'var(--cold-white)' }}>
            Aguarde o Mestre criar e vincular seu personagem ao sistema.
          </p>
        </div>
      </div>
    );
  }

  const sanityPct = (character.sanity / (character.sanity_max || 100)) * 100;
  const hpPct = (character.hp / (character.hp_max || 10)) * 100;
  const isCritical = sanityPct === 0;
  const shakeClass = sanityPct <= 20 && sanityPct > 0 ? 'sanity-shake-low'
    : isCritical ? 'sanity-shake-critical' : '';

  return (
    <div className={`p-4 md:p-6 space-y-5 max-w-6xl mx-auto ${shakeClass}`}>
      
      {/* World event banner */}
      {worldState?.world_event_active && worldState.world_event && (
        <div className="p-3 flicker text-center"
          style={{ background: 'rgba(74,10,10,0.4)', border: '1px solid rgba(204,0,0,0.4)', borderRadius: '2px' }}>
          <div className="font-grimoire text-base" style={{ color: 'var(--gold)' }}>
            {worldState.world_event}
          </div>
        </div>
      )}

      {/* Recently approved requests notification */}
      {recentApproved?.length > 0 && (
        <div className="p-3"
          style={{ background: 'rgba(139,117,54,0.1)', border: '1px solid rgba(196,169,90,0.3)', borderRadius: '2px' }}>
          <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>
            ◆ MESTRE RESPONDEU
          </div>
          {recentApproved.slice(0, 1).map(r => (
            <div key={r.id}>
              <p className="text-sm font-body opacity-80" style={{ color: 'var(--cold-white)' }}>{r.description}</p>
              {r.gm_response && (
                <p className="text-xs font-terminal mt-1 italic opacity-60" style={{ color: 'var(--gold-dark)' }}>
                  "{r.gm_response}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header identity */}
      <div className="fade-in-up flex items-start gap-5">
        <CharacterAvatar character={character} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-terminal tracking-[0.25em] mb-1" style={{ color: 'var(--gold-dark)', opacity: 0.6, fontSize: '0.6rem' }}>
            IDENTIFICAÇÃO DE SUJEITO — PROTOCOLO AFTER LIFE
          </div>
          <h1 className="font-grimoire text-3xl md:text-4xl" style={{
            color: isCritical ? 'var(--alert)' : 'var(--cold-white)',
            textShadow: isCritical ? '0 0 20px rgba(204,0,0,0.3)' : '0 0 20px rgba(196,169,90,0.2)',
          }}>
            {character.name}
          </h1>
          <div className="flex gap-3 mt-1 flex-wrap">
            {character.occupation && (
              <span className="text-xs font-terminal" style={{ color: 'var(--gold-dark)' }}>{character.occupation}</span>
            )}
            {character.nationality && (
              <span className="text-xs font-terminal opacity-50" style={{ color: 'var(--cold-white)' }}>
                ◆ {character.nationality}
              </span>
            )}
            {character.player_name && (
              <span className="text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                [{character.player_name}]
              </span>
            )}
          </div>
          {character.is_marked && (
            <div className="mt-2 inline-flex pulse-blood px-3 py-1"
              style={{ border: '1px solid rgba(204,0,0,0.6)', background: 'rgba(74,10,10,0.4)', borderRadius: '2px' }}>
              <span className="font-terminal text-xs tracking-[0.4em]" style={{ color: 'var(--alert)' }}>◈ MARCADO ◈</span>
            </div>
          )}
        </div>
      </div>

      <div className="divider-gold" />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in-up-delay-1">
        {/* HP */}
        <CencursaCard>
          <div className="text-xs font-terminal tracking-widest mb-2" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            INTEGRIDADE FÍSICA
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-grimoire text-2xl" style={{ color: hpPct > 50 ? 'var(--cold-white)' : 'var(--alert)' }}>
              {character.hp}
            </span>
            <span className="font-terminal text-sm opacity-40" style={{ color: 'var(--cold-white)' }}>
              / {character.hp_max}
            </span>
          </div>
          <div className="h-2 rounded-sm overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(196,169,90,0.1)' }}>
            <div className="h-full transition-all duration-700"
              style={{
                width: `${hpPct}%`,
                background: hpPct > 50 ? 'linear-gradient(90deg, #7A1515, #C41515)' : 'linear-gradient(90deg, #4A0A0A, var(--alert))',
                boxShadow: `0 0 6px ${hpPct > 50 ? 'rgba(196,21,21,0.4)' : 'rgba(204,0,0,0.7)'}`,
              }} />
          </div>
          <div className="mt-1 text-xs font-terminal opacity-40" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem' }}>
            {hpPct < 30 ? 'ESTADO CRÍTICO' : hpPct < 60 ? 'FERIDO' : 'ESTÁVEL'}
          </div>
        </CencursaCard>

        {/* Sanity */}
        <CencursaCard>
          <SanityBar value={character.sanity} maxValue={character.sanity_max} showEffects={true} />
        </CencursaCard>

        {/* Souls */}
        <CencursaCard>
          <SoulsCounter value={character.souls || 0} />
          <div className="mt-3 text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem' }}>
            MOEDA DO AFTER LIFE
          </div>
        </CencursaCard>
      </div>

      {/* Status effects */}
      {statuses?.length > 0 && (
        <CencursaCard title="Condições Ativas" subtitle="STATUS PSICOFÍSICOS DETECTADOS" className="fade-in-up-delay-2">
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <StatusBadge key={s.id} type={s.type} intensity={s.intensity} duration={s.duration} description={s.description} />
            ))}
          </div>
        </CencursaCard>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up-delay-2">
        {[
          { to: '/sheet', icon: '◆', label: 'Ficha Completa', sub: 'atributos & perfil' },
          { to: '/inventory', icon: '⬡', label: 'Inventário', sub: 'itens & artefatos' },
          { to: '/documents', icon: '▣', label: 'Arquivos', sub: 'documentos desbloqueados' },
          {
            to: '/requests', icon: '◉', label: 'Solicitações',
            sub: pendingRequests?.length ? `${pendingRequests.length} pendente(s)` : 'enviar ao mestre',
            alert: pendingRequests?.length > 0,
          },
        ].map(item => (
          <Link key={item.to} to={item.to}>
            <div className={`cencursa-card p-4 h-full cursor-pointer transition-all ${item.alert ? 'ornament-border-gold' : ''}`}>
              <div className="text-xl mb-2" style={{ color: item.alert ? 'var(--gold)' : 'var(--gold-dark)' }}>{item.icon}</div>
              <div className="font-grimoire text-sm" style={{ color: 'var(--cold-white)' }}>{item.label}</div>
              <div className="text-xs font-terminal opacity-40 mt-1" style={{
                color: item.alert ? 'var(--gold)' : 'var(--gold-dark)', fontSize: '0.55rem',
              }}>
                {item.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* World context */}
      {worldState && (
        <CencursaCard className="fade-in-up-delay-3">
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>FASE</div>
              <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.8 }}>{worldState.phase}</div>
            </div>
            <div>
              <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>LOCALIZAÇÃO</div>
              <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.8 }}>{worldState.date_in_game}</div>
            </div>
            <div>
              <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>CLIMA</div>
              <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.8 }}>
                {worldState.weather?.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>SESSÃO</div>
              <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.8 }}>#{worldState.session_number}</div>
            </div>
          </div>
        </CencursaCard>
      )}

      {/* Recent logs */}
      {recentLogs?.length > 0 && (
        <CencursaCard title="Registro Recente" subtitle="ÚLTIMAS OCORRÊNCIAS DOCUMENTADAS" className="fade-in-up-delay-3">
          <div className="space-y-1">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b"
                style={{ borderColor: 'rgba(196,169,90,0.06)' }}>
                <span className="text-sm shrink-0 mt-0.5 opacity-60">
                  {LOG_ICONS[log.type] || '◆'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.75 }}>
                    {log.message}
                  </div>
                  <div className="text-xs font-terminal opacity-30 mt-0.5" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem' }}>
                    {new Date(log.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/logs" className="mt-3 block text-center text-xs font-terminal opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            VER TODOS OS REGISTROS →
          </Link>
        </CencursaCard>
      )}
    </div>
  );
}