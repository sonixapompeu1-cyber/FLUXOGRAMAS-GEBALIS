import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Flow, FlowNode, FlowEdge, NodeKind } from '../types';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Plus, Trash2, Edit3, 
  ArrowRight, CheckCircle2, Play, HelpCircle as QuestionIcon, 
  Info, Move, X, ExternalLink, Link2
} from 'lucide-react';

interface FlowGraphicEditorProps {
  flow: Flow;
  allFlows: Flow[];
  onChange: (updatedFlow: Flow) => void;
}

export const FlowGraphicEditor: React.FC<FlowGraphicEditorProps> = ({
  flow,
  allFlows,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and pan
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected elements for editing
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  // Auto-fit flow canvas
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 900;
    const containerHeight = containerRef.current.clientHeight || 650;

    const scaleX = (containerWidth - 60) / flow.w;
    const scaleY = (containerHeight - 60) / flow.h;
    const idealScale = Math.min(1.1, Math.max(0.4, Math.min(scaleX, scaleY)));

    const centerX = Math.max(20, (containerWidth - flow.w * idealScale) / 2);
    const centerY = Math.max(20, (containerHeight - flow.h * idealScale) / 2);

    setScale(idealScale);
    setPan({ x: centerX, y: centerY });
  }, [flow.w, flow.h]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Don't drag if clicking directly on a node or button
    if ((e.target as HTMLElement).closest('.interactive-node') || (e.target as HTMLElement).closest('.interactive-edge')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Node Map
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode>();
    flow.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [flow.nodes]);

  // Edge calculations for SVG curves
  const computedEdges = useMemo(() => {
    return flow.edges.map((edge, index) => {
      const fromNode = nodeMap.get(edge.f);
      const toNode = nodeMap.get(edge.t);

      if (!fromNode || !toNode) return null;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;

      let startX: number, startY: number, endX: number, endY: number;

      if (Math.abs(dx) > 180 && dy < 60 && dy > -60) {
        // Horizontal connection
        if (dx > 0) {
          startX = fromNode.x + fromNode.w;
          startY = fromNode.y + fromNode.h / 2;
          endX = toNode.x;
          endY = toNode.y + toNode.h / 2;
        } else {
          startX = fromNode.x;
          startY = fromNode.y + fromNode.h / 2;
          endX = toNode.x + toNode.w;
          endY = toNode.y + toNode.h / 2;
        }
      } else {
        // Vertical connection
        startX = fromNode.x + fromNode.w / 2;
        startY = fromNode.y + fromNode.h;
        endX = toNode.x + toNode.w / 2;
        endY = toNode.y;
      }

      const controlDist = Math.max(30, Math.abs(endY - startY) * 0.5);
      const c1x = startX;
      const c1y = startY + (endY > startY ? controlDist : -controlDist);
      const c2x = endX;
      const c2y = endY - (endY > startY ? controlDist : -controlDist);

      const pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      return {
        index,
        edge,
        fromNode,
        toNode,
        pathData,
        midX,
        midY,
      };
    }).filter(Boolean);
  }, [flow.edges, nodeMap]);

  // Update selected node in FlowModel
  const handleUpdateSelectedNode = (updates: Partial<FlowNode>) => {
    if (!selectedNodeId) return;
    const oldId = selectedNodeId;
    const newId = updates.id ? updates.id.trim() : oldId;

    const updatedNodes = flow.nodes.map(n => {
      if (n.id === oldId) {
        return { ...n, ...updates, id: newId || oldId };
      }
      return n;
    });

    let updatedEdges = flow.edges;
    if (newId && newId !== oldId) {
      updatedEdges = flow.edges.map(e => ({
        ...e,
        f: e.f === oldId ? newId : e.f,
        t: e.t === oldId ? newId : e.t,
      }));
      setSelectedNodeId(newId);
    }

    onChange({ ...flow, nodes: updatedNodes, edges: updatedEdges });
  };

  // Delete selected node
  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    if (!window.confirm(`Tem a certeza que deseja remover o nó '${selectedNodeId}'?`)) return;
    const updatedNodes = flow.nodes.filter(n => n.id !== selectedNodeId);
    const updatedEdges = flow.edges.filter(e => e.f !== selectedNodeId && e.t !== selectedNodeId);
    setSelectedNodeId(null);
    onChange({ ...flow, nodes: updatedNodes, edges: updatedEdges });
  };

  // Add new node in Graphic canvas
  const handleAddNodeGraphic = () => {
    const nextNum = flow.nodes.length + 1;
    const newId = `passo-g-${Date.now().toString().slice(-4)}`;
    const newNode: FlowNode = {
      id: newId,
      t: `Novo nó operacional #${nextNum}`,
      kind: 'process',
      x: Math.round(-pan.x / scale + 250),
      y: Math.round(-pan.y / scale + 200),
      w: 220,
      h: 80,
    };
    onChange({ ...flow, nodes: [...flow.nodes, newNode] });
    setSelectedNodeId(newId);
  };

  // Update selected edge in FlowModel
  const handleUpdateSelectedEdge = (updates: Partial<FlowEdge>) => {
    if (selectedEdgeIndex === null) return;
    const updatedEdges = flow.edges.map((e, idx) => {
      if (idx === selectedEdgeIndex) {
        return { ...e, ...updates };
      }
      return e;
    });
    onChange({ ...flow, edges: updatedEdges });
  };

  // Delete selected edge
  const handleDeleteSelectedEdge = () => {
    if (selectedEdgeIndex === null) return;
    const updatedEdges = flow.edges.filter((_, idx) => idx !== selectedEdgeIndex);
    setSelectedEdgeIndex(null);
    onChange({ ...flow, edges: updatedEdges });
  };

  // Node connection handler
  const handleNodeClick = (nodeId: string) => {
    if (isConnecting) {
      if (connectSourceId && connectSourceId !== nodeId) {
        // Create new edge
        const newEdge: FlowEdge = {
          f: connectSourceId,
          t: nodeId,
          l: 'SIM'
        };
        onChange({ ...flow, edges: [...flow.edges, newEdge] });
        setIsConnecting(false);
        setConnectSourceId(null);
        setSelectedEdgeIndex(flow.edges.length); // select new edge
      }
    } else {
      setSelectedNodeId(nodeId);
      setSelectedEdgeIndex(null);
    }
  };

  const selectedNode = flow.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = selectedEdgeIndex !== null ? flow.edges[selectedEdgeIndex] : null;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Graphic Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddNodeGraphic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#8CBD45]" />
            <span>Adicionar Nó no Gráfico</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isConnecting) {
                if (!selectedNodeId) {
                  alert('Selecione primeiro um nó de origem no gráfico para criar uma ligação.');
                  return;
                }
                setIsConnecting(true);
                setConnectSourceId(selectedNodeId);
              } else {
                setIsConnecting(false);
                setConnectSourceId(null);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-colors ${
              isConnecting 
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-[#E62382]" />
            <span>{isConnecting ? 'Clique no Nó de Destino...' : 'Ligar Nós (Criar Seta)'}</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-mono mr-1">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale(s => Math.max(0.3, Number((s - 0.15).toFixed(2))))}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale(s => Math.min(2.0, Number((s + 0.15).toFixed(2))))}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setScale(1.0); setPan({ x: 40, y: 40 }); }}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
            title="Repor 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={fitToView}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
            title="Ajustar ao Ecrã"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area with Inspector Sidebar */}
      <div className="relative flex flex-col lg:flex-row h-[620px] overflow-hidden bg-slate-900">
        {/* Main Interactive Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 h-full cursor-grab active:cursor-grabbing relative overflow-hidden select-none"
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              width: flow.w,
              height: flow.h,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* SVG Layer for Edges */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={flow.w}
              height={flow.h}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-selected"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#E62382" />
                </marker>
              </defs>

              {computedEdges.map((item) => {
                if (!item) return null;
                const isSelected = selectedEdgeIndex === item.index;

                return (
                  <g key={item.index} className="interactive-edge pointer-events-auto cursor-pointer">
                    {/* Invisible thicker path for easier clicking */}
                    <path
                      d={item.pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeIndex(item.index);
                        setSelectedNodeId(null);
                      }}
                    />
                    {/* Visible path */}
                    <path
                      d={item.pathData}
                      fill="none"
                      stroke={isSelected ? '#E62382' : '#cbd5e1'}
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray={isSelected ? '4 2' : undefined}
                      markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeIndex(item.index);
                        setSelectedNodeId(null);
                      }}
                    />
                    {/* Label pill on edge */}
                    {item.edge.l && (
                      <g
                        transform={`translate(${item.midX}, ${item.midY})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdgeIndex(item.index);
                          setSelectedNodeId(null);
                        }}
                      >
                        <rect
                          x={-24}
                          y={-11}
                          width={48}
                          height={22}
                          rx={5}
                          fill={isSelected ? '#E62382' : '#ffffff'}
                          stroke={isSelected ? '#E62382' : '#cbd5e1'}
                          strokeWidth={1}
                        />
                        <text
                          x={0}
                          y={3}
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : '#1e293b'}
                          fontSize={10}
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {item.edge.l}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {flow.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnectSource = connectSourceId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: node.w,
                    height: node.h,
                  }}
                  className={`interactive-node p-3 rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'ring-3 ring-[#E62382] ring-offset-2 ring-offset-slate-900 bg-white text-slate-900 shadow-2xl z-20'
                      : isConnectSource
                      ? 'ring-3 ring-amber-400 bg-amber-50 text-slate-900 z-20'
                      : node.kind === 'start'
                      ? 'bg-emerald-50 border-2 border-[#8CBD45] text-slate-900'
                      : node.kind === 'decision'
                      ? 'bg-teal-50 border-2 border-[#379C8D] text-slate-900'
                      : node.kind === 'terminal'
                      ? 'bg-rose-50 border-2 border-[#E62382] text-slate-900'
                      : node.kind === 'note'
                      ? 'bg-amber-50 border border-dashed border-amber-400 text-amber-950'
                      : 'bg-white border-2 border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {node.id}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {node.kind}
                    </span>
                  </div>

                  <p className="text-xs font-semibold leading-tight line-clamp-3 text-slate-800">
                    {node.t}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Element Inspector Panel */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto z-10 shrink-0">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    ID: {selectedNode.id}
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-1">
                    Editar Nó Gráfico
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node ID Input — Requisito 6 */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Identificador (ID do Nó)
                </label>
                <input
                  type="text"
                  value={selectedNode.id}
                  onChange={(e) => handleUpdateSelectedNode({ id: e.target.value })}
                  className="w-full p-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E62382] outline-none text-slate-900 bg-slate-50"
                  placeholder="ID do nó..."
                />
              </div>

              {/* Node Text Input — Requisito 17 (Confirmar documentação -> atualiza versão textual) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Texto do Nó (Pergunta ou Ação)
                </label>
                <textarea
                  value={selectedNode.t}
                  onChange={(e) => handleUpdateSelectedNode({ t: e.target.value })}
                  rows={3}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E62382] outline-none text-slate-900"
                  placeholder="Introduza o texto descritivo..."
                />
                <p className="text-[10px] text-slate-400 italic">
                  A alteração deste texto atualiza automaticamente a Versão Textual.
                </p>
              </div>

              {/* Node Kind */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Tipo de Nó
                </label>
                <select
                  value={selectedNode.kind}
                  onChange={(e) => handleUpdateSelectedNode({ kind: e.target.value as NodeKind })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="start">Início de Atendimento</option>
                  <option value="process">Ação / Processo</option>
                  <option value="decision">Ponto de Decisão (Pergunta)</option>
                  <option value="terminal">Desfecho / Terminal</option>
                  <option value="note">Nota Operacional</option>
                </select>
              </div>

              {/* Cross-flow */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Cross-flow Link (Opcional)
                </label>
                <select
                  value={selectedNode.link || ''}
                  onChange={(e) => handleUpdateSelectedNode({ link: e.target.value || undefined })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Nenhum</option>
                  {allFlows.filter(f => f.slug !== flow.slug).map(f => (
                    <option key={f.slug} value={f.slug}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Delete Node */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteSelectedNode}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Nó Gráfico</span>
                </button>
              </div>
            </div>
          ) : selectedEdge ? (
            /* Selected Edge Inspector — Requisito 18 */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Editar Seta / Ligação
                </h4>
                <button
                  onClick={() => setSelectedEdgeIndex(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Etiqueta da Condição (SIM / NÃO / Outro)
                </label>
                <input
                  type="text"
                  value={selectedEdge.l || ''}
                  onChange={(e) => handleUpdateSelectedEdge({ l: e.target.value })}
                  placeholder="Ex: SIM, NÃO, Herdeiro"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E62382] outline-none"
                />
              </div>

              {/* Alterar Origem */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Nó de Origem
                </label>
                <select
                  value={selectedEdge.f}
                  onChange={(e) => handleUpdateSelectedEdge({ f: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {flow.nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      ({n.id}) {n.t.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Alterar Destino */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Nó de Destino
                </label>
                <select
                  value={selectedEdge.t}
                  onChange={(e) => handleUpdateSelectedEdge({ t: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {flow.nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      ({n.id}) {n.t.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteSelectedEdge}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Seta</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-3 text-slate-400">
              <Move className="w-8 h-8 mx-auto opacity-50 text-slate-300" />
              <p className="text-xs">
                Selecione qualquer nó ou seta no gráfico para editar o seu texto, propriedades ou destinos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
