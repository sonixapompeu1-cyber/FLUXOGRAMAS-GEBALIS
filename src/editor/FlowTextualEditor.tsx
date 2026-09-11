import React from 'react';
import { Flow, FlowNode, FlowEdge, NodeKind } from '../types';
import { 
  Plus, Trash2, ArrowRight, CornerDownRight, CheckCircle2, 
  HelpCircle, Play, Info, ExternalLink, GitBranch, AlertCircle 
} from 'lucide-react';

interface FlowTextualEditorProps {
  flow: Flow;
  allFlows: Flow[];
  onChange: (updatedFlow: Flow) => void;
}

export const FlowTextualEditor: React.FC<FlowTextualEditorProps> = ({
  flow,
  allFlows,
  onChange,
}) => {
  // Alterar texto ou propriedade de um nó
  const handleUpdateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    const updatedNodes = flow.nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, ...updates };
      }
      return n;
    });
    onChange({ ...flow, nodes: updatedNodes });
  };

  // Renomear ID de nó com propagação em cascata de ligações (Requisito 6)
  const handleRenameNodeId = (oldId: string, newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed || trimmed === oldId) return;
    const updatedNodes = flow.nodes.map(n => (n.id === oldId ? { ...n, id: trimmed } : n));
    const updatedEdges = flow.edges.map(e => ({
      ...e,
      f: e.f === oldId ? trimmed : e.f,
      t: e.t === oldId ? trimmed : e.t
    }));
    onChange({ ...flow, nodes: updatedNodes, edges: updatedEdges });
  };

  // Adicionar novo passo/nó
  const handleAddNode = () => {
    const nextIndex = flow.nodes.length + 1;
    const newId = `passo-${Date.now().toString().slice(-4)}`;
    const newNode: FlowNode = {
      id: newId,
      t: `Novo passo operacional #${nextIndex}`,
      kind: 'process',
      x: 350,
      y: (flow.nodes[flow.nodes.length - 1]?.y || 100) + 120,
      w: 220,
      h: 80
    };
    const updatedNodes = [...flow.nodes, newNode];
    onChange({ ...flow, nodes: updatedNodes });
  };

  // Remover nó e suas conexões
  const handleDeleteNode = (nodeId: string) => {
    if (!window.confirm(`Tem a certeza que deseja remover o nó '${nodeId}' e todas as suas ligações?`)) {
      return;
    }
    const updatedNodes = flow.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = flow.edges.filter(e => e.f !== nodeId && e.t !== nodeId);
    onChange({ ...flow, nodes: updatedNodes, edges: updatedEdges });
  };

  // Atualizar ligação existente
  const handleUpdateEdge = (edgeIndex: number, updates: Partial<FlowEdge>) => {
    const updatedEdges = flow.edges.map((e, idx) => {
      if (idx === edgeIndex) {
        return { ...e, ...updates };
      }
      return e;
    });
    onChange({ ...flow, edges: updatedEdges });
  };

  // Adicionar ligação a partir de um nó
  const handleAddOutgoingEdge = (fromNodeId: string) => {
    const targetCandidates = flow.nodes.filter(n => n.id !== fromNodeId);
    const defaultTarget = targetCandidates[0]?.id || fromNodeId;
    const newEdge: FlowEdge = {
      f: fromNodeId,
      t: defaultTarget,
      l: 'SIM'
    };
    onChange({ ...flow, edges: [...flow.edges, newEdge] });
  };

  // Remover ligação
  const handleDeleteEdge = (edgeIndex: number) => {
    const updatedEdges = flow.edges.filter((_, idx) => idx !== edgeIndex);
    onChange({ ...flow, edges: updatedEdges });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Versão Textual Editável — Estrutura de Passos e Decisões
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Qualquer alteração em perguntas, condições ou destinos de setas atualiza o <strong className="text-[#E62382]">Flow Model</strong> e reflete instantaneamente na Vista Gráfica.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNode}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#8CBD45]" />
          <span>Adicionar Passo</span>
        </button>
      </div>

      <div className="space-y-4">
        {flow.nodes.map((node, index) => {
          const outgoingEdgesWithIndex = flow.edges
            .map((edge, idx) => ({ edge, idx }))
            .filter(({ edge }) => edge.f === node.id);

          return (
            <div
              key={node.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300"
            >
              {/* Header do Passo */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400">ID:</span>
                      <input
                        type="text"
                        value={node.id}
                        onChange={(e) => handleRenameNodeId(node.id, e.target.value)}
                        className="text-xs font-mono font-bold text-slate-800 bg-transparent outline-none w-24 focus:bg-white focus:px-1 rounded"
                        title="Identificador único do nó (editável)"
                      />
                    </div>
                    <select
                      value={node.kind}
                      onChange={(e) => handleUpdateNode(node.id, { kind: e.target.value as NodeKind })}
                      className="text-xs font-bold px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:ring-1 focus:ring-[#E62382] outline-none"
                    >
                      <option value="start">Início de Atendimento</option>
                      <option value="process">Ação / Processo</option>
                      <option value="decision">Ponto de Decisão (Pergunta)</option>
                      <option value="terminal">Desfecho / Terminal</option>
                      <option value="note">Nota Operacional</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remover este nó"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Texto / Pergunta do Passo */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {node.kind === 'decision' ? 'Pergunta / Condição de Triagem' : 'Descrição da Ação / Instrução ao Operador'}
                </label>
                <textarea
                  value={node.t}
                  onChange={(e) => handleUpdateNode(node.id, { t: e.target.value })}
                  rows={2}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#E62382] focus:border-[#E62382] outline-none transition-all text-slate-900"
                  placeholder="Introduza o texto descritivo deste passo..."
                />
              </div>

              {/* Cross-flow link */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-[#E62382]" />
                  Encaminhamento Cross-flow (Opcional):
                </span>
                <select
                  value={node.link || ''}
                  onChange={(e) => handleUpdateNode(node.id, { link: e.target.value || undefined })}
                  className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-[#E62382] outline-none max-w-xs"
                >
                  <option value="">Nenhum (continua neste fluxo)</option>
                  {allFlows.filter(f => f.slug !== flow.slug).map(f => (
                    <option key={f.slug} value={f.slug}>
                      {f.name} ({f.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conexões e Saídas (Setas gráficas) */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Saídas e Conexões do Passo ({outgoingEdgesWithIndex.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddOutgoingEdge(node.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E62382] hover:text-[#c9186d] bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Saída / Seta</span>
                  </button>
                </div>

                {outgoingEdgesWithIndex.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg">
                    {node.kind === 'terminal' 
                      ? 'Desfecho final do fluxo (sem passos seguintes).' 
                      : 'Nenhuma ligação configurada a partir deste passo. Adicione uma saída para ligar a outro nó.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {outgoingEdgesWithIndex.map(({ edge, idx }) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Rótulo da Condição (ex: SIM / NÃO / Outro) */}
                          <div className="w-24 shrink-0">
                            <input
                              type="text"
                              value={edge.l || ''}
                              onChange={(e) => handleUpdateEdge(idx, { l: e.target.value })}
                              placeholder="Rótulo (SIM/NÃO)"
                              className="w-full px-2 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded text-center focus:ring-1 focus:ring-[#E62382] outline-none"
                            />
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                          {/* Seleção do Destino */}
                          <select
                            value={edge.t}
                            onChange={(e) => handleUpdateEdge(idx, { t: e.target.value })}
                            className="w-full px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-[#E62382] outline-none text-slate-800 truncate"
                          >
                            {flow.nodes.map((targetCandidate, targetIdx) => (
                              <option key={targetCandidate.id} value={targetCandidate.id}>
                                #{targetIdx + 1} ({targetCandidate.id}): {targetCandidate.t.substring(0, 32)}...
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteEdge(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                          title="Remover ligação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
