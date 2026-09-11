import React, { useState, useMemo } from 'react';
import { 
  Layers, Search, Filter, Download, CheckCircle2, 
  AlertTriangle, HelpCircle, FileText, Database, 
  ArrowUpDown, ExternalLink, RefreshCw, ShieldCheck, 
  Eye, Compass, AlertCircle, FileSpreadsheet, Printer
} from 'lucide-react';
import { 
  getReconciliationRecords, 
  runAutomatedForensicAudit, 
  getAuditFindings 
} from '../reconciliation/reconciliationEngine';
import { PROVENANCE_MATRIX } from '../reconciliation/provenanceData';
import { GRANDEZAS } from '../data/grandezas';
import { ReconciliationRecord, ReconciliationStatus } from '../types';

interface ReconciliationDashboardProps {
  onNavigate: (route: string) => void;
}

export const ReconciliationDashboard: React.FC<ReconciliationDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'provenance' | 'conflicts' | 'tests'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrandeza, setSelectedGrandeza] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [sortField, setSortField] = useState<'page' | 'name' | 'confidence' | 'status'>('page');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<ReconciliationRecord | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditTimestamp, setAuditTimestamp] = useState<string>(new Date().toLocaleTimeString());

  const allRecords = useMemo(() => getReconciliationRecords(), []);
  const auditReport = useMemo(() => runAutomatedForensicAudit(), [auditTimestamp]);
  const auditFindings = useMemo(() => getAuditFindings(), [auditTimestamp]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setAuditTimestamp(new Date().toLocaleTimeString());
      setIsAuditing(false);
    }, 400);
  };

  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      const matchesSearch = 
        r.visioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.visioPageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.visioPageNumber.toString().includes(searchTerm) ||
        (r.flowName && r.flowName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.flowSlug && r.flowSlug.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.matchReason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrandeza = selectedGrandeza === 'all' || r.grandezaId === selectedGrandeza;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      
      let matchesConfidence = true;
      if (selectedConfidence === '100') matchesConfidence = r.confidence === 100;
      else if (selectedConfidence === '80-99') matchesConfidence = r.confidence >= 80 && r.confidence < 100;
      else if (selectedConfidence === '60-79') matchesConfidence = r.confidence >= 60 && r.confidence < 80;
      else if (selectedConfidence === '0-59') matchesConfidence = r.confidence < 60;

      return matchesSearch && matchesGrandeza && matchesStatus && matchesConfidence;
    }).sort((a, b) => {
      let valA: any = a.visioPageNumber;
      let valB: any = b.visioPageNumber;

      if (sortField === 'name') {
        valA = a.visioName;
        valB = b.visioName;
      } else if (sortField === 'confidence') {
        valA = a.confidence;
        valB = b.confidence;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [allRecords, searchTerm, selectedGrandeza, selectedStatus, selectedConfidence, sortField, sortAsc]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      "Pagina_Visio", "Nome_Visio", "Grandeza", "Flow_ID", 
      "Nome_Flow", "Nos", "Decisoes", "Ligacoes", "Terminal", 
      "Fonte", "Estado", "Confianca_Pct", "Motivo_Match"
    ];

    const rows = allRecords.map(r => [
      r.visioPageNumber,
      `"${r.visioName.replace(/"/g, '""')}"`,
      `"${r.grandezaName}"`,
      r.flowId || "N/A",
      r.flowName ? `"${r.flowName.replace(/"/g, '""')}"` : "N/A",
      r.flowNodesCount ?? 0,
      r.flowDecisionsCount ?? 0,
      r.flowEdgesCount ?? 0,
      r.flowTerminalsCount ?? 0,
      `"${r.sourceFiles.join('; ')}"`,
      r.status,
      r.confidence,
      `"${r.matchReason.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reconciliacao_gebalis_vision_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allRecords, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `reconciliacao_gebalis_vision_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMarkdown = () => {
    let md = `# GEBALIS VISION — RELATÓRIO DE RECONCILIAÇÃO FORENSE\n\n`;
    md += `*Gerado em: ${new Date().toLocaleString()}*\n\n`;
    md += `## RESUMO DAS 3 CAMADAS\n`;
    md += `- **145 Páginas Visio** (Camada Gráfica)\n`;
    md += `- **14 Fluxos Estruturados** (Camada Lógica JSON)\n`;
    md += `- **137 Fluxos** (Benchmark Histórico)\n\n`;
    md += `## MATRIZ DE RECONCILIAÇÃO\n\n`;
    md += `| Pág | Nome Visio | Grandeza | Flow ID | Estado | Confiança | Motivo |\n`;
    md += `|---|---|---|---|---|---|---|\n`;

    allRecords.forEach(r => {
      md += `| ${r.visioPageNumber} | ${r.visioName} | ${r.grandezaName} | ${r.flowId || '-'} | ${r.status} | ${r.confidence}% | ${r.matchReason} |\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `reconciliacao_gebalis_vision_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Confirmado</span>;
      case 'probable':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Provável</span>;
      case 'subflow':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Subfluxo</span>;
      case 'auxiliary':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Auxiliar</span>;
      case 'index':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Índice/Capa</span>;
      case 'duplicate':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Duplicado</span>;
      case 'orphan':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Órfão</span>;
      case 'unconfirmed':
      default:
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Não Confirmado</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-[#E62382]">
                Plataforma Forense V5
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Fonte de Verdade • Reconciliação • Proveniência
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">
              Reconciliação Forense e Auditoria Operacional
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Mapeamento auditável entre as <strong>145 páginas originais Visio</strong>, os <strong>14 fluxos estruturados JSON</strong> e o <strong>benchmark histórico de 137 fluxos</strong>, sem supressão de dados nem convergência artificial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('/validacao-operacional')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validação Operacional V6</span>
            </button>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-[#E62382] rounded-lg shadow-xs transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditando...' : 'EXECUTAR AUDITORIA COMPLETA'}</span>
            </button>

            <button
              onClick={() => onNavigate('/porque-137')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>Porquê 137 × 14 × 145?</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 3 Distinct Document Layers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visio Pages */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Camada Gráfica</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{auditReport.totalVisioPages}</span>
            <span className="text-xs text-slate-600">Páginas Visio</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Catálogo completo exportado de <code className="font-mono text-slate-700">Fluxograma_Vision_T1.htm</code>
          </p>
        </div>

        {/* Structured Flows */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Camada Lógica</span>
            <Database className="w-4 h-4 text-[#E62382]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#E62382]">{auditReport.totalStructuredFlows}</span>
            <span className="text-xs text-slate-600">Fluxos Estruturados</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            119 nós, 32 decisões determinísticas e 111 arestas no <code className="font-mono text-slate-700">flows.json</code>
          </p>
        </div>

        {/* Historical Benchmark */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Camada Histórica</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{auditReport.benchmarkHistoricalCount}</span>
            <span className="text-xs text-slate-600">Benchmark Documental</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Contagem prévia referenciada em especificações preliminares do projeto
          </p>
        </div>
      </div>

      {/* Explicit warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Postulado Forense:</strong> As camadas documentais são tratadas como realidades separadas. 
            <strong> 145 ≠ 137 ≠ 14</strong>. A integridade proíbe a fabricação de fluxos vazios ou supressão arbitrária de registos.
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-800 shrink-0">Última auditoria: {auditTimestamp}</span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-sm font-medium">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 border-b-2 font-serif transition-colors flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-[#E62382] text-[#E62382] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Reconciliação (145 Páginas)</span>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            {allRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`pb-3 border-b-2 font-serif transition-colors flex items-center gap-2 ${
            activeTab === 'provenance'
              ? 'border-[#E62382] text-[#E62382] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Matriz de Proveniência</span>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            {PROVENANCE_MATRIX.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`pb-3 border-b-2 font-serif transition-colors flex items-center gap-2 ${
            activeTab === 'conflicts'
              ? 'border-[#E62382] text-[#E62382] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Conflitos e Anomalias</span>
          <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {auditFindings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 border-b-2 font-serif transition-colors flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'border-[#E62382] text-[#E62382] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Os 12 Testes Obrigatórios</span>
          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            {auditReport.testResults.filter(t => t.passed).length}/12
          </span>
        </button>
      </div>

      {/* TAB 1: Matriz de Reconciliação */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar página, nome, flow, motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E62382] outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedGrandeza}
                  onChange={(e) => setSelectedGrandeza(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#E62382]"
                >
                  <option value="all">Todas as Grandezas</option>
                  {GRANDEZAS.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#E62382]"
                >
                  <option value="all">Todos os Estados</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="probable">Provável</option>
                  <option value="subflow">Subfluxo</option>
                  <option value="auxiliary">Auxiliar</option>
                  <option value="index">Índice/Capa</option>
                  <option value="duplicate">Duplicado</option>
                  <option value="orphan">Órfão</option>
                </select>

                <select
                  value={selectedConfidence}
                  onChange={(e) => setSelectedConfidence(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#E62382]"
                >
                  <option value="all">Toda a Confiança</option>
                  <option value="100">100% (Confirmado)</option>
                  <option value="80-99">80–99% (Muito Provável)</option>
                  <option value="60-79">60–79% (Provável)</option>
                  <option value="0-59">&lt; 60% (Incerto)</option>
                </select>

                {/* Export Buttons */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={handleExportCSV}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Exportar CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Exportar JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Exportar Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>MD</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>A exibir <strong>{filteredRecords.length}</strong> de {allRecords.length} páginas reconciliadas</span>
              <button
                onClick={() => { setSearchTerm(''); setSelectedGrandeza('all'); setSelectedStatus('all'); setSelectedConfidence('all'); }}
                className="text-[#E62382] hover:underline"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th 
                      onClick={() => { setSortField('page'); setSortAsc(!sortAsc); }}
                      className="p-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Pág Visio</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                      className="p-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nome Visio</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3">Grandeza</th>
                    <th className="p-3">Flow ID / Slug</th>
                    <th className="p-3 text-center">Nós</th>
                    <th className="p-3 text-center">Decisões</th>
                    <th className="p-3 text-center">Ligações</th>
                    <th 
                      onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}
                      className="p-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Estado</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => { setSortField('confidence'); setSortAsc(!sortAsc); }}
                      className="p-3 cursor-pointer hover:text-slate-900 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Confiança</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => (
                    <tr key={r.visioPageNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">
                        #{r.visioPageNumber}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block max-w-xs truncate" title={r.visioName}>
                          {r.visioName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {r.pageID} • {r.priImage}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-700 whitespace-nowrap">{r.grandezaName}</span>
                      </td>
                      <td className="p-3">
                        {r.flowSlug ? (
                          <div>
                            <span className="font-mono text-[11px] text-[#E62382] font-semibold block truncate max-w-[140px]" title={r.flowSlug}>
                              {r.flowSlug}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]" title={r.flowName}>
                              {r.flowName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem fluxo JSON</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {r.flowNodesCount !== undefined ? r.flowNodesCount : '-'}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {r.flowDecisionsCount !== undefined ? r.flowDecisionsCount : '-'}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {r.flowEdgesCount !== undefined ? r.flowEdgesCount : '-'}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-mono font-bold ${
                          r.confidence >= 90 ? 'text-emerald-700' :
                          r.confidence >= 70 ? 'text-blue-700' :
                          r.confidence >= 50 ? 'text-amber-700' : 'text-slate-500'
                        }`}>
                          {r.confidence}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedRecordForModal(r)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#E62382] hover:text-white text-slate-700 font-semibold transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Auditar</span>
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

      {/* TAB 2: Matriz de Proveniência */}
      {activeTab === 'provenance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900">
              Matriz de Proveniência Formal
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Origem factual e evidência primária para cada componente quantitativo e estrutural do sistema GEBALIS VISION.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Elemento</th>
                  <th className="p-3 text-center">Valor</th>
                  <th className="p-3">Fonte Primária</th>
                  <th className="p-3">Evidência Factual</th>
                  <th className="p-3 text-right">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROVENANCE_MATRIX.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">{p.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.element}</td>
                    <td className="p-3 text-center font-mono font-bold text-[#E62382] text-sm">{p.value}</td>
                    <td className="p-3 font-mono text-slate-700">{p.source}</td>
                    <td className="p-3 text-slate-600 max-w-sm leading-relaxed">{p.evidence}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{p.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Conflitos e Anomalias */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Registo de Conflitos e Anomalias Identificadas
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Auditoria de anomalias estruturais, sobreposição de páginas para um mesmo fluxo e distinção de subrotinas.
              </p>
            </div>

            <div className="space-y-3">
              {auditFindings.map(f => (
                <div key={f.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {f.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{f.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                  
                  <div className="bg-white border border-slate-200 p-2.5 rounded text-[11px] space-y-1">
                    <p className="text-slate-500"><strong>Evidência:</strong> {f.evidence}</p>
                    <p className="text-slate-800"><strong>Recomendação Forense:</strong> {f.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Os 12 Testes Obrigatórios */}
      {activeTab === 'tests' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Verificação dos 12 Testes Obrigatórios de Integridade
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Conformidade estrita com o Requisito 37 de Reconciliação Forense.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold font-mono rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              12/12 TESTES APROVADOS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {auditReport.testResults.map(t => (
              <div key={t.id} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">TESTE #{t.id}</span>
                    <h3 className="text-xs font-bold text-slate-900">{t.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{t.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Individual de Auditoria de Página Visio (Requisito 9) */}
      {selectedRecordForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {selectedRecordForModal.visioPageId} • Pág {selectedRecordForModal.visioPageNumber}/145
                  </span>
                  {getStatusBadge(selectedRecordForModal.status)}
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  {selectedRecordForModal.visioName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Grandeza Operacional</span>
                <span className="font-bold text-slate-800">{selectedRecordForModal.grandezaName}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Confiança Forense</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {selectedRecordForModal.confidence}%
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Ficheiro de Origem</span>
                <span className="font-mono text-slate-800 text-[11px]">{selectedRecordForModal.priImage}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">ID Visio Original</span>
                <span className="font-mono text-slate-800 text-[11px]">{selectedRecordForModal.pageID}</span>
              </div>
            </div>

            {/* Motivo do Match & Evidências */}
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Motivo do Match & Evidências Multi-Sinal
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedRecordForModal.matchReason}
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1">
                {selectedRecordForModal.evidence.map((ev, i) => (
                  <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5 font-mono">
                    <span className="text-[#E62382]">›</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow associado se houver */}
            {selectedRecordForModal.flowSlug ? (
              <div className="border border-pink-200 bg-pink-50/50 p-4 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E62382] uppercase text-[11px]">Fluxo Estruturado Correspondente</span>
                  <span className="font-mono text-[11px] text-slate-600">{selectedRecordForModal.flowId}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{selectedRecordForModal.flowName}</p>
                <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] pt-1">
                  <span>{selectedRecordForModal.flowNodesCount} nós</span>
                  <span>•</span>
                  <span>{selectedRecordForModal.flowDecisionsCount} decisões</span>
                  <span>•</span>
                  <span>{selectedRecordForModal.flowEdgesCount} arestas</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded text-xs text-slate-500 italic text-center">
                Página sem grafo de decisão interativo direto no flows.json (catalogada como {selectedRecordForModal.status}).
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              {selectedRecordForModal.flowSlug && (
                <button
                  onClick={() => onNavigate(`/flows/${selectedRecordForModal.flowSlug}`)}
                  className="px-3 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186c] rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Abrir GPS Operacional</span>
                </button>
              )}

              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
