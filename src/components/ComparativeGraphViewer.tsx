import React, { useState } from 'react';
import { Flow, FlowNode, FlowEdge, ValidationFinding } from '../types';
import { 
  Layers, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Eye, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ComparativeGraphViewerProps {
  flow: Flow;
  visioPageNumber?: number;
  visioPageName?: string;
  findings: ValidationFinding[];
  onSelectFinding?: (finding: ValidationFinding) => void;
}

export const ComparativeGraphViewer: React.FC<ComparativeGraphViewerProps> = ({
  flow,
  visioPageNumber = 1,
  visioPageName = 'Visio',
  findings,
  onSelectFinding
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(flow.nodes[0]?.id || '');
  const [showOriginalImage, setShowOriginalImage] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  const selectedNode = flow.nodes.find(n => n.id === selectedNodeId);
  const nodeFindings = findings.filter(f => f.nodeId === selectedNodeId);

  const decisionNodes = flow.nodes.filter(n => n.kind === 'decision');
  const terminalNodes = flow.nodes.filter(n => n.kind === 'terminal');

  // SVG dimensions
  const svgWidth = Math.max(flow.w || 900, 850);
  const svgHeight = Math.max(flow.h || 700, 600);

  const getNodeColor = (node: FlowNode) => {
    const hasFinding = findings.some(f => f.nodeId === node.id);
    if (hasFinding) {
      return {
        bg: '#FEF3C7', // Amber-100
        border: '#D97706', // Amber-600
        text: '#92400E'
      };
    }
    switch (node.kind) {
      case 'start':
        return { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A' };
      case 'decision':
        return { bg: '#FDF4FF', border: '#C026D3', text: '#701A75' };
      case 'terminal':
        return { bg: '#ECFDF5', border: '#10B981', text: '#064E3B' };
      default:
        return { bg: '#F8FAFC', border: '#94A3B8', text: '#1E293B' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E62382] text-white">
              V6 Grafo Comparativo
            </span>
            <span className="text-xs text-slate-300">
              Prancha #{visioPageNumber} ({visioPageName}) ↔ {flow.slug}
            </span>
          </div>
          <h3 className="text-base font-bold font-serif text-white mt-0.5">
            Grafo Documental Original vs Execução Determinística GPS
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOriginalImage(!showOriginalImage)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              showOriginalImage 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOriginalImage ? 'Ocultar Prancha Visio' : 'Exibir Prancha Visio'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Side: Documento Original (Visio) */}
        <div className={`${showOriginalImage ? 'lg:col-span-5' : 'lg:col-span-4'} p-4 bg-slate-50 flex flex-col`}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Prancha Original (Visio)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
              ORIGINAL — NÃO ALTERADO
            </span>
          </div>

          {/* Original View */}
          <div className="relative flex-1 min-h-[380px] bg-slate-200 rounded-xl border border-slate-300 overflow-hidden flex items-center justify-center p-2">
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <iframe
                title={`Visio Original Pág ${visioPageNumber}`}
                src={`/visio/png_${visioPageNumber}.htm`}
                className="w-full h-[360px] bg-white rounded-lg border border-slate-300 shadow-xs"
                onError={(e) => {
                  // Fallback to xaml
                  (e.target as HTMLIFrameElement).src = `/visio/xaml_${visioPageNumber}.htm`;
                }}
              />
              <div className="mt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between w-full px-1">
                <span>Ficheiro: png_{visioPageNumber}.htm</span>
                <span className="text-emerald-600 font-bold">Fidelidade Estrita</span>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Especificação Documental de Origem</span>
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Fluxograma institucional aprovado no âmbito do Contact Center GEBALIS. As marcações operacionais de auditoria são representadas exclusivamente no grafo derivado ao lado, preservando a imagem de arquivo.
            </p>
          </div>
        </div>

        {/* Right Side: Grafo Estruturado GPS */}
        <div className={`${showOriginalImage ? 'lg:col-span-7' : 'lg:col-span-8'} p-4 flex flex-col`}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#E62382]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Grafo Estruturado & Motor GPS ({flow.nodes.length} Nós · {flow.edges.length} Arestas)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.6))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                title="Repor Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Graph Canvas */}
          <div className="relative flex-1 min-h-[420px] max-h-[560px] bg-slate-50 rounded-xl border border-slate-200 overflow-auto p-4">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.1s ease-out' }}>
              <svg 
                width={svgWidth} 
                height={svgHeight} 
                className="overflow-visible select-none"
              >
                <defs>
                  <marker
                    id="arrow-norm"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
                  </marker>
                  <marker
                    id="arrow-finding"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
                  </marker>
                </defs>

                {/* Edges */}
                {flow.edges.map((edge, idx) => {
                  const fromNode = flow.nodes.find(n => n.id === edge.f);
                  const toNode = flow.nodes.find(n => n.id === edge.t);
                  if (!fromNode || !toNode) return null;

                  const x1 = fromNode.x + fromNode.w / 2;
                  const y1 = fromNode.y + fromNode.h;
                  const x2 = toNode.x + toNode.w / 2;
                  const y2 = toNode.y;

                  const isFindingBranch = findings.some(f => f.nodeId === edge.f);

                  return (
                    <g key={`edge-${idx}`}>
                      <path
                        d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={isFindingBranch ? '#D97706' : '#94A3B8'}
                        strokeWidth={isFindingBranch ? 2.5 : 1.5}
                        strokeDasharray={isFindingBranch ? '4 2' : undefined}
                        markerEnd={`url(#${isFindingBranch ? 'arrow-finding' : 'arrow-norm'})`}
                      />
                      {edge.l && (
                        <rect
                          x={(x1 + x2) / 2 - 20}
                          y={(y1 + y2) / 2 - 10}
                          width={40}
                          height={18}
                          rx={4}
                          fill="#FFFFFF"
                          stroke={isFindingBranch ? '#D97706' : '#CBD5E1'}
                          strokeWidth={1}
                        />
                      )}
                      {edge.l && (
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 + 3}
                          textAnchor="middle"
                          fontSize={9}
                          fontWeight="bold"
                          fill={isFindingBranch ? '#D97706' : '#475569'}
                        >
                          {edge.l}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {flow.nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const hasFinding = findings.some(f => f.nodeId === node.id);
                  const color = getNodeColor(node);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        width={node.w}
                        height={node.h}
                        rx={node.kind === 'decision' ? 4 : 8}
                        fill={color.bg}
                        stroke={isSelected ? '#E62382' : color.border}
                        strokeWidth={isSelected ? 3 : hasFinding ? 2.5 : 1.5}
                        filter={isSelected ? 'drop-shadow(0 4px 6px rgba(230, 35, 130, 0.2))' : undefined}
                      />

                      {/* Header pill / badge */}
                      <rect
                        x={4}
                        y={4}
                        width={node.kind === 'decision' ? 45 : 30}
                        height={14}
                        rx={3}
                        fill={isSelected ? '#E62382' : color.border}
                      />
                      <text
                        x={8}
                        y={14}
                        fontSize={8}
                        fontWeight="bold"
                        fill="#FFFFFF"
                      >
                        {node.id}
                      </text>

                      {hasFinding && (
                        <circle
                          cx={node.w - 10}
                          cy={10}
                          r={6}
                          fill="#D97706"
                        />
                      )}

                      {/* Text content */}
                      <foreignObject x={8} y={20} width={node.w - 16} height={node.h - 24}>
                        <div className="text-[10px] text-slate-800 leading-tight font-sans font-medium line-clamp-3 p-0.5">
                          {node.t}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Selected Node Details Bar */}
          {selectedNode && (
            <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    Nó {selectedNode.id}
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-slate-500">
                    Tipo: {selectedNode.kind}
                  </span>
                  {nodeFindings.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{nodeFindings.length} Achado(s) de Auditoria</span>
                    </span>
                  )}
                </div>
                <p className="font-medium text-slate-900">
                  {selectedNode.t}
                </p>
              </div>

              {nodeFindings.length > 0 && onSelectFinding && (
                <button
                  type="button"
                  onClick={() => onSelectFinding(nodeFindings[0])}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0"
                >
                  Abrir Ficha do Achado ({nodeFindings[0].id})
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
