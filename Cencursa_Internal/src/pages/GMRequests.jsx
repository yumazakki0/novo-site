import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { client } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TYPE_LABELS = { item_use:'USO DE ITEM', rest:'DESCANSO', trade:'TROCA', special_action:'AÇÃO ESPECIAL' };

export default function GMRequests() {
  const { user } = useOutletContext();
  const qc = useQueryClient();
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');

  const { data: requests = [] } = useQuery({
    queryKey: ['all-requests'],
    queryFn: () => client.entities.Request.list('-created_date', 50),
    refetchInterval: 15000,
  });

  const updateReq = useMutation({
    mutationFn: ({ id, data }) => client.entities.Request.update(id, data),
    onSuccess: async (updated) => {
      qc.invalidateQueries(['all-requests']);
      qc.invalidateQueries(['pending-requests']);
      setResponding(null);
      setResponseText('');
      await client.entities.EventLog.create({
        character_id: updated.character_id,
        character_name: updated.character_name,
        type: 'request_response',
        message: `Solicitação ${updated.status === 'approved' ? 'aprovada' : 'negada'}: ${updated.type}`,
      });
    },
  });

  if (user?.role !== 'admin') return null;

  const pending = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  const statusStyle = {
    pending:  { color: '#8B7536', label: 'PENDENTE' },
    approved: { color: '#4A7A4A', label: 'APROVADO' },
    denied:   { color: '#CC0000', label: 'NEGADO' },
  };

  const ReqCard = ({ req }) => {
    const st = statusStyle[req.status];
    return (
      <div className="cencursa-card p-4 rounded-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-grimoire text-sm text-cold mr-3">{req.character_name}</span>
            <span className="font-terminal text-xs text-muted-foreground">{TYPE_LABELS[req.type]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-terminal text-xs" style={{ color: st.color }}>{st.label}</span>
            <span className="font-terminal text-xs text-muted-foreground opacity-40">
              {new Date(req.created_date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <p className="font-body text-sm text-cold/80 mb-3">{req.description}</p>
        {req.gm_response && (
          <div className="p-2 rounded-sm mb-3 font-body text-xs text-cold/70 italic" style={{ background: 'rgba(196,169,90,0.05)', border: '1px solid rgba(196,169,90,0.1)' }}>
            Resposta: {req.gm_response}
          </div>
        )}
        {req.status === 'pending' && (
          responding === req.id ? (
            <div className="space-y-2">
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Resposta (opcional)..."
                rows={2}
                className="w-full bg-black/50 border border-gold/20 text-cold font-body text-xs p-2 rounded-sm focus:border-gold/50 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateReq.mutate({ id: req.id, data: { status: 'approved', gm_response: responseText } })}
                  className="btn-cencursa rounded-sm flex-1"
                >✓ APROVAR</button>
                <button
                  onClick={() => updateReq.mutate({ id: req.id, data: { status: 'denied', gm_response: responseText } })}
                  className="btn-cencursa btn-danger rounded-sm flex-1"
                >✕ NEGAR</button>
                <button onClick={() => setResponding(null)} className="btn-cencursa rounded-sm px-2">◦</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setResponding(req.id)} className="btn-cencursa rounded-sm text-xs py-1">
              → RESPONDER
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8 fade-in-up">
        <div className="font-terminal text-xs text-muted-foreground tracking-[0.3em] mb-1">SISTEMA DE SOLICITAÇÕES</div>
        <h1 className="font-grimoire text-4xl text-cold">Solicitações</h1>
      </div>
      <div className="divider-gold" />

      {pending.length > 0 && (
        <div className="mt-6 mb-8 fade-in-up-delay-1">
          <div className="font-terminal text-xs text-alert tracking-widest mb-4">
            ─ PENDENTES ({pending.length}) ─
          </div>
          <div className="space-y-3">{pending.map(r => <ReqCard key={r.id} req={r} />)}</div>
        </div>
      )}

      {resolved.length > 0 && (
        <div className="fade-in-up-delay-2">
          <div className="font-terminal text-xs text-muted-foreground tracking-widest mb-4">
            ─ RESOLVIDAS ({resolved.length}) ─
          </div>
          <div className="space-y-2">{resolved.map(r => <ReqCard key={r.id} req={r} />)}</div>
        </div>
      )}
    </div>
  );
}