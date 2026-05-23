import { useQuery } from '@tanstack/react-query';
import { client } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import CencursaCard from '@/components/ui/CencursaCard';
import { useState } from 'react';

const TYPE_ICONS = {
  report: '📋', recording: '🎙', secret_file: '◈', corrupted_record: '☣', image: '🖼', cencursa_log: '▣',
};
const TYPE_LABELS = {
  report: 'Relatório', recording: 'Gravação', secret_file: 'Arquivo Secreto',
  corrupted_record: 'Registro Corrompido', image: 'Imagem', cencursa_log: 'Log Cencursa',
};
const ACCESS_COLORS = {
  public: 'var(--gold-dark)', restricted: '#C4A020', classified: 'var(--crimson)', eyes_only: 'var(--alert)',
};

export default function Documents() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  const { data: characters } = useQuery({
    queryKey: ['myCharacter', user?.email],
    queryFn: () => client.entities.Character.filter({ player_email: user?.email }),
    enabled: !!user?.email,
  });
  const character = characters?.[0];

  const { data: allDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: () => client.entities.Document.list(),
    enabled: !!character?.id,
  });

  const docs = (allDocs || []).filter(d =>
    d.access_level === 'public' ||
    (d.unlocked_for && d.unlocked_for.includes(character?.id))
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="fade-in-up">
        <div className="text-xs font-terminal tracking-[0.4em] mb-1" style={{ color: 'var(--gold-dark)', opacity: 0.5 }}>
          ARQUIVOS CENCURSA — ACESSO PARCIAL CONCEDIDO
        </div>
        <h1 className="font-grimoire text-3xl" style={{ color: 'var(--gold)' }}>Arquivos</h1>
        <div className="divider-gold mt-2" />
        <p className="text-xs font-terminal mt-2 opacity-40" style={{ color: 'var(--cold-white)' }}>
          {docs.length} DOCUMENTO(S) ACESSÍVEL(IS)
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-20">▣</div>
          <p className="font-terminal text-sm opacity-30" style={{ color: 'var(--gold-dark)' }}>
            NENHUM ARQUIVO DESBLOQUEADO
          </p>
          <p className="font-terminal text-xs opacity-20 mt-2" style={{ color: 'var(--cold-white)' }}>
            ACESSO REQUER AUTORIZAÇÃO DO MESTRE
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map(doc => (
            <button key={doc.id} onClick={() => setSelected(doc)}
              className={`cencursa-card p-4 text-left transition-all hover:ornament-border-gold ${doc.is_corrupted ? 'opacity-80' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl opacity-70 mt-0.5">{TYPE_ICONS[doc.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-grimoire text-sm ${doc.is_corrupted ? 'line-through opacity-70' : ''}`}
                      style={{ color: 'var(--cold-white)' }}>
                      {doc.title}
                    </h3>
                    <div className="text-xs font-terminal shrink-0 px-1.5 py-0.5"
                      style={{ color: ACCESS_COLORS[doc.access_level], border: `1px solid ${ACCESS_COLORS[doc.access_level]}40`, fontSize: '0.5rem', borderRadius: '2px' }}>
                      {doc.access_level?.toUpperCase().replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-xs font-terminal opacity-50" style={{ color: 'var(--gold-dark)', fontSize: '0.55rem' }}>
                    {TYPE_LABELS[doc.type]}
                    {doc.is_corrupted && ' — CORROMPIDO'}
                  </div>
                  {doc.content && (
                    <p className="text-xs font-body mt-2 opacity-50 line-clamp-2" style={{ color: 'var(--cold-white)' }}>
                      {doc.content.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Document viewer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto cencursa-card ornament-border p-6 relative slide-in-right">
            {/* Corner ornaments */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: 'rgba(196,169,90,0.4)' }} />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: 'rgba(196,169,90,0.4)' }} />

            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-terminal tracking-widest" style={{ color: ACCESS_COLORS[selected.access_level], fontSize: '0.55rem' }}>
                CENCURSA CORP. — {TYPE_LABELS[selected.type]?.toUpperCase()} — {selected.access_level?.toUpperCase().replace('_', ' ')}
              </div>
              <button onClick={() => setSelected(null)} className="text-xs font-terminal opacity-40 hover:opacity-80" style={{ color: 'var(--gold)' }}>
                ✕
              </button>
            </div>

            <div className="divider-gold" />

            <h2 className={`font-grimoire text-2xl mb-4 ${selected.is_corrupted ? 'opacity-70' : ''}`} style={{ color: 'var(--gold)' }}>
              {selected.title}
            </h2>

            {selected.content && (
              <div className="font-body text-sm mb-4" style={{ color: 'var(--cold-white)', opacity: 0.8, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
            )}

            {selected.censored_parts && (
              <div className="mt-4 p-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(204,0,0,0.2)' }}>
                <div className="text-xs font-terminal mb-2" style={{ color: 'var(--alert)', fontSize: '0.55rem' }}>
                  SEÇÃO CENSURADA — ACESSO NEGADO
                </div>
                <div className="font-terminal text-xs" style={{ color: 'rgba(204,0,0,0.3)', letterSpacing: '0.05em' }}>
                  {'█'.repeat(Math.min(200, (selected.censored_parts?.length || 50)))}
                </div>
              </div>
            )}

            {selected.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.tags.split(',').map((tag, i) => (
                  <span key={i} className="text-xs font-terminal px-2 py-0.5"
                    style={{ border: '1px solid rgba(196,169,90,0.2)', color: 'var(--gold-dark)', fontSize: '0.55rem', borderRadius: '2px' }}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs font-terminal opacity-30" style={{ color: 'var(--gold-dark)', fontSize: '0.5rem' }}>
              REGISTRADO EM: {new Date(selected.created_date).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}