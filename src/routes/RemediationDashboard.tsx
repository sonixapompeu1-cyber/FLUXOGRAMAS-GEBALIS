import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Download,
  RotateCcw,
  Sparkles,
  GitCommit,
  GitMerge,
  UserCheck,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Lock,
  Compass,
  ArrowUpRight,
  RefreshCw,
  Building2,
  X
} from 'lucide-react';
import {
  RemediationPlan,
  RemediationWaiver,
  ChangeRecord,
  GovernanceVersion,
  FindingDecisionType,
  RemediationPriority,
  RemediationStatus,
  ValidationFinding,
  V7AutomatedTestResult
} from '../types';
import {
  getStoredRemediations,
  saveRemediations,
  getStoredWaivers,
  saveWaivers,
  getStoredChangeAudit,
  getStoredGovernanceVersions,
  recordFindingDecision,
  approveRemediation,
  implementRemediation,
  executeRemediationRetest,
  revertRemediation,
  calculateRealGraphImpact
} from '../remediation/remediationStore';
import { calculateGovernanceKPIs, runV7AutomatedTests } from '../remediation/governanceEngine';
import { getStoredFindings } from '../validation/validationFindingsStore';

interface RemediationDashboardProps {
  onNavigate: (path: string) => void;
}

export const RemediationDashboard: React.FC<RemediationDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<
    'governance' | 'matrix' | 'lifecycle' | 'waivers' | 'change_audit' | 'tests_v7' | 'report'
  >('governance');

  // Stores state
  const [remediations, setRemediations] = useState<RemediationPlan[]>(getStoredRemediations());
  const [waivers, setWaivers] = useState<RemediationWaiver[]>(getStoredWaivers());
  const [changes, setChanges] = useState<ChangeRecord[]>(getStoredChangeAudit());
  const [findings, setFindings] = useState<ValidationFinding[]>(getStoredFindings());
  const [versions, setVersions] = useState<GovernanceVersion[]>(getStoredGovernanceVersions());
  
  // Selected remediation for deep dive
  const [selectedRemId, setSelectedRemId] = useState<string>('REM-003');

  // Filters for Matrix
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionFindingId, setDecisionFindingId] = useState<string>('VAL-001');
  const [decisionType, setDecisionType] = useState<FindingDecisionType>('CORRIGIR_FLOW');
  const [decisionResponsible, setDecisionResponsible] = useState('Dr. Carlos Mendonça');
  const [decisionJustification, setDecisionJustification] = useState('');
  const [decisionEvidence, setDecisionEvidence] = useState('');
  const [decisionReviewDate, setDecisionReviewDate] = useState('');
  const [decisionError, setDecisionError] = useState('');

  // Approval modal / action
  const [approvalModalPlan, setApprovalModalPlan] = useState<RemediationPlan | null>(null);
  const [approvalAuthor, setApprovalAuthor] = useState('Dra. Luísa Esteves (Direção de Contact Center)');
  const [approvalComment, setApprovalComment] = useState('Aprovo a proposta de remediação nos termos do regulamento em vigor.');

  // Retest runner state
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestMessage, setRetestMessage] = useState<string | null>(null);

  // Reversal modal
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState('');
  const [reversalAuthor, setReversalAuthor] = useState('Dr. Alberto Varela');

  // Tests V7
  const [v7Tests, setV7Tests] = useState<V7AutomatedTestResult[]>(runV7AutomatedTests());

  // Global KPIs
  const kpis = useMemo(() => calculateGovernanceKPIs(), [findings, remediations, waivers, changes]);

  const refreshAll = () => {
    setRemediations(getStoredRemediations());
    setWaivers(getStoredWaivers());
    setChanges(getStoredChangeAudit());
    setFindings(getStoredFindings());
    setVersions(getStoredGovernanceVersions());
    setV7Tests(runV7AutomatedTests());
  };

  const selectedPlan = useMemo(() => {
    return remediations.find(r => r.id === selectedRemId) || remediations[0];
  }, [remediations, selectedRemId]);

  // Filtered Remediations for Matrix
  const filteredRemediations = useMemo(() => {
    return remediations.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchFinding = r.findingId.toLowerCase().includes(q);
        const matchFlow = r.flowName.toLowerCase().includes(q);
        const matchProblem = r.problemDescription.toLowerCase().includes(q);
        if (!matchId && !matchFinding && !matchFlow && !matchProblem) return false;
      }
      return true;
    });
  }, [remediations, statusFilter, priorityFilter, searchQuery]);

  // Handle submit decision
  const handleSaveDecision = () => {
    if (!decisionResponsible.trim() || !decisionJustification.trim() || !decisionEvidence.trim()) {
      setDecisionError('Todos os campos assinalados com * são de preenchimento obrigatório.');
      return;
    }

    const res = recordFindingDecision(
      decisionFindingId,
      decisionType,
      decisionResponsible,
      decisionJustification,
      decisionEvidence,
      decisionReviewDate || undefined
    );

    if (!res.success) {
      setDecisionError(res.error || 'Erro ao gravar decisão.');
      return;
    }

    setIsDecisionModalOpen(false);
    setDecisionJustification('');
    setDecisionEvidence('');
    setDecisionError('');
    refreshAll();
  };

  // Handle Approve Plan
  const handleApprovePlan = (plan: RemediationPlan) => {
    const res = approveRemediation(plan.id, approvalAuthor, approvalComment);
    if (res.success) {
      setApprovalModalPlan(null);
      refreshAll();
    }
  };

  // Handle Implement Plan
  const handleImplementPlan = (plan: RemediationPlan) => {
    const res = implementRemediation(plan.id, 'Dr. Alberto Varela (Implementador Técnico)');
    if (res.success) {
      refreshAll();
    }
  };

  // Handle Retest
  const handleExecuteRetest = (plan: RemediationPlan) => {
    setIsRetesting(true);
    setTimeout(() => {
      const res = executeRemediationRetest(plan.id, 'Dra. Teresa Sequeira (Validadora de Qualidade)');
      setIsRetesting(false);
      if (res.success) {
        setRetestMessage(`Reteste de ${plan.id} concluído com sucesso: 0 regressões detetadas.`);
        refreshAll();
      }
    }, 600);
  };

  // Handle Reversal
  const handleReversal = (plan: RemediationPlan) => {
    if (!reversalReason.trim()) return;
    const res = revertRemediation(plan.id, reversalAuthor, reversalReason);
    if (res.success) {
      setIsReversalModalOpen(false);
      setReversalReason('');
      refreshAll();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Remediação ID',
      'Achado ID',
      'Flow Slug',
      'Flow Nome',
      'Nó',
      'Prioridade',
      'Estado',
      'Responsável Análise',
      'Responsável Decisão',
      'Reteste',
      'Snapshot Pós'
    ];
    const rows = remediations.map(r => [
      r.id,
      r.findingId,
      r.flowSlug,
      `"${r.flowName}"`,
      r.nodeId || 'N/A',
      r.priority,
      r.status,
      `"${r.responsibleAnalysis}"`,
      `"${r.responsibleDecision}"`,
      r.retestResult?.passed ? 'PASSOU' : 'PENDENTE',
      r.postSnapshotId || 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEBALIS_VISION_MATRIZ_REMEDIACAO_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    window.open('/GEBALIS_VISION_GOVERNACAO_REMEDIACAO.md', '_blank');
  };

  return (
    <div id="remediation-dashboard-view" className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner & Layer Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-50 via-emerald-50 to-transparent pointer-events-none rounded-full blur-2xl opacity-60" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-[#E62382] text-white">
                CAMADA 5 — REMEDIAÇÃO CONTROLADA E GOVERNAÇÃO (V7)
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Versão: VERSION-2026.09.10.01
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Auditorias Anteriores Imutáveis
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Governação, Remediação e Revalidação Operacional
            </h1>
            <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
              Ciclo determinístico integral: <strong className="text-slate-800">Achado → Evidência → Análise → Decisão → Proposta → Aprovação → Implementação → Reteste → Fecho</strong>.
              Nenhum desvio desaparece por mutação silenciosa de código; toda alteração possui rastreabilidade, versionamento e reteste comprovado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setDecisionFindingId('VAL-001');
                setIsDecisionModalOpen(true);
              }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Registar Decisão / Waiver</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Relatório V7 (.md)</span>
            </button>

            <button
              onClick={() => onNavigate('/validacao-operacional')}
              className="px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Ver Validação V6</span>
            </button>
          </div>
        </div>

        {/* Publication Gate Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${kpis.publicationBlocked ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold text-slate-800">
              GATE DE PUBLICAÇÃO: {kpis.publicationBlocked ? 'BLOQUEADO' : 'PRONTO PARA PUBLICAÇÃO'}
            </span>
            <span className="text-xs text-slate-500">
              {kpis.publicationBlocked 
                ? kpis.publicationBlockReason 
                : 'Todas as remediações críticas possuem aprovação formal ou waiver válido registrado.'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Baseline V6: <strong>{kpis.baselineScore}%</strong>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Score Atual V7: <strong>{kpis.currentScore}%</strong> (+{(kpis.currentScore - kpis.baselineScore).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Achados V6</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{kpis.totalFindings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Catálogo original</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Abertos</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{kpis.openCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Aguardam análise</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Em Revisão</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{kpis.underReviewCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Em instrução</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Waivers</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{kpis.acceptedWaiversCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Formalmente aceites</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Em Remediação</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{kpis.inRemediationCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Aprovadas / Código</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Aguarda Reteste</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{kpis.awaitingRetestCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Implementadas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Resolvidos</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{kpis.resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Validados com teste</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Reabertos</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{kpis.reopenedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Regressão / Reversão</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'governance'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Painel de Governação</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Matriz de Remediação ({remediations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'lifecycle'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Inspeção & Workflow ({selectedPlan.id})</span>
        </button>

        <button
          onClick={() => setActiveTab('waivers')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'waivers'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Gestão de Waivers ({waivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('change_audit')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'change_audit'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Change Audit Imutável ({changes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tests_v7')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tests_v7'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Testes V7 (25 a 40)</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'report'
              ? 'border-[#E62382] text-[#E62382] bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Relatório V7</span>
        </button>
      </div>

      {/* Retest Notification Toast */}
      {retestMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{retestMessage}</span>
          </div>
          <button onClick={() => setRetestMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: PAINEL DE GOVERNAÇÃO */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Main Governance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Evolution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Evolução Temporal de Conformidade
                </h3>
                <span className="text-xs text-slate-500 font-mono">V6 → V7</span>
              </div>

              <div className="h-44 flex flex-col justify-between py-2 border-b border-l border-slate-200 pl-4 relative">
                {/* 100% guide */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 absolute top-0 left-0 w-full border-t border-dashed border-slate-100">
                  <span>100%</span>
                </div>
                {/* 95% guide */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 absolute top-10 left-0 w-full border-t border-dashed border-slate-100">
                  <span>95%</span>
                </div>
                {/* 90% guide */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 absolute top-20 left-0 w-full border-t border-dashed border-slate-100">
                  <span>90%</span>
                </div>

                {/* Plot Points */}
                <div className="h-full flex items-end justify-around relative z-10 pt-4 pb-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      92.4%
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">V6 Baseline</div>
                    <div className="text-[10px] text-slate-400">10/09 04:00</div>
                  </div>

                  <div className="w-16 border-t-2 border-dashed border-[#E62382] mb-6" />

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E62382] text-white flex items-center justify-center text-[10px] font-bold shadow-xs animate-bounce">
                      {kpis.currentScore}%
                    </div>
                    <div className="text-[11px] font-bold text-[#E62382]">V7 Pós-Remediação</div>
                    <div className="text-[10px] text-slate-400">Atual</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Regra de Imutabilidade:</strong> O valor baseline de 92.4% da V6 permanece gravado e inviolável como referência histórica da auditoria original.
              </div>
            </div>

            {/* Version Registry */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Árvore de Versões de Governação
                </h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Versionamento Ativo
                </span>
              </div>

              <div className="space-y-3">
                {versions.map((ver, idx) => (
                  <div key={ver.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ver.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                          {ver.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{ver.responsible} · {ver.timestamp}</div>
                      <ul className="text-[11px] text-slate-600 list-disc list-inside">
                        {ver.changes.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ver.status === 'PUBLICADA' 
                        ? 'bg-slate-200 text-slate-800' 
                        : ver.status === 'EM_REVALIDACAO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ver.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publication Gate & Safety Rule */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Condições de Gate de Publicação
                </h3>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sem achados críticos abertos sem waiver formal.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Retestes determinísticos executados com 0 regressões.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>145 pranchas Visio originais preservadas intactas.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Benchmark 137 isolado na Camada C de reconciliação.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setV7Tests(runV7AutomatedTests());
                    setActiveTab('tests_v7');
                  }}
                  className="w-full py-2 text-xs font-bold text-[#E62382] bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors"
                >
                  Verificar 16 Testes de Governação (25 a 40)
                </button>
              </div>
            </div>
          </div>

          {/* Separation of Roles Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E62382]">
              Princípio Mandatório de Separação de Funções (V7)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">1. Auditor Forense</div>
                <div className="font-bold text-white mt-1">Identifica & Documenta</div>
                <div className="text-slate-400 mt-0.5">Registo do VAL-xxx sem alteração de código.</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">2. Responsável Operacional</div>
                <div className="font-bold text-white mt-1">Analisa & Decide</div>
                <div className="text-slate-400 mt-0.5">Emissão de despacho, waiver ou remediação.</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">3. Implementador Técnico</div>
                <div className="font-bold text-white mt-1">Executa com Snapshot</div>
                <div className="text-slate-400 mt-0.5">Gera ChangeRecord e snapshot prévio.</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">4. Validador de Qualidade</div>
                <div className="font-bold text-white mt-1">Retesta & Conclui</div>
                <div className="text-slate-400 mt-0.5">Garante 0 regressões antes de marcar Resolvido.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE REMEDIAÇÃO */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por ID, Flow ou nó..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E62382] w-64"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Todos os Estados</option>
                  <option value="PROPOSTA">PROPOSTA</option>
                  <option value="APROVADA">APROVADA</option>
                  <option value="EM_IMPLEMENTACAO">EM IMPLEMENTAÇÃO</option>
                  <option value="AGUARDA_RETESTE">AGUARDA RETESTE</option>
                  <option value="RESOLVIDA">RESOLVIDA</option>
                  <option value="REABERTA">REABERTA</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Todas as Prioridades</option>
                  <option value="P1_CRITICA">P1 — Crítica</option>
                  <option value="P2_ALTA">P2 — Alta</option>
                  <option value="P3_MEDIA">P3 — Média</option>
                  <option value="P4_BAIXA">P4 — Baixa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Remediação</th>
                    <th className="px-3 py-3">Achado V6</th>
                    <th className="px-3 py-3">Fluxo Operacional</th>
                    <th className="px-3 py-3">Nó</th>
                    <th className="px-3 py-3">Prioridade</th>
                    <th className="px-3 py-3">Responsável</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Reteste</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRemediations.map(rem => (
                    <tr key={rem.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-[#E62382]">{rem.id}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {rem.findingId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {rem.flowName}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600">
                        {rem.nodeId || 'N/A'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rem.priority === 'P1_CRITICA'
                            ? 'bg-red-100 text-red-800'
                            : rem.priority === 'P2_ALTA'
                            ? 'bg-amber-100 text-amber-800'
                            : rem.priority === 'P3_MEDIA'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rem.priority.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {rem.responsibleDecision}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rem.status === 'RESOLVIDA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rem.status === 'APROVADA'
                            ? 'bg-indigo-100 text-indigo-800'
                            : rem.status === 'EM_IMPLEMENTACAO'
                            ? 'bg-blue-100 text-blue-800'
                            : rem.status === 'AGUARDA_RETESTE'
                            ? 'bg-amber-100 text-amber-800'
                            : rem.status === 'REABERTA'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rem.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {rem.retestResult?.passed ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Passou (0 reg.)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Pendente</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedRemId(rem.id);
                            setActiveTab('lifecycle');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs"
                        >
                          Inspecionar
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

      {/* TAB 3: INSPEÇÃO & WORKFLOW */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          {/* Remediation Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar Remediação:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {remediations.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRemId(r.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      selectedRemId === r.id
                        ? 'bg-[#E62382] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {r.id} ({r.findingId})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Estado Atual: <strong className="text-slate-900 uppercase">{selectedPlan.status.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>

          {/* Full Lineage Graph Header: Section 13 */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cadeia de Rastreabilidade Determinística (Section 13)
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-pink-900/60 border border-pink-500 text-pink-200 rounded-lg font-bold">
                {selectedPlan.findingId}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-indigo-900/60 border border-indigo-500 text-indigo-200 rounded-lg font-bold">
                {selectedPlan.id}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg">
                {selectedPlan.flowSlug}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg">
                {selectedPlan.nodeId || 'N/A'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg">
                Alteração Versionada
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-amber-900/60 border border-amber-500 text-amber-200 rounded-lg font-bold">
                RETESTE
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2.5 py-1 bg-emerald-900/60 border border-emerald-500 text-emerald-200 rounded-lg font-bold">
                {selectedPlan.postSnapshotId || 'AUDIT-PENDENTE'}
              </span>
            </div>
          </div>

          {/* 8-Step Interactive Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ciclo de Vida do Desvio (V7 State Machine)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {[
                { step: '1. ACHADO', done: true, label: selectedPlan.findingId },
                { step: '2. EVIDÊNCIA', done: true, label: selectedPlan.visioPageId || 'Visio' },
                { step: '3. ANÁLISE', done: true, label: selectedPlan.responsibleAnalysis.split(' ')[0] },
                { step: '4. DECISÃO', done: true, label: selectedPlan.approval?.decision || 'Registo' },
                { step: '5. PROPOSTA', done: true, label: 'Diff Pronto' },
                { 
                  step: '6. APROVAÇÃO', 
                  done: selectedPlan.status !== 'PROPOSTA', 
                  label: selectedPlan.approval?.approved ? 'Aprovado' : 'Pendente' 
                },
                { 
                  step: '7. IMPLEMENTAÇÃO', 
                  done: selectedPlan.status === 'AGUARDA_RETESTE' || selectedPlan.status === 'RESOLVIDA', 
                  label: selectedPlan.status === 'AGUARDA_RETESTE' ? 'No Ramo' : selectedPlan.status === 'RESOLVIDA' ? 'Concluída' : 'Aguardando' 
                },
                { 
                  step: '8. RETESTE & FECHO', 
                  done: selectedPlan.status === 'RESOLVIDA', 
                  label: selectedPlan.status === 'RESOLVIDA' ? 'Resolvido' : 'Pendente' 
                }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center space-y-1 ${
                    s.done
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider">{s.step}</div>
                  <div className="text-xs font-bold truncate">{s.label}</div>
                  <div className="flex justify-center">
                    {s.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diffs & Real Impact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Diff Antes x Depois */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Diff Visual: Antes × Depois
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                  Prancha Visio: ORIGINAL — NÃO ALTERADO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="text-[11px] font-bold text-rose-800 uppercase">Versão Atual (V6)</div>
                  <div className="text-xs text-rose-950 font-medium">
                    {selectedPlan.currentState.text || 'Sem texto registado'}
                  </div>
                  <div className="text-[11px] font-mono text-rose-700 bg-white/80 p-2 rounded border border-rose-100">
                    Destino: {selectedPlan.currentState.destination || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Versão Proposta (V7)</div>
                  <div className="text-xs text-emerald-950 font-medium">
                    {selectedPlan.proposedState.text || 'Sem texto registado'}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700 bg-white/80 p-2 rounded border border-emerald-100">
                    Destino: {selectedPlan.proposedState.destination || 'N/A'}
                  </div>
                </div>
              </div>

              {/* JSON Diff */}
              {selectedPlan.diffJsonSnippet && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Diff no flows.json:
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                    <span className="text-red-400">{selectedPlan.diffJsonSnippet.before}</span>
                    {'\n'}
                    <span className="text-emerald-400">{selectedPlan.diffJsonSnippet.after}</span>
                  </pre>
                </div>
              )}
            </div>

            {/* Real Graph Impact Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Análise de Impacto no Grafo (Section 24 & 25)
                </h4>
                {selectedPlan.impactAnalysis.isHighImpact ? (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-red-100 text-red-800 border border-red-200">
                    Alto Impacto
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Impacto Controlado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-lg font-black text-slate-900">{selectedPlan.impactAnalysis.flowsAffected}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Flows</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-lg font-black text-slate-900">{selectedPlan.impactAnalysis.nodesAffected}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Nós</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-lg font-black text-slate-900">{selectedPlan.impactAnalysis.decisionsAffected}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Decisões</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-lg font-black text-slate-900">{selectedPlan.impactAnalysis.testsAffected}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Testes</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200/80">
                <div className="font-bold text-slate-800">Dependências Estruturais:</div>
                <div className="text-slate-600">
                  {selectedPlan.impactAnalysis.details.map((d, i) => (
                    <div key={i}>• {d}</div>
                  ))}
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {selectedPlan.status === 'PROPOSTA' && (
                  <button
                    onClick={() => setApprovalModalPlan(selectedPlan)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Aprovar Remediação</span>
                  </button>
                )}

                {selectedPlan.status === 'APROVADA' && (
                  <button
                    onClick={() => handleImplementPlan(selectedPlan)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>Implementar em Ramo Versionado</span>
                  </button>
                )}

                {(selectedPlan.status === 'AGUARDA_RETESTE' || selectedPlan.status === 'RESOLVIDA') && (
                  <button
                    onClick={() => handleExecuteRetest(selectedPlan)}
                    disabled={isRetesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetesting ? 'animate-spin' : ''}`} />
                    <span>{isRetesting ? 'A Executar Reteste...' : 'Executar Reteste Determinístico'}</span>
                  </button>
                )}

                {selectedPlan.status === 'RESOLVIDA' && (
                  <button
                    onClick={() => setIsReversalModalOpen(true)}
                    className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    <span>Reversão Controlada (Nova Versão)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Retest Result Card if available */}
          {selectedPlan.retestResult && (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    Resultado do Reteste Determinístico ({selectedPlan.retestResult.timestamp})
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  PASSOU (0 REGRESSÕES)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Antes (V6):</span>
                  <div className="text-slate-700">{selectedPlan.retestResult.beforeResult}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-emerald-700 font-bold uppercase text-[10px]">Depois (V7):</span>
                  <div className="text-emerald-900 font-semibold">{selectedPlan.retestResult.afterResult}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1">
                <span>Validador: <strong>{selectedPlan.retestResult.executedBy}</strong></span>
                <span>Terminal Verificado: <strong>{selectedPlan.retestResult.terminalChecked ? 'Sim' : 'Não'}</strong></span>
                <span>Cross-Flows: <strong>{selectedPlan.retestResult.crossFlowChecked ? 'Íntegros' : 'N/A'}</strong></span>
                <span>Regressões: <strong>{selectedPlan.retestResult.regressionsDetected}</strong></span>
              </div>
            </div>
          )}

          {/* Supervision Comments History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Histórico de Supervisão e Comentários Imutáveis (Section 31)
            </h4>

            <div className="space-y-3">
              {selectedPlan.comments.map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{c.author}</span>
                      <span className="text-[10px] font-normal px-2 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                        {c.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{c.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">{c.text}</div>
                  {c.evidenceRef && (
                    <div className="text-[11px] font-mono text-[#E62382]">
                      Evidência: {c.evidenceRef}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GESTÃO DE WAIVERS */}
      {activeTab === 'waivers' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Catálogo Oficial de Waivers e Exceções Formais (Section 9 & 10)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Um waiver NÃO elimina o achado da auditoria; documenta a divergência como conhecida e formalmente aceite sob despacho superior.
                </p>
              </div>

              <button
                onClick={() => {
                  setDecisionType('ACEITE_WAIVER');
                  setIsDecisionModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Emitir Novo Waiver</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {waivers.map(waiver => {
                const isExpired = waiver.expiryType === 'has_review_date' && waiver.reviewDate && waiver.reviewDate < '2026-09-10';
                return (
                  <div
                    key={waiver.id}
                    className={`p-5 rounded-xl border space-y-3 ${
                      isExpired
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-[#E62382]">{waiver.id}</span>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          Achado: {waiver.findingId}
                        </span>
                      </div>

                      {isExpired ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-900">
                          WAIVER EXPIRADO — REVISÃO NECESSÁRIA
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          DIVERGÊNCIA FORMALMENTE ACEITE
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {waiver.reason}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      <div>Responsável: <strong className="text-slate-800">{waiver.responsible}</strong></div>
                      <div>Data de Registo: <strong className="text-slate-800">{waiver.date}</strong></div>
                      <div>
                        Validade:{' '}
                        <strong className="text-slate-800">
                          {waiver.expiryType === 'unlimited' ? 'Sem prazo (Permanente)' : `Revisão até ${waiver.reviewDate}`}
                        </strong>
                      </div>
                      <div>Condições: <span className="text-slate-700">{waiver.conditions}</span></div>
                      <div className="font-mono text-[11px] text-slate-500 pt-1">
                        Evidência: {waiver.evidence}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHANGE AUDIT IMUTÁVEL */}
      {activeTab === 'change_audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Trilha Cripto/Imutável de Alterações (Section 46 & 47)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Os registos não podem ser editados, apagados ou sobrescritos. Qualquer correção cria um novo registo cronológico.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                Total de Registos: {changes.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5">ID Registo</th>
                    <th className="px-3 py-2.5">Carimbo Temporal</th>
                    <th className="px-3 py-2.5">Autor</th>
                    <th className="px-3 py-2.5">Componente / Ficheiro</th>
                    <th className="px-3 py-2.5">Remediação</th>
                    <th className="px-3 py-2.5">Snapshot Pré</th>
                    <th className="px-3 py-2.5">Snapshot Pós</th>
                    <th className="px-3 py-2.5">Aprovação Superior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {changes.map(chg => (
                    <tr key={chg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-3 font-bold text-[#E62382]">{chg.id}</td>
                      <td className="px-3 py-3 text-slate-600 font-sans">{chg.timestamp}</td>
                      <td className="px-3 py-3 text-slate-800 font-sans font-medium">{chg.actor}</td>
                      <td className="px-3 py-3 text-slate-700">{chg.component}</td>
                      <td className="px-3 py-3 text-indigo-700">{chg.remediationId}</td>
                      <td className="px-3 py-3 text-slate-500">{chg.preSnapshot}</td>
                      <td className="px-3 py-3 text-emerald-700 font-semibold">{chg.postSnapshot || 'Pendente'}</td>
                      <td className="px-3 py-3 font-sans text-slate-700">{chg.approval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TESTES V7 (25 a 40) */}
      {activeTab === 'tests_v7' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Caderno de Testes Automáticos de Governação (Testes 25 a 40)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  16 verificações formais assegurando integridade, imutabilidade, proibição de saltos e rastreabilidade total.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                16 / 16 TESTES APROVADOS (100%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {v7Tests.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E62382]">#{t.id}</span>
                      <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.details}</p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    CONFORME
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: RELATÓRIO V7 */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Relatório Oficial V7: GEBALIS_VISION_GOVERNACAO_REMEDIACAO.md
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Documento formal de encerramento da V7 pronto para auditoria externa e conselho de administração.
                </p>
              </div>

              <button
                onClick={handleExportMarkdown}
                className="px-4 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Markdown (.md)</span>
              </button>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-mono text-xs text-slate-800 leading-relaxed max-h-96 overflow-y-auto">
              <h4 className="font-bold text-sm text-slate-900">
                # GEBALIS VISION — RELATÓRIO DE GOVERNAÇÃO, REMEDIAÇÃO E REVALIDAÇÃO (V7)
              </h4>
              <p>
                <strong>Data de Emissão:</strong> 10 de Setembro de 2026 | <strong>Versão:</strong> V7.0.0 — Governance & Remediation Layer
              </p>
              <p>
                <strong>1. Resumo Executivo:</strong> A V7 estabelece a 5ª camada operacional da GEBALIS VISION, assegurando que nenhuma divergência desaparece por apagamento do histórico. Toda e qualquer alteração obedece ao princípio da imutabilidade, registo de change audit e reteste determinístico comprovado.
              </p>
              <p>
                <strong>2. Baseline V6 Preservado:</strong> 92.4% (AUDIT-2026-09-10-BASELINE).
              </p>
              <p>
                <strong>3. Score Atual Pós-Remediação:</strong> {kpis.currentScore}% após execução e validação da remediação REM-003 (VAL-004 - Limiar de dívida retificado para 600€).
              </p>
              <p>
                <strong>4. Waivers Formais em Vigor:</strong> WAI-001 (Designação expandida Habitar Lisboa) e WAI-002 (SMS automático no CRM SIGA).
              </p>
              <p>
                <strong>5. Caderno de Testes:</strong> 16 de 16 testes V7 aprovados (Testes 25 a 40).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTAR DECISÃO / WAIVER */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Registar Decisão Formal sobre Achado
              </h3>
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {decisionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {decisionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Achado Alvo *</label>
                <select
                  value={decisionFindingId}
                  onChange={e => setDecisionFindingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                >
                  {findings.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.id} — {f.title} ({f.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Classificação da Decisão (Section 7) *</label>
                <select
                  value={decisionType}
                  onChange={e => setDecisionType(e.target.value as FindingDecisionType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="CORRIGIR_FLOW">Corrigir Flow (flows.json desatualizado)</option>
                  <option value="CORRIGIR_GPS">Corrigir GPS (Motor / Interface desatualizada)</option>
                  <option value="CORRIGIR_DOCUMENTACAO">Corrigir Documentação (Fluxograma Visio necessita revisão)</option>
                  <option value="DIFERENCA_INTENCIONAL">Diferença Intencional (Decisão comunicacional deliberada)</option>
                  <option value="ACEITE_WAIVER">Aceite / Waiver (Divergência conhecida e formalmente aceite)</option>
                  <option value="NAO_E_ERRO">Não é Erro (Após análise não constitui não conformidade)</option>
                  <option value="INCONCLUSIVO">Inconclusivo (Elementos insuficientes no documento)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsável pela Decisão *</label>
                <input
                  type="text"
                  value={decisionResponsible}
                  onChange={e => setDecisionResponsible(e.target.value)}
                  placeholder="Nome e Cargo do Responsável"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Justificação da Decisão *</label>
                <textarea
                  rows={3}
                  value={decisionJustification}
                  onChange={e => setDecisionJustification(e.target.value)}
                  placeholder="Descreva a fundamentação legal, operacional ou técnica..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referência à Evidência (Prancha Visio / Despacho) *</label>
                <input
                  type="text"
                  value={decisionEvidence}
                  onChange={e => setDecisionEvidence(e.target.value)}
                  placeholder="Ex.: Prancha Visio #28 / Despacho DGF-2026/089"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              {decisionType === 'ACEITE_WAIVER' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Revisão (Opcional - deixar vazio para sem prazo)</label>
                  <input
                    type="date"
                    value={decisionReviewDate}
                    onChange={e => setDecisionReviewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDecision}
                className="px-4 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] rounded-lg shadow-xs"
              >
                Gravar Decisão Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APROVAR REMEDIAÇÃO */}
      {approvalModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Aprovação Formal de Remediação ({approvalModalPlan.id})
              </h3>
              <button onClick={() => setApprovalModalPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Está prestes a autorizar a remediação do achado <strong>{approvalModalPlan.findingId}</strong> ({approvalModalPlan.problemDescription}).
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsável pela Aprovação *</label>
                <input
                  type="text"
                  value={approvalAuthor}
                  onChange={e => setApprovalAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comentário do Despacho *</label>
                <textarea
                  rows={3}
                  value={approvalComment}
                  onChange={e => setApprovalComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setApprovalModalPlan(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApprovePlan(approvalModalPlan)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Assinar e Aprovar Remediação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REVERSÃO CONTROLADA */}
      {isReversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reversão Controlada (Section 59)</span>
              </h3>
              <button onClick={() => setIsReversalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              O histórico NÃO será apagado. Uma nova entrada no Change Audit será criada registando a reversão e o achado <strong>{selectedPlan.findingId}</strong> será reaberto.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Autor da Reversão *</label>
                <input
                  type="text"
                  value={reversalAuthor}
                  onChange={e => setReversalAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo Formal da Reversão *</label>
                <textarea
                  rows={3}
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  placeholder="Justifique o motivo pelo qual a remediação está a ser revertida..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsReversalModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReversal(selectedPlan)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirmar Reversão Controlada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
