import React, { useState, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, 
  ChevronLeft, ChevronRight, ShieldAlert, FileText, 
  Move, CheckCircle2, Compass, AlertCircle
} from 'lucide-react';
import { VisioEntry, Flow, GrandezaId } from '../types';
import { getGrandezaById } from '../data/grandezas';

interface OriginalFlowchartViewerProps {
  entry: VisioEntry;
  matchedFlow?: Flow | null;
  activeGpsNodeId?: string;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  className?: string;
}

export const OriginalFlowchartViewer: React.FC<OriginalFlowchartViewerProps> = ({
  entry,
  matchedFlow,
  activeGpsNodeId,
  onPrevPage,
  onNextPage,
  className = ''
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const grandeza = getGrandezaById(entry.grandezaId);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };
  const handleFitScreen = () => {
    setZoom(85);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Find active node if matched flow is present
  const activeGpsNode = matchedFlow && activeGpsNodeId 
    ? matchedFlow.nodes.find(n => n.id === activeGpsNodeId)
    : null;

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg select-none ${className}`}
    >
      {/* Top Banner: ORIGINAL — NÃO ALTERADO (Mandatory by Requisito 10 & 11) */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            ORIGINAL — NÃO ALTERADO
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Pág {entry.pageIndex}/145 (ID: {entry.pageID})
          </span>
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: `${grandeza?.color || '#64748b'}25`,
              color: grandeza?.color || '#38bdf8' 
            }}
          >
            {grandeza?.name || 'Geral'}
          </span>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center gap-1.5">
          {onPrevPage && (
            <button
              onClick={onPrevPage}
              disabled={entry.pageIndex <= 1}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {onNextPage && (
            <button
              onClick={onNextPage}
              disabled={entry.pageIndex >= 145}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
              title="Página Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-slate-300 w-10 text-center">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitScreen}
            className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Ajustar ao ecrã"
          >
            Fit
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Resetar Posição e Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title={isFullscreen ? "Sair do Ecrã Inteiro" : "Ecrã Inteiro"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Warning according to Requisito 12 */}
      {activeGpsNodeId && (
        <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#E62382]" />
            <span>Nó GPS actual: <strong className="text-white font-mono">{activeGpsNodeId}</strong> {activeGpsNode ? `(${activeGpsNode.t})` : ''}</span>
          </div>
          <span className="text-[11px] text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Localizador no fluxograma original não determinado
          </span>
        </div>
      )}

      {/* Canvas Viewport with Pan & Drag */}
      <div 
        className="relative flex-1 min-h-[480px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Helper Drag Cue */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 z-10 pointer-events-none">
          <Move className="w-3 h-3 text-slate-400" />
          Arrastar para navegar / Rodar scroll para zoom
        </div>

        {/* Transformable Canvas */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative bg-white text-slate-900 border border-slate-300 shadow-2xl rounded p-8 min-w-[720px] max-w-[960px]"
        >
          {/* Authentic Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                <span>GEBALIS VISION • FLUXOGRAMA T1</span>
                <span>•</span>
                <span>Página {entry.pageIndex} de 145</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">
                {entry.pageName}
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <p>ID: {entry.pageID}</p>
              <p className="text-[10px] text-slate-400">{entry.priImage} / {entry.secImage}</p>
            </div>
          </div>

          {/* Authentic Process Flow Diagram representation from Visio */}
          {matchedFlow ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">
                  <span>Estrutura Operacional Original</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    {matchedFlow.nodes.length} nós • {matchedFlow.edges.length} arestas
                  </span>
                </div>

                {/* SVG Visual Graph representing the genuine Visio flow */}
                <svg viewBox={`0 0 ${matchedFlow.w || 1000} ${matchedFlow.h || 800}`} className="w-full h-auto bg-white border border-slate-200 rounded shadow-inner">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                  </defs>

                  {/* Render Edges */}
                  {matchedFlow.edges.map((edge, i) => {
                    const fromNode = matchedFlow.nodes.find(n => n.id === edge.f);
                    const toNode = matchedFlow.nodes.find(n => n.id === edge.t);
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + fromNode.w / 2;
                    const y1 = fromNode.y + fromNode.h;
                    const x2 = toNode.x + toNode.w / 2;
                    const y2 = toNode.y;

                    return (
                      <g key={i}>
                        <path
                          d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          markerEnd="url(#arrow)"
                        />
                        {edge.l && (
                          <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 4}
                            textAnchor="middle"
                            className="text-[11px] font-bold fill-slate-700"
                            style={{ fontSize: '12px' }}
                          >
                            {edge.l}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Render Nodes */}
                  {matchedFlow.nodes.map(node => {
                    const isDecision = node.kind === 'decision';
                    const isTerminal = node.kind === 'terminal';
                    const isStart = node.kind === 'start';

                    return (
                      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                        {isDecision ? (
                          <polygon
                            points={`${node.w / 2},0 ${node.w},${node.h / 2} ${node.w / 2},${node.h} 0,${node.h / 2}`}
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="2"
                          />
                        ) : isTerminal ? (
                          <rect
                            width={node.w}
                            height={node.h}
                            rx={8}
                            fill="#dcfce7"
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                        ) : isStart ? (
                          <rect
                            width={node.w}
                            height={node.h}
                            rx={node.h / 2}
                            fill="#e0e7ff"
                            stroke="#6366f1"
                            strokeWidth="2"
                          />
                        ) : (
                          <rect
                            width={node.w}
                            height={node.h}
                            rx={4}
                            fill="#ffffff"
                            stroke="#cbd5e1"
                            strokeWidth="2"
                          />
                        )}

                        <text
                          x={node.w / 2}
                          y={node.h / 2}
                          dominantBaseline="middle"
                          textAnchor="middle"
                          className="font-sans font-semibold text-slate-800"
                          style={{ fontSize: isDecision ? '11px' : '12px' }}
                        >
                          {node.t.length > 38 ? `${node.t.slice(0, 36)}...` : node.t}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            /* Document Page for Visio Pages without interactive graph (subflows/auxiliary) */
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-serif">{entry.pageName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Documento Original: {entry.priImage} (Ficheiro Microsoft Visio export)
                </p>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {entry.notes || 'Página auxiliar de apoio, organograma, minuta processual ou anexo documental do sistema GEBALIS VISION.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded text-xs font-mono text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Registo fiel preservado no acervo das 145 páginas originais
              </div>
            </div>
          )}

          {/* Footer of the document */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Microsoft Visio 11.0 XML/HTML Export</span>
            <span>Fluxograma_Vision_T1.htm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
