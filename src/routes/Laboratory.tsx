import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, Play, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, 
  AlertTriangle, Terminal, Code2, Compass, GitCommit, ChevronRight
} from 'lucide-react';
import { Flow, FlowNode, GPSState, GPSPathStep } from '../types';
import { GPSEngine, GPSDecisionOption } from '../engine/gpsEngine';

interface LaboratoryProps {
  flows: Flow[];
  onNavigate: (route: string) => void;
}

export const Laboratory: React.FC<LaboratoryProps> = ({ flows, onNavigate }) => {
  const [selectedFlowSlug, setSelectedFlowSlug] = useState<string>(flows[0]?.slug || '');
  
  const currentFlow = useMemo(() => {
    return flows.find(f => f.slug === selectedFlowSlug) || flows[0];
  }, [flows, selectedFlowSlug]);

  const [gpsState, setGpsState] = useState<GPSState>(() => {
    return GPSEngine.initFlow(flows[0]);
  });

  // When selected flow changes, reinit GPS
  const handleSelectFlow = (slug: string) => {
    setSelectedFlowSlug(slug);
    const flow = flows.find(f => f.slug === slug);
    if (flow) {
      setGpsState(GPSEngine.initFlow(flow));
    }
  };

  const currentNode = useMemo<FlowNode | undefined>(() => {
    return currentFlow?.nodes.find(n => n.id === gpsState.currentNodeId);
  }, [currentFlow, gpsState.currentNodeId]);

  const availableOptions = useMemo<GPSDecisionOption[]>(() => {
    if (!currentFlow) return [];
    return GPSEngine.getOptionsForNode(currentFlow, gpsState.currentNodeId);
  }, [currentFlow, gpsState.currentNodeId]);

  const handleSelectOption = (option: GPSDecisionOption) => {
    if (!currentFlow) return;
    const newState = GPSEngine.selectOption(gpsState, currentFlow, option);
    setGpsState(newState);
  };

  const handleRollback = (index: number) => {
    const newState = GPSEngine.rollbackToStep(gpsState, index);
    setGpsState(newState);
  };

  const handleReset = () => {
    if (currentFlow) {
      setGpsState(GPSEngine.initFlow(currentFlow));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                Ambiente de Simulação Determinística
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Requisito 22: Laboratório do GPS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">
              Laboratório de Teste do GPS
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Inspecione o estado interno do motor determinístico, teste cada nó, avalie bifurcações de decisão 
              e simule a Call Trail sem qualquer intermediação de IA generativa.
            </p>
          </div>

          {/* Flow selector dropdown */}
          <div className="shrink-0 w-full md:w-72">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Selecionar Fluxo para Simulação
            </label>
            <select
              value={selectedFlowSlug}
              onChange={(e) => handleSelectFlow(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-[#E62382]"
            >
              {flows.map(f => (
                <option key={f.slug} value={f.slug}>
                  {f.name} ({f.nodes.length} nós)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Node & Decision Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Node Display Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                  ID
                </span>
                <div>
                  <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Nó Atual em Execução
                  </h2>
                  <p className="text-base font-mono font-bold text-slate-900">
                    {currentNode?.id || 'Nenhum'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentNode?.kind === 'decision' ? 'bg-amber-100 text-amber-800' :
                  currentNode?.kind === 'terminal' ? 'bg-emerald-100 text-emerald-800' :
                  currentNode?.kind === 'start' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentNode?.kind || 'Desconhecido'}
                </span>

                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Reiniciar Simulação"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt Statement */}
            <div className="py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Instrução / Pergunta Operacional
              </span>
              <p className="text-lg font-serif font-bold text-slate-900 leading-snug">
                {currentNode?.t || 'Fim do Percurso'}
              </p>
            </div>

            {/* Target Link or Terminal info */}
            {currentNode?.link && (
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#E62382]">Encaminhamento Inter-Fluxo:</p>
                  <p className="text-slate-600">Este nó conecta diretamente ao fluxo <span className="font-mono font-bold">{currentNode.link}</span>.</p>
                </div>
                <button
                  onClick={() => onNavigate(`/flows/${currentNode.link}`)}
                  className="px-3 py-1.5 bg-[#E62382] text-white font-bold rounded shadow-xs hover:bg-[#c21869]"
                >
                  Abrir Destino
                </button>
              </div>
            )}

            {/* Branching Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Decisões Operacionais Disponíveis
              </h2>

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
                            ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50' 
                            : isNo
                            ? 'bg-rose-50/50 border-rose-300 hover:border-rose-500 hover:bg-rose-50'
                            : 'bg-white border-slate-200 hover:border-[#E62382] hover:bg-pink-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isYes ? 'bg-emerald-200 text-emerald-900' :
                            isNo ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {opt.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          Destino: {opt.targetNodeId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-900">
                    Desfecho Operacional Atingido
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Não existem mais bifurcações ativas para este nó. Procedimento registado com sucesso no CRM.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-3 px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                  >
                    Recomeçar Percurso
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Call Trail (Section 21) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold font-serif text-slate-900">
                  Call Trail Operacional
                </h2>
                <p className="text-xs text-slate-500">
                  Histórico do percurso percorrido. Clique num nó anterior para retroceder e recalcular caminhos.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {gpsState.history.length} passos
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
              {gpsState.history.map((step, idx) => {
                const isCurrent = idx === gpsState.history.length - 1;

                return (
                  <div key={idx} className="relative group">
                    {/* Step marker dot */}
                    <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-[#E62382] border-white shadow-xs'
                        : 'bg-white border-slate-300 group-hover:border-[#E62382]'
                    }`} />

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            #{idx + 1} [{step.nodeId}]
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {step.nodeKind}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {step.timestamp}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 mt-1">
                        {step.nodeText}
                      </p>

                      {step.chosenAnswer && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-100 text-[#E62382]">
                            Resposta: {step.chosenAnswer}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            → {step.targetNodeId}
                          </span>
                        </div>
                      )}

                      {!isCurrent && (
                        <button
                          onClick={() => handleRollback(idx)}
                          className="mt-2 text-[10px] font-bold text-slate-600 hover:text-[#E62382] underline underline-offset-2 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retroceder até este passo & recalcular</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Technical Inspector Panel */}
        <div className="space-y-6">
          {/* Node Inspector */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-[#E62382]" />
              <span>Inspector JSON do Nó</span>
            </div>

            <div className="font-mono text-xs text-slate-300 space-y-2 overflow-x-auto max-h-80">
              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] leading-relaxed text-pink-300">
                {JSON.stringify(currentNode, null, 2)}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <p><strong className="text-white">Arestas de Saída:</strong> {availableOptions.length}</p>
              <p><strong className="text-white">Estado do Motor:</strong> {gpsState.status}</p>
            </div>
          </div>

          {/* Quick Flow Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs space-y-3">
            <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500" />
              <span>Metadados do Grafo</span>
            </h2>

            <div className="space-y-1.5 text-slate-600">
              <p><strong className="text-slate-800">Nome:</strong> {currentFlow.name}</p>
              <p><strong className="text-slate-800">Slug:</strong> <code className="font-mono">{currentFlow.slug}</code></p>
              <p><strong className="text-slate-800">Nós:</strong> {currentFlow.nodes.length}</p>
              <p><strong className="text-slate-800">Arestas:</strong> {currentFlow.edges.length}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate(`/flows/${currentFlow.slug}`)}
                className="w-full py-2 bg-slate-900 hover:bg-[#E62382] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Abrir no Visualizador Geral</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
