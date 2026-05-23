import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/ui/StatusBadge';

const ATTRS = ['str','agi','res','int','per','pre','will'];
const ATTR_LABELS = { str:'Força', agi:'Agilidade', res:'Resistência', int:'Inteligência', per:'Percepção', pre:'Presença', will:'Vontade' };
const STATUS_TYPES = ['bleeding','fear','corruption','exhaustion','insanity','curse','infection'];
const STATUS_LABELS = { bleeding:'Sangramento', fear:'Medo', corruption:'Corrupção', exhaustion:'Exaustão', insanity:'Insanidade', curse:'Maldição', infection:'Infecção' };

export default function GMCharacters() {
  const { user } = useOutletContext();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('vitals');
  const [showNewChar, setShowNewChar] = useState(false);
  const [newChar, setNewChar] = useState({ name:'', player_email:'', player_name:'', occupation:'', nationality:'', hp:10, hp_max:10, sanity:100, sanity_max:100, souls:0, str:5, agi:5, res:5, int:5, per:5, pre:5, will:5 });
  const [statusForm, setStatusForm] = useState({ type:'fear', description:'', duration:'', intensity:'mild' });
  const [itemForm, setItemForm] = useState({ name:'', category:'misc', rarity:'common', description:'', effects:'', origin:'' });
  const [powerForm, setPowerForm] = useState({ name:'', description:'', sanity_cost:0, psychological_effects:'', origin_trauma:'' });

  const { data: characters = [] } = useQuery({
    queryKey: ['all-characters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['char-statuses', selected?.id],
    queryFn: () => base44.entities.StatusEffect.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['char-items', selected?.id],
    queryFn: () => base44.entities.InventoryItem.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const { data: powers = [] } = useQuery({
    queryKey: ['char-powers', selected?.id],
    queryFn: () => base44.entities.Power.filter({ character_id: selected.id }),
    enabled: !!selected?.id,
  });

  const updateChar = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Character.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries(['all-characters']);
      setSelected(updated);
    },
  });

  const createChar = useMutation({
    mutationFn: data => base44.entities.Character.create(data),
    onSuccess: () => { qc.invalidateQueries(['all-characters']); setShowNewChar(false); },
  });

  const createStatus = useMutation({
    mutationFn: data => base44.entities.StatusEffect.create(data),
    onSuccess: () => { qc.invalidateQueries(['char-statuses', selected?.id]); setStatusForm({ type:'fear', description:'', duration:'', intensity:'mild' }); },
  });

  const deleteStatus = useMutation({
    mutationFn: id => base44.entities.StatusEffect.delete(id),
    onSuccess: () => qc.invalidateQueries(['char-statuses', selected?.id]),
  });

  const createItem = useMutation({
    mutationFn: data => base44.entities.InventoryItem.create(data),
    onSuccess: () => { qc.invalidateQueries(['char-items', selected?.id]); setItemForm({ name:'', category:'misc', rarity:'common', description:'', effects:'', origin:'' }); },
  });

  const deleteItem = useMutation({
    mutationFn: id => base44.entities.InventoryItem.delete(id),
    onSuccess: () => qc.invalidateQueries(['char-items', selected?.id]),
  });

  const createPower = useMutation({
    mutationFn: data => base44.entities.Power.create(data),
    onSuccess: () => { qc.invalidateQueries(['char-powers', selected?.id]); setPowerForm({ name:'', description:'', sanity_cost:0, psychological_effects:'', origin_trauma:'' }); },
  });

  const logEvent = async (type, message, value) => {
    await base44.entities.EventLog.create({ character_id: selected.id, character_name: selected.name, type, message, value: value || 0 });
  };

  const handleUpdate = async (field, val) => {
    const data = { [field]: val };
    await updateChar.mutateAsync({ id: selected.id, data });
    // Log important changes
    if (field === 'sanity') logEvent('sanity_loss', `Sanidade alterada para ${val}`, val - selected.sanity);
    if (field === 'hp') logEvent('hp_change', `HP alterado para ${val}`, val - selected.hp);
    if (field === 'souls') logEvent('souls_change', `Almas alteradas para ${val}`, val - selected.souls);
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-start justify-between mb-8 fade-in-up">
        <div>
          <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
            CONTROLE DE AGENTES
          </div>
          <h1 className="font-grimoire text-4xl text-cold">Agentes</h1>
        </div>
        <button onClick={() => setShowNewChar(!showNewChar)} className="btn-cencursa rounded-sm">
          + NOVO AGENTE
        </button>
      </div>

      <div className="divider-gold" />

      {/* New character form */}
      {showNewChar && (
        <div className="cencursa-card p-6 rounded-sm mb-6 fade-in-up">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">CRIAR NOVO AGENTE</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { key:'name', label:'NOME DO PERSONAGEM' },
              { key:'player_email', label:'EMAIL DO JOGADOR' },
              { key:'player_name', label:'NOME DO JOGADOR' },
              { key:'occupation', label:'OCUPAÇÃO' },
              { key:'nationality', label:'NACIONALIDADE' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-terminal text-xs text-gold/60 tracking-wider block mb-1">{f.label}</label>
                <input
                  value={newChar[f.key] || ''}
                  onChange={e => setNewChar(c => ({ ...c, [f.key]: e.target.value }))}
                  className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => createChar.mutate(newChar)} className="btn-cencursa rounded-sm">
              ▶ CRIAR
            </button>
            <button onClick={() => setShowNewChar(false)} className="btn-cencursa btn-danger rounded-sm">
              CANCELAR
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Character list */}
        <div className="lg:col-span-1">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">AGENTES</div>
          <div className="space-y-2">
            {characters.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left cencursa-card p-3 rounded-sm transition-all ${selected?.id === c.id ? 'border-gold/40 bg-gold/5' : ''}`}
              >
                <div className="font-grimoire text-sm text-cold">{c.name}</div>
                <div className="font-terminal text-xs text-muted-foreground opacity-60 truncate">{c.player_email}</div>
                {c.is_marked && <span className="font-terminal text-xs text-alert">⛧ MARCADO</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        {selected ? (
          <div className="lg:col-span-2">
            <div className="cencursa-card p-6 rounded-sm">
              <div className="font-grimoire text-xl text-cold mb-1">{selected.name}</div>
              <div className="font-terminal text-xs text-muted-foreground mb-4">{selected.player_email}</div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 mb-6">
                {['vitals', 'attrs', 'status', 'inventory', 'powers', 'profile'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`font-terminal text-xs px-3 py-1 rounded-sm border transition-all ${
                      tab === t ? 'border-gold/50 text-gold bg-gold/10' : 'border-gold/15 text-muted-foreground'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Vitals tab */}
              {tab === 'vitals' && (
                <div className="space-y-4">
                  {[
                    { key:'hp', label:'HP', max: selected.hp_max },
                    { key:'hp_max', label:'HP MAX', max: 50 },
                    { key:'sanity', label:'SANIDADE', max: selected.sanity_max },
                    { key:'sanity_max', label:'SAN MAX', max: 100 },
                    { key:'souls', label:'ALMAS', max: 99999 },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="font-terminal text-xs text-gold/60 tracking-wider block mb-1">{f.label}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={selected[f.key] || 0}
                          min={0}
                          max={f.max}
                          onBlur={e => handleUpdate(f.key, parseInt(e.target.value))}
                          className="w-24 bg-black/50 border border-gold/20 text-cold font-terminal text-sm p-2 rounded-sm focus:border-gold/50 outline-none"
                        />
                        <div className="flex-1 flex items-center">
                          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, ((selected[f.key] || 0) / f.max) * 100)}%`, background: '#C4A95A' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 mt-4">
                    <label className="font-terminal text-xs text-gold/60 tracking-wider">MARCADO</label>
                    <button
                      onClick={() => updateChar.mutate({ id: selected.id, data: { is_marked: !selected.is_marked } })}
                      className={`font-terminal text-xs px-3 py-1 rounded-sm border transition-all ${
                        selected.is_marked ? 'border-alert text-alert bg-alert/10' : 'border-gold/20 text-muted-foreground'
                      }`}
                    >
                      {selected.is_marked ? '⛧ ATIVO' : '○ INATIVO'}
                    </button>
                  </div>
                </div>
              )}

              {/* Attributes tab */}
              {tab === 'attrs' && (
                <div className="space-y-3">
                  {ATTRS.map(a => (
                    <div key={a} className="flex items-center gap-4">
                      <label className="font-terminal text-xs text-muted-foreground w-28">{ATTR_LABELS[a].toUpperCase()}</label>
                      <input
                        type="number"
                        defaultValue={selected[a] || 5}
                        min={1} max={20}
                        onBlur={e => updateChar.mutate({ id: selected.id, data: { [a]: parseInt(e.target.value) } })}
                        className="w-16 bg-black/50 border border-gold/20 text-cold font-terminal text-sm p-1 rounded-sm focus:border-gold/50 outline-none text-center"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Status tab */}
              {tab === 'status' && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {statuses.map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <StatusBadge type={s.type} duration={s.duration} intensity={s.intensity} />
                        <button onClick={() => deleteStatus.mutate(s.id)} className="text-muted-foreground hover:text-alert font-terminal text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="divider-gold" />
                  <div className="font-terminal text-xs text-muted-foreground tracking-wider mb-3 mt-3">ADICIONAR STATUS</div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select
                      value={statusForm.type}
                      onChange={e => setStatusForm(f => ({ ...f, type: e.target.value }))}
                      className="bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
                    >
                      {STATUS_TYPES.map(t => <option key={t} value={t}>{STATUS_LABELS[t]}</option>)}
                    </select>
                    <select
                      value={statusForm.intensity}
                      onChange={e => setStatusForm(f => ({ ...f, intensity: e.target.value }))}
                      className="bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
                    >
                      <option value="mild">LEVE</option>
                      <option value="moderate">MODERADO</option>
                      <option value="severe">SEVERO</option>
                    </select>
                  </div>
                  <input
                    placeholder="Duração (ex: 2 rodadas)"
                    value={statusForm.duration}
                    onChange={e => setStatusForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none mb-2"
                  />
                  <button
                    onClick={() => createStatus.mutate({ ...statusForm, character_id: selected.id, label: STATUS_LABELS[statusForm.type] })}
                    className="btn-cencursa rounded-sm"
                  >
                    + APLICAR STATUS
                  </button>
                </div>
              )}

              {/* Inventory tab */}
              {tab === 'inventory' && (
                <div>
                  <div className="space-y-1 mb-4">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div>
                          <span className={`font-terminal text-xs rarity-${item.rarity}`}>{item.name}</span>
                          {item.is_equipped && <span className="ml-2 font-terminal text-xs text-gold opacity-60">◈</span>}
                        </div>
                        <button onClick={() => deleteItem.mutate(item.id)} className="text-muted-foreground hover:text-alert font-terminal text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="divider-gold" />
                  <div className="font-terminal text-xs text-muted-foreground tracking-wider mb-3 mt-3">ADICIONAR ITEM</div>
                  <div className="space-y-2">
                    <input placeholder="Nome" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}
                        className="bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none">
                        {['weapon','armor','consumable','artifact','document','misc'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={itemForm.rarity} onChange={e => setItemForm(f => ({ ...f, rarity: e.target.value }))}
                        className="bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none">
                        {['common','uncommon','rare','epic','cursed'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <textarea placeholder="Descrição" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} rows={2}
                      className="w-full bg-black/50 border border-gold/20 text-cold font-body text-xs p-2 rounded-sm focus:border-gold/50 outline-none resize-none" />
                    <input placeholder="Efeitos" value={itemForm.effects} onChange={e => setItemForm(f => ({ ...f, effects: e.target.value }))}
                      className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
                    <button onClick={() => createItem.mutate({ ...itemForm, character_id: selected.id })} className="btn-cencursa rounded-sm">
                      + ADICIONAR ITEM
                    </button>
                  </div>
                </div>
              )}

              {/* Powers tab */}
              {tab === 'powers' && (
                <div>
                  <div className="space-y-2 mb-4">
                    {powers.map(p => (
                      <div key={p.id} className="p-2 rounded-sm" style={{ background: 'rgba(74,10,10,0.1)', border: '1px solid rgba(204,0,0,0.1)' }}>
                        <div className="font-grimoire text-sm text-cold">{p.name}</div>
                        <div className="font-terminal text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    ))}
                  </div>
                  <div className="divider-gold" />
                  <div className="font-terminal text-xs text-muted-foreground tracking-wider mb-3 mt-3">CONCEDER PODER</div>
                  <div className="space-y-2">
                    <input placeholder="Nome do poder" value={powerForm.name} onChange={e => setPowerForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
                    <textarea placeholder="Descrição narrativa" value={powerForm.description} onChange={e => setPowerForm(f => ({ ...f, description: e.target.value }))} rows={2}
                      className="w-full bg-black/50 border border-gold/20 text-cold font-body text-xs p-2 rounded-sm focus:border-gold/50 outline-none resize-none" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Custo SAN" value={powerForm.sanity_cost} onChange={e => setPowerForm(f => ({ ...f, sanity_cost: parseInt(e.target.value) || 0 }))}
                        className="w-24 bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
                      <input placeholder="Efeitos psicológicos" value={powerForm.psychological_effects} onChange={e => setPowerForm(f => ({ ...f, psychological_effects: e.target.value }))}
                        className="flex-1 bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
                    </div>
                    <button onClick={() => createPower.mutate({ ...powerForm, character_id: selected.id })} className="btn-cencursa rounded-sm">
                      ⛧ CONCEDER PODER
                    </button>
                  </div>
                </div>
              )}

              {/* Profile tab */}
              {tab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key:'age', label:'IDADE' },
                    { key:'height', label:'ALTURA' },
                    { key:'weight', label:'PESO' },
                    { key:'appearance', label:'APARÊNCIA' },
                    { key:'nationality', label:'NACIONALIDADE' },
                    { key:'occupation', label:'OCUPAÇÃO' },
                    { key:'fears', label:'MEDOS' },
                    { key:'traumas', label:'TRAUMAS' },
                    { key:'desires', label:'DESEJOS' },
                    { key:'addictions', label:'VÍCIOS' },
                    { key:'important_memory', label:'MEMÓRIA IMPORTANTE' },
                    { key:'mental_instability', label:'INSTABILIDADE MENTAL' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="font-terminal text-xs text-gold/60 tracking-wider block mb-1">{f.label}</label>
                      <input
                        defaultValue={selected[f.key] || ''}
                        onBlur={e => updateChar.mutate({ id: selected.id, data: { [f.key]: e.target.value } })}
                        className="w-full bg-black/50 border border-gold/20 text-cold font-body text-xs p-2 rounded-sm focus:border-gold/50 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="font-terminal text-xs text-muted-foreground opacity-30 tracking-widest">
              SELECIONE UM AGENTE PARA EDITAR
            </div>
          </div>
        )}
      </div>
    </div>
  );
}