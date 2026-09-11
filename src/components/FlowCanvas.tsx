import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Flow, FlowNode, NodeKind } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ExternalLink,
  Search,
  Eye,
  FileText,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle as QuestionIcon,
  Move,
  Info,
} from 'lucide-react';

interface FlowCanvasProps {
  flow: Flow;
  onNavigateToFlow: (slug: string) => void;
  allFlows?: Flow[];
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flow,
  onNavigateToFlow,
  allFlows = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and pan transform state
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mode: Graphic canvas vs Textual/Accessible view
  const [viewMode, setViewMode] = useState<'canvas' | 'textual'>('canvas');

  // Search/highlight inside this flow
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Auto-fit flow canvas on load or flow change
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 900;
    const containerHeight = containerRef.current.clientHeight || 650;

    const scaleX = (containerWidth - 60) / flow.w;
    const scaleY = (containerHeight - 60) / flow.h;
    const idealScale = Math.min(1.1, Math.max(0.45, Math.min(scaleX, scaleY)));

    // Center the flow
    const centerX = Math.max(20, (containerWidth - flow.w * idealScale) / 2);
    const centerY = Math.max(20, (containerHeight - flow.h * idealScale) / 2);

    setScale(idealScale);
    setPan({ x: centerX, y: centerY });
  }, [flow.w, flow.h]);

  useEffect(() => {
    fitToView();
    setSelectedNodeId(null);
    setSearchQuery('');
  }, [flow.slug, fitToView]);

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(2.0, Number((s + 0.15).toFixed(2))));
  const handleZoomOut = () => setScale((s) => Math.max(0.3, Number((s - 0.15).toFixed(2))));
  const handleZoomReset = () => {
    setScale(1.0);
    setPan({ x: 40, y: 40 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if left click on canvas background
    if (e.button !== 0) return;
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(2.0, Math.max(0.3, Number((s + zoomFactor).toFixed(2)))));
    } else {
      // Allow panning with trackpad scroll
      setPan((p) => ({
        x: p.x - e.deltaX * 0.8,
        y: p.y - e.deltaY * 0.8,
      }));
    }
  };

  // Lookup map for fast node retrieval
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode>();
    for (const node of flow.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [flow.nodes]);

  // Highlight matches
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const query = searchQuery.toLowerCase();
    const ids = new Set<string>();
    for (const node of flow.nodes) {
      if (node.t.toLowerCase().includes(query) || node.id.toLowerCase().includes(query)) {
        ids.add(node.id);
      }
    }
    return ids;
  }, [flow.nodes, searchQuery]);

  // Compute curved SVG path between two nodes
  const edgePaths = useMemo(() => {
    return flow.edges.map((edge, index) => {
      const fromNode = nodeMap.get(edge.f);
      const toNode = nodeMap.get(edge.t);

      if (!fromNode || !toNode) {
        return null;
      }

      // Check spatial relationship
      const dx = toNode.x + toNode.w / 2 - (fromNode.x + fromNode.w / 2);
      const dy = toNode.y - (fromNode.y + fromNode.h);

      let startX: number, startY: number, endX: number, endY: number;
      let pathData = '';
      let midX = 0;
      let midY = 0;

      if (Math.abs(dx) > 200 && dy < 50 && dy > -80) {
        // Horizontal connection (Side-to-Side)
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
        const delta = Math.abs(endX - startX) / 2;
        const c1x = startX + (dx > 0 ? delta : -delta);
        const c1y = startY;
        const c2x = endX - (dx > 0 ? delta : -delta);
        const c2y = endY;
        pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        midX = (startX + endX) / 2;
        midY = (startY + endY) / 2;
      } else {
        // Vertical connection (Bottom to Top)
        startX = fromNode.x + fromNode.w / 2;
        startY = fromNode.y + fromNode.h;
        endX = toNode.x + toNode.w / 2;
        endY = toNode.y;

        const controlDist = Math.max(30, Math.abs(endY - startY) * 0.5);
        const c1x = startX;
        const c1y = startY + controlDist;
        const c2x = endX;
        const c2y = endY - controlDist;

        pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        midX = (startX + endX) / 2;
        midY = (startY + endY) / 2;
      }

      return {
        id: `edge-${edge.f}-${edge.t}-${index}`,
        fromId: edge.f,
        toId: edge.t,
        label: edge.l,
        pathData,
        midX,
        midY,
      };
    });
  }, [flow.edges, nodeMap]);

  // Helper for node styling based on kind
  const getNodeStyle = (kind: NodeKind, isHighlighted: boolean, isSelected: boolean) => {
    let base = 'transition-all duration-200 cursor-pointer ';
    if (isSelected) {
      base += 'ring-3 ring-[#E62382] ring-offset-2 shadow-lg ';
    } else if (isHighlighted) {
      base += 'ring-3 ring-[#379C8D] ring-offset-2 shadow-md ';
    }

    switch (kind) {
      case 'start':
        return `${base} bg-emerald-50 border-2 border-[#8CBD45] text-slate-900 rounded-full shadow-xs hover:border-emerald-600`;
      case 'decision':
        return `${base} bg-teal-50/90 border-2 border-[#379C8D] text-slate-900 rounded-xl shadow-xs hover:border-teal-700`;
      case 'terminal':
        return `${base} bg-rose-50 border-2 border-[#E62382] text-slate-900 rounded-xl shadow-xs hover:border-pink-700`;
      case 'note':
        return `${base} bg-amber-50/90 border border-dashed border-amber-400 text-amber-950 rounded-lg shadow-2xs hover:bg-amber-100/90`;
      case 'process':
      default:
        return `${base} bg-white border-2 border-slate-300 text-slate-900 rounded-xl shadow-xs hover:border-slate-400`;
    }
  };

  // Helper to render icon for node kind
  const renderNodeKindIcon = (kind: NodeKind) => {
    switch (kind) {
      case 'start':
        return <Play className="w-3.5 h-3.5 text-[#8CBD45] fill-[#8CBD45] shrink-0" />;
      case 'decision':
        return <QuestionIcon className="w-3.5 h-3.5 text-[#379C8D] shrink-0" />;
      case 'terminal':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#E62382] shrink-0" />;
      case 'note':
        return <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div id="flow-canvas-container" className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Canvas Toolbar */}
      <div
        id="flow-canvas-toolbar"
        className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            id="view-mode-canvas-button"
            onClick={() => setViewMode('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'canvas'
                ? 'bg-[#181717] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Gráfica</span>
          </button>
          <button
            type="button"
            id="view-mode-textual-button"
            onClick={() => setViewMode('textual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'textual'
                ? 'bg-[#181717] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Versão Textual / Acessível</span>
          </button>
        </div>

        {/* In-canvas Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="flow-canvas-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar passos no fluxo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E62382] placeholder:text-slate-400"
          />
          {searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {matchingNodeIds.size} {matchingNodeIds.size === 1 ? 'passo' : 'passos'}
            </span>
          )}
        </div>

        {/* Zoom & Canvas Actions */}
        {viewMode === 'canvas' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              id="zoom-out-button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-[#E62382]"
              title="Diminuir Zoom"
              aria-label="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="zoom-in-button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-[#E62382]"
              title="Aumentar Zoom"
              aria-label="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="zoom-reset-button"
              onClick={handleZoomReset}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-[#E62382]"
              title="Repor 100%"
              aria-label="Repor Escala Normal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="zoom-fit-button"
              onClick={fitToView}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-[#E62382]"
              title="Ajustar ao Ecrã"
              aria-label="Ajustar ao Ecrã"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main View Area */}
      {viewMode === 'canvas' ? (
        <div
          ref={containerRef}
          id="flow-canvas-viewport"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`relative w-full h-[680px] bg-[#F8FAFC] overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Pan Navigation helper badge */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs text-xs text-slate-500 flex items-center gap-2 pointer-events-none">
            <Move className="w-3.5 h-3.5 text-slate-400" />
            <span>Arraste para navegar · Rodinha para Zoom</span>
          </div>

          {/* Interactive Flow Canvas */}
          <div
            id="flow-canvas-stage"
            className="absolute transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              width: `${flow.w}px`,
              height: `${flow.h}px`,
            }}
          >
            {/* SVG Layer: Edges and Arrows */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Regular directional arrow */}
                <marker
                  id="flow-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                {/* Active arrow */}
                <marker
                  id="flow-arrow-active"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#E62382" />
                </marker>
              </defs>

              {edgePaths.map((edge) => {
                if (!edge) return null;
                const isEdgeHighlighted =
                  selectedNodeId === edge.fromId || selectedNodeId === edge.toId;

                return (
                  <g key={edge.id} className="transition-all">
                    {/* Path Shadow / Backing for contrast */}
                    <path
                      d={edge.pathData}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Edge line */}
                    <path
                      d={edge.pathData}
                      fill="none"
                      stroke={isEdgeHighlighted ? '#E62382' : '#64748b'}
                      strokeWidth={isEdgeHighlighted ? '3' : '2'}
                      strokeLinecap="round"
                      markerEnd={
                        isEdgeHighlighted
                          ? 'url(#flow-arrow-active)'
                          : 'url(#flow-arrow)'
                      }
                    />

                    {/* Edge Label (e.g. Sim, Não, Condição) */}
                    {edge.label && (
                      <g
                        transform={`translate(${edge.midX}, ${edge.midY})`}
                        className="pointer-events-auto cursor-default"
                      >
                        <rect
                          x={-(edge.label.length * 4.2 + 10)}
                          y="-11"
                          width={edge.label.length * 8.4 + 20}
                          height="22"
                          rx="11"
                          fill="#FFFFFF"
                          stroke={isEdgeHighlighted ? '#E62382' : '#cbd5e1'}
                          strokeWidth="1.5"
                          className="shadow-xs"
                        />
                        <text
                          y="3"
                          textAnchor="middle"
                          className={`text-[11px] font-bold ${
                            isEdgeHighlighted ? 'fill-[#E62382]' : 'fill-slate-700'
                          }`}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* HTML Nodes Layer */}
            {flow.nodes.map((node) => {
              const isHighlighted = matchingNodeIds.has(node.id);
              const isSelected = selectedNodeId === node.id;
              const hasLink = !!node.link;

              return (
                <div
                  key={node.id}
                  id={`flow-node-${node.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                  }}
                  className={`absolute flex flex-col justify-center p-3 text-center ${getNodeStyle(
                    node.kind,
                    isHighlighted,
                    isSelected
                  )}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.w}px`,
                    minHeight: `${node.h}px`,
                  }}
                >
                  {/* Top node badge header */}
                  <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      {renderNodeKindIcon(node.kind)}
                      <span className="font-mono text-slate-400">#{node.id}</span>
                    </span>
                    {hasLink && (
                      <span className="inline-flex items-center gap-1 text-[#E62382] font-semibold text-[10px] bg-pink-100/70 px-1.5 py-0.5 rounded">
                        <span>Fluxo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Main Node Content */}
                  <p className="text-xs font-semibold leading-relaxed text-slate-800 line-clamp-3">
                    {node.t}
                  </p>

                  {/* If node links to another flow: Clickable Action Button */}
                  {hasLink && (
                    <button
                      type="button"
                      id={`node-link-button-${node.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (node.link) onNavigateToFlow(node.link);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-bold text-white bg-[#E62382] hover:bg-[#c9186d] active:scale-98 rounded-md shadow-xs transition-all"
                      title={`Abrir fluxo: ${node.link}`}
                    >
                      <span>Abrir Fluxo Relacionado</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Textual & Highly Accessible View */
        <div id="flow-textual-version" className="p-6 bg-white space-y-6 max-h-[680px] overflow-y-auto">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Estrutura Sequencial do Fluxo: {flow.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Esta visualização apresenta todos os passos, condições e decisões do fluxograma em formato textual ordenado para operadores e tecnologias de apoio.
            </p>
          </div>

          <div className="space-y-4">
            {flow.nodes.map((node, index) => {
              const outgoingEdges = flow.edges.filter((e) => e.f === node.id);
              const targetFlow = node.link ? allFlows.find((f) => f.slug === node.link) : null;

              return (
                <div
                  key={node.id}
                  id={`textual-step-${node.id}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#181717] text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {node.kind === 'start' && 'Início de Atendimento'}
                        {node.kind === 'process' && 'Ação / Processo'}
                        {node.kind === 'decision' && 'Ponto de Decisão / Condição'}
                        {node.kind === 'terminal' && 'Desfecho / Encaminhamento Final'}
                        {node.kind === 'note' && 'Nota Operacional ao Agente'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {node.id}</span>
                    </div>

                    {node.link && (
                      <button
                        type="button"
                        onClick={() => node.link && onNavigateToFlow(node.link)}
                        className="flex items-center gap-1 text-xs font-bold text-[#E62382] bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <span>Ver Fluxo: {targetFlow ? targetFlow.name : node.link}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-800 pl-8">
                    {node.t}
                  </p>

                  {/* Outgoing Paths */}
                  {outgoingEdges.length > 0 && (
                    <div className="mt-3 pl-8 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Próximo(s) Passo(s):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {outgoingEdges.map((edge, eIdx) => {
                          const targetNode = nodeMap.get(edge.t);
                          return (
                            <div
                              key={eIdx}
                              className="text-xs bg-white border border-slate-200 rounded-lg p-2 flex items-start gap-2"
                            >
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                                {edge.l || 'Seguir'}
                              </span>
                              <span className="text-slate-700 font-medium">
                                <strong className="font-semibold text-slate-900">Passo #{edge.t}:</strong>{' '}
                                {targetNode ? targetNode.t : `Nó ${edge.t}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Canvas Summary Footer */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>
            Total de Nós: <strong className="text-slate-800">{flow.nodes.length}</strong>
          </span>
          <span>
            Ligações Operacionais: <strong className="text-slate-800">{flow.edges.length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-[#8CBD45]" />
            Início
          </span>
          <span className="inline-flex items-center gap-1.5 text-teal-700">
            <span className="w-2 h-2 rounded-full bg-[#379C8D]" />
            Decisão
          </span>
          <span className="inline-flex items-center gap-1.5 text-pink-700">
            <span className="w-2 h-2 rounded-full bg-[#E62382]" />
            Conclusão
          </span>
        </div>
      </div>
    </div>
  );
};
