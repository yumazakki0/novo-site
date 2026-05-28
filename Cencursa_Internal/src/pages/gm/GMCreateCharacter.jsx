import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client';
import CencursaCard from '@/components/ui/CencursaCard';
import { useNavigate } from 'react-router-dom';

const ATTRS = ['str', 'agi', 'res', 'int', 'per', 'pre', 'will'];
const ATTR_LABELS = { str: 'Força', agi: 'Agilidade', res: 'Resistência', int: 'Inteligência', per: 'Percepção', pre: 'Presença', will: 'Vontade' };

const DEFAULT_FORM = {
  name: '', player_email: '', player_name: '', age: '', height: '', weight: '',
  appearance: '', nationality: '', occupation: '',
  fears: '', traumas: '', desires: '', addictions: '', important_memory: '', mental_instability: '',
  str: 5, agi: 5, res: 5, int: 5, per: 5, pre: 5, will: 5,
  hp: 10, hp_max: 10, sanity: 100, sanity_max: 100, souls: 0, notes: '', is_active: true,
};

export default function GMCreateCharacter() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [tab, setTab] = useState('basic');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createChar = useMutation({
    mutationFn: data => client.entities.Character.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allCharacters'] });
      navigate('/gm/players');
    },
    onError: (error) => {
      console.error('[GMCreateCharacter] createChar error', error);
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const inputStyle = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' };
  const labelStyle = { color: 'var(--gold-dark)', fontSize: '0.55rem' };

  const TABS = ['basic', 'psychology', 'attrs', 'config'];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ REGISTRO DE NOVO SUJEITO
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Criar Personagem</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-xs font-terminal px-3 py-1.5 transition-all"
            style={{
              background: tab === t ? 'rgba(196,169,90,0.15)' : 'transparent',
              border: `1px solid ${tab === t ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.1)'}`,
              color: tab === t ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
              borderRadius: '2px', fontSize: '0.6rem', letterSpacing: '0.15em',
            }}>
            {t === 'basic' ? 'BÁSICO' : t === 'psychology' ? 'PSICOLOGIA' : t === 'attrs' ? 'ATRIBUTOS' : 'CONFIG'}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <CencursaCard title="Informações Básicas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'NOME DO PERSONAGEM *' },
              { key: 'player_email', label: 'EMAIL DO JOGADOR *' },
              { key: 'player_name', label: 'NOME DO JOGADOR' },
              { key: 'age', label: 'IDADE' },
              { key: 'height', label: 'ALTURA' },
              { key: 'weight', label: 'PESO' },
              { key: 'nationality', label: 'NACIONALIDADE' },
              { key: 'occupation', label: 'OCUPAÇÃO' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>{f.label}</label>
                <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  className="w-full p-2 text-sm font-body" style={inputStyle} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>APARÊNCIA</label>
            <textarea value={form.appearance} onChange={e => set('appearance', e.target.value)}
              rows={3} className="w-full p-2 text-sm font-body resize-none" style={inputStyle} />
          </div>
        </CencursaCard>
      )}

      {tab === 'psychology' && (
        <CencursaCard title="Perfil Psicológico">
          <div className="space-y-4">
            {[
              { key: 'fears', label: 'MEDOS' },
              { key: 'traumas', label: 'TRAUMAS' },
              { key: 'desires', label: 'DESEJOS' },
              { key: 'addictions', label: 'VÍCIOS' },
              { key: 'important_memory', label: 'MEMÓRIA IMPORTANTE' },
              { key: 'mental_instability', label: 'INSTABILIDADE MENTAL' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>{f.label}</label>
                <textarea value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  rows={2} className="w-full p-2 text-sm font-body resize-none" style={inputStyle} />
              </div>
            ))}
          </div>
        </CencursaCard>
      )}

      {tab === 'attrs' && (
        <CencursaCard title="Atributos">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ATTRS.map(attr => (
              <div key={attr}>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>{ATTR_LABELS[attr].toUpperCase()}</label>
                <input type="number" min="1" max="10" value={form[attr]}
                  onChange={e => set(attr, parseInt(e.target.value) || 5)}
                  className="w-full p-2 text-sm font-terminal" style={{ ...inputStyle, color: 'var(--gold)' }} />
              </div>
            ))}
          </div>
        </CencursaCard>
      )}

      {tab === 'config' && (
        <CencursaCard title="Configuração de Vitais">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'hp', label: 'HP INICIAL' },
              { key: 'hp_max', label: 'HP MÁXIMO' },
              { key: 'sanity', label: 'SANIDADE INICIAL' },
              { key: 'sanity_max', label: 'SANIDADE MÁXIMA' },
              { key: 'souls', label: 'ALMAS INICIAIS' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>{f.label}</label>
                <input type="number" min="0" value={form[f.key]}
                  onChange={e => set(f.key, parseInt(e.target.value) || 0)}
                  className="w-full p-2 text-sm font-terminal" style={{ ...inputStyle, color: 'var(--gold)' }} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-terminal tracking-widest mb-1 block" style={labelStyle}>ANOTAÇÕES DO GM</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} className="w-full p-2 text-sm font-body resize-none" style={inputStyle} />
          </div>
        </CencursaCard>
      )}

      {createChar.isError && (
        <div className="p-3 rounded-sm bg-red-900/20 border border-red-700 text-sm text-red-200">
          Erro ao criar personagem: {createChar.error?.message || 'Falha desconhecida'}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => createChar.mutate(form)}
          disabled={createChar.isPending || !form.name.trim() || !form.player_email.trim()}
          className="btn-cencursa">
          {createChar.isPending ? '◈ REGISTRANDO...' : '◈ REGISTRAR SUJEITO'}
        </button>
        <button onClick={() => navigate('/gm/players')} className="btn-cencursa btn-danger">
          ✕ CANCELAR
        </button>
      </div>
    </div>
  );
}