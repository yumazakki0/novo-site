import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { client } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import SanityBar from '@/components/ui/SanityBar';
import HPBar from '@/components/ui/HPBar';
import SoulsCounter from '@/components/ui/SoulsCounter';
import AttributeBar from '@/components/ui/AttributeBar';
import StatusBadge from '@/components/ui/StatusBadge';

const ATTRS = [
  { key: 'str', label: 'FORÇA' },
  { key: 'agi', label: 'AGILIDADE' },
  { key: 'res', label: 'RESISTÊNCIA' },
  { key: 'int', label: 'INTELIGÊNCIA' },
  { key: 'per', label: 'PERCEPÇÃO' },
  { key: 'pre', label: 'PRESENÇA' },
  { key: 'will', label: 'VONTADE' },
];

export default function Dashboard() {
  const { user, character } = useOutletContext();

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses', character?.id],
    queryFn: () => client.entities.StatusEffect.filter({ character_id: character.id, is_active: true }),
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const { data: powers = [] } = useQuery({
    queryKey: ['powers', character?.id],
    queryFn: () => client.entities.Power.filter({ character_id: character.id }),
    enabled: !!character?.id,
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recent-logs', character?.id],
    queryFn: () => client.entities.EventLog.filter({ character_id: character.id }, '-created_date', 5),
    enabled: !!character?.id,
    refetchInterval: 20000,
  });

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center fade-in-up">
          <div className="font-grimoire text-3xl text-gold mb-4">NENHUM AGENTE VINCULADO</div>
          <div className="font-terminal text-sm text-muted-foreground tracking-widest">
            Aguarde o Controlador atribuir seu registro.
          </div>
        </div>
      </div>
    );
  }

  const sanityPct = (character.sanity / character.sanity_max) * 100;
  const sanityClass = sanityPct <= 10 ? 'sanity-shake-critical'
    : sanityPct <= 30 ? 'sanity-shake-low' : '';
  const sanityRevealClass = sanityPct <= 10 ? 'sanity-reveal-critical'
    : sanityPct <= 30 ? 'sanity-reveal' : '';

  return (
    <div className={`p-6 min-h-screen ${sanityClass} ${sanityRevealClass}`}
      style={{ background: 'radial-gradient(ellipse at top left, rgba(74,10,10,0.08) 0%, transparent 60%)' }}
    >
      {/* Hidden messages that appear at low sanity */}
      <div className="hidden-message fixed top-1/2 left-4 font-terminal text-xs text-alert rotate-90 pointer-events-none select-none">
        ELES ESTÃO OUVINDO
      </div>
      <div className="hidden-message fixed bottom-20 right-4 font-terminal text-xs text-alert pointer-events-none select-none">
        VOCÊ NÃO ESTÁ SOZINHO
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 fade-in-up">
        <div>
          <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
            ARQUIVO PESSOAL — CONFIDENCIAL
          </div>
          <h1 className="font-grimoire text-4xl text-cold">{character.name}</h1>
          <div className="font-terminal text-xs text-gold mt-1 tracking-wider">
            {character.occupation} • {character.nationality}
          </div>
        </div>
        <div className="text-right">
          <SoulsCounter value={character.souls || 0} />
          {character.is_marked && (
            <div className="mt-2 font-terminal text-xs text-alert tracking-widest pulse-blood">
              ⛧ MARCADO ⛧
            </div>
          )}
        </div>
      </div>

      <div className="divider-gold" />

      {/* Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 fade-in-up-delay-1">
        <div className="cencursa-card p-4 rounded-sm">
          <HPBar value={character.hp} max={character.hp_max} />
          <div className="mt-3">
            <SanityBar value={character.sanity} max={character.sanity_max} />
          </div>
        </div>

        {/* Status effects */}
        <div className="cencursa-card p-4 rounded-sm">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">
            STATUS ATIVOS
          </div>
          {statuses.length === 0 ? (
            <div className="font-terminal text-xs text-muted-foreground opacity-40">
              Nenhuma condição ativa
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <StatusBadge key={s.id} type={s.type} duration={s.duration} intensity={s.intensity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attributes */}
      <div className="cencursa-card p-6 rounded-sm mb-6 fade-in-up-delay-2">
        <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4 flex items-center gap-3">
          <span>ATRIBUTOS</span>
          <div className="flex-1 h-px bg-gold/10" />
          <span className="text-gold/40">◆</span>
        </div>
        <div className="space-y-3">
          {ATTRS.map(a => (
            <AttributeBar key={a.key} label={a.label} value={character[a.key] ?? 5} />
          ))}
        </div>
      </div>

      {/* Psychological profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 fade-in-up-delay-3">
        <div className="cencursa-card p-4 rounded-sm">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">
            PERFIL PSICOLÓGICO
          </div>
          <div className="space-y-3 font-body text-sm">
            {[
              { label: 'Medos', value: character.fears },
              { label: 'Traumas', value: character.traumas },
              { label: 'Desejos', value: character.desires },
              { label: 'Vícios', value: character.addictions },
            ].map(item => item.value && (
              <div key={item.label}>
                <div className="font-terminal text-xs text-gold/60 tracking-wider mb-1">{item.label.toUpperCase()}</div>
                <div className="text-cold/80 text-sm leading-relaxed">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cencursa-card p-4 rounded-sm">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">
            INFORMAÇÕES BÁSICAS
          </div>
          <div className="space-y-2 font-terminal text-xs">
            {[
              { label: 'IDADE', value: character.age },
              { label: 'ALTURA', value: character.height },
              { label: 'PESO', value: character.weight },
              { label: 'NACIONALIDADE', value: character.nationality },
              { label: 'OCUPAÇÃO', value: character.occupation },
            ].map(item => item.value && (
              <div key={item.label} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-cold">{item.value}</span>
              </div>
            ))}
          </div>
          {character.important_memory && (
            <div className="mt-4">
              <div className="font-terminal text-xs text-gold/60 tracking-wider mb-1">MEMÓRIA IMPORTANTE</div>
              <div className="font-body text-sm text-cold/80 leading-relaxed italic">"{character.important_memory}"</div>
            </div>
          )}
        </div>
      </div>

      {/* Powers */}
      {powers.length > 0 && (
        <div className="cencursa-card p-6 rounded-sm mb-6 fade-in-up-delay-4">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4 flex items-center gap-3">
            <span>MANIFESTAÇÕES DA ALMA</span>
            <div className="flex-1 h-px bg-crimson/20" />
            <span className="text-alert/40">⛧</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {powers.map(p => (
              <div key={p.id}
                className="p-3 rounded-sm"
                style={{ background: 'rgba(74,10,10,0.15)', border: '1px solid rgba(204,0,0,0.15)' }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-grimoire text-cold text-sm">{p.name}</div>
                  {p.sanity_cost > 0 && (
                    <span className="font-terminal text-xs text-alert">-{p.sanity_cost} SAN</span>
                  )}
                </div>
                <div className="font-body text-xs text-muted-foreground leading-relaxed">{p.description}</div>
                {p.psychological_effects && (
                  <div className="mt-1 font-terminal text-xs text-alert/60 italic">{p.psychological_effects}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div className="cencursa-card p-4 rounded-sm fade-in-up-delay-4">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">
            REGISTROS RECENTES
          </div>
          <div className="space-y-1.5">
            {recentLogs.map(log => (
              <div key={log.id} className="flex gap-3 font-terminal text-xs">
                <span className="text-muted-foreground shrink-0">
                  {new Date(log.created_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-cold/70">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}