import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { client } from '@/api/client';
import { useQuery } from '@tanstack/react-query';

export default function GMDashboard() {
  const { user } = useOutletContext();

  const { data: characters = [] } = useQuery({
    queryKey: ['all-characters'],
    queryFn: () => client.entities.Character.list(),
    refetchInterval: 15000,
  });

  const { data: pendingReqs = [] } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => client.entities.Request.filter({ status: 'pending' }),
    refetchInterval: 15000,
  });

  const { data: worldStates = [] } = useQuery({
    queryKey: ['world-state'],
    queryFn: () => client.entities.WorldState.list(),
    refetchInterval: 10000,
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-alert font-terminal text-sm tracking-widest">ACESSO NEGADO</div>
      </div>
    );
  }

  const worldState = worldStates[0];
  const activeCount = characters.filter(c => c.is_active).length;
  const markedCount = characters.filter(c => c.is_marked).length;
  const lowSanityCount = characters.filter(c => (c.sanity / (c.sanity_max || 100)) < 0.3).length;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
          PAINEL DO CONTROLADOR — ADMIN
        </div>
        <h1 className="font-grimoire text-4xl text-cold">Centro de Controle</h1>
        <div className="font-terminal text-xs text-gold mt-1">
          {worldState?.phase || 'AFTER LIFE — PHASE I'} • {worldState?.date_in_game || 'London, 2014'}
        </div>
      </div>

      <div className="divider-gold" />

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8 fade-in-up-delay-1">
        {[
          { label: 'AGENTES', value: activeCount, color: '#C4A95A' },
          { label: 'MARCADOS', value: markedCount, color: '#CC0000' },
          { label: 'SAN CRÍTICA', value: lowSanityCount, color: '#CC4400' },
          { label: 'SOLICITAÇÕES', value: pendingReqs.length, color: '#8B7536' },
        ].map(stat => (
          <div key={stat.label} className="cencursa-card p-4 rounded-sm text-center">
            <div className="font-terminal text-3xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="font-terminal text-xs text-muted-foreground tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Character grid */}
      <div className="fade-in-up-delay-2">
        <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">
          ─ AGENTES ATIVOS ─
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(char => {
            const sanPct = (char.sanity / (char.sanity_max || 100)) * 100;
            const hpPct = (char.hp / (char.hp_max || 10)) * 100;
            const sanColor = sanPct > 60 ? '#4A7A4A' : sanPct > 30 ? '#8B7536' : '#CC0000';
            return (
              <div key={char.id} className="cencursa-card p-4 rounded-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-grimoire text-lg text-cold">{char.name}</div>
                    <div className="font-terminal text-xs text-muted-foreground opacity-70">{char.player_email}</div>
                  </div>
                  {char.is_marked && (
                    <span className="font-terminal text-xs text-alert pulse-blood">⛧ MARCADO</span>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between font-terminal text-xs mb-1">
                      <span className="text-muted-foreground">HP</span>
                      <span style={{ color: hpPct > 50 ? '#4A7A4A' : '#CC0000' }}>{char.hp}/{char.hp_max}</span>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${hpPct}%`, background: '#4A7A4A' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-terminal text-xs mb-1">
                      <span className="text-muted-foreground">SAN</span>
                      <span style={{ color: sanColor }}>{char.sanity}/{char.sanity_max}</span>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${sanPct}%`, background: sanColor }} />
                    </div>
                  </div>
                  <div className="flex justify-between font-terminal text-xs">
                    <span className="text-muted-foreground">ALMAS</span>
                    <span className="text-gold">✦ {char.souls || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pendingReqs.length > 0 && (
        <div className="mt-8 fade-in-up-delay-3">
          <div className="font-terminal text-xs text-alert tracking-widest mb-4">
            ─ SOLICITAÇÕES PENDENTES ({pendingReqs.length}) ─
          </div>
          <div className="space-y-2">
            {pendingReqs.slice(0, 5).map(req => (
              <div key={req.id} className="cencursa-card p-3 rounded-sm">
                <div className="flex justify-between">
                  <span className="font-terminal text-xs text-gold">{req.character_name}</span>
                  <span className="font-terminal text-xs text-muted-foreground">{req.type}</span>
                </div>
                <p className="font-body text-xs text-cold/70 mt-1">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}