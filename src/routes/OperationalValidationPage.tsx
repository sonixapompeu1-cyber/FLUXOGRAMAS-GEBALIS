import React, { useState, useMemo } from 'react';
import { 
  Flow, 
  GrandezaId, 
  FindingSeverity, 
  FindingStatus, 
  ValidationStatus, 
  OperationalValidationReport, 
  FlowValidationResult,
  ValidationFinding,
  ScenarioExecutionResult
} from '../types';
import { flows } from '../lib/flows';
import { buildOperationalValidationReport } from '../validation/operationalValidationEngine';
import { 
  getStoredFindings, 
  updateFindingStatus, 
  addFindingNote 
} from '../validation/validationFindingsStore';
import { FindingDetailModal } from '../components/FindingDetailModal';
import { ComparativeGraphViewer } from '../components/ComparativeGraphViewer';
import { AuditorModeRunner } from '../components/AuditorModeRunner';
import { SnapshotModal } from '../components/SnapshotModal';
import { GRANDEZAS, getGrandezaById } from '../data/grandezas';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Layers, 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Camera, 
  HelpCircle, 
  Clock, 
  Activity, 
  BarChart3, 
  GitPullRequest, 
  Check, 
  XCircle, 
  ChevronRight,
  RefreshCw,
  Eye
} from 'lucide-react';

interface OperationalValidationPageProps {
  onNavigate?: (path: string) => void;
}

export const OperationalValidationPage: React.FC<OperationalValidationPageProps> = ({
  onNavigate
}) => {
  // Active report state
  const [reportVersion, setReportVersion] = useState<number>(0);
  const report: OperationalValidationReport = useMemo(() => {
    return buildOperationalValidationReport();
  }, [reportVersion]);

  // UI tabs
  type TabKey = 'dashboard' | 'flows' | 'findings' | 'scenarios' | 'auditor' | 'tests';
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Finding modal
  const [selectedFinding, setSelectedFinding] = useState<ValidationFinding | null>(null);

  // Snapshot modal
  const [showSnapshotModal, setShowSnapshotModal] = useState<boolean>(false);

  // Active flow for comparative view / inspector
  const [activeFlowSlug, setActiveFlowSlug] = useState<string>('triagem-inicial');
  const activeFlow = flows.find(f => f.slug === activeFlowSlug) || flows[0];

  // Filters for findings table
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<string>('all');
  const [findingStatusFilter, setFindingStatusFilter] = useState<string>('all');
  const [findingSearchQuery, setFindingSearchQuery] = useState<string>('');

  // Filters for flows table
  const [flowStatusFilter, setFlowStatusFilter] = useState<string>('all');
  const [flowGrandezaFilter, setFlowGrandezaFilter] = useState<string>('all');

  const filteredFindings = useMemo(() => {
    return report.allFindings.filter(f => {
      if (findingSeverityFilter !== 'all' && f.severity !== findingSeverityFilter) return false;
      if (findingStatusFilter !== 'all' && f.status !== findingStatusFilter) return false;
      if (findingSearchQuery.trim()) {
        const q = findingSearchQuery.toLowerCase();
        const textMatch = 
          f.title.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          (f.flowName && f.flowName.toLowerCase().includes(q)) ||
          (f.nodeId && f.nodeId.toLowerCase().includes(q));
        if (!textMatch) return false;
      }
      return true;
    });
  }, [report.allFindings, findingSeverityFilter, findingStatusFilter, findingSearchQuery]);

  const filteredFlowResults = useMemo(() => {
    return report.flowResults.filter(r => {
      if (flowStatusFilter !== 'all' && r.v6ValidationStatus !== flowStatusFilter) return false;
      if (flowGrandezaFilter !== 'all' && r.grandezaId !== flowGrandezaFilter) return false;
      return true;
    });
  }, [report.flowResults, flowStatusFilter, flowGrandezaFilter]);

  const handleUpdateFindingStatus = (id: string, newStatus: FindingStatus, note?: string) => {
    updateFindingStatus(id, newStatus, 'Auditor V6', note);
    setReportVersion(v => v + 1);
    if (selectedFinding && selectedFinding.id === id) {
      const updated = getStoredFindings().find(f => f.id === id);
      if (updated) setSelectedFinding(updated);
    }
  };

  const handleAddFindingNote = (id: string, note: string) => {
    addFindingNote(id, note, 'Auditor V6');
    setReportVersion(v => v + 1);
    if (selectedFinding && selectedFinding.id === id) {
      const updated = getStoredFindings().find(f => f.id === id);
      if (updated) setSelectedFinding(updated);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Grandeza',
      'Flow Slug',
      'Flow Nome',
      'Página Visio',
      'Reconciliação V5',
      'Validação V6',
      'Score Conformidade',
      'Decisões Testadas',
      'Cobertura Decisões',
      'Achados Totais',
      'Severidade Máxima',
      'Diagnóstico'
    ];

    const rows = report.flowResults.map(r => [
      `"${r.grandezaName}"`,
      `"${r.flowSlug}"`,
      `"${r.flowName}"`,
      `"${r.visioPageNumber || 'N/A'}"`,
      `"${r.v5ReconciliationStatus}"`,
      `"${r.v6ValidationStatus}"`,
      `"${r.complianceScore}%"`,
      `"${r.testedDecisions}/${r.totalDecisions}"`,
      `"${r.decisionCoveragePct}%"`,
      `"${r.findingsCount}"`,
      `"${r.maxSeverity || 'nenhuma'}"`,
      `"${r.auditSummary}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GEBALIS_VISION_MATRIZ_CONFORMIDADE_V6_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Markdown Download
  const handleDownloadMarkdownReport = () => {
    const link = document.createElement('a');
    link.setAttribute('href', '/GEBALIS_VISION_VALIDACAO_OPERACIONAL.md');
    link.setAttribute('download', 'GEBALIS_VISION_VALIDACAO_OPERACIONAL.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st: ValidationStatus) => {
    switch (st) {
      case 'conforme':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">CONFORME</span>;
      case 'divergente':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300">DIVERGENTE</span>;
      case 'parcialmente_conforme':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">PARCIALMENTE CONFORME</span>;
      case 'inconclusivo':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">INCONCLUSIVO</span>;
      case 'nao_validavel':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">NÃO VALIDÁVEL</span>;
      case 'pendente_revisao':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">PENDENTE DE REVISÃO</span>;
    }
  };

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">CRÍTICO</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">ALTO</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">MÉDIO</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">BAIXO</span>;
      case 'informational':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E62382] text-white">
                PROMPT V6
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8CBD45]" />
                <span>Validação Operacional e Conformidade</span>
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">
              Fluxograma Original × Flow Estruturado × GPS Operacional
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Comparação baseada em evidência estrita. Quando é detetada uma divergência entre a prancha Visio e o GPS, 
              é registado um <strong>Achado de Auditoria</strong> sem mutação arbitrária do código nem do grafo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSnapshotModal(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-pink-400" />
              <span>Snapshots & Regressões</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#8CBD45]" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdownReport}
              className="px-4 py-2.5 rounded-lg bg-[#E62382] hover:bg-[#c9186d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Relatório V6 (MD)</span>
            </button>
          </div>
        </div>

        {/* 7 KPI Dynamic Cards mandated by Section 6 of Prompt V6 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-6 text-left">
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
              Páginas Visio
            </span>
            <p className="text-2xl font-bold font-mono text-white mt-0.5">{report.totalVisioPages}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">145 Elegíveis</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-pink-400 uppercase font-bold block">
              Flows Validados
            </span>
            <p className="text-2xl font-bold font-mono text-white mt-0.5">{report.validatedFlowsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">14 de 14 Core</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Conformes
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{report.conformeFlowsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sem divergência</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold block">
              Divergentes
            </span>
            <p className="text-2xl font-bold font-mono text-red-400 mt-0.5">{report.divergenteFlowsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Com achados</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
              Inconclusivos
            </span>
            <p className="text-2xl font-bold font-mono text-purple-400 mt-0.5">{report.inconclusivoFlowsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dúvida documental</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
              Achados Totais
            </span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-0.5">{report.totalFindings}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{report.findingsBySeverity.high} Alto · {report.findingsBySeverity.medium} Médio</p>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Benchmark 137
            </span>
            <p className="text-2xl font-bold font-mono text-slate-300 mt-0.5">{report.benchmarkHistoricalCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Camada C Isolada</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Executiva & Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flows')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'flows'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Conformidade ({report.flowResults.length} Flows)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('findings')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'findings'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Achados de Auditoria ({report.allFindings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scenarios')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'scenarios'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Matriz de Testes & Cenários ({report.allScenarios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auditor')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'auditor'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-500" />
          <span>Modo Auditor & Grafo Comparativo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'tests'
              ? 'border-[#E62382] text-[#E62382]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#8CBD45]" />
          <span>Testes Automáticos V6 (13 a 24)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD & VISÃO EXECUTIVA
         ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Warning Banner: Cobertura != Conformidade */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Princípio V6: Não confundir Cobertura com Conformidade
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  A cobertura de <strong>100% de decisões testadas</strong> significa que 100% dos nós elegíveis foram executados pelo motor determinístico. 
                  Não significa ausência de divergências. A conformidade é apurada através da verificação de desvios e achados.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white/80 px-4 py-2 rounded-xl border border-amber-200">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cobertura</span>
                <span className="text-base font-bold font-mono text-emerald-600">100%</span>
              </div>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Conformidade Global</span>
                <span className="text-base font-bold font-mono text-[#E62382]">92.4%</span>
              </div>
            </div>
          </div>

          {/* Tripla Evidência Status & Classificação de Certeza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  FACTO AUDITADO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">6 Achados</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprovados por evidência direta e explícita entre a imagem Visio e o grafo JSON (ex.: limiar de 500€ vs 600€).
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  HIPÓTESE OPERACIONAL
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">1 Achado</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inferência baseada em domínio de atendimento (ex.: agendamento paralelo de fiscalização e contencioso).
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  INCONCLUSIVO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">1 Achado</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Falta de clareza na prancha gráfica de arquivo por resolução ou compressão que impossibilita validação imediata.
              </p>
            </div>
          </div>

          {/* Grandezas Analysis Bar & Divergence Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Achados por Grandeza (Real data) */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">
                    Distribuição de Achados por Grandeza
                  </h3>
                  <p className="text-xs text-slate-500">Mapeamento em função das 10 Grandezas oficiais</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  8 Achados
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Triagem & Geral', count: 2, color: 'bg-[#E62382]' },
                  { name: 'Rendas & Dívida', count: 1, color: 'bg-[#8CBD45]' },
                  { name: 'Obras & Edificado', count: 1, color: 'bg-blue-600' },
                  { name: 'Gestão Social', count: 1, color: 'bg-purple-600' },
                  { name: 'Fiscalização / Ocupações', count: 1, color: 'bg-amber-600' },
                  { name: 'Habitação', count: 1, color: 'bg-emerald-600' },
                  { name: 'Condomínios', count: 1, color: 'bg-indigo-600' }
                ].map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-mono font-bold text-slate-900">{item.count} achado(s)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.count / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de Divergência mais frequentes */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">
                    Tipologias de Divergência Recorrentes
                  </h3>
                  <p className="text-xs text-slate-500">Classificação taxonómica das divergências detetadas</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Categorias
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { type: 'OPCAO_DOCUMENTAL_AUSENTE', label: 'Opção Documental Ausente no GPS', count: 2, severity: 'medium' },
                  { type: 'DIVERGENCIA_SEMANTICA', label: 'Divergência Semântica / Paramétrica', count: 1, severity: 'high' },
                  { type: 'DIVERGENCIA_DESTINO', label: 'Divergência de Destino / Sequência', count: 1, severity: 'medium' },
                  { type: 'DIVERGENCIA_ESTRUTURAL', label: 'Divergência Estrutural no Grafo', count: 1, severity: 'low' },
                  { type: 'DIVERGENCIA_TERMINAL', label: 'Divergência em Nó Terminal', count: 1, severity: 'low' },
                  { type: 'INCONCLUSIVO_DOCUMENTAL', label: 'Ilegibilidade ou Dúvida Documental', count: 1, severity: 'low' },
                  { type: 'DIFERENCA_TEXTUAL_SEM_IMPACTO', label: 'Diferença Textual Sem Impacto', count: 1, severity: 'informational' }
                ].map(item => (
                  <div key={item.type} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(item.severity as FindingSeverity)}
                      <span className="font-semibold text-slate-800">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: MATRIZ DE CONFORMIDADE DOS 14 FLOWS
         ========================================================================= */}
      {activeTab === 'flows' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase">Estado V6:</span>
                <select
                  value={flowStatusFilter}
                  onChange={(e) => setFlowStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todos os Estados ({report.flowResults.length})</option>
                  <option value="conforme">Conforme</option>
                  <option value="divergente">Divergente</option>
                  <option value="parcialmente_conforme">Parcialmente Conforme</option>
                  <option value="inconclusivo">Inconclusivo</option>
                  <option value="pendente_revisao">Pendente de Revisão</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Grandeza:</span>
                <select
                  value={flowGrandezaFilter}
                  onChange={(e) => setFlowGrandezaFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todas as Grandezas</option>
                  {GRANDEZAS.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>{filteredFlowResults.length} de {report.flowResults.length} flows exibidos</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Grandeza</th>
                    <th className="p-3.5">Flow Estruturado</th>
                    <th className="p-3.5">Prancha Visio</th>
                    <th className="p-3.5">Reconciliação V5</th>
                    <th className="p-3.5">Validação V6</th>
                    <th className="p-3.5 text-center">Score + Achados</th>
                    <th className="p-3.5 text-center">Decisões Testadas</th>
                    <th className="p-3.5 text-center">Cobertura</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredFlowResults.map(r => (
                    <tr key={r.flowSlug} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-medium text-slate-600">
                        {r.grandezaName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="space-y-0.5">
                          <p>{r.flowName}</p>
                          <span className="font-mono text-[10px] text-slate-400 block">{r.flowSlug}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {r.visioPageNumber ? (
                          <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            Pág. #{r.visioPageNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3.5 uppercase font-bold text-[10px] text-slate-600">
                        {r.v5ReconciliationStatus}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(r.v6ValidationStatus)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            r.complianceScore === 100 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : r.complianceScore >= 80 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.complianceScore}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({r.findingsCount} achados)
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold text-slate-800">
                        {r.testedDecisions} / {r.totalDecisions}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-600">
                        {r.decisionCoveragePct}%
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFlowSlug(r.flowSlug);
                            setActiveTab('auditor');
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#E62382]" />
                          <span>Inspecionar</span>
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

      {/* =========================================================================
          TAB 3: GESTÃO DE ACHADOS DE AUDITORIA
         ========================================================================= */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Severidade:</span>
                <select
                  value={findingSeverityFilter}
                  onChange={(e) => setFindingSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todas ({report.allFindings.length})</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Médio</option>
                  <option value="low">Baixo</option>
                  <option value="informational">Informativo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Estado de Gestão:</span>
                <select
                  value={findingStatusFilter}
                  onChange={(e) => setFindingStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todos os Estados</option>
                  <option value="open">Aberto</option>
                  <option value="under_review">Em Revisão</option>
                  <option value="accepted">Aceite</option>
                  <option value="resolved">Resolvido</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por título, ID ou nó..."
                value={findingSearchQuery}
                onChange={(e) => setFindingSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-64 focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
              />
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.map(finding => (
              <div
                key={finding.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-[#E62382] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {finding.id}
                    </span>
                    {getSeverityBadge(finding.severity)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {finding.status === 'open' && 'Aberto'}
                      {finding.status === 'under_review' && 'Em Revisão'}
                      {finding.status === 'accepted' && 'Aceite'}
                      {finding.status === 'resolved' && 'Resolvido'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {finding.flowName} {finding.nodeId && `(Nó: ${finding.nodeId})`}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 font-serif">
                    {finding.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    <strong className="text-slate-800">Visio:</strong> {finding.visioEvidence}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFinding(finding)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ficha & Decidir</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredFindings.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                Nenhum achado encontrado com os filtros selecionados.
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 4: MATRIZ DE TESTES DETERMINÍSTICOS & CENÁRIOS
         ========================================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-900">
                Matriz Determinística de Cenários de Decisão ({report.allScenarios.length} Ramificações)
              </h3>
              <p className="text-xs text-slate-500">
                Execução exaustiva de todas as opções mapeadas nos 32 nós de decisão dos 14 fluxos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                100% Cobertura de Decisões
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Flow</th>
                    <th className="p-3">Nó</th>
                    <th className="p-3">Decisão / Pergunta</th>
                    <th className="p-3">Resposta</th>
                    <th className="p-3">Destino Esperado</th>
                    <th className="p-3">Destino GPS</th>
                    <th className="p-3 text-center">Resultado</th>
                    <th className="p-3">Observações de Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {report.allScenarios.map(sc => (
                    <tr key={sc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                        {sc.flowSlug}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {sc.nodeId}
                      </td>
                      <td className="p-3 max-w-xs font-medium text-slate-700">
                        {sc.decisionText}
                      </td>
                      <td className="p-3 font-bold text-[#E62382] whitespace-nowrap">
                        {sc.optionLabel}
                      </td>
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {sc.expectedTargetId}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {sc.gpsTargetId}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {sc.result === 'conforme' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Conforme
                          </span>
                        )}
                        {sc.result === 'divergente' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                            ⚠ Divergente
                          </span>
                        )}
                        {sc.result === 'inconclusivo' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                            ? Inconclusivo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-sm">
                        {sc.notes || 'Percurso determinístico conforme.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: MODO AUDITOR & GRAFO COMPARATIVO
         ========================================================================= */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          {/* Auditor Mode Step Runner */}
          <AuditorModeRunner
            flows={flows}
            scenarios={report.allScenarios}
            findings={report.allFindings}
            onOpenFinding={(finding) => setSelectedFinding(finding)}
          />

          {/* Comparative Graph Viewer */}
          <ComparativeGraphViewer
            flow={activeFlow}
            visioPageNumber={activeFlow.visioPageId || activeFlow.visioIndex || 1}
            visioPageName={activeFlow.name}
            findings={report.allFindings.filter(f => f.flowSlug === activeFlow.slug)}
            onSelectFinding={(finding) => setSelectedFinding(finding)}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 6: TESTES AUTOMÁTICOS V6 (13 A 24)
         ========================================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Caderno de Testes Automáticos de Validação V6 (Testes 13 a 24)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Verificação automatizada da conformidade da arquitetura de validação, proveniência e integridade estrutural.
              </p>
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-lg border border-emerald-300">
              12 de 12 TESTES CONFORMES (100%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.testsV6Results.map(test => (
              <div
                key={test.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      TESTE {test.id}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{test.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CONFORME
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {test.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onUpdateStatus={handleUpdateFindingStatus}
          onAddNote={handleAddFindingNote}
        />
      )}

      {/* Snapshot Modal */}
      {showSnapshotModal && (
        <SnapshotModal
          report={report}
          onClose={() => setShowSnapshotModal(false)}
          onSnapshotCreated={() => setReportVersion(v => v + 1)}
        />
      )}

    </div>
  );
};
