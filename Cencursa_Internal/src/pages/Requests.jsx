import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const TYPE_LABELS = {
  item_use: 'Uso de Item', rest: 'Descanso', trade: 'Troca', special_action: 'Ação Especial',
};
const STATUS_STYLES = {
  pending: { color: 'var(--gold)', border: 'rgba(196,169,90,0.3)', label: 'PENDENTE' },
  approved: { color: '#4A7A4A', border: 'rgba(74,122,74,0.4)', label: 'APROVADO' },
  denied: { color: 'var(--alert)', border: 'rgba(204,0,0,0.4)', label: 'RECUSADO' },
};

export default function Requests() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: 'special_action', description: '' });
  const [showForm, setShowForm] = useState(false);

  const { data: characters } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => base44.entities.Character.filter({ player_email: user?.email }),
    enabled: !!user?.email,
  });
  const character = characters?.[0];

  const { data: requests } = useQuery({
    queryKey: ['myRequests', character?.id],
    queryFn: () => base44.entities.Request.filter({ character_id: character.id }, '-created_date'),
    enabled: !!character?.id,
  });

  const createRequest = useMutation({
    mutationFn: data => base44.entities.Request.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myRequests'] });
      setForm({ type: 'special_action', description: '' });
      setShowForm(false);
    },
  });

  const handleSubmit = () => {
    if (!form.description.trim() || !character) return;
    createRequest.mutate({
      character_id: character.id,
      character_name: character.name,
      player_email: user.email,
      type: form.type,
      description: form.description,
    });
  };

  const pending = (requests || []).filter(r => r.status === 'pending');
  const resolved = (requests || []).filter(r => r.status !== 'pending');

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--gold-dark)', opacity: 0.5 }}>
          CANAL DE COMUNICAÇÃO — SUJEITO → SUPERVISÃO
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Solicitações</h1>
        <div className="divider-gold mt-2" />
      </div>

      {/* New request */}
      <div className="fade-in-up-delay-1">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-cencursa">
            ◈ NOVA SOLICITAÇÃO
          </button>
        ) : (
          <CencursaCard title="Nova Solicitação" subtitle="TRANSMISSÃO PARA SUPERVISÃO">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-terminal tracking-widest mb-2 block" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                  TIPO DE SOLICITAÇÃO
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, type: val }))}
                      className="text-xs font-terminal px-3 py-1.5 transition-all"
                      style={{
                        background: form.type === val ? 'rgba(196,169,90,0.15)' : 'transparent',
                        border: `1px solid ${form.type === val ? 'rgba(196,169,90,0.5)' : 'rgba(196,169,90,0.15)'}`,
                        color: form.type === val ? 'var(--gold)' : 'rgba(232,232,232,0.4)',
                        borderRadius: '2px',
                        fontSize: '0.6rem',
                      }}>
                      {label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-terminal tracking-widest mb-2 block" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                  DESCRIÇÃO
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Descreva sua solicitação em detalhes..."
                  className="w-full p-3 text-sm font-body resize-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(196,169,90,0.2)',
                    color: 'var(--cold-white)',
                    borderRadius: '2px',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={createRequest.isPending || !form.description.trim()}
                  className="btn-cencursa">
                  {createRequest.isPending ? '◈ ENVIANDO...' : '◈ ENVIAR'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-cencursa btn-danger">
                  ✕ CANCELAR
                </button>
              </div>
            </div>
          </CencursaCard>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <CencursaCard title="Aguardando Resposta" subtitle="SOLICITAÇÕES PENDENTES">
          <div className="space-y-3">
            {pending.map(req => (
              <RequestCard key={req.id} req={req} />
            ))}
          </div>
        </CencursaCard>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <CencursaCard title="Histórico" subtitle="SOLICITAÇÕES PROCESSADAS">
          <div className="space-y-3">
            {resolved.map(req => (
              <RequestCard key={req.id} req={req} />
            ))}
          </div>
        </CencursaCard>
      )}

      {(!requests || requests.length === 0) && !showForm && (
        <div className="text-center py-12 opacity-30">
          <div className="text-3xl mb-3">◉</div>
          <p className="font-terminal text-xs" style={{ color: 'var(--gold-dark)' }}>NENHUMA SOLICITAÇÃO</p>
        </div>
      )}
    </div>
  );
}

function RequestCard({ req }) {
  const st = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
  return (
    <div className="p-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,169,90,0.1)' }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-terminal mr-2" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
            {TYPE_LABELS[req.type]?.toUpperCase()}
          </span>
          <span className="text-xs font-terminal" style={{ color: 'rgba(232,232,232,0.3)', fontSize: '0.55rem' }}>
            {new Date(req.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-xs font-terminal px-2 py-0.5 shrink-0"
          style={{ color: st.color, border: `1px solid ${st.border}`, fontSize: '0.55rem', borderRadius: '2px' }}>
          {st.label}
        </span>
      </div>
      <p className="text-sm font-body opacity-70" style={{ color: 'var(--cold-white)', lineHeight: 1.6 }}>
        {req.description}
      </p>
      {req.gm_response && (
        <div className="mt-3 p-2 rounded-sm" style={{ background: 'rgba(196,169,90,0.05)', borderLeft: '2px solid rgba(196,169,90,0.3)' }}>
          <div className="text-xs font-terminal mb-1" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
            RESPOSTA DO MESTRE
          </div>
          <p className="text-sm font-body opacity-70" style={{ color: 'var(--cold-white)', lineHeight: 1.6 }}>
            {req.gm_response}
          </p>
        </div>
      )}
    </div>
  );
}