import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const TYPE_LABELS = { item_use: 'Uso de Item', rest: 'Descanso', trade: 'Troca', special_action: 'Ação Especial' };

export default function GMRequests() {
  const qc = useQueryClient();
  const [responses, setResponses] = useState({});

  const { data: requests, isLoading } = useQuery({
    queryKey: ['allRequests'],
    queryFn: () => base44.entities.Request.list('-created_date'),
    refetchInterval: 10000,
  });

  const logEvent = useMutation({
    mutationFn: data => base44.entities.EventLog.create(data),
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Request.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['allRequests'] });
      if (vars.data.status === 'approved' || vars.data.status === 'denied') {
        const req = requests?.find(r => r.id === vars.id);
        if (req) {
          logEvent.mutate({
            character_id: req.character_id,
            character_name: req.character_name,
            type: 'request_response',
            message: `Solicitação "${TYPE_LABELS[req.type]}" ${vars.data.status === 'approved' ? 'APROVADA' : 'RECUSADA'}: ${req.description?.substring(0, 50)}`,
          });
        }
      }
    },
  });

  const handleRespond = (req, status) => {
    updateRequest.mutate({
      id: req.id,
      data: { status, gm_response: responses[req.id] || '' },
    });
  };

  const pending = (requests || []).filter(r => r.status === 'pending');
  const resolved = (requests || []).filter(r => r.status !== 'pending');

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--alert)', opacity: 0.7 }}>
          ◈ CANAL DE SUPERVISÃO — SOLICITAÇÕES DOS SUJEITOS
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Solicitações</h1>
        <div className="divider-gold mt-2" />
        {pending.length > 0 && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 pulse-blood"
            style={{ border: '1px solid rgba(204,0,0,0.4)', background: 'rgba(74,10,10,0.3)', borderRadius: '2px' }}>
            <span className="text-xs font-terminal" style={{ color: 'var(--alert)' }}>
              ⚠ {pending.length} AGUARDANDO RESPOSTA
            </span>
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <CencursaCard title="Pendentes" subtitle="REQUER AÇÃO IMEDIATA">
          <div className="space-y-4">
            {pending.map(req => (
              <div key={req.id} className="p-4 rounded-sm"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(204,0,0,0.2)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-terminal mr-2" style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>
                      {TYPE_LABELS[req.type]?.toUpperCase()}
                    </span>
                    <span className="font-grimoire text-sm" style={{ color: 'var(--cold-white)' }}>
                      {req.character_name}
                    </span>
                    <div className="text-xs font-terminal opacity-40 mt-0.5" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                      {new Date(req.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-body mb-3" style={{ color: 'var(--cold-white)', opacity: 0.8, lineHeight: 1.6 }}>
                  {req.description}
                </p>
                <div className="space-y-2">
                  <textarea
                    value={responses[req.id] || ''}
                    onChange={e => setResponses(r => ({ ...r, [req.id]: e.target.value }))}
                    placeholder="Resposta ao jogador (opcional)..."
                    rows={2}
                    className="w-full p-2 text-xs font-body resize-none"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,169,90,0.15)', color: 'var(--cold-white)', borderRadius: '2px', outline: 'none' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(req, 'approved')}
                      className="btn-cencursa"
                      style={{ borderColor: 'rgba(74,122,74,0.5)', color: '#4A7A4A' }}>
                      ✓ APROVAR
                    </button>
                    <button onClick={() => handleRespond(req, 'denied')}
                      className="btn-cencursa btn-danger">
                      ✕ RECUSAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CencursaCard>
      )}

      {resolved.length > 0 && (
        <CencursaCard title="Histórico" subtitle="SOLICITAÇÕES PROCESSADAS">
          <div className="space-y-3">
            {resolved.map(req => (
              <div key={req.id} className="p-3 rounded-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,169,90,0.08)' }}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-terminal" style={{ color: 'var(--gold-dark)', fontSize: '0.6rem' }}>
                      {TYPE_LABELS[req.type]}
                    </span>
                    <span className="font-grimoire text-sm" style={{ color: 'rgba(232,232,232,0.7)' }}>
                      {req.character_name}
                    </span>
                  </div>
                  <span className="text-xs font-terminal px-2 py-0.5 shrink-0"
                    style={{
                      color: req.status === 'approved' ? '#4A7A4A' : 'var(--alert)',
                      border: `1px solid ${req.status === 'approved' ? 'rgba(74,122,74,0.4)' : 'rgba(204,0,0,0.4)'}`,
                      fontSize: '0.55rem', borderRadius: '2px',
                    }}>
                    {req.status === 'approved' ? 'APROVADO' : 'RECUSADO'}
                  </span>
                </div>
                <p className="text-xs font-body opacity-50" style={{ color: 'var(--cold-white)' }}>
                  {req.description?.substring(0, 100)}
                </p>
                {req.gm_response && (
                  <p className="text-xs font-body mt-1 opacity-60" style={{ color: 'var(--gold-dark)', fontStyle: 'italic' }}>
                    Resposta: {req.gm_response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CencursaCard>
      )}

      {!isLoading && !requests?.length && (
        <div className="text-center py-12 opacity-30">
          <div className="text-3xl mb-3">◉</div>
          <p className="font-terminal text-xs" style={{ color: 'var(--gold-dark)' }}>NENHUMA SOLICITAÇÃO</p>
        </div>
      )}
    </div>
  );
}