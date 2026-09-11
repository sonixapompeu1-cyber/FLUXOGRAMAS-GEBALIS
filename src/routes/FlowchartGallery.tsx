import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Maximize2, ExternalLink, ArrowRight, 
  ArrowLeft, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertTriangle, 
  Layers, Compass, Eye, ShieldCheck, Tag, Columns, ShieldAlert
} from 'lucide-react';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import { GRANDEZAS, getGrandezaById } from '../data/grandezas';
import { VisioEntry, Flow } from '../types';
import { OriginalFlowchartViewer } from '../components/OriginalFlowchartViewer';

interface FlowchartGalleryProps {
  flows: Flow[];
  onNavigate: (route: string) => void;
}

export const FlowchartGallery: React.FC<FlowchartGalleryProps> = ({ flows, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrandeza, setSelectedGrandeza] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalEntry, setActiveModalEntry] = useState<VisioEntry | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const filteredEntries = useMemo(() => {
    return VISIO_REGISTRY.filter(entry => {
      const matchesSearch = 
        entry.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `página ${entry.pageIndex}`.includes(searchTerm.toLowerCase()) ||
        entry.pageID.toString().includes(searchTerm) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGrandeza = selectedGrandeza === 'all' || entry.grandezaId === selectedGrandeza;
      const matchesStatus = selectedStatus === 'all' || entry.matchStatus === selectedStatus;

      return matchesSearch && matchesGrandeza && matchesStatus;
    });
  }, [searchTerm, selectedGrandeza, selectedStatus]);

  const handleOpenModal = (entry: VisioEntry) => {
    setActiveModalEntry(entry);
    setZoomLevel(100);
  };

  const handleNextEntry = () => {
    if (!activeModalEntry) return;
    const currentIndex = VISIO_REGISTRY.findIndex(e => e.pageIndex === activeModalEntry.pageIndex);
    if (currentIndex < VISIO_REGISTRY.length - 1) {
      setActiveModalEntry(VISIO_REGISTRY[currentIndex + 1]);
      setZoomLevel(100);
    }
  };

  const handlePrevEntry = () => {
    if (!activeModalEntry) return;
    const currentIndex = VISIO_REGISTRY.findIndex(e => e.pageIndex === activeModalEntry.pageIndex);
    if (currentIndex > 0) {
      setActiveModalEntry(VISIO_REGISTRY[currentIndex - 1]);
      setZoomLevel(100);
    }
  };

  const matchedFlowForModal = useMemo(() => {
    if (!activeModalEntry?.matchedSlug) return null;
    return flows.find(f => f.slug === activeModalEntry.matchedSlug) || null;
  }, [activeModalEntry, flows]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-[#E62382]">
                Catálogo Visual Forense
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Fonte: Fluxograma_Vision_T1.htm (Microsoft Visio)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">
              Galeria dos 145 Fluxogramas
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Registo integral das 145 páginas exportadas pelo Microsoft Visio, categorizadas pelas 10 Grandezas 
              operacionais da GEBALIS e vinculadas aos grafos determinísticos do GPS.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right border-r border-slate-200 pr-4">
              <p className="text-2xl font-bold font-mono text-slate-900">145</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Páginas Visio</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-[#E62382]">{flows.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Grafos Core</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por página, nome, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E62382] focus:border-[#E62382] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter by Grandeza */}
            <select
              value={selectedGrandeza}
              onChange={(e) => setSelectedGrandeza(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#E62382]"
            >
              <option value="all">Todas as 10 Grandezas</option>
              {GRANDEZAS.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.visioPageIndices.length} págs)
                </option>
              ))}
            </select>

            {/* Filter by Match Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#E62382]"
            >
              <option value="all">Todos os Estados de Match</option>
              <option value="MATCH CONFIRMADO">Match Confirmado</option>
              <option value="MATCH PROVÁVEL">Match Provável</option>
            </select>

            <button
              onClick={() => { setSearchTerm(''); setSelectedGrandeza('all'); setSelectedStatus('all'); }}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 145 Flowcharts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEntries.map((entry) => {
          const grandeza = getGrandezaById(entry.grandezaId);
          const hasLinkedCoreFlow = flows.some(f => f.slug === entry.matchedSlug);

          return (
            <div
              key={entry.pageIndex}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Pág #{entry.pageIndex} (ID: {entry.pageID})
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${grandeza?.color || '#64748b'}15`,
                      color: grandeza?.color || '#64748b'
                    }}
                  >
                    {grandeza?.name || 'Geral'}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-sm font-bold font-serif text-slate-900 group-hover:text-[#E62382] transition-colors line-clamp-2 min-h-[40px]">
                  {entry.pageName}
                </h2>

                {/* Mock Flowchart Vector Preview */}
                <div 
                  onClick={() => handleOpenModal(entry)}
                  className="mt-3 relative w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer overflow-hidden group/canvas hover:border-[#E62382] transition-all"
                >
                  {/* Stylized Node Chart */}
                  <div className="flex flex-col items-center gap-1.5 w-full max-w-[140px] opacity-75 group-hover/canvas:opacity-100 transition-opacity">
                    <div className="w-full py-1 text-center bg-white border border-slate-300 rounded text-[9px] font-mono text-slate-700 font-semibold shadow-xs">
                      [Início #{entry.pageIndex}]
                    </div>
                    <div className="w-0.5 h-2 bg-slate-300"></div>
                    <div className="w-full py-1 text-center bg-pink-50 border border-pink-300 rounded text-[9px] font-mono text-[#E62382] font-semibold shadow-xs truncate px-1">
                      {entry.pageName}
                    </div>
                    <div className="w-0.5 h-2 bg-slate-300"></div>
                    <div className="w-full py-1 text-center bg-emerald-50 border border-emerald-300 rounded text-[9px] font-mono text-emerald-800 font-semibold shadow-xs">
                      Desfecho / CRM
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#E62382]/10 opacity-0 group-hover/canvas:opacity-100 backdrop-blur-[1px] flex items-center justify-center gap-2 transition-all text-slate-900 font-semibold text-xs">
                    <Maximize2 className="w-4 h-4 text-[#E62382]" />
                    <span>Ampliar Fluxograma</span>
                  </div>
                </div>

                {/* Match Status Badge */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {entry.priImage}
                  </span>
                  <span className={`font-semibold ${
                    entry.matchStatus === 'MATCH CONFIRMADO' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {entry.confidence}% conf.
                  </span>
                </div>
              </div>

              {/* Bottom Actions (Requisito 7 & 11) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(entry)}
                    className="text-[11px] font-semibold text-slate-700 hover:text-[#E62382] flex items-center gap-1 py-1"
                    title="Abrir Original"
                  >
                    <Eye className="w-3.5 h-3.5" /> Abrir Original
                  </button>

                  <button
                    onClick={() => onNavigate(`/reconciliacao`)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1"
                    title="Auditar na Reconciliação"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Auditoria
                  </button>
                </div>

                {entry.matchedSlug ? (
                  <button
                    onClick={() => onNavigate(`/flows/${entry.matchedSlug}`)}
                    className="text-[11px] font-bold text-white bg-slate-900 hover:bg-[#E62382] px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-all"
                    title="Abrir no GPS Operacional"
                  >
                    <span>GPS</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Pág auxiliar</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-base font-semibold text-slate-800">Nenhum fluxograma encontrado</p>
          <p className="text-xs text-slate-500 mt-1">Ajuste os termos de pesquisa ou filtros selecionados.</p>
        </div>
      )}

      {/* Fullscreen Inspector Modal (Section 17) */}
      {activeModalEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E62382] flex items-center justify-center text-white font-bold">
                  <span className="text-xs font-mono">#{activeModalEntry.pageIndex}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-serif text-white">
                      {activeModalEntry.pageName}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      ID Visio: {activeModalEntry.pageID}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ficheiros originais: {activeModalEntry.priImage} | {activeModalEntry.secImage}
                  </p>
                </div>
              </div>

              {/* Navigation Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEntry}
                  disabled={activeModalEntry.pageIndex === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                  title="Página Anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-300 px-1">
                  {activeModalEntry.pageIndex} / {VISIO_REGISTRY.length}
                </span>
                <button
                  onClick={handleNextEntry}
                  disabled={activeModalEntry.pageIndex === VISIO_REGISTRY.length}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                  title="Próxima Página"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveModalEntry(null)}
                  className="ml-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body with OriginalFlowchartViewer (Requisito 10, 11, 12) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <OriginalFlowchartViewer
                entry={activeModalEntry}
                matchedFlow={matchedFlowForModal}
                onPrevPage={handlePrevEntry}
                onNextPage={handleNextEntry}
                className="min-h-[500px]"
              />

              {/* Metadata & Audit Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Metadados da Fonte (Visio HTML)
                  </p>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600">
                    <p><strong className="text-slate-900">Page Index:</strong> {activeModalEntry.pageIndex}</p>
                    <p><strong className="text-slate-900">Page ID:</strong> {activeModalEntry.pageID}</p>
                    <p><strong className="text-slate-900">Primary File:</strong> {activeModalEntry.priImage}</p>
                    <p><strong className="text-slate-900">Secondary File:</strong> {activeModalEntry.secImage}</p>
                    <p><strong className="text-slate-900">Grandeza:</strong> {getGrandezaById(activeModalEntry.grandezaId)?.name}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Auditoria & Correspondência
                  </p>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>
                      <strong className="text-slate-900">Estado de Match:</strong>{' '}
                      <span className="font-bold text-emerald-700">{activeModalEntry.matchStatus}</span>
                    </p>
                    <p><strong className="text-slate-900">Grau de Confiança:</strong> {activeModalEntry.confidence}%</p>
                    <p>
                      <strong className="text-slate-900">Fluxo no Sistema:</strong>{' '}
                      {activeModalEntry.matchedSlug ? (
                        <span className="font-mono text-[#E62382] font-semibold">{activeModalEntry.matchedSlug}</span>
                      ) : (
                        <span className="text-slate-400 italic">Página sem grafo de decisão interativo</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setActiveModalEntry(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg bg-white"
              >
                Fechar Ficha
              </button>

              {activeModalEntry.matchedSlug && (
                <button
                  onClick={() => {
                    const slug = activeModalEntry.matchedSlug;
                    setActiveModalEntry(null);
                    onNavigate(`/flows/${slug}`);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c21869] rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Executar no GPS Operacional</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
