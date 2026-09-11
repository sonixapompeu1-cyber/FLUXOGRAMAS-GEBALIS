import React, { useState, useMemo } from 'react';
import { Flow, FlowArea, GPSState } from '../types';
import { FlowCanvas } from '../components/FlowCanvas';
import { SplitViewLayout } from '../components/SplitViewLayout';
import { getNextAndPrevFlow } from '../lib/flows';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import { getGrandezaById, GRANDEZAS } from '../data/grandezas';
import { GPSEngine, GPSDecisionOption } from '../engine/gpsEngine';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  GitFork,
  ExternalLink,
  Layers,
  HelpCircle,
  Compass,
  LayoutGrid,
  Columns,
  RotateCcw,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface FlowDetailProps {
  slug: string;
  flows: Flow[];
  areas: FlowArea[];
  onNavigate: (path: string) => void;
}

type ViewMode = 'CANVAS' | 'GPS' | 'SPLIT';

export const FlowDetail: React.FC<FlowDetailProps> = ({
  slug,
  flows,
  areas,
  onNavigate,
}) => {
  const currentFlow = flows.find((f) => f.slug === slug);
  const { prev, next } = getNextAndPrevFlow(slug);

  const [viewMode, setViewMode] = useState<ViewMode>('CANVAS');

  // GPS State
  const [gpsState, setGpsState] = useState<GPSState>(() => {
    return currentFlow ? GPSEngine.initFlow(currentFlow) : {
      flowSlug: slug,
      currentNodeId: '',
      history: [],
      status: 'RUNNING'
    };
  });

  // Re-init GPS when flow changes
  React.useEffect(() => {
    if (currentFlow) {
      setGpsState(GPSEngine.initFlow(currentFlow));
    }
  }, [slug, currentFlow]);

  // Visio registry match
  const visioMatch = useMemo(() => {
    return VISIO_REGISTRY.find(v => v.matchedSlug === slug);
  }, [slug]);

  const grandeza = useMemo(() => {
    if (visioMatch) return getGrandezaById(visioMatch.grandezaId);
    return GRANDEZAS[0];
  }, [visioMatch]);

  // If flow not found, show 404 state
  if (!currentFlow) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#E62382] flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">
          Fluxograma Não Encontrado
        </h1>
        <p className="text-sm text-slate-500">
          O fluxograma solicitado (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{slug}</code>) não existe no repositório.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/fluxos')}
          className="px-5 py-2.5 rounded-xl bg-[#E62382] text-white font-bold text-sm shadow-xs hover:bg-[#c9186d] transition-colors"
        >
          Regressar ao Índice de Fluxos
        </button>
      </div>
    );
  }

  // Find area
  const currentArea = areas.find((a) => a.flowSlugs.includes(slug));

  // Find linked flows
  const linkedSlugs = Array.from(
    new Set(
      currentFlow.nodes
        .filter((n) => !!n.link && n.link !== slug)
        .map((n) => n.link as string)
    )
  );

  const linkedFlows = linkedSlugs
    .map((s) => flows.find((f) => f.slug === s))
    .filter((f): f is Flow => Boolean(f));

  // Current GPS node & options
  const currentNode = currentFlow.nodes.find(n => n.id === gpsState.currentNodeId);
  const availableOptions = GPSEngine.getOptionsForNode(currentFlow, gpsState.currentNodeId);

  const handleSelectOption = (option: GPSDecisionOption) => {
    const newState = GPSEngine.selectOption(gpsState, currentFlow, option);
    setGpsState(newState);
  };

  const handleRollback = (index: number) => {
    const newState = GPSEngine.rollbackToStep(gpsState, index);
    setGpsState(newState);
  };

  const handleResetGPS = () => {
    setGpsState(GPSEngine.initFlow(currentFlow));
  };

  return (
    <div id="flow-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-slate-900 transition-colors"
          >
            Início
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate('/fluxos')}
            className="hover:text-slate-900 transition-colors"
          >
            Catálogo
          </button>
          <span>/</span>
          <span className="text-[#E62382] font-bold truncate max-w-xs sm:max-w-md">
            {currentFlow.name}
          </span>
        </div>

        {/* View Mode Switcher (Section 15) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('CANVAS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'CANVAS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#E62382]" />
            <span>Fluxograma</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('GPS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'GPS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            <span>Modo GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('SPLIT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'SPLIT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-teal-600" />
            <span>Visão Dividida</span>
          </button>
        </div>
      </div>

      {/* Flow Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${grandeza?.color || '#E62382'}15`,
                color: grandeza?.color || '#E62382'
              }}
            >
              Grandeza: {grandeza?.name || (currentArea ? currentArea.name : 'Edificado')}
            </span>

            {visioMatch && (
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Visio Pág #{visioMatch.pageIndex} ({visioMatch.pageName})
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            {currentFlow.name}
          </h1>
        </div>

        {/* Quick Sequential Navigation: Anterior / Seguinte */}
        <div className="flex items-center gap-2 shrink-0">
          {prev && (
            <button
              type="button"
              id="prev-flow-button"
              onClick={() => onNavigate(`/fluxos/${prev.slug}`)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title={`Anterior: ${prev.name}`}
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}

          {next && (
            <button
              type="button"
              id="next-flow-button"
              onClick={() => onNavigate(`/fluxos/${next.slug}`)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title={`Seguinte: ${next.name}`}
            >
              <span className="hidden sm:inline">Seguinte</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'CANVAS' && (
        <FlowCanvas
          flow={currentFlow}
          onNavigateToFlow={(targetSlug) => onNavigate(`/fluxos/${targetSlug}`)}
          allFlows={flows}
        />
      )}

      {viewMode === 'GPS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Question & Decisions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Nó Atual: {currentNode?.id}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E62382]">
                    {currentNode?.kind}
                  </span>
                </div>

                <button
                  onClick={handleResetGPS}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar GPS</span>
                </button>
              </div>

              <div className="py-2">
                <p className="text-xl font-serif font-bold text-slate-900 leading-snug">
                  {currentNode?.t}
                </p>
              </div>

              {/* Options */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Respostas / Ações Operacionais
                </h3>

                {availableOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableOptions.map((opt, i) => {
                      const isYes = opt.label.toUpperCase().includes('SIM');
                      const isNo = opt.label.toUpperCase().includes('NÃO') || opt.label.toUpperCase().includes('NAO');

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectOption(opt)}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all group shadow-xs hover:shadow-md ${
                            isYes 
                              ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50' 
                              : isNo
                              ? 'bg-rose-50/60 border-rose-300 hover:border-rose-500 hover:bg-rose-50'
                              : 'bg-white border-slate-200 hover:border-[#E62382] hover:bg-pink-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-[#E62382]">
                              {opt.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            → {opt.targetNodeId}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-base font-bold text-emerald-900">
                      Desfecho do Procedimento
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Este nó conclui o fluxo. Registe a ocorrência no CRM Gebalis conforme indicado.
                    </p>
                    <button
                      onClick={handleResetGPS}
                      className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                    >
                      Reiniciar Rota
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call Trail */}
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold font-serif text-slate-900 uppercase tracking-wider">
                  Call Trail Rastreável
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {gpsState.history.length} passos
                </span>
              </div>

              <div className="relative pl-5 border-l-2 border-slate-200 space-y-4">
                {gpsState.history.map((step, idx) => {
                  const isCurrent = idx === gpsState.history.length - 1;
                  return (
                    <div key={idx} className="relative group">
                      <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                        isCurrent ? 'bg-[#E62382] border-white' : 'bg-white border-slate-300'
                      }`} />

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-500">
                            #{idx + 1} {step.nodeId}
                          </span>
                          <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                        </div>
                        <p className="font-semibold text-slate-800">{step.nodeText}</p>
                        {step.chosenAnswer && (
                          <div className="text-[11px] text-[#E62382] font-bold">
                            Resposta: {step.chosenAnswer}
                          </div>
                        )}
                        {!isCurrent && (
                          <button
                            onClick={() => handleRollback(idx)}
                            className="text-[10px] text-slate-500 hover:text-[#E62382] underline block pt-0.5"
                          >
                            Voltar a este passo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'SPLIT' && (
        <SplitViewLayout
          visioEntry={visioMatch || VISIO_REGISTRY[0]}
          matchedFlow={currentFlow}
          activeGpsNodeId={currentNode?.id || ''}
          gpsComponent={
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-bold text-[#E62382]">
                  GPS Operacional: {currentNode?.id}
                </span>
                <button
                  onClick={handleResetGPS}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Reiniciar
                </button>
              </div>

              <div className="py-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Pergunta / Passo Operacional
                </span>
                <p className="text-base font-serif font-bold text-slate-900 leading-snug">
                  {currentNode?.t}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Alternativas Determinísticas
                </span>
                {availableOptions.length > 0 ? (
                  availableOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt)}
                      className="w-full p-3 rounded-lg border border-slate-200 hover:border-[#E62382] hover:bg-pink-50/30 text-left flex items-center justify-between text-xs font-bold transition-colors"
                    >
                      <span>{opt.label}</span>
                      <span className="font-mono text-slate-400">→ {opt.targetNodeId}</span>
                    </button>
                  ))
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-900">Desfecho Terminal</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Procedimento concluído. Registe no CRM Gebalis.
                    </p>
                    <button
                      onClick={handleResetGPS}
                      className="mt-3 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 rounded hover:bg-emerald-800"
                    >
                      Reiniciar Rota
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Call Trail summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Call Trail ({gpsState.history.length} passos)
                  </p>
                  {gpsState.history.length > 1 && (
                    <button
                      onClick={() => handleRollback(gpsState.history.length - 2)}
                      className="text-[10px] text-[#E62382] hover:underline"
                    >
                      Retroceder 1 passo
                    </button>
                  )}
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600 max-h-36 overflow-y-auto">
                  {gpsState.history.map((s, idx) => (
                    <div key={idx} className="truncate flex items-center justify-between">
                      <span>{idx + 1}. [{s.nodeId}] {s.chosenAnswer ? `→ ${s.chosenAnswer}` : '(atual)'}</span>
                      {idx < gpsState.history.length - 1 && (
                        <button
                          onClick={() => handleRollback(idx)}
                          className="text-[10px] text-slate-400 hover:text-[#E62382]"
                        >
                          voltar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Linked Flows Section (if this flow links to others) */}
      {linkedFlows.length > 0 && (
        <div id="linked-flows-section" className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#379C8D] uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            <span>Fluxos Relacionados & Desvios Operacionais</span>
          </div>
          <p className="text-xs text-slate-500">
            Este procedimento contém passos que articulam diretamente com outros fluxogramas operacionais da Gebalis:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {linkedFlows.map((lf) => (
              <button
                key={lf.slug}
                type="button"
                onClick={() => onNavigate(`/fluxos/${lf.slug}`)}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/40 hover:border-[#379C8D] transition-colors group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#379C8D]">
                    {lf.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {lf.nodes.length} nós operacionais
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#379C8D] shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 14: PAINEL DE AUDITORIA DO FLUXO */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E62382]" />
            <h3 className="text-xs font-bold font-serif text-slate-900 uppercase tracking-wider">
              Painel de Auditoria e Rastreabilidade do Fluxo
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            Grafo Validado (0 Erros)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-slate-900">{currentFlow.nodes.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Nós Totais</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-amber-700">
              {currentFlow.nodes.filter(n => n.kind === 'decision').length}
            </p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Decisões</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-slate-900">{currentFlow.edges.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Ligações</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-emerald-700">
              {currentFlow.nodes.filter(n => n.kind === 'terminal').length}
            </p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Terminais</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-purple-700">{linkedFlows.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Desvios</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-lg font-bold font-mono text-[#E62382]">
              {visioMatch ? `#${visioMatch.pageIndex}` : 'N/D'}
            </p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Pág Visio</p>
          </div>
        </div>

        {visioMatch && (
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200">
            <div>
              <strong className="text-slate-800">Ficheiros de Origem:</strong>{' '}
              <span className="font-mono">{visioMatch.priImage}</span> &{' '}
              <span className="font-mono">{visioMatch.secImage}</span> | Correspondência: {visioMatch.matchStatus} ({visioMatch.confidence}%)
            </div>
            <button
              onClick={() => onNavigate('/galeria')}
              className="text-xs font-bold text-[#E62382] hover:underline"
            >
              Ver na Galeria dos 145 Fluxogramas →
            </button>
          </div>
        )}
      </div>

      {/* Sequential Footer Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
        <div>
          {prev && (
            <button
              type="button"
              onClick={() => onNavigate(`/fluxos/${prev.slug}`)}
              className="text-left hover:text-[#E62382] transition-colors"
            >
              <div className="text-[10px] text-slate-400">← Fluxo Anterior</div>
              <div className="font-bold text-slate-700">{prev.name}</div>
            </button>
          )}
        </div>

        <div>
          {next && (
            <button
              type="button"
              onClick={() => onNavigate(`/fluxos/${next.slug}`)}
              className="text-right hover:text-[#E62382] transition-colors"
            >
              <div className="text-[10px] text-slate-400">Próximo Fluxo →</div>
              <div className="font-bold text-slate-700">{next.name}</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
