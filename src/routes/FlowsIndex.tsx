import React, { useState, useMemo } from 'react';
import { Flow, FlowArea } from '../types';
import { pesquisarFlows } from '../lib/flows';
import {
  Search,
  GitFork,
  ArrowRight,
  Layers,
  Filter,
  X,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';

interface FlowsIndexProps {
  flows: Flow[];
  areas: FlowArea[];
  initialQuery?: string;
  onNavigate: (path: string) => void;
}

export const FlowsIndex: React.FC<FlowsIndexProps> = ({
  flows,
  areas,
  initialQuery = '',
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');

  // Filter flows by query using pesquisarFlows logic
  const searchedFlows = useMemo(() => {
    return pesquisarFlows(searchQuery);
  }, [searchQuery]);

  // Further filter by area if an area tab is selected
  const filteredFlows = useMemo(() => {
    if (selectedAreaId === 'all') return searchedFlows;
    const currentArea = areas.find((a) => a.id === selectedAreaId);
    if (!currentArea) return searchedFlows;
    return searchedFlows.filter((flow) => currentArea.flowSlugs.includes(flow.slug));
  }, [searchedFlows, selectedAreaId, areas]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Find which area a flow belongs to
  const getAreaForFlow = (slug: string) => {
    return areas.find((a) => a.flowSlugs.includes(slug));
  };

  return (
    <div id="flows-index-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header section */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E62382] uppercase tracking-wider">
          <GitFork className="w-4 h-4" />
          <span>Índice Operacional</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#181717] font-display">
          Fluxogramas do Contact Center
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Consulte e navegue por todos os diagramas de atendimento, procedimentos de triagem, árvores de decisão e encaminhamento institucional da Gebalis.
        </p>
      </div>

      {/* Search and Area Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="flows-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome do fluxo ou conteúdo dos passos (ex: rendas, piquete, permuta)..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E62382] placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              title="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips by Area */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            id="area-filter-all"
            onClick={() => setSelectedAreaId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedAreaId === 'all'
                ? 'bg-[#181717] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas as Áreas ({searchedFlows.length})
          </button>

          {areas.map((area) => {
            const count = searchedFlows.filter((f) => area.flowSlugs.includes(f.slug)).length;
            const isSelected = selectedAreaId === area.id;

            return (
              <button
                key={area.id}
                id={`area-filter-${area.id}`}
                onClick={() => setSelectedAreaId(area.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#E62382] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{area.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          A mostrar <strong className="text-slate-800">{filteredFlows.length}</strong> de {flows.length} fluxogramas disponíveis
        </span>
        {searchQuery && (
          <span className="text-slate-400">
            Termo de pesquisa: &quot;<strong className="text-[#E62382]">{searchQuery}</strong>&quot;
          </span>
        )}
      </div>

      {/* Flows Grid */}
      {filteredFlows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => {
            const area = getAreaForFlow(flow.slug);
            const interlinkedNodes = flow.nodes.filter((n) => !!n.link);

            return (
              <div
                key={flow.slug}
                id={`flow-card-${flow.slug}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {area ? area.name : 'Geral'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {flow.nodes.length} nós
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#181717] font-display group-hover:text-[#E62382] transition-colors leading-snug">
                    {flow.name}
                  </h2>

                  {/* Sample steps in this flow */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Passos em destaque:
                    </div>
                    {flow.nodes.slice(0, 3).map((node) => (
                      <div
                        key={node.id}
                        className="text-xs text-slate-600 flex items-start gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span className="line-clamp-1">{node.t}</span>
                      </div>
                    ))}
                  </div>

                  {interlinkedNodes.length > 0 && (
                    <div className="pt-2 text-[11px] text-[#379C8D] font-semibold flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>{interlinkedNodes.length} ligação(ões) para outros fluxos</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    id={`open-flow-${flow.slug}`}
                    onClick={() => onNavigate(`/fluxos/${flow.slug}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#E62382] text-slate-800 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Abrir Fluxograma</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-[#E62382] flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Nenhum fluxograma encontrado
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Não foram encontrados resultados para &quot;{searchQuery}&quot; com os filtros selecionados. Tente pesquisar por termos mais gerais como &quot;rendas&quot;, &quot;obras&quot; ou &quot;social&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedAreaId('all');
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Limpar Filtros e Ver Todos
          </button>
        </div>
      )}
    </div>
  );
};
