import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const CATEGORY_LABELS = {
  weapon: { label: 'Armas', icon: '⚔' },
  armor: { label: 'Armaduras', icon: '🛡' },
  consumable: { label: 'Consumíveis', icon: '⚗' },
  artifact: { label: 'Artefatos', icon: '◈' },
  document: { label: 'Documentos', icon: '▤' },
  misc: { label: 'Miscelânea', icon: '◦' },
};

const RARITY_LABEL = {
  common: 'COMUM',
  uncommon: 'INCOMUM',
  rare: 'RARO',
  epic: 'ÉPICO',
  cursed: 'AMALDIÇOADO',
};

export default function Inventory() {
  const { character } = useOutletContext();

  const { data: items = [] } = useQuery({
    queryKey: ['inventory', character?.id],
    queryFn: () => base44.entities.InventoryItem.filter({ character_id: character.id }),
    enabled: !!character?.id,
    refetchInterval: 15000,
  });

  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'misc';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const equipped = items.filter(i => i.is_equipped);
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  if (!character) return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">
          INVENTÁRIO PESSOAL
        </div>
        <h1 className="font-grimoire text-4xl text-cold">{character.name}</h1>
        <div className="font-terminal text-xs text-gold mt-1">
          {items.length} ITENS REGISTRADOS
        </div>
      </div>

      <div className="divider-gold" />

      {/* Equipped */}
      {equipped.length > 0 && (
        <div className="mb-6 fade-in-up-delay-1">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-3">
            ─ EQUIPADO ─
          </div>
          <div className="flex flex-wrap gap-3">
            {equipped.map(item => (
              <ItemCard key={item.id} item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4 fade-in-up-delay-2">
        {['all', ...Object.keys(CATEGORY_LABELS)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`font-terminal text-xs px-3 py-1 rounded-sm border transition-all ${
              filter === cat
                ? 'border-gold/50 text-gold bg-gold/10'
                : 'border-gold/15 text-muted-foreground hover:border-gold/30'
            }`}
          >
            {cat === 'all' ? 'TODOS' : CATEGORY_LABELS[cat].label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 fade-in-up-delay-3">
        {filtered.map(item => (
          <ItemCard key={item.id} item={item} onSelect={() => setSelected(selected?.id === item.id ? null : item)} selected={selected?.id === item.id} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full font-terminal text-xs text-muted-foreground text-center py-12 opacity-40">
            NENHUM ITEM REGISTRADO
          </div>
        )}
      </div>

      {/* Selected item detail */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:fixed md:right-6 md:bottom-6 md:w-80 z-30 slide-in-right">
          <div
            className="rounded-sm p-5"
            style={{
              background: 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)',
              border: '1px solid rgba(196,169,90,0.3)',
              boxShadow: '0 0 40px rgba(74,10,10,0.4)',
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className={`font-terminal text-xs tracking-wider mb-1 rarity-${selected.rarity}`}>
                  {RARITY_LABEL[selected.rarity] || selected.rarity}
                </div>
                <div className="font-grimoire text-lg text-cold">{selected.name}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-cold font-terminal text-xs">✕</button>
            </div>

            <div className="divider-gold" />

            {selected.description && (
              <div className="font-body text-sm text-cold/80 leading-relaxed mb-3">{selected.description}</div>
            )}
            {selected.effects && (
              <div className="font-terminal text-xs text-gold/70 mb-2">
                <span className="text-muted-foreground">EFEITOS: </span>{selected.effects}
              </div>
            )}
            {selected.origin && (
              <div className="font-terminal text-xs text-muted-foreground italic">
                Origem: {selected.origin}
              </div>
            )}
            {selected.quantity > 1 && (
              <div className="font-terminal text-xs text-muted-foreground mt-2">
                Qtd: ×{selected.quantity}
              </div>
            )}
            {selected.is_equipped && (
              <div className="mt-2 font-terminal text-xs text-gold tracking-widest">◈ EQUIPADO</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onSelect, selected }) {
  const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.misc;
  return (
    <button
      onClick={onSelect}
      className={`cencursa-card p-3 rounded-sm text-left transition-all aspect-square flex flex-col justify-between cursor-pointer ${
        selected ? 'border-gold/50 bg-gold/5' : ''
      }`}
    >
      <div className="text-xl">{cat.icon}</div>
      <div>
        <div className={`font-terminal text-xs tracking-wide rarity-${item.rarity} mb-0.5 truncate`}>
          {item.name}
        </div>
        <div className="font-terminal text-xs text-muted-foreground opacity-50">
          {RARITY_LABEL[item.rarity]?.slice(0, 3) || '?'}
        </div>
      </div>
      {item.is_equipped && (
        <div className="w-1.5 h-1.5 rounded-full bg-gold absolute top-2 right-2" />
      )}
    </button>
  );
}