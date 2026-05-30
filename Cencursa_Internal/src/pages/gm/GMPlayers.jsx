import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import CencursaCard from '@/components/ui/CencursaCard';
import SanityBar from '@/components/character/SanityBar';
import StatusBadge from '@/components/character/StatusBadge';
import CharacterAvatar from '@/components/character/CharacterAvatar';
import { useState } from 'react';

const ATTRS = ['str', 'agi', 'res', 'int', 'per', 'pre', 'will'];
const ATTR_LABELS = { str: 'FOR', agi: 'AGI', res: 'RES', int: 'INT', per: 'PER', pre: 'PRE', will: 'VON' };
const STATUS_TYPES = ['bleeding', 'fear', 'corruption', 'exhaustion', 'insanity', 'curse', 'infection'];
const STATUS_LABELS = { bleeding: 'Sangramento', fear: 'Medo', corruption: 'Corrupção', exhaustion: 'Exaustão', insanity: 'Insanidade', curse: 'Maldição', infection: 'Infecção' };
const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'epic', 'cursed'];
const ITEM_CATEGORIES = ['weapon', 'armor', 'consumable', 'artifact', 'document', 'misc'];

export default function GMPlayers() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('vitals');
  const [newItem, setNewItem] = useState({ name: '', category: 'misc', rarity: 'common', description: '', quantity: 1, is_equipped: false });
  const [newStatus, setNewStatus] = useState({ type: 'fear', description: '', duration: 1, intensity: 'mild' });
  const [newPower, setNewPower] = useState({ name: '', description: '', sanity_cost: 0, psychological_effects: '', origin_trauma: '' });
  const [editVitals, setEditVitals] = useState({});

  const { data: characters, isLoading } = useQuery({
    queryKey: ['allCharacters'],
    queryFn: () => client.entities.Character.list(),
  });

  const { data: statuses } = useQuery({
    queryKey: ['charStatuses', selected?.id],
    queryFn: () => client.entities.StatusEffect.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const { data: items } = useQuery({
    queryKey: ['charItems', selected?.id],
    queryFn: () => client.entities.InventoryItem.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const { data: powers } = useQuery({
    queryKey: ['charPowers', selected?.id],
    queryFn: () => client.entities.Power.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const updateChar = useMutation({
    mutationFn: ({ id, data }) => client.entities.Character.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['allCharacters'] });
      setSelected(prev => ({ ...prev, ...vars.data }));
    },
  });

  const logEvent = useMutation({
    mutationFn: data => client.entities.EventLog.create(data),
  });

  const addItem = useMutation({
    mutationFn: data => client.entities.InventoryItem.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charItems', selected?.id] });
      setNewItem({ name: '', category: 'misc', rarity: 'common', description: '', quantity: 1, is_equipped: false });
      logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'item_acquired', message: `${selected.name} recebeu: ${newItem.name}` });
    },
  });

  const removeItem = useMutation({
    mutationFn: id => client.entities.InventoryItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['charItems', selected?.id] }),
  });

  const addStatus = useMutation({
    mutationFn: data => client.entities.StatusEffect.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charStatuses', selected?.id] });
      setNewStatus({ type: 'fear', description: '', duration: '', intensity: 'mild' });
      logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'status_applied', message: `${selected.name}: ${STATUS_LABELS[newStatus.type]} aplicado` });
    },
  });

  const removeStatus = useMutation({
    mutationFn: id => client.entities.StatusEffect.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['charStatuses', selected?.id] }),
  });

  const addPower = useMutation({
    mutationFn: data => client.entities.Power.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charPowers', selected?.id] });
      setNewPower({ name: '', description: '', sanity_cost: 0, psychological_effects: '', origin_trauma: '' });
      logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'power_granted', message: `${selected.name}: manifestação "${newPower.name}" concedida` });
    },
  });

  const handleVitalUpdate = (field, value) => {
    const num = parseInt(value) || 0;
    const oldVal = selected[field];
    updateChar.mutate({ id: selected.id, data: { [field]: num } });
    if (field === 'sanity') logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'sanity_loss', message: `Sanidade de ${selected.name}: ${oldVal} → ${num}`, value: num - oldVal });
    if (field === 'hp') logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'hp_change', message: `HP de ${selected.name}: ${oldVal} → ${num}`, value: num - oldVal });
    if (field === 'souls') logEvent.mutate({ character_id: selected.id, character_name: selected.name, type: 'souls_change', message: `Almas de ${selected.name}: ${oldVal} → ${num}`, value: num - oldVal });
    if (num === 0 && field === 'sanity') updateChar.mutate({ id: selected.id, data: { is_marked: true } });
  };

  const TABS = ['vitals', 'attrs', 'status', 'items', 'powers', 'perfil'];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="fade-in-up mb-6">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ GESTÃO DE SUJEITOS — ACESSO TOTAL
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Jogadores</h1>
        <div className="divider-gold mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player list */}
        <div className="space-y-2">
          <div className="text-xs font-terminal tracking-widest mb-3" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            SUJEITOS REGISTRADOS ({characters?.length || 0})
          </div>
          {isLoading ? (
            <div className="text-xs font-terminal opacity-40" style={{ color: 'var(--gold)' }}>Carregando...</div>
          ) : (
            characters?.map(char => (
              <button key={char.id} onClick={() => { setSelected(char); setTab('vitals'); }}
                className={`w-full cencursa-card p-3 text-left transition-all ${selected?.id === char.id ? 'ornament-border-gold' : ''}`}>
                <div className="flex items-start gap-3">
                  <CharacterAvatar character={char} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-grimoire text-sm truncate" style={{ color: selected?.id === char.id ? 'var(--gold)' : 'var(--cold-white)' }}>
                        {char.name}
                      </span>
                      {char.is_marked && (
                        <span className="text-xs font-terminal shrink-0 ml-1" style={{ color: 'var(--alert)', fontSize: '0.5rem' }}>◈ MARCADO</span>
                      )}
                    </div>
                    <div className="text-xs font-terminal opacity-50 mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                      {char.player_name || char.player_email?.split('@')[0]}
                    </div>
                    <SanityBar value={char.sanity || 0} maxValue={char.sanity_max || 100} showEffects={false} />
                  </div>
                </div>
              </button>
            ))
          )}
          {!isLoading && !characters?.length && (
            <div className="text-center py-8 opacity-30">
              <p className="text-xs font-terminal" style={{ color: 'var(--gold-dark)' }}>NENHUM SUJEITO</p>
            </div>
          )}
        </div>

        {/* Editor */}
        {selected ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-grimoire text-2xl" style={{ color: 'var(--gold)' }}>{selected.name}</h2>
              <div className="text-xs font-terminal opacity-50" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                {selected.player_email}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="text-xs font-terminal px-3 py-1.5 transition-all"
                  style={{
                    background: tab === t ? 'rgba(196,169,90,0.15)' : 'transparent',
                    border: `1px solid ${tab === t ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.1)'}`,
                    color: tab === t ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                    borderRadius: '2px', fontSize: '0.6rem', letterSpacing: '0.15em',
                  }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* VITALS */}
            {tab === 'vitals' && (
              <CencursaCard title="Vitais" subtitle="HP, SANIDADE, ALMAS">
                {/* Avatar upload */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b" style={{ borderColor: 'rgba(196,169,90,0.08)' }}>
                  <CharacterAvatar
                    character={selected}
                    size="md"
                    onUpload={(url) => updateChar.mutate({ id: selected.id, data: { avatar_url: url } })}
                  />
                  <div>
                    <div className="font-grimoire text-base" style={{ color: 'var(--gold)' }}>{selected.name}</div>
                    <div className="text-xs font-terminal opacity-50 mt-0.5" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                      {selected.player_email}
                    </div>
                    <div className="text-xs font-terminal opacity-30 mt-0.5" style={{ color: 'var(--cold-white)', fontSize: '0.5rem' }}>
                      PASSE O MOUSE NO AVATAR PARA TROCAR A FOTO
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {[
                    { key: 'hp', label: 'HP', maxKey: 'hp_max' },
                    { key: 'hp_max', label: 'HP MAX', maxKey: null },
                    { key: 'sanity', label: 'SANIDADE', maxKey: 'sanity_max' },
                    { key: 'sanity_max', label: 'SAN MAX', maxKey: null },
                    { key: 'souls', label: 'ALMAS', maxKey: null },
                  ].map(v => (
                    <div key={v.key}>
                      <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                        {v.label}
                      </label>
                      <input
                        type="number"
                        defaultValue={selected[v.key] || 0}
                        key={`${selected.id}-${v.key}`}
                        onBlur={e => handleVitalUpdate(v.key, e.target.value)}
                        className="w-full p-2 text-sm font-terminal"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--gold)', borderRadius: '2px', outline: 'none' }}
                      />
                    </div>
                  ))}
                  <div className="flex items-end">
                    <div>
                      <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                        MARCADO
                      </label>
                      <button
                        onClick={() => updateChar.mutate({ id: selected.id, data: { is_marked: !selected.is_marked } })}
                        className="btn-cencursa"
                        style={{ borderColor: selected.is_marked ? 'rgba(204,0,0,0.5)' : undefined, color: selected.is_marked ? 'var(--alert)' : undefined }}>
                        {selected.is_marked ? '◈ MARCADO' : '◇ MARCAR'}
                      </button>
                    </div>
                  </div>
                </div>
              </CencursaCard>
            )}

            {/* ATTRS */}
            {tab === 'attrs' && (
              <CencursaCard title="Atributos">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ATTRS.map(attr => (
                    <div key={attr}>
                      <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                        {ATTR_LABELS[attr]}
                      </label>
                      <input
                        type="number" min="1" max="10"
                        defaultValue={selected[attr] || 5}
                        key={`${selected.id}-${attr}`}
                        onBlur={e => updateChar.mutate({ id: selected.id, data: { [attr]: parseInt(e.target.value) || 5 } })}
                        className="w-full p-2 text-sm font-terminal"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--gold)', borderRadius: '2px', outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </CencursaCard>
            )}

            {/* STATUS */}
            {tab === 'status' && (
              <div className="space-y-4">
                <CencursaCard title="Status Ativos">
                  <div className="flex flex-wrap gap-2 mb-4 min-h-8">
                    {(statuses || []).filter(s => s.is_active).map(s => (
                      <StatusBadge key={s.id} type={s.type} intensity={s.intensity} duration={s.duration}
                        onRemove={() => removeStatus.mutate(s.id)} />
                    ))}
                    {!(statuses || []).filter(s => s.is_active).length && (
                      <span className="text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)' }}>Nenhum status</span>
                    )}
                  </div>
                  <div className="divider-gold" />
                  <div className="space-y-3 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {STATUS_TYPES.map(t => (
                        <button key={t} onClick={() => setNewStatus(s => ({ ...s, type: t }))}
                          className="text-xs font-terminal px-2 py-1 transition-all"
                          style={{
                            background: newStatus.type === t ? 'rgba(196,169,90,0.15)' : 'transparent',
                            border: `1px solid ${newStatus.type === t ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.1)'}`,
                            color: newStatus.type === t ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                            borderRadius: '2px', fontSize: '0.55rem',
                          }}>
                          {STATUS_LABELS[t]}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" min="1" placeholder="Duração (em turnos)" value={newStatus.duration}
                        onChange={e => setNewStatus(s => ({ ...s, duration: parseInt(e.target.value, 10) || 1 }))}
                        className="p-2 text-xs font-terminal"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                      <select value={newStatus.intensity}
                        onChange={e => setNewStatus(s => ({ ...s, intensity: e.target.value }))}
                        className="p-2 text-xs font-terminal"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                        <option value="mild">Leve</option>
                        <option value="moderate">Moderado</option>
                        <option value="severe">Severo</option>
                      </select>
                    </div>
                    <input placeholder="Descrição..." value={newStatus.description}
                      onChange={e => setNewStatus(s => ({ ...s, description: e.target.value }))}
                      className="w-full p-2 text-xs font-terminal"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                    <button onClick={() => addStatus.mutate({ type: newStatus.type, description: newStatus.description, duration: newStatus.duration, intensity: newStatus.intensity, character_id: selected.id, is_active: true })}
                      disabled={addStatus.isPending} className="btn-cencursa">
                      ◈ APLICAR STATUS
                    </button>
                  </div>
                </CencursaCard>
              </div>
            )}

            {/* ITEMS */}
            {tab === 'items' && (
              <div className="space-y-4">
                <CencursaCard title="Inventário">
                  <div className="space-y-2 mb-4">
                    {(items || []).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-sm"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,169,90,0.08)' }}>
                        <div>
                          <span className="text-sm font-body" style={{ color: 'var(--cold-white)' }}>{item.name}</span>
                          <span className={`ml-2 text-xs border px-1 rarity-${item.rarity}`}
                            style={{ fontSize: '0.5rem', fontFamily: 'var(--font-terminal)' }}>
                            {item.rarity}
                          </span>
                        </div>
                        <button onClick={() => removeItem.mutate(item.id)}
                          className="text-xs font-terminal opacity-40 hover:opacity-80" style={{ color: 'var(--alert)' }}>✕</button>
                      </div>
                    ))}
                    {!items?.length && (
                      <p className="text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)' }}>Inventário vazio</p>
                    )}
                  </div>
                  <div className="divider-gold" />
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Nome do item" value={newItem.name}
                        onChange={e => setNewItem(i => ({ ...i, name: e.target.value }))}
                        className="p-2 text-sm font-body"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                      <select value={newItem.rarity}
                        onChange={e => setNewItem(i => ({ ...i, rarity: e.target.value }))}
                        className="p-2 text-xs font-terminal"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                        {RARITY_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ITEM_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setNewItem(i => ({ ...i, category: cat }))}
                          className="text-xs font-terminal px-2 py-1 transition-all"
                          style={{
                            background: newItem.category === cat ? 'rgba(196,169,90,0.15)' : 'transparent',
                            border: `1px solid ${newItem.category === cat ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.1)'}`,
                            color: newItem.category === cat ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                            borderRadius: '2px', fontSize: '0.55rem',
                          }}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Descrição, efeitos e origem do item" value={newItem.description}
                      onChange={e => setNewItem(i => ({ ...i, description: e.target.value }))}
                      rows={2}
                      className="w-full p-2 text-xs font-body resize-none"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                    <button onClick={() => addItem.mutate({ ...newItem, character_id: selected.id })}
                      disabled={addItem.isPending || !newItem.name.trim()} className="btn-cencursa">
                      ⬡ ADICIONAR ITEM
                    </button>
                  </div>
                </CencursaCard>
              </div>
            )}

            {/* PERFIL */}
            {tab === 'perfil' && (
              <CencursaCard title="Perfil do Personagem" subtitle="DADOS PESSOAIS E PSICOLÓGICOS">
                {[
                  { key: 'player_name', label: 'NOME DO JOGADOR' },
                  { key: 'player_email', label: 'EMAIL DO JOGADOR' },
                  { key: 'occupation', label: 'OCUPAÇÃO' },
                  { key: 'nationality', label: 'NACIONALIDADE' },
                  { key: 'age', label: 'IDADE' },
                  { key: 'height', label: 'ALTURA' },
                  { key: 'weight', label: 'PESO' },
                  { key: 'appearance', label: 'APARÊNCIA' },
                  { key: 'fears', label: 'MEDOS' },
                  { key: 'traumas', label: 'TRAUMAS' },
                  { key: 'desires', label: 'DESEJOS' },
                  { key: 'addictions', label: 'VÍCIOS' },
                  { key: 'important_memory', label: 'MEMÓRIA IMPORTANTE' },
                  { key: 'mental_instability', label: 'INSTABILIDADE MENTAL' },
                  { key: 'notes', label: 'ANOTAÇÕES DO MESTRE' },
                ].map(f => (
                  <div key={f.key} className="mb-3">
                    <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                      {f.label}
                    </label>
                    <textarea
                      defaultValue={selected[f.key] || ''}
                      key={`${selected.id}-${f.key}`}
                      onBlur={e => updateChar.mutate({ id: selected.id, data: { [f.key]: e.target.value } })}
                      rows={f.key === 'notes' || f.key === 'appearance' || f.key === 'traumas' ? 3 : 1}
                      className="w-full p-2 text-sm font-body resize-none"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}
                    />
                  </div>
                ))}
              </CencursaCard>
            )}

            {/* POWERS */}
            {tab === 'powers' && (
              <div className="space-y-4">
                <CencursaCard title="Manifestações">
                  <div className="space-y-2 mb-4">
                    {(powers || []).map(p => (
                      <div key={p.id} className="p-3 rounded-sm"
                        style={{ background: 'rgba(74,10,10,0.2)', border: '1px solid rgba(122,21,21,0.3)' }}>
                        <div className="font-grimoire text-sm" style={{ color: 'var(--gold)' }}>{p.name}</div>
                        <div className="text-xs font-body opacity-60 mt-1" style={{ color: 'var(--cold-white)' }}>{p.description}</div>
                        {p.sanity_cost > 0 && (
                          <div className="text-xs font-terminal mt-1" style={{ color: 'var(--alert)', fontSize: '0.55rem' }}>
                            CUSTO: -{p.sanity_cost} SAN
                          </div>
                        )}
                      </div>
                    ))}
                    {!powers?.length && (
                      <p className="text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)' }}>Nenhuma manifestação</p>
                    )}
                  </div>
                  <div className="divider-gold" />
                  <div className="space-y-3 mt-3">
                    <input placeholder="Nome da manifestação" value={newPower.name}
                      onChange={e => setNewPower(p => ({ ...p, name: e.target.value }))}
                      className="w-full p-2 text-sm font-body"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                    <textarea placeholder="Descrição narrativa..." value={newPower.description}
                      onChange={e => setNewPower(p => ({ ...p, description: e.target.value }))}
                      rows={3} className="w-full p-2 text-xs font-body resize-none"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-terminal mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>CUSTO DE SAN</label>
                        <input type="number" min="0" value={newPower.sanity_cost}
                          onChange={e => setNewPower(p => ({ ...p, sanity_cost: parseInt(e.target.value) || 0 }))}
                          className="w-full p-2 text-sm font-terminal"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(204,0,0,0.2)', color: 'var(--alert)', borderRadius: '2px', outline: 'none' }} />
                      </div>
                      <div>
                        <label className="text-xs font-terminal mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>TRAUMA ORIGEM</label>
                        <input value={newPower.origin_trauma}
                          onChange={e => setNewPower(p => ({ ...p, origin_trauma: e.target.value }))}
                          className="w-full p-2 text-xs font-body"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
                      </div>
                    </div>
                    <button onClick={() => addPower.mutate({ ...newPower, character_id: selected.id, is_active: true })}
                      disabled={addPower.isPending || !newPower.name.trim()} className="btn-cencursa">
                      ✦ CONCEDER MANIFESTAÇÃO
                    </button>
                  </div>
                </CencursaCard>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center min-h-64">
            <div className="text-center opacity-30">
              <div className="text-4xl mb-4">◈</div>
              <p className="font-terminal text-xs" style={{ color: 'var(--gold-dark)' }}>SELECIONE UM SUJEITO</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}