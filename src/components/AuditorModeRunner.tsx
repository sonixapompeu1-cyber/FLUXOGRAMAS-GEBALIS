import React, { useState } from 'react';
import { 
  Flow, 
  FlowNode, 
  FlowEdge, 
  ScenarioExecutionResult, 
  ValidationFinding,
  GrandezaId
} from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  Compass, 
  FileText, 
  Layers, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { GRANDEZAS } from '../data/grandezas';

interface AuditorModeRunnerProps {
  flows: Flow[];
  scenarios: ScenarioExecutionResult[];
  findings: ValidationFinding[];
  onOpenFinding?: (finding: ValidationFinding) => void;
}

export const AuditorModeRunner: React.FC<AuditorModeRunnerProps> = ({
  flows,
  scenarios,
  findings,
  onOpenFinding
}) => {
  const [selectedFlowSlug, setSelectedFlowSlug] = useState<string>(flows[0]?.slug || 'triagem-inicial');
  const activeFlow = flows.find(f => f.slug === selectedFlowSlug) || flows[0];

  const flowScenarios = scenarios.filter(s => s.flowSlug === selectedFlowSlug);
  const decisionNodes = activeFlow.nodes.filter(n => n.kind === 'decision');

  // Step-by-step state
  const [currentNodeId, setCurrentNodeId] = useState<string>(activeFlow.nodes[0]?.id || '');
  const [stepHistory, setStepHistory] = useState<{
    nodeId: string;
    nodeText: string;
    chosenOption?: string;
    targetNodeId?: string;
    findingAlert?: ValidationFinding;
  }[]>([{
    nodeId: activeFlow.nodes[0]?.id || '',
    nodeText: activeFlow.nodes[0]?.t || '',
    findingAlert: findings.find(f => f.nodeId === activeFlow.nodes[0]?.id)
  }]);

  const currentNode = activeFlow.nodes.find(n => n.id === currentNodeId) || activeFlow.nodes[0];
  const outgoingEdges = activeFlow.edges.filter(e => e.f === currentNode?.id);
  const isTerminal = currentNode?.kind === 'terminal';

  const handleChooseBranch = (edge: FlowEdge) => {
    const targetNode = activeFlow.nodes.find(n => n.id === edge.t);
    if (!targetNode) return;

    const finding = findings.find(f => f.nodeId === currentNode?.id);
    const newHistory = [
      ...stepHistory,
      {
        nodeId: targetNode.id,
        nodeText: targetNode.t,
        chosenOption: edge.l || 'Seguir',
        targetNodeId: targetNode.id,
        findingAlert: findings.find(f => f.nodeId === targetNode.id)
      }
    ];

    setStepHistory(newHistory);
    setCurrentNodeId(targetNode.id);
  };

  const handleReset = () => {
    const root = activeFlow.nodes[0];
    setCurrentNodeId(root?.id || '');
    setStepHistory([{
      nodeId: root?.id || '',
      nodeText: root?.t || '',
      findingAlert: findings.find(f => f.nodeId === root?.id)
    }]);
  };

  const handleSelectFlowChange = (slug: string) => {
    setSelectedFlowSlug(slug);
    const flow = flows.find(f => f.slug === slug) || flows[0];
    const root = flow.nodes[0];
    setCurrentNodeId(root?.id || '');
    setStepHistory([{
      nodeId: root?.id || '',
      nodeText: root?.t || '',
      findingAlert: findings.find(f => f.nodeId === root?.id)
    }]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8CBD45] text-slate-950">
              MODO AUDITOR OPERACIONAL
            </span>
            <span className="text-xs text-slate-300">
              Rastreio Passo-a-Passo: Visio → Flow → Decisão → Resposta → Destino → GPS
            </span>
          </div>
          <h3 className="text-base font-bold font-serif text-white mt-0.5">
            Inspeção Interativa de Percurso e Conformidade
          </h3>
        </div>

        {/* Flow Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFlowSlug}
            onChange={(e) => handleSelectFlowChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
          >
            {flows.map((f, i) => (
              <option key={f.slug} value={f.slug}>
                {i + 1}. {f.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Reiniciar Percurso"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left: Chain Breadcrumbs & Step Progress */}
        <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cadeia de Evidência Auditada
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Passo {stepHistory.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {stepHistory.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  idx === stepHistory.length - 1
                    ? 'bg-white border-[#E62382] shadow-xs ring-1 ring-[#E62382]/20'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Passo #{idx + 1} · Nó {step.nodeId}
                  </span>
                  {step.chosenOption && (
                    <span className="font-bold text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                      Resposta: {step.chosenOption}
                    </span>
                  )}
                </div>
                <p className="font-medium text-slate-900 leading-snug line-clamp-2">
                  {step.nodeText}
                </p>

                {step.findingAlert && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-1.5 text-[11px] text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Achado de Auditoria:</span> {step.findingAlert.title}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Decision / Action View */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Step Identification */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-white">
                Nó Ativo: {currentNode?.id}
              </span>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Tipo: {currentNode?.kind}
              </span>
              {currentNode?.kind === 'decision' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  Ponto de Decisão
                </span>
              )}
            </div>

            {/* Node Content */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pergunta / Ação Operacional
              </h4>
              <p className="text-base font-semibold text-slate-900 leading-relaxed font-serif">
                {currentNode?.t}
              </p>
            </div>

            {/* Decision Branches / Options */}
            {outgoingEdges.length > 0 ? (
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Alternativas Determinísticas Mapeadas no GPS:
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {outgoingEdges.map((edge, i) => {
                    const target = activeFlow.nodes.find(n => n.id === edge.t);
                    const label = edge.l || `Opção ${i + 1}`;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleChooseBranch(edge)}
                        className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-[#E62382] hover:bg-pink-50/40 transition-all flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-[#E62382] transition-colors">
                            {label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E62382] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          Destino: <strong className="text-slate-700">{target?.id}</strong> — {target?.t}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : isTerminal ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm">Nó Terminal de Conclusão Atingido</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-900">
                  O percurso determinístico atingiu o desfecho formal previsto no procedimento do Contact Center. Registo de conclusão efetuado.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600">
                Sem ramificações adicionais neste nó.
              </div>
            )}

            {/* Associated Findings for this node */}
            {findings.filter(f => f.nodeId === currentNode?.id).length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Achado de Auditoria Registado neste Nó</span>
                  </span>
                  {onOpenFinding && (
                    <button
                      type="button"
                      onClick={() => onOpenFinding(findings.find(f => f.nodeId === currentNode?.id)!)}
                      className="text-xs font-bold text-[#E62382] hover:underline"
                    >
                      Ver Detalhe Completo
                    </button>
                  )}
                </div>
                <p className="text-xs text-amber-950">
                  {findings.find(f => f.nodeId === currentNode?.id)?.title}
                </p>
              </div>
            )}

          </div>

          {/* Step Footer Controls */}
          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Passo a passo auditável em conformidade com o princípio "Não Inventar".</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-700 hover:text-slate-950 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recomeçar do Início</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
