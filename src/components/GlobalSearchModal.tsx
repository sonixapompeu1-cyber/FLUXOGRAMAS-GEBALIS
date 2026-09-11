import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Layers, FileText, Compass, ShieldCheck, GitMerge, FlaskConical, ExternalLink, ArrowRight } from 'lucide-react';
import { GlobalSearchResult } from '../types';
import { executeGlobalSearch } from '../readiness/readinessEngine';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('TODOS');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!query) {
        setResults(executeGlobalSearch('rendas'));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 1) {
      setResults(executeGlobalSearch(query));
    } else if (!query) {
      setResults(executeGlobalSearch('rendas'));
    }
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = activeFilter === 'TODOS'
    ? results
    : results.filter(r => r.source === activeFilter);

  const getSourceIcon = (source: GlobalSearchResult['source']) => {
    switch (source) {
      case 'VISIO': return Layers;
      case 'FLOW': return Compass;
      case 'GPS': return ArrowRight;
      case 'VALIDAÇÃO': return ShieldCheck;
      case 'REMEDIAÇÃO': return GitMerge;
      case 'SIMULAÇÃO': return FlaskConical;
      case 'AUDITORIA': return FileText;
      default: return FileText;
    }
  };

  const getSourceBadgeColor = (source: GlobalSearchResult['source']) => {
    switch (source) {
      case 'VISIO': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'FLOW': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'GPS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'VALIDAÇÃO': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REMEDIAÇÃO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SIMULAÇÃO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AUDITORIA': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 pb-12 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisa transversal: fluxos, nós, decisões, pranchas Visio, achados VAL, remediações..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white rounded-lg border border-slate-200 shadow-2xs"
          >
            ESC
          </button>
        </div>

        {/* Source Filters */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          {['TODOS', 'VISIO', 'FLOW', 'GPS', 'VALIDAÇÃO', 'REMEDIAÇÃO', 'SIMULAÇÃO'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-2xs uppercase tracking-wider font-mono">
            {filteredResults.length} resultados
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 divide-y divide-slate-100 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="font-semibold text-slate-700">Nenhum resultado encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente pesquisar por termo como "rendas", "piquete", "t3", "VAL-004" ou "SIM-001".
              </p>
            </div>
          ) : (
            filteredResults.map((res) => {
              const Icon = getSourceIcon(res.source);
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    onNavigate(res.linkPath);
                    onClose();
                  }}
                  className="py-3 px-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 group"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-2xs font-extrabold border ${getSourceBadgeColor(res.source)}`}>
                        {res.source}
                      </span>
                      {res.badgeText && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-2xs font-mono">
                          {res.badgeText}
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
                        {res.title}
                      </h4>
                    </div>
                    <p className="text-xs font-medium text-slate-500 truncate">{res.subtitle}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{res.matchDetail}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-2xs text-slate-500 flex items-center justify-between">
          <span>Pesquisa multi-camada indexada em tempo real (Camadas 1 a 6)</span>
          <span className="font-mono">GEBALIS VISION V8</span>
        </div>
      </div>
    </div>
  );
};
