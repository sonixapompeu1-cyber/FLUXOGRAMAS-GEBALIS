import React, { useMemo, useState } from 'react';
import { Flow, FlowArea } from '../types';
import { runForensicAudit } from '../audit/forensicAudit';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import { GRANDEZAS } from '../data/grandezas';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Printer,
  ChevronRight,
  Info,
  Scale,
  Layers,
  Database,
  ExternalLink,
  Search
} from 'lucide-react';

interface ReportProps {
  flows: Flow[];
  areas: FlowArea[];
  onNavigate: (path: string) => void;
}

export const Report: React.FC<ReportProps> = ({ flows, areas, onNavigate }) => {
  const audit = useMemo(() => runForensicAudit(flows), [flows]);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'COMPLIANCE' | 'VISIO_REGISTRY' | 'DIVERGENCES'>('COMPLIANCE');
  const [visioSearch, setVisioSearch] = useState('');

  const filteredVisioPages = useMemo(() => {
    return VISIO_REGISTRY.filter(v => 
      v.pageName.toLowerCase().includes(visioSearch.toLowerCase()) ||
      v.pageIndex.toString().includes(visioSearch) ||
      v.priImage.toLowerCase().includes(visioSearch.toLowerCase()) ||
      v.matchStatus.toLowerCase().includes(visioSearch.toLowerCase())
    );
  }, [visioSearch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen animate-in fade-in duration-300">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#E62382] uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Auditoria Forense & Matriz de Conformidade V4</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
            Relatório Forense de Reconstrução
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Demonstração técnica e auditável da correspondência com o projeto original GEBALIS VISION (Microsoft Visio / 145 páginas exportadas e 14 fluxos interativos core).
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0 print:hidden"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      {/* Global Status Banner */}
      <div className={`border-2 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        audit.approvalStatus === 'APROVADO COM DIVERGÊNCIAS'
          ? 'bg-amber-50/80 border-amber-300'
          : audit.approvalStatus === 'APROVADO'
          ? 'bg-emerald-50/80 border-emerald-400'
          : 'bg-rose-50/80 border-rose-400'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 ${
            audit.approvalStatus === 'APROVADO COM DIVERGÊNCIAS' ? 'bg-amber-600' : 'bg-emerald-600'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Status Global da Auditoria: {audit.approvalStatus}
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
              Aplicação reconstruída sob o princípio de <strong>Fidelidade Forense</strong> ("Não Inventar"). 
              Todos os {audit.metricsCalculated.fluxos} fluxos estruturados, {audit.totalNodes} nós e {audit.totalEdges} arestas são 
              estritamente coerentes. As 145 páginas do Visio estão mapeadas e documentadas com transparência.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-bold shrink-0 text-slate-800 shadow-xs">
          {new Date(audit.timestamp).toLocaleDateString('pt-PT')}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold print:hidden">
        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'COMPLIANCE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Matriz Final de Conformidade (Requisito 38)
        </button>

        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'METRICS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Métricas Calculadas vs Alvo (Requisito 6)
        </button>

        <button
          onClick={() => setActiveTab('VISIO_REGISTRY')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'VISIO_REGISTRY' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Auditoria dos 145 Fluxogramas Visio (Requisito 24)
        </button>

        <button
          onClick={() => setActiveTab('DIVERGENCES')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'DIVERGENCES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Divergências Documentadas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
            {audit.divergences.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Matriz de Conformidade (Section 38) */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-serif text-slate-900">
                  Matriz Final de Conformidade Forense (Requisito 38)
                </h3>
                <p className="text-xs text-slate-500">
                  Comparativo rigoroso entre os parâmetros do projeto original e a implementação atual.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Requisito</th>
                    <th className="px-4 py-3">Original / Benchmark</th>
                    <th className="px-4 py-3">Reconstruído</th>
                    <th className="px-4 py-3">Auditoria Realizada</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="px-4 py-3">Observação Forense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audit.complianceMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {row.requisito}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {row.original}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {row.reconstruido}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.auditoria}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          row.estado === '✓' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs">
                        {row.observacao}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Métricas Calculadas vs Alvo (Section 6) */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold font-serif text-slate-900 mb-1">
              Métricas Institucionais Obrigatórias (Requisito 6)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Todos os valores são calculados dinamicamente em tempo de execução a partir da estrutura dos dados.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Fluxos</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {audit.metricsCalculated.fluxos}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.fluxos}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Nós Centrais</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {audit.metricsCalculated.nosCentrais}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.nosCentrais}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Decisões</p>
                <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
                  {audit.metricsCalculated.decisoes}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.decisoes}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Ligações Ativas</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {audit.metricsCalculated.ligacoes}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.ligacoes}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Terminais</p>
                <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  {audit.metricsCalculated.terminais}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.terminais}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs uppercase font-bold text-slate-500">Grandezas</p>
                <p className="text-2xl font-bold font-mono text-[#E62382] mt-1">
                  {audit.metricsCalculated.grandezas}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Alvo: {audit.metricsTarget.grandezas}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Visio Registry (Requisito 24) */}
      {activeTab === 'VISIO_REGISTRY' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm font-serif text-slate-900">
                  Registo dos 145 Ficheiros Exportados do Microsoft Visio
                </h3>
                <p className="text-xs text-slate-500">
                  Fonte: Fluxograma_Vision_T1.htm — Páginas 1 a 145 indexadas e auditadas.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por nome, página..."
                  value={visioSearch}
                  onChange={(e) => setVisioSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E62382]"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Pág</th>
                    <th className="px-4 py-2.5">Page ID</th>
                    <th className="px-4 py-2.5">Nome do Fluxograma</th>
                    <th className="px-4 py-2.5">Ficheiro Primário</th>
                    <th className="px-4 py-2.5">Grandeza</th>
                    <th className="px-4 py-2.5">Match Status</th>
                    <th className="px-4 py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredVisioPages.map((entry) => (
                    <tr key={entry.pageIndex} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-bold text-slate-900">#{entry.pageIndex}</td>
                      <td className="px-4 py-2 text-slate-500">{entry.pageID}</td>
                      <td className="px-4 py-2 font-sans font-semibold text-slate-800">{entry.pageName}</td>
                      <td className="px-4 py-2 text-slate-500">{entry.priImage}</td>
                      <td className="px-4 py-2 font-sans text-slate-600">{entry.grandezaId}</td>
                      <td className="px-4 py-2 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.matchStatus === 'MATCH CONFIRMADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {entry.matchStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-sans">
                        <button
                          onClick={() => onNavigate('/galeria')}
                          className="text-[#E62382] hover:underline text-xs font-bold"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Divergências Documentadas */}
      {activeTab === 'DIVERGENCES' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold font-serif text-slate-900 mb-1">
              Registo de Divergências Identificadas (Princípio "Não Inventar")
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Em estrito cumprimento das diretrizes de auditoria forense, nenhuma discrepância foi artificialmente mascarada.
            </p>

            <div className="space-y-4">
              {audit.divergences.map((div) => (
                <div key={div.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      [{div.id}] {div.categoria} • {div.item}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {div.nivel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <p><strong className="text-slate-800">Esperado:</strong> {div.esperado}</p>
                    <p><strong className="text-slate-800">Calculado:</strong> {div.calculado}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1 border-t border-slate-200">
                    <strong className="text-slate-800">Justificação Forense:</strong> {div.justificacao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
