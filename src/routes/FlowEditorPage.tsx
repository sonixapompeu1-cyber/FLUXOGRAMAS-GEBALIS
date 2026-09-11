import React, { useState, useEffect, useMemo } from 'react';
import { Flow, VisioEntry } from '../types';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import { FlowTextualEditor } from '../editor/FlowTextualEditor';
import { FlowGraphicEditor } from '../editor/FlowGraphicEditor';
import { 
  getFlowForEditing, 
  validateFlowModel, 
  saveFlowDraft, 
  publishFlowVersion, 
  revertFlowToOriginal, 
  getFlowEditorHistory,
  restoreFlowFromHistory,
  ModelValidationResult,
  FlowEditorHistoryItem
} from '../editor/flowEditorStore';
import { OriginalFlowchartViewer } from '../components/OriginalFlowchartViewer';
import { 
  Eye, FileText, CheckCircle2, AlertTriangle, ShieldAlert, 
  Save, Send, RotateCcw, History, Sparkles, Layers, ShieldCheck,
  ChevronRight, ArrowLeft, RefreshCw
} from 'lucide-react';

interface FlowEditorPageProps {
  flows: Flow[];
  onNavigate: (path: string) => void;
}

type EditorViewMode = 'GRAPHIC' | 'TEXTUAL' | 'ORIGINAL';

export const FlowEditorPage: React.FC<FlowEditorPageProps> = ({ flows, onNavigate }) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(flows[0]?.slug || 'triagem-inicial');
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [isPublishedCustom, setIsPublishedCustom] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<EditorViewMode>('GRAPHIC');

  // Feedback and Validation state
  const [validationResult, setValidationResult] = useState<ModelValidationResult | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishReason, setPublishReason] = useState('');
  const [historyList, setHistoryList] = useState<FlowEditorHistoryItem[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Load flow when slug changes
  const loadFlowData = (slug: string) => {
    try {
      const data = getFlowForEditing(slug);
      setCurrentFlow(data.flow);
      setIsDraft(data.isDraft);
      setIsPublishedCustom(data.isPublishedCustom);
      setValidationResult(validateFlowModel(data.flow));
      setHistoryList(getFlowEditorHistory(slug));
    } catch (e) {
      console.error('Erro ao carregar fluxo:', e);
    }
  };

  useEffect(() => {
    loadFlowData(selectedSlug);
  }, [selectedSlug]);

  // Handle flow updates (Unified FlowModel)
  const handleFlowModelChange = (updatedFlow: Flow) => {
    setCurrentFlow(updatedFlow);
    setIsDraft(true);
    // Realtime validation feedback
    const val = validateFlowModel(updatedFlow);
    setValidationResult(val);
  };

  // Find corresponding Visio entry
  const visioMatch = useMemo(() => {
    return VISIO_REGISTRY.find(v => v.matchedSlug === selectedSlug) || null;
  }, [selectedSlug]);

  // Action: Save Draft (Requisito 20)
  const handleSaveDraft = () => {
    if (!currentFlow) return;
    saveFlowDraft(currentFlow);
    setIsDraft(true);
    setHistoryList(getFlowEditorHistory(selectedSlug));
    setNotification({
      type: 'success',
      message: 'Rascunho de alterações guardado com sucesso no repositório local.'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Action: Validate (Requisito 19)
  const handleValidateOnly = () => {
    if (!currentFlow) return;
    const val = validateFlowModel(currentFlow);
    setValidationResult(val);
    if (val.isValid) {
      setNotification({
        type: 'success',
        message: 'Modelo verificado e 100% válido! Todos os IDs, ligações e decisões estão conformes.'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'MODELO INVÁLIDO: Foram identificadas inconsistências estruturais no fluxo.'
      });
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Action: Publish (Requisito 21 & 23)
  const handleConfirmPublish = () => {
    if (!currentFlow) return;
    const res = publishFlowVersion(currentFlow, publishReason);
    setValidationResult(res.validation);

    if (res.success) {
      setIsDraft(false);
      setIsPublishedCustom(true);
      setIsPublishModalOpen(false);
      setPublishReason('');
      setHistoryList(getFlowEditorHistory(selectedSlug));
      setNotification({
        type: 'success',
        message: `Fluxograma publicado com sucesso! Versão operacional ativa no GPS e visualizadores.`
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Publicação bloqueada: corrija os erros estruturais antes de publicar.'
      });
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Action: Revert
  const handleRevert = () => {
    if (!window.confirm('Deseja descartar as alterações e restaurar este fluxograma para a versão original de fábrica?')) {
      return;
    }
    revertFlowToOriginal(selectedSlug);
    loadFlowData(selectedSlug);
    setNotification({
      type: 'info',
      message: 'Fluxograma restaurado para a versão original de fábrica.'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  if (!currentFlow) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#E62382] mx-auto mb-2" />
        <p className="text-sm text-slate-500">A carregar modelo do fluxo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-[#E62382]">
                Área de Administrador
              </span>
              <span className="text-xs font-bold text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-700">Editor Oficial de Fluxogramas</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">
              Editor de Fluxogramas — Modelo Único Sincronizado
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Edição estruturada e determinística dos grafos operacionais. As alterações na <strong>Versão Textual</strong> ou na <strong>Vista Gráfica</strong> representam e alteram exatamente o mesmo <strong>Flow Model</strong>.
            </p>
          </div>

          {/* Flow Selector Dropdown (Requisito 36) */}
          <div className="w-full md:w-80 shrink-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Selecionar Fluxograma
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E62382] focus:bg-white outline-none transition-all text-slate-900"
            >
              {flows.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name} ({f.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Badges */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Nós: {currentFlow.nodes.length} | Ligações: {currentFlow.edges.length}
            </span>
            {isDraft && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Rascunho Não Guardado
              </span>
            )}
            {isPublishedCustom && !isDraft && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Versão Operacional Personalizada
              </span>
            )}
            {!isDraft && !isPublishedCustom && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Versão Original de Fábrica
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Histórico ({historyList.length})</span>
            </button>

            <button
              type="button"
              onClick={handleRevert}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 font-semibold"
              title="Restaurar versão original de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Original</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Procedural Change Warning (Requisito 23) */}
      {validationResult?.isProceduralChange && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-950 uppercase tracking-wider text-sm flex items-center gap-2">
                <span>ALTERAÇÃO PROCESSUAL DETETADA</span>
                <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full font-mono">
                  Governação V7 Obrigatória
                </span>
              </h4>
              <p className="text-amber-800 leading-relaxed">
                As alterações realizadas afetam decisões, regras, encaminhamentos ou terminais operacionais. Ao publicar, estas modificações serão registadas automaticamente no <strong>Change Audit de Governação</strong> sob identificador formal.
              </p>
              {validationResult.changesDetected.length > 0 && (
                <ul className="list-disc list-inside text-amber-900 font-mono text-[11px] pt-1 space-y-0.5">
                  {validationResult.changesDetected.map((cd, i) => (
                    <li key={i}>{cd}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Model Invalid Error Banner (Requisito 19) */}
      {validationResult && !validationResult.isValid && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-900 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs flex-1">
              <h4 className="font-bold text-rose-950 uppercase tracking-wider text-sm">
                MODELO INVÁLIDO
              </h4>
              <p className="text-rose-800">
                O modelo contém inconsistências lógicas que impedem a sua publicação para o motor GPS:
              </p>
              <ul className="list-disc list-inside text-rose-900 text-xs font-semibold pt-1 space-y-1">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Mode Tabs (Requisito 11, 36) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('GRAPHIC')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'GRAPHIC'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4 text-[#E62382]" />
            <span>VISTA GRÁFICA</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('TEXTUAL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'TEXTUAL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#379C8D]" />
            <span>VERSÃO TEXTUAL</span>
          </button>

          {visioMatch && (
            <button
              type="button"
              onClick={() => setViewMode('ORIGINAL')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'ORIGINAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>ORIGINAL VISIO (NÃO ALTERADO)</span>
            </button>
          )}
        </div>

        {/* Central Architecture Indicator (Requisito 12, 36) */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono bg-pink-50 border border-pink-200 text-[#E62382] px-3 py-1.5 rounded-xl font-bold">
          <span>VISTA GRÁFICA</span>
          <span>⇄</span>
          <span className="bg-[#E62382] text-white px-2 py-0.5 rounded">FLOW MODEL</span>
          <span>⇄</span>
          <span>VERSÃO TEXTUAL</span>
        </div>

        {/* Main Action Buttons (Requisito 20, 21, 36) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>GUARDAR ALTERAÇÕES</span>
          </button>

          <button
            type="button"
            onClick={handleValidateOnly}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8CBD45]" />
            <span>VALIDAR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validationResult && !validationResult.isValid) {
                alert('Não é possível publicar: o modelo contém erros estruturais.');
                return;
              }
              setIsPublishModalOpen(true);
            }}
            disabled={validationResult ? !validationResult.isValid : false}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#E62382] hover:bg-[#c9186d] disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>PUBLICAR</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      <div>
        {viewMode === 'GRAPHIC' && (
          <FlowGraphicEditor
            flow={currentFlow}
            allFlows={flows}
            onChange={handleFlowModelChange}
          />
        )}

        {viewMode === 'TEXTUAL' && (
          <FlowTextualEditor
            flow={currentFlow}
            allFlows={flows}
            onChange={handleFlowModelChange}
          />
        )}

        {viewMode === 'ORIGINAL' && visioMatch && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Documentação Original (Microsoft Visio):</strong> Esta prancha representa a fonte estática inalterada exportada do Visio. Serve exclusivamente de referência comparativa e nunca é modificada pelo editor.
              </span>
            </div>
            <OriginalFlowchartViewer
              entry={visioMatch}
              matchedFlow={currentFlow}
              className="min-h-[550px]"
            />
          </div>
        )}
      </div>

      {/* Publish Confirmation Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 text-[#E62382] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Publicar Versão Operacional
                </h3>
                <p className="text-xs text-slate-500">
                  Disponibilizar novo grafo no GPS Operacional e Contact Center
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <p>
                Esta ação atualizará o modelo oficial em tempo de execução para o fluxo: <strong className="text-slate-900">{currentFlow.name}</strong>.
              </p>
              {validationResult?.isProceduralChange && (
                <p className="text-amber-800 font-semibold">
                  ⚠️ Como foram alteradas regras de decisão, será emitido um registo no Change Audit V7.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Justificação / Despacho Institucional
              </label>
              <textarea
                value={publishReason}
                onChange={(e) => setPublishReason(e.target.value)}
                placeholder="Ex: Atualização do nó t3 e percurso condicional conforme Despacho DAC-2026/05..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E62382] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="px-5 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-xl shadow-xs"
              >
                Confirmar e Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#E62382]" />
                  <h3 className="text-base font-bold font-serif text-slate-900">
                    Histórico de Alterações
                  </h3>
                </div>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">
                    Nenhum registo de alteração no histórico deste fluxo.
                  </p>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Publicado' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {item.changeSummary}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>Por: {item.adminName}</span>
                        <span>{item.nodesCount} nós / {item.edgesCount} lig.</span>
                      </div>
                      {item.flowSnapshot && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const restored = restoreFlowFromHistory(item.id);
                              if (restored) {
                                setCurrentFlow(restored);
                                setIsDraft(true);
                                setIsHistoryDrawerOpen(false);
                                setNotification({
                                  type: 'success',
                                  message: `Versão anterior restaurada com sucesso para o rascunho de trabalho.`
                                });
                              }
                            }}
                            className="w-full py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-[#E62382]" />
                            <span>Restaurar Esta Versão</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
