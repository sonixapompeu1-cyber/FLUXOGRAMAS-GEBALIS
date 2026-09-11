import React, { useState } from 'react';
import { 
  ValidationFinding, 
  FindingStatus, 
  FindingSeverity, 
  OperationalImpact 
} from '../types';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Compass, 
  History, 
  Send
} from 'lucide-react';

interface FindingDetailModalProps {
  finding: ValidationFinding;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: FindingStatus, note?: string) => void;
  onAddNote: (id: string, note: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onUpdateStatus,
  onAddNote
}) => {
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FindingStatus>(finding.status);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300">CRÍTICO</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">ALTO</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">MÉDIO</span>;
      case 'low':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">BAIXO</span>;
      case 'informational':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">INFORMATIVO</span>;
    }
  };

  const getStatusBadge = (st: FindingStatus) => {
    switch (st) {
      case 'open':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">Aberto</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Em Revisão</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Aceite</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolvido</span>;
    }
  };

  const handleApplyStatusChange = () => {
    onUpdateStatus(finding.id, selectedStatus, statusChangeNote || undefined);
    setIsChangingStatus(false);
    setStatusChangeNote('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(finding.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {finding.id}
              </span>
              {getSeverityBadge(finding.severity)}
              {getStatusBadge(finding.status)}
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {finding.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              {finding.title}
            </h3>
            <p className="text-xs text-slate-600">
              Fluxo: <span className="font-semibold text-slate-800">{finding.flowName}</span> ({finding.flowSlug}) 
              {finding.visioPageNumber && ` · Prancha Visio Pág. #${finding.visioPageNumber}`}
              {finding.nodeId && ` · Nó: ${finding.nodeId}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Impact & Principle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Impacto Operacional
              </span>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{finding.operationalImpact || 'Não determinável'}</span>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Classificação de Certeza
              </span>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>FACTO AUDITADO (Comprovação Multi-Fonte)</span>
              </p>
            </div>
          </div>

          {/* Tripla Evidência */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E62382]" />
              <span>Tripla Evidência Comparada (Documento × Flow × GPS)</span>
            </h4>

            <div className="space-y-2.5">
              {/* Visio Evidence */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    1. Documento Original (Visio Pág. #{finding.visioPageNumber || 'N/A'})
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded">
                    ORIGINAL — NÃO ALTERADO
                  </span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed font-sans">
                  {finding.visioEvidence || 'Sem anotação explícita de evidência Visio.'}
                </p>
              </div>

              {/* Flow Evidence */}
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  2. Flow Estruturado (flows.json · Nó: {finding.nodeId || 'Geral'})
                </span>
                <p className="text-xs text-purple-950 leading-relaxed font-mono">
                  {finding.flowEvidence || 'Sem dados adicionais de flow.'}
                </p>
              </div>

              {/* GPS Evidence */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  3. Execução no GPS Operacional (Comportamento em Contact Center)
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-sans">
                  {finding.gpsEvidence || 'Comportamento determinístico verificado.'}
                </p>
              </div>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Esperado (Conforme Fluxograma)
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-mono">
                {finding.expected || 'Conformidade com os nós do diagrama original.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Observado no Motor GPS
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-mono">
                {finding.actual || 'Comportamento executado pelo motor de navegação.'}
              </p>
            </div>
          </div>

          {/* Action: Change Status */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gestão e Decisão Humana de Auditoria
              </span>
              {!isChangingStatus && (
                <button
                  type="button"
                  onClick={() => setIsChangingStatus(true)}
                  className="text-xs font-semibold text-[#E62382] hover:underline"
                >
                  Alterar Estado do Achado
                </button>
              )}
            </div>

            {isChangingStatus ? (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  {(['open', 'under_review', 'accepted', 'resolved'] as FindingStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedStatus === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'open' && 'Aberto'}
                      {st === 'under_review' && 'Em Revisão'}
                      {st === 'accepted' && 'Aceite (Waiver)'}
                      {st === 'resolved' && 'Resolvido'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Justificação da alteração de estado (opcional)..."
                  value={statusChangeNote}
                  onChange={(e) => setStatusChangeNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsChangingStatus(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyStatusChange}
                    className="px-3.5 py-1.5 bg-[#E62382] hover:bg-[#c9186d] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Confirmar Alteração
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Estado atual: <strong className="text-slate-900">{getStatusBadge(finding.status)}</strong>. Não há modificação automática no ficheiro <code className="font-mono text-slate-800">flows.json</code>.
              </p>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>Histórico de Auditoria e Rastreabilidade</span>
            </h4>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5 max-h-48 overflow-y-auto">
              {finding.history && finding.history.length > 0 ? (
                finding.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs border-b border-slate-200/60 pb-2 last:border-b-0 last:pb-0">
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{h.date}</span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">{h.action}</p>
                      {h.author && <p className="text-[11px] text-slate-500">Por: {h.author}</p>}
                      {h.note && <p className="text-[11px] text-slate-600 italic">"{h.note}"</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Sem eventos históricos adicionais.</p>
              )}
            </div>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar observação de auditoria..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
            />
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gravar Nota</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 italic">
            Regra V6: Nenhum achado altera automaticamente o código ou fluxo. Decisão preservada em auditoria.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
