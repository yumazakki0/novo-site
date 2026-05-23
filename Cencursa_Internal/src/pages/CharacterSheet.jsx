import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import AttributeBar from '@/components/character/AttributeBar';
import SanityBar from '@/components/character/SanityBar';
import StatusBadge from '@/components/character/StatusBadge';
import CencursaCard from '@/components/ui/CencursaCard';
import CharacterAvatar from '@/components/character/CharacterAvatar';

const ATTRS = ['str', 'agi', 'res', 'int', 'per', 'pre', 'will'];
const ATTR_LABELS = {
  str: 'FORÇA', agi: 'AGILIDADE', res: 'RESISTÊNCIA',
  int: 'INTELIGÊNCIA', per: 'PERCEPÇÃO', pre: 'PRESENÇA', will: 'VONTADE',
};

const InfoField = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="py-2 border-b" style={{ borderColor: 'rgba(196,169,90,0.08)' }}>
      <div className="text-xs font-terminal tracking-widest mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
        {label}
      </div>
      <div className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.85, lineHeight: 1.6 }}>
        {value}
      </div>
    </div>
  );
};

export default function CharacterSheet() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => client.entities.Character.filter({ player_email: user?.email }),
    enabled: !!user?.email,
  });
  const character = characters?.[0];

  const { data: statuses } = useQuery({
    queryKey: ['statuses', character?.id],
    queryFn: () => client.entities.StatusEffect.filter({ character_id: character.id, is_active: true }),
    enabled: !!character?.id,
  });

  const { data: powers } = useQuery({
    queryKey: ['powers', character?.id],
    queryFn: () => client.entities.Power.filter({ character_id: character.id, is_active: true }),
    enabled: !!character?.id,
  });

  const updateAvatar = useMutation({
    mutationFn: (avatar_url) => client.entities.Character.update(character.id, { avatar_url }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myCharacter', user?.email] }),
  });

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-30" style={{ color: 'var(--gold)' }}>◈</div>
          <p className="font-terminal text-sm opacity-40" style={{ color: 'var(--gold)' }}>
            Nenhum personagem vinculado.
          </p>
          <p className="text-xs font-body opacity-30 mt-2" style={{ color: 'var(--cold-white)' }}>
            Aguarde o Mestre criar e vincular seu personagem.
          </p>
        </div>
      </div>
    );
  }

  const sanityPct = (character.sanity / (character.sanity_max || 100)) * 100;
  const hpPct = (character.hp / (character.hp_max || 10)) * 100;
  const isCritical = sanityPct === 0;
  const isLow = sanityPct > 0 && sanityPct < 20;
  const shakeClass = isLow ? 'sanity-shake-low' : isCritical ? 'sanity-shake-critical' : '';

  return (
    <div className={`p-4 md:p-6 max-w-5xl mx-auto space-y-6 ${shakeClass}`}>
      
      {/* MARKED HORROR HEADER */}
      {isCritical && (
        <div className="p-4 text-center pulse-blood"
          style={{ background: 'rgba(74,10,10,0.5)', border: '2px solid rgba(204,0,0,0.6)', borderRadius: '2px' }}>
          <div className="font-grimoire text-2xl flicker" style={{ color: 'var(--alert)', letterSpacing: '0.3em' }}>
            ◈ SUJEITO MARCADO ◈
          </div>
          <div className="text-xs font-terminal mt-1 opacity-60" style={{ color: 'var(--cold-white)' }}>
            A CENCURSA IDENTIFICOU SUA POSIÇÃO — OS SINOS TOCAM
          </div>
        </div>
      )}

      {/* Header com Avatar */}
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-3" style={{ color: 'var(--gold-dark)', opacity: 0.5 }}>
          FICHA DE SUJEITO — CLASSIFICAÇÃO: CONFIDENCIAL
        </div>

        <div className="flex items-start gap-5">
          <CharacterAvatar
            character={character}
            size="lg"
            onUpload={(url) => updateAvatar.mutate(url)}
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-grimoire text-3xl md:text-4xl" style={{
              color: isCritical ? 'var(--alert)' : 'var(--gold)',
              textShadow: isCritical ? '0 0 30px rgba(204,0,0,0.4)' : '0 0 30px rgba(196,169,90,0.2)',
            }}>
              {character.name}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {character.occupation && (
                <span className="text-xs font-terminal" style={{ color: 'var(--gold-dark)' }}>
                  {character.occupation}
                </span>
              )}
              {character.nationality && (
                <span className="text-xs font-terminal opacity-50" style={{ color: 'var(--cold-white)' }}>
                  ◆ {character.nationality}
                </span>
              )}
              {character.age && (
                <span className="text-xs font-terminal opacity-40" style={{ color: 'var(--cold-white)' }}>
                  {character.age} anos
                </span>
              )}
            </div>
            {character.player_name && (
              <div className="mt-1 text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                JOGADOR: {character.player_name}
              </div>
            )}
          </div>
        </div>

        <div className="divider-gold mt-4" />
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in-up-delay-1">
        <CencursaCard>
          <div className="mb-1 text-xs font-terminal tracking-widest" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
            PONTOS DE VIDA
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-grimoire text-3xl" style={{ color: hpPct < 30 ? 'var(--alert)' : 'var(--cold-white)' }}>
              {character.hp}
            </span>
            <span className="font-terminal opacity-40 text-sm" style={{ color: 'var(--cold-white)' }}>/ {character.hp_max}</span>
          </div>
          <div className="h-2 rounded-sm overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(196,169,90,0.1)' }}>
            <div className="h-full transition-all duration-700"
              style={{
                width: `${hpPct}%`,
                background: hpPct < 30 ? 'linear-gradient(90deg, #4A0A0A, var(--alert))' : 'linear-gradient(90deg, #7A1515, #CC0000)',
                boxShadow: `0 0 8px rgba(204,0,0,0.4)`,
              }} />
          </div>
        </CencursaCard>
        <CencursaCard>
          <SanityBar value={character.sanity} maxValue={character.sanity_max} showEffects />
        </CencursaCard>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identification */}
        <CencursaCard title="Identificação" subtitle="DADOS PESSOAIS" className="fade-in-up-delay-1">
          <InfoField label="NOME COMPLETO" value={character.name} />
          <InfoField label="IDADE" value={character.age} />
          <div className="grid grid-cols-2 gap-0">
            <InfoField label="ALTURA" value={character.height} />
            <InfoField label="PESO" value={character.weight} />
          </div>
          <InfoField label="NACIONALIDADE" value={character.nationality} />
          <InfoField label="OCUPAÇÃO" value={character.occupation} />
          <InfoField label="APARÊNCIA" value={character.appearance} />
        </CencursaCard>

        {/* Psychology */}
        <CencursaCard title="Perfil Psicológico" subtitle="RELATÓRIO DE ANÁLISE COMPORTAMENTAL" className="fade-in-up-delay-2">
          <InfoField label="MEDOS" value={character.fears} />
          <InfoField label="TRAUMAS" value={character.traumas} />
          <InfoField label="DESEJOS" value={character.desires} />
          <InfoField label="VÍCIOS" value={character.addictions} />
          <InfoField label="MEMÓRIA IMPORTANTE" value={character.important_memory} />
          <InfoField label="INSTABILIDADE MENTAL" value={character.mental_instability} />
        </CencursaCard>
      </div>

      {/* Attributes */}
      <CencursaCard title="Atributos" subtitle="CAPACIDADES DOCUMENTADAS" className="fade-in-up-delay-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {ATTRS.map(attr => (
            <AttributeBar key={attr} attrKey={attr} value={character[attr] || 0} maxValue={10} />
          ))}
        </div>
        {/* Almas */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(196,169,90,0.1)' }}>
          <span className="text-xs font-terminal tracking-widest" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            ALMAS ACUMULADAS
          </span>
          <span className="font-grimoire text-xl" style={{ color: 'var(--gold)' }}>
            ◈ {character.souls || 0}
          </span>
        </div>
      </CencursaCard>

      {/* Status effects */}
      {statuses?.length > 0 && (
        <CencursaCard title="Status Ativos" subtitle="CONDIÇÕES PSICOFÍSICAS DETECTADAS" className="fade-in-up-delay-3">
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <StatusBadge key={s.id} type={s.type} intensity={s.intensity} duration={s.duration} description={s.description} />
            ))}
          </div>
        </CencursaCard>
      )}

      {/* Powers */}
      {powers?.length > 0 && (
        <CencursaCard title="Manifestações" subtitle="ANOMALIAS PSÍQUICAS REGISTRADAS" className="fade-in-up-delay-4">
          <div className="space-y-4">
            {powers.map(power => (
              <div key={power.id} className="p-4 rounded-sm"
                style={{ background: 'rgba(74,10,10,0.2)', border: '1px solid rgba(122,21,21,0.3)' }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-grimoire text-base" style={{ color: 'var(--gold)' }}>{power.name}</h3>
                  {power.sanity_cost > 0 && (
                    <div className="text-xs font-terminal px-2 py-0.5"
                      style={{ background: 'rgba(204,0,0,0.15)', color: 'var(--alert)', border: '1px solid rgba(204,0,0,0.3)', borderRadius: '2px' }}>
                      -{power.sanity_cost} SAN
                    </div>
                  )}
                </div>
                <p className="text-sm font-body opacity-75 mb-2" style={{ color: 'var(--cold-white)', lineHeight: 1.6 }}>
                  {power.description}
                </p>
                {power.psychological_effects && (
                  <div className="text-xs font-terminal opacity-50" style={{ color: 'var(--alert)', fontSize: '0.6rem' }}>
                    EFEITO: {power.psychological_effects}
                  </div>
                )}
                {power.origin_trauma && (
                  <div className="text-xs font-terminal opacity-40 mt-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                    ORIGEM: {power.origin_trauma}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CencursaCard>
      )}

      {/* Notes */}
      {character.notes && (
        <CencursaCard title="Anotações" subtitle="REGISTROS PESSOAIS" className="fade-in-up-delay-4">
          <p className="text-sm font-body" style={{ color: 'var(--cold-white)', opacity: 0.7, lineHeight: 1.7 }}>
            {character.notes}
          </p>
        </CencursaCard>
      )}
    </div>
  );
}