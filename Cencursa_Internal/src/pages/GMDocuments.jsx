import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { client } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TYPE_LABELS = {
  report:           'RELATÓRIO',
  recording:        'GRAVAÇÃO',
  secret_file:      'ARQUIVO SECRETO',
  corrupted_record: 'REGISTRO CORROMPIDO',
  image:            'IMAGEM',
  cencursa_log:     'LOG CENCURSA',
};

export default function GMDocuments() {
  const { user } = useOutletContext();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'report', content: '', censored_parts: '',
    access_level: 'restricted', unlocked_for: [], is_corrupted: false,
  });
  const [unlockInput, setUnlockInput] = useState('');

  const { data: documents = [] } = useQuery({
    queryKey: ['all-documents'],
    queryFn: () => client.entities.Document.list('-created_date', 50),
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['all-characters'],
    queryFn: () => client.entities.Character.list(),
  });

  const createDoc = useMutation({
    mutationFn: data => client.entities.Document.create(data),
    onSuccess: () => { qc.invalidateQueries(['all-documents']); setShowForm(false); resetForm(); },
  });

  const updateDoc = useMutation({
    mutationFn: ({ id, data }) => client.entities.Document.update(id, data),
    onSuccess: async (updated) => {
      qc.invalidateQueries(['all-documents']);
      setEditing(null);
      // Log unlocks
      await client.entities.EventLog.create({
        type: 'document_unlocked',
        message: `Documento "${updated.title}" atualizado`,
        is_global: false,
      });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: id => client.entities.Document.delete(id),
    onSuccess: () => qc.invalidateQueries(['all-documents']),
  });

  const resetForm = () => setForm({
    title: '', type: 'report', content: '', censored_parts: '',
    access_level: 'restricted', unlocked_for: [], is_corrupted: false,
  });

  const handleUnlockToggle = (charId) => {
    setForm(f => ({
      ...f,
      unlocked_for: f.unlocked_for.includes(charId)
        ? f.unlocked_for.filter(id => id !== charId)
        : [...f.unlocked_for, charId]
    }));
  };

  const startEdit = (doc) => {
    setEditing(doc.id);
    setForm({ ...doc, unlocked_for: doc.unlocked_for || [] });
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-start justify-between mb-8 fade-in-up">
        <div>
          <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">SISTEMA DE ARQUIVOS</div>
          <h1 className="font-grimoire text-4xl text-cold">Documentos</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className="btn-cencursa rounded-sm">
          {showForm ? '✕' : '+ NOVO DOCUMENTO'}
        </button>
      </div>
      <div className="divider-gold" />

      {/* Form */}
      {(showForm || editing) && (
        <div className="cencursa-card p-6 rounded-sm mb-6 fade-in-up">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">
            {editing ? 'EDITAR DOCUMENTO' : 'CRIAR DOCUMENTO'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="font-terminal text-xs text-gold/60 block mb-1">TÍTULO</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-black/50 border border-gold/20 text-cold font-grimoire text-sm p-2 rounded-sm focus:border-gold/50 outline-none" />
            </div>
            <div>
              <label className="font-terminal text-xs text-gold/60 block mb-1">TIPO</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none">
                {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="font-terminal text-xs text-gold/60 block mb-1">NÍVEL DE ACESSO</label>
              <select value={form.access_level} onChange={e => setForm(f => ({ ...f, access_level: e.target.value }))}
                className="w-full bg-black/50 border border-gold/20 text-cold font-terminal text-xs p-2 rounded-sm focus:border-gold/50 outline-none">
                <option value="public">PÚBLICO</option>
                <option value="restricted">RESTRITO</option>
                <option value="classified">CLASSIFICADO</option>
                <option value="eyes_only">ONLY EYES</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="font-terminal text-xs text-gold/60 block mb-1">CONTEÚDO</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6}
              className="w-full bg-black/50 border border-gold/20 text-cold font-body text-sm p-3 rounded-sm focus:border-gold/50 outline-none resize-none" />
          </div>
          <div className="mb-4">
            <label className="font-terminal text-xs text-gold/60 block mb-1">PARTES CENSURADAS (opcional)</label>
            <input value={form.censored_parts} onChange={e => setForm(f => ({ ...f, censored_parts: e.target.value }))}
              className="w-full bg-black/50 border border-gold/20 text-cold font-body text-xs p-2 rounded-sm focus:border-gold/50 outline-none" />
          </div>
          <div className="mb-4">
            <label className="font-terminal text-xs text-gold/60 block mb-2">DESBLOQUEAR PARA:</label>
            <div className="flex flex-wrap gap-2">
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleUnlockToggle(c.id)}
                  className={`font-terminal text-xs px-3 py-1 rounded-sm border transition-all ${
                    form.unlocked_for.includes(c.id)
                      ? 'border-gold/50 text-gold bg-gold/10'
                      : 'border-gold/15 text-muted-foreground'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label className="font-terminal text-xs text-gold/60">CORROMPIDO</label>
            <button onClick={() => setForm(f => ({ ...f, is_corrupted: !f.is_corrupted }))}
              className={`font-terminal text-xs px-3 py-1 rounded-sm border transition-all ${form.is_corrupted ? 'border-alert text-alert' : 'border-gold/15 text-muted-foreground'}`}>
              {form.is_corrupted ? '▒ SIM' : '○ NÃO'}
            </button>
          </div>
          <button
            onClick={() => editing ? updateDoc.mutate({ id: editing, data: form }) : createDoc.mutate(form)}
            className="btn-cencursa rounded-sm"
          >
            {editing ? '▶ SALVAR ALTERAÇÕES' : '▶ CRIAR DOCUMENTO'}
          </button>
        </div>
      )}

      {/* Document list */}
      <div className="space-y-2 fade-in-up-delay-1">
        {documents.map(doc => (
          <div key={doc.id} className="cencursa-card p-4 rounded-sm flex justify-between items-start">
            <div>
              <div className="font-terminal text-xs text-gold/60 mb-0.5">{TYPE_LABELS[doc.type]}</div>
              <div className="font-grimoire text-sm text-cold">{doc.title}</div>
              <div className="font-terminal text-xs text-muted-foreground mt-1">
                {doc.unlocked_for?.length || 0} agente(s) com acesso • {doc.access_level}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button onClick={() => startEdit(doc)} className="btn-cencursa rounded-sm py-1 px-2 text-xs">EDITAR</button>
              <button onClick={() => deleteDoc.mutate(doc.id)} className="btn-cencursa btn-danger rounded-sm py-1 px-2 text-xs">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}