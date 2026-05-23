import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const TYPE_OPTIONS = ['report', 'recording', 'secret_file', 'corrupted_record', 'image', 'cencursa_log'];
const TYPE_LABELS = { report: 'Relatório', recording: 'Gravação', secret_file: 'Arquivo Secreto', corrupted_record: 'Registro Corrompido', image: 'Imagem', cencursa_log: 'Log Cencursa' };
const ACCESS_OPTIONS = ['public', 'restricted', 'classified', 'eyes_only'];

export default function GMDocuments() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'report', content: '', censored_parts: '',
    access_level: 'restricted', is_corrupted: false, tags: '', unlocked_for: [],
  });

  const { data: docs } = useQuery({
    queryKey: ['allDocuments'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const { data: characters } = useQuery({
    queryKey: ['allCharacters'],
    queryFn: () => base44.entities.Character.list(),
  });

  const createDoc = useMutation({
    mutationFn: data => base44.entities.Document.create(data),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ['allDocuments'] });
      setShowCreate(false);
      setForm({ title: '', type: 'report', content: '', censored_parts: '', access_level: 'restricted', is_corrupted: false, tags: '', unlocked_for: [] });
    },
  });

  const updateDoc = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['allDocuments'] });
      setSelected(prev => ({ ...prev, ...vars.data }));
    },
  });

  const logEvent = useMutation({
    mutationFn: data => base44.entities.EventLog.create(data),
  });

  const deleteDoc = useMutation({
    mutationFn: id => base44.entities.Document.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['allDocuments'] }); setSelected(null); },
  });

  const toggleUnlock = (docId, charId, currentUnlocked) => {
    const updated = currentUnlocked?.includes(charId)
      ? (currentUnlocked || []).filter(id => id !== charId)
      : [...(currentUnlocked || []), charId];
    updateDoc.mutate({ id: docId, data: { unlocked_for: updated } });
    const char = characters?.find(c => c.id === charId);
    if (!currentUnlocked?.includes(charId)) {
      logEvent.mutate({ character_id: charId, character_name: char?.name, type: 'document_unlocked', message: `Documento desbloqueado: ${selected?.title || 'Desconhecido'}` });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="fade-in-up flex items-center justify-between">
        <div>
          <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
            ◈ GESTÃO DE ARQUIVOS CENCURSA
          </div>
          <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Arquivos</h1>
          <div className="divider-gold mt-2" />
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-cencursa">▣ NOVO ARQUIVO</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <CencursaCard title="Novo Arquivo" subtitle="REGISTRO CENCURSA — CRIAÇÃO">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>TÍTULO</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full p-2 text-sm font-body"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
              </div>
              <div>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>TIPO</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full p-2 text-xs font-terminal"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>CONTEÚDO</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={6} className="w-full p-3 text-sm font-body resize-y"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
            </div>
            <div>
              <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--alert)', fontSize: '0.55rem' }}>PARTES CENSURADAS (conteúdo será bloqueado)</label>
              <textarea value={form.censored_parts} onChange={e => setForm(f => ({ ...f, censored_parts: e.target.value }))}
                rows={2} className="w-full p-2 text-xs font-body resize-none"
                style={{ background: 'rgba(74,10,10,0.15)', border: '1px solid rgba(204,0,0,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>NÍVEL DE ACESSO</label>
                <select value={form.access_level} onChange={e => setForm(f => ({ ...f, access_level: e.target.value }))}
                  className="w-full p-2 text-xs font-terminal"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}>
                  {ACCESS_OPTIONS.map(a => <option key={a} value={a}>{a.toUpperCase().replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-terminal tracking-widest mb-1 block" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>TAGS (separadas por vírgula)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full p-2 text-xs font-body"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,169,90,0.2)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, is_corrupted: !f.is_corrupted }))}
                className="btn-cencursa"
                style={{ borderColor: form.is_corrupted ? 'rgba(204,0,0,0.5)' : undefined, color: form.is_corrupted ? 'var(--alert)' : undefined }}>
                {form.is_corrupted ? '☣ CORROMPIDO' : '◇ MARCAR COMO CORROMPIDO'}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => createDoc.mutate(form)} disabled={createDoc.isPending || !form.title.trim()} className="btn-cencursa">
                {createDoc.isPending ? '▣ CRIANDO...' : '▣ CRIAR ARQUIVO'}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-cencursa btn-danger">✕ CANCELAR</button>
            </div>
          </div>
        </CencursaCard>
      )}

      {/* Docs list + unlock panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-terminal tracking-widest mb-2" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            {docs?.length || 0} ARQUIVO(S)
          </div>
          {(docs || []).map(doc => (
            <button key={doc.id} onClick={() => setSelected(doc)}
              className={`w-full cencursa-card p-3 text-left transition-all ${selected?.id === doc.id ? 'ornament-border-gold' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`font-grimoire text-sm ${doc.is_corrupted ? 'line-through opacity-60' : ''}`}
                  style={{ color: 'var(--cold-white)' }}>{doc.title}</span>
                <span className="text-xs font-terminal shrink-0" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem' }}>
                  {TYPE_LABELS[doc.type]}
                </span>
              </div>
              <div className="text-xs font-terminal mt-1 opacity-50" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                {doc.access_level?.toUpperCase().replace('_', ' ')}
                {doc.unlocked_for?.length > 0 && ` — ${doc.unlocked_for.length} acesso(s)`}
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <CencursaCard title="Controle de Acesso" subtitle="GERENCIAR DESBLOQUEIOS">
            <div className="mb-4">
              <h3 className="font-grimoire text-base mb-1" style={{ color: 'var(--gold)' }}>{selected.title}</h3>
              <div className="flex gap-2 mt-2">
                <button onClick={() => deleteDoc.mutate(selected.id)} className="btn-cencursa btn-danger text-xs">
                  ✕ EXCLUIR
                </button>
              </div>
            </div>
            <div className="divider-gold" />
            <div className="text-xs font-terminal tracking-widest mb-3 mt-3" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
              SUJEITOS COM ACESSO
            </div>
            <div className="space-y-2">
              {(characters || []).map(char => {
                const hasAccess = selected.unlocked_for?.includes(char.id);
                return (
                  <div key={char.id} className="flex items-center justify-between p-2 rounded-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${hasAccess ? 'rgba(196,169,90,0.2)' : 'rgba(196,169,90,0.06)'}` }}>
                    <span className="text-sm font-body" style={{ color: hasAccess ? 'var(--gold)' : 'rgba(232,232,232,0.5)' }}>
                      {char.name}
                    </span>
                    <button
                      onClick={() => toggleUnlock(selected.id, char.id, selected.unlocked_for)}
                      className="text-xs font-terminal px-2 py-1 transition-all"
                      style={{
                        background: hasAccess ? 'rgba(196,169,90,0.15)' : 'transparent',
                        border: `1px solid ${hasAccess ? 'rgba(196,169,90,0.4)' : 'rgba(196,169,90,0.15)'}`,
                        color: hasAccess ? 'var(--gold)' : 'rgba(232,232,232,0.3)',
                        borderRadius: '2px', fontSize: '0.55rem',
                      }}>
                      {hasAccess ? '✓ CONCEDIDO' : '◇ CONCEDER'}
                    </button>
                  </div>
                );
              })}
            </div>
          </CencursaCard>
        )}
      </div>
    </div>
  );
}