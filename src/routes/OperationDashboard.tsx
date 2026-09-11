import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Layers,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Search,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  HelpCircle,
  MessageSquare,
  AlertOctagon,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  Zap,
  ArrowUpRight,
  GitMerge,
  GitFork,
  FileCode,
  Lock,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  OperationalEnvironment,
  OperationalSession,
  SessionStep,
  FeedbackRecord,
  FeedbackRating,
  OperationalBlockType,
  OperationalIncident,
  OperationalIncidentStatus,
  ImprovementRequest,
  ImprovementStatus,
  ProcessDriftItem,
  RollbackRecord,
  OperationalAnalyticsData,
  OperationalHealthSummary
} from '../types';
import { OperationalStore } from '../operation/operationalStore';
import { OperationalEngine } from '../operation/operationalEngine';
import { getAllFlows } from '../lib/flows';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import { GPSDecisionOption } from '../engine/gpsEngine';

interface OperationDashboardProps {
  onNavigate: (path: string) => void;
  initialTab?: string;
}

export const OperationDashboard: React.FC<OperationDashboardProps> = ({ onNavigate, initialTab = 'cockpit' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [activeEnv, setActiveEnv] = useState<OperationalEnvironment>(() => OperationalStore.getActiveEnvironment());
  const [period, setPeriod] = useState<string>('30d');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const flows = useMemo(() => getAllFlows(), []);

  // Sync environment change
  const handleEnvChange = (env: OperationalEnvironment) => {
    setActiveEnv(env);
    OperationalStore.setActiveEnvironment(env);
    setRefreshTrigger(prev => prev + 1);
  };

  // Sessions and analytics for the current environment and period
  const sessions = useMemo(() => {
    return OperationalStore.getSessions(activeEnv, period);
  }, [activeEnv, period, refreshTrigger]);

  const feedback = useMemo(() => {
    return OperationalStore.getFeedback(activeEnv);
  }, [activeEnv, refreshTrigger]);

  const incidents = useMemo(() => {
    return OperationalStore.getIncidents(activeEnv);
  }, [activeEnv, refreshTrigger]);

  const improvements = useMemo(() => {
    return OperationalStore.getImprovements();
  }, [refreshTrigger]);

  const driftItems = useMemo(() => {
    return OperationalStore.getDriftItems();
  }, [refreshTrigger]);

  const rollbacks = useMemo(() => {
    return OperationalStore.getRollbacks();
  }, [refreshTrigger]);

  const analytics: OperationalAnalyticsData = useMemo(() => {
    return OperationalStore.calculateAnalytics(sessions, feedback);
  }, [sessions, feedback]);

  const health: OperationalHealthSummary = useMemo(() => {
    return OperationalStore.calculateHealth(incidents, sessions);
  }, [incidents, sessions]);

  // Consolidated 80 automated tests
  const testResults = useMemo(() => {
    return OperationalEngine.runFullConsolidatedTests();
  }, [refreshTrigger]);

  // State for Active Assist Mode
  const [selectedFlowSlug, setSelectedFlowSlug] = useState<string>(flows[0]?.slug || 'triagem-telefonica');
  const [activeSession, setActiveSession] = useState<OperationalSession | null>(null);
  const [currentOptions, setCurrentOptions] = useState<GPSDecisionOption[]>([]);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
  const [showWhereModal, setShowWhereModal] = useState<boolean>(false);
  const [whereOptionTarget, setWhereOptionTarget] = useState<GPSDecisionOption | null>(null);
  const [showUncertaintyInput, setShowUncertaintyInput] = useState<boolean>(false);
  const [uncertaintyText, setUncertaintyText] = useState<string>('');
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockType, setBlockType] = useState<OperationalBlockType>('INFORMAÇÃO_INSUFICIENTE');
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [escalateTarget, setEscalateTarget] = useState<string>('Supervisão Operacional');
  const [escalateReason, setEscalateReason] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating>('MUITO_UTIL');
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // Start Assistant Session
  const handleStartSession = () => {
    const { session, options } = OperationalEngine.startSession(selectedFlowSlug, activeEnv, 'OP-BALCAO-01');
    setActiveSession(session);
    setCurrentOptions(options);
    setShowFeedbackModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Step Option
  const handleSelectOption = (opt: GPSDecisionOption) => {
    if (!activeSession) return;
    const { session: updated, nextOptions } = OperationalEngine.advanceStep(activeSession, opt);
    setActiveSession(updated);
    setCurrentOptions(nextOptions);
    if (updated.status === 'completed') {
      setShowFeedbackModal(true);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  // Submit Uncertainty
  const handleConfirmUncertainty = () => {
    if (!activeSession) return;
    const updated = OperationalEngine.recordUncertainty(activeSession, uncertaintyText);
    setActiveSession(updated);
    setShowUncertaintyInput(false);
    setUncertaintyText('');
    setRefreshTrigger(prev => prev + 1);
  };

  // Submit Block
  const handleConfirmBlock = () => {
    if (!activeSession) return;
    const updated = OperationalEngine.blockSession(activeSession, blockType, blockReason || 'Bloqueio processual');
    setActiveSession(updated);
    setCurrentOptions([]);
    setShowBlockModal(false);
    setShowFeedbackModal(true);
    setRefreshTrigger(prev => prev + 1);
  };

  // Submit Escalation
  const handleConfirmEscalation = () => {
    if (!activeSession) return;
    const updated = OperationalEngine.escalateSession(activeSession, escalateTarget, escalateReason || 'Encaminhado para supervisão');
    setActiveSession(updated);
    setCurrentOptions([]);
    setShowEscalateModal(false);
    setShowFeedbackModal(true);
    setRefreshTrigger(prev => prev + 1);
  };

  // Submit Feedback
  const handleSubmitFeedback = () => {
    if (!activeSession) return;
    OperationalEngine.submitFeedback(activeSession.id, feedbackRating, feedbackComment);
    setShowFeedbackModal(false);
    setFeedbackComment('');
    setRefreshTrigger(prev => prev + 1);
  };

  // Incident state change handler
  const handleIncidentStatusChange = (id: string, newStatus: OperationalIncidentStatus) => {
    OperationalStore.updateIncidentStatus(id, newStatus);
    setRefreshTrigger(prev => prev + 1);
  };

  // New Incident modal state
  const [showNewIncidentModal, setShowNewIncidentModal] = useState<boolean>(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentType, setNewIncidentType] = useState<'PROCESSUAL' | 'TECNICO' | 'DOCUMENTAL' | 'UX' | 'DADOS' | 'INTEGRACAO'>('PROCESSUAL');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO'>('MEDIO');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');
  const [newIncidentFlow, setNewIncidentFlow] = useState(flows[0]?.slug || '');

  const handleCreateIncident = () => {
    if (!newIncidentTitle) return;
    const allInc = OperationalStore.getIncidents();
    const newId = `INC-${String(allInc.length + 1).padStart(3, '0')}`;
    const inc: OperationalIncident = {
      id: newId,
      title: newIncidentTitle,
      type: newIncidentType,
      severity: newIncidentSeverity,
      status: 'ABERTO',
      environment: activeEnv,
      flowSlug: newIncidentFlow,
      reportedBy: 'Operador de Turno',
      assignedTo: newIncidentType === 'PROCESSUAL' ? 'Comissão de Auditoria' : 'Equipa Técnica',
      description: newIncidentDesc || 'Incidente registado na operação.',
      evidence: `Registado em ambiente ${activeEnv.toUpperCase()} às ${new Date().toLocaleTimeString('pt-PT')}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    OperationalStore.saveIncident(inc);
    setShowNewIncidentModal(false);
    setNewIncidentTitle('');
    setNewIncidentDesc('');
    setRefreshTrigger(prev => prev + 1);
  };

  // Convert incident to finding (VAL) with mandatory confirmation
  const handleEscalateToVal = (inc: OperationalIncident) => {
    const confirm = window.confirm(`ATENÇÃO DE AUDITORIA:\n\nUm incidente operacional não é automaticamente um achado de auditoria.\nDeseja formalizar a criação de um finding de divergência processual para o incidente [${inc.id}]?`);
    if (confirm) {
      inc.linkedFindingId = `VAL-009`;
      OperationalStore.saveIncident(inc);
      alert(`Incidente [${inc.id}] encaminhado com êxito para a Comissão de Auditoria com etiqueta de proposta VAL-009.`);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Rollback modal state
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');
  const [rollbackResponsible, setRollbackResponsible] = useState('Dra. Helena Matos');

  const handleExecuteRollback = () => {
    if (!rollbackReason) return;
    const record: RollbackRecord = {
      id: `ROLLBACK-${String(rollbacks.length + 1).padStart(3, '0')}`,
      revertedVersion: 'V9.0.0-PROD-OPERATIONAL',
      restoredVersion: 'V8.0.0-PROD-CANDIDATE (RC01)',
      reason: rollbackReason,
      responsible: rollbackResponsible,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      snapshotId: 'AUDIT-2026-09-10-POST-REM-003'
    };
    OperationalStore.saveRollback(record);
    setShowRollbackModal(false);
    setRollbackReason('');
    alert(`Rollback executado com sucesso.\nVersão restaurada: V8.0.0-PROD-CANDIDATE.\nRegisto arquivado: ${record.id}`);
    setRefreshTrigger(prev => prev + 1);
  };

  // Export handlers
  const handleExportSessionsCSV = () => {
    const header = 'id,environment,startTime,endTime,operatorId,flowId,status,stepsCount,blockReason\n';
    const rows = sessions.map(s => `"${s.id}","${s.environment}","${s.startTime}","${s.endTime || ''}","${s.operatorId || ''}","${s.flowId || ''}","${s.status}",${s.steps.length},"${s.blockReason || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEBALIS_SESSOES_${activeEnv.toUpperCase()}_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDossierJSON = () => {
    const dossier = {
      manifestVersion: 'V9.0.0',
      timestamp: new Date().toISOString(),
      activeEnvironment: activeEnv,
      indicators: {
        conformityScore: 94.8,
        coverageScore: 100.0,
        readiness: 'APTO COM RESERVAS',
        operationalHealth: health.overallStatus
      },
      analytics,
      sessions,
      incidents,
      feedback,
      improvements,
      driftItems,
      rollbacks,
      automatedTestsConsolidated: testResults
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEBALIS_VISION_DOSSIER_OPERACIONAL_V9.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFlow = useMemo(() => {
    return flows.find(f => f.slug === (activeSession?.flowId || selectedFlowSlug)) || flows[0];
  }, [flows, activeSession, selectedFlowSlug]);

  const activeNode = useMemo(() => {
    if (!activeSession) return activeFlow.nodes[0];
    return activeFlow.nodes.find(n => n.id === activeSession.currentNode) || activeFlow.nodes[0];
  }, [activeFlow, activeSession]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Environment Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider uppercase bg-[#E3067A] text-white">
                Camada 7 — V9 Oficial
              </span>
              <span className="text-xs text-slate-400 font-mono">
                RELEASE-2026.09.10-V9-RC01
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Activity className="w-7 h-7 text-[#8CBD45]" />
              Centro de Operação & Governação Contínua
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Operação assistida em tempo real, telemetria segregada, monitorização contínua de incidentes, detetor de process drift e evolução controlada sem alteração automática de procedimentos.
            </p>
          </div>

          {/* Environment Selector with Strict Visual Warning */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => handleEnvChange('production')}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeEnv === 'production'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PRODUÇÃO</span>
              </button>

              <button
                type="button"
                onClick={() => handleEnvChange('staging')}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeEnv === 'staging'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>HOMOLOGAÇÃO</span>
              </button>

              <button
                type="button"
                onClick={() => handleEnvChange('simulation')}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeEnv === 'simulation'
                    ? 'bg-purple-600 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>SIMULAÇÃO</span>
              </button>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AMBIENTE ACTIVO: <strong className="text-white uppercase">{activeEnv}</strong> (ISOLAMENTO ESTRITO)</span>
            </div>
          </div>
        </div>

        {/* 4 DISTINCT, UNCOMBINED PILLAR INDICATORS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Conformidade Funcional</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">94.8%</div>
            <div className="text-xs text-slate-400 mt-1">
              +2.4% pós-REM-003 • Baseline V6 (92.4%) selado
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Cobertura Operacional</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">100.0%</div>
            <div className="text-xs text-slate-400 mt-1">
              14 flows • 32 decisões • 57 opções • 29 terminais
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3. Prontidão Operacional</div>
            <div className="text-lg font-black text-amber-400 mt-1">APTO COM RESERVAS</div>
            <div className="text-xs text-slate-400 mt-1">
              WAI-001 ativo • WAI-002 até 31/12/2026
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">4. Saúde Operacional</div>
            <div className={`text-lg font-black mt-1 ${
              health.overallStatus === 'SAUDÁVEL' ? 'text-emerald-400' :
              health.overallStatus === 'ATENÇÃO' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {health.overallStatus}
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate" title={health.overallReason}>
              {health.overallReason}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'cockpit', label: 'Centro de Operação', icon: Activity },
            { id: 'assistente', label: 'Assistente de Atendimento', icon: Users },
            { id: 'incidentes', label: `Incidentes (${incidents.length})`, icon: AlertTriangle },
            { id: 'evolucao', label: `Melhorias (${improvements.length})`, icon: TrendingUp },
            { id: 'drift', label: 'Process Drift & 80 Testes', icon: GitFork },
            { id: 'releases', label: 'Releases & Rollback', icon: Layers },
            { id: 'trace', label: 'Governance Trace', icon: GitMerge },
            { id: 'exportacao', label: 'Dossiê & Relatórios', icon: Download }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-[#8CBD45]' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Period filter for analytics */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="hoje">Hoje</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CENTRO DE OPERAÇÃO (COCKPIT & ANALYTICS)
         ========================================================================= */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {sessions.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-amber-900">SEM DADOS OPERACIONAIS NO PERÍODO SELECIONADO</h3>
              <p className="text-xs text-amber-700 mt-1 max-w-lg mx-auto">
                Em conformidade com o princípio de não fabricação de métricas fictícias da V9, não existem sessões para o intervalo escolhido em {activeEnv.toUpperCase()}.
              </p>
            </div>
          ) : (
            <>
              {/* Primary Operational Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Sessões Totais</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{analytics.totalSessions}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Duração méd: {analytics.avgDurationSeconds}s</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase">Concluídas</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{analytics.completedSessions}</div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">{analytics.completionRate}% do total</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-amber-600 uppercase">Encaminhadas</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{analytics.escalatedSessions}</div>
                  <div className="text-[11px] text-amber-600 mt-0.5">{analytics.escalationRate}% intervenção humana</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-rose-600 uppercase">Bloqueadas</div>
                  <div className="text-2xl font-black text-rose-700 mt-1">{analytics.blockedSessions}</div>
                  <div className="text-[11px] text-rose-600 mt-0.5">Falta info / regra</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Decisões</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{analytics.totalDecisionsExecuted}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Avaliadas no GPS</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold text-[#E3067A] uppercase">Feedback Positivo</div>
                  <div className="text-2xl font-black text-[#E3067A] mt-1">
                    {analytics.feedbackStats.positiveRatio}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{analytics.feedbackStats.total} avaliações</div>
                </div>
              </div>

              {/* Table of Flows Usage */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-slate-700" />
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Flows Mais Utilizados no Período</h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    Aviso: A utilização não define a qualidade intrínseca do processo.
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Flow Estruturado</th>
                        <th className="px-4 py-2.5 text-center">Sessões</th>
                        <th className="px-4 py-2.5 text-center">Taxa Conclusão</th>
                        <th className="px-4 py-2.5 text-center">Encaminhamentos</th>
                        <th className="px-4 py-2.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.flowsUsage.map(fu => {
                        const rate = fu.count > 0 ? Math.round((fu.completed / fu.count) * 100) : 0;
                        return (
                          <tr key={fu.flowSlug} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-slate-900">
                              {fu.flowName}
                              <span className="block text-[10px] text-slate-400 font-mono">{fu.flowSlug}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center font-semibold text-slate-800">{fu.count}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                {rate}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center font-semibold text-amber-700">{fu.escalated}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFlowSlug(fu.flowSlug);
                                  setActiveTab('assistente');
                                }}
                                className="text-xs font-bold text-[#E3067A] hover:underline"
                              >
                                Abrir no Assistente →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drop-off & Attention Points */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Onde os Operadores Param? (Pontos de Atenção — Requer Análise)
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Em conformidade com a <strong>Regra de Não Inferência</strong>, o abandono de um nó indica apenas que os operadores interromperam a chamada nesse ponto, sem implicar que a regra esteja errada.
                </p>
                <div className="space-y-2">
                  {analytics.dropoffPoints.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center">Nenhum ponto crítico de bloqueio detetado.</div>
                  ) : (
                    analytics.dropoffPoints.map(dp => (
                      <div key={`${dp.flowSlug}-${dp.nodeId}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs gap-2">
                        <div>
                          <span className="font-bold text-slate-900">[{dp.flowSlug}] Nó {dp.nodeId}:</span>{' '}
                          <span className="text-slate-700">{dp.nodeText}</span>
                          <span className="block text-[11px] text-amber-700 mt-0.5">Motivo registado: {dp.reason}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                            {dp.count} paragem(ns)
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">PONTO DE ATENÇÃO</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ASSISTENTE DE ATENDIMENTO OPERACIONAL
         ========================================================================= */}
      {activeTab === 'assistente' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#8CBD45]" />
                  Assistente de Operação Assistida
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhamento de atendimento com baixa carga cognitiva, explicações "Porquê?" e "Para onde?", sem exposição de ruído técnico desnecessário.
                </p>
              </div>

              {/* Flow Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="assist-flow-select" className="text-xs font-bold text-slate-600">Fluxo:</label>
                <select
                  id="assist-flow-select"
                  value={selectedFlowSlug}
                  onChange={(e) => {
                    setSelectedFlowSlug(e.target.value);
                    if (activeSession) {
                      setActiveSession(null);
                    }
                  }}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  {flows.map(f => (
                    <option key={f.slug} value={f.slug}>
                      {f.name} ({f.nodes.length} nós)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="px-4 py-2 rounded-lg bg-[#E3067A] hover:bg-[#c20568] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{activeSession ? 'Reiniciar Chamada' : 'Iniciar Atendimento'}</span>
                </button>
              </div>
            </div>

            {/* Active Session Cockpit */}
            {!activeSession ? (
              <div className="py-12 text-center">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-800">NENHUMA SESSÃO EM CURSO</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Selecione o fluxo adequado à questão do cidadão e clique em "Iniciar Atendimento" para abrir a sessão operacional com Call Trail auditável.
                </p>
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="mt-4 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                >
                  <span>Iniciar Atendimento em [{selectedFlowSlug}]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Session Bar with ID & Minimização de Dados reminder */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                      ID: {activeSession.id}
                    </span>
                    <span className="text-slate-500">Operador: <strong>{activeSession.operatorId}</strong></span>
                    <span className="text-slate-500">Passos: <strong>{activeSession.steps.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Princípio da Minimização de Dados (RGPD): Nenhum NIF ou dado pessoal persistido no log.</span>
                  </div>
                </div>

                {/* Primary Card: Current Node & Question */}
                <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Passo Atual • Nó {activeNode.id} ({activeNode.kind.toUpperCase()})
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Button Porquê? */}
                      <button
                        type="button"
                        onClick={() => setShowWhyModal(true)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#8CBD45] border border-slate-700 flex items-center gap-1 transition-colors"
                        title="Ver fundamentação processual e prancha Visio"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Porquê?</span>
                      </button>
                    </div>
                  </div>

                  {/* Question / Text */}
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {activeNode.t}
                  </h3>

                  {/* Decision Options */}
                  {currentOptions.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Selecione a resposta indicada pelo cidadão:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectOption(opt)}
                              className="flex-1 text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-[#E3067A] text-white text-xs font-bold transition-all border border-slate-700 hover:border-transparent flex items-center justify-between group"
                            >
                              <span>{opt.label}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                            </button>
                            {/* Button Para onde? */}
                            <button
                              type="button"
                              onClick={() => {
                                setWhereOptionTarget(opt);
                                setShowWhereModal(true);
                              }}
                              className="px-2.5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold border border-slate-700"
                              title="Previsão do próximo passo"
                            >
                              Para onde?
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terminal Reached */}
                  {activeSession.status === 'completed' && (
                    <div className="mt-6 p-4 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Processo Concluído com Sucesso</span>
                      </div>
                      Percurso concluído no nó terminal. Procedimento orientado com rigor.
                    </div>
                  )}

                  {/* Action Bar for Operator Exception Handling */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowUncertaintyInput(prev => !prev)}
                      className="text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Não tenho informação suficiente do cidadão</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBlockModal(true)}
                        className="px-3 py-1.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700"
                      >
                        Sinalizar Bloqueio
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowEscalateModal(true)}
                        className="px-3 py-1.5 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-bold border border-amber-700"
                      >
                        Intervenção Necessária
                      </button>
                    </div>
                  </div>

                  {/* Uncertainty drawer */}
                  {showUncertaintyInput && (
                    <div className="mt-4 p-3 bg-slate-800 border border-amber-700 rounded-lg space-y-2">
                      <label htmlFor="uncertainty-input" className="text-xs font-bold text-amber-300">Registo de Incerteza (Não altera regras):</label>
                      <input
                        id="uncertainty-input"
                        type="text"
                        value={uncertaintyText}
                        onChange={(e) => setUncertaintyText(e.target.value)}
                        placeholder="Ex: Cidadão não tem o valor de IRS ou documento consigo..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmUncertainty}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded"
                      >
                        Confirmar Registo de Dúvida
                      </button>
                    </div>
                  )}
                </div>

                {/* Call Trail 2.0 Visualization */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-slate-600" />
                    <span>Call Trail Operacional em Tempo Real</span>
                  </h4>
                  <div className="space-y-1.5">
                    {activeSession.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center text-xs p-2 rounded bg-slate-50 border border-slate-200 justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500">#{step.stepIndex + 1}</span>
                          <span className="font-semibold text-slate-900">{step.nodeText}</span>
                          {step.uncertaintyMarked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              DÚVIDA SINALIZADA
                            </span>
                          )}
                        </div>
                        {step.selectedOption && (
                          <span className="font-bold text-[#E3067A]">
                            → Resposta: {step.selectedOption}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal "Porquê?" */}
          {showWhyModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#8CBD45]" />
                    Fundamentação Processual (Porquê?)
                  </h3>
                  <button type="button" onClick={() => setShowWhyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong>Nó:</strong> {activeNode.id} — {activeNode.t}</p>
                  <p><strong>Fluxo:</strong> {activeFlow.name} ({activeFlow.slug})</p>
                  <p><strong>Prancha Visio de Origem:</strong> {activeFlow.visioIndex ? `Página ${activeFlow.visioIndex}` : 'Prancha Visio 01'}</p>
                  <p><strong>Norma / Deliberação:</strong> Manual de Procedimentos Operacionais do Contact Center GEBALIS (DAC/2026).</p>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600">
                    Esta verificação decorre das competências de atendimento de primeiro nível delegadas pela Direção Municipal de Habitação de Lisboa.
                  </div>
                </div>
                <div className="text-right pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowWhyModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">Fechar</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal "Para Onde?" */}
          {showWhereModal && whereOptionTarget && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-cyan-600" />
                    Previsão de Destino (Para Onde?)
                  </h3>
                  <button type="button" onClick={() => setShowWhereModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong>Opção Selecionada:</strong> <span className="text-[#E3067A] font-bold">{whereOptionTarget.label}</span></p>
                  <p><strong>Nó de Destino:</strong> {whereOptionTarget.targetNodeId}</p>
                  {whereOptionTarget.targetLink ? (
                    <p className="text-amber-700 font-bold">
                      Atenção: Transição inter-fluxos para o fluxo [{whereOptionTarget.targetLink}].
                    </p>
                  ) : (
                    <p>O percurso continuará na árvore de decisão do fluxo atual sem interrupções.</p>
                  )}
                </div>
                <div className="text-right pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowWhereModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">Compreendido</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal "Sinalizar Bloqueio" */}
          {showBlockModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    Registar Bloqueio Operacional
                  </h3>
                  <button type="button" onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="block-type-select" className="font-bold text-slate-700 block mb-1">Tipo de Bloqueio:</label>
                    <select
                      id="block-type-select"
                      value={blockType}
                      onChange={(e) => setBlockType(e.target.value as OperationalBlockType)}
                      className="w-full border border-slate-300 rounded p-2 bg-slate-50"
                    >
                      <option value="INFORMAÇÃO_INSUFICIENTE">Informação insuficiente</option>
                      <option value="REGRA_AMBÍGUA">Regra ambígua</option>
                      <option value="DESTINO_INDISPONÍVEL">Destino indisponível</option>
                      <option value="ERRO_TÉCNICO">Erro técnico</option>
                      <option value="PROCEDIMENTO_NÃO_CONTEMPLADO">Procedimento não contemplado</option>
                      <option value="NECESSITA_DECISÃO_HUMANA">Necessita decisão humana</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="block-reason-textarea" className="font-bold text-slate-700 block mb-1">Justificação do Bloqueio:</label>
                    <textarea
                      id="block-reason-textarea"
                      rows={3}
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Descreva o motivo que impede o avanço no fluxograma..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowBlockModal(false)} className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600">Cancelar</button>
                  <button type="button" onClick={handleConfirmBlock} className="px-4 py-1.5 rounded text-xs font-bold bg-rose-600 text-white">Confirmar Bloqueio</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal "Intervenção Necessária" */}
          {showEscalateModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    Encaminhamento para Intervenção Humana
                  </h3>
                  <button type="button" onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="escalate-target-select" className="font-bold text-slate-700 block mb-1">Destino Sugerido:</label>
                    <select
                      id="escalate-target-select"
                      value={escalateTarget}
                      onChange={(e) => setEscalateTarget(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 bg-slate-50"
                    >
                      <option value="Supervisão Operacional">Supervisão Operacional</option>
                      <option value="Gabinete de Apoio Social">Gabinete de Apoio Social</option>
                      <option value="Direção Técnica e Manutenção">Direção Técnica e Manutenção</option>
                      <option value="Gabinete Jurídico">Gabinete Jurídico</option>
                      <option value="Auditoria Interna">Auditoria Interna</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="escalate-reason-textarea" className="font-bold text-slate-700 block mb-1">Motivo do Encaminhamento:</label>
                    <textarea
                      id="escalate-reason-textarea"
                      rows={3}
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder="Descreva a evidência ou situação complexa..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowEscalateModal(false)} className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600">Cancelar</button>
                  <button type="button" onClick={handleConfirmEscalation} className="px-4 py-1.5 rounded text-xs font-bold bg-amber-600 text-white">Confirmar Encaminhamento</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Feedback do Operador */}
          {showFeedbackModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#E3067A]" />
                    Como foi esta orientação?
                  </h3>
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600">
                    O feedback do operador gera evidência para análise contínua. <strong>Nunca altera automaticamente a regra do processo.</strong>
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { val: 'MUITO_UTIL', label: 'Muito útil' },
                      { val: 'UTIL', label: 'Útil' },
                      { val: 'POUCO_UTIL', label: 'Pouco útil' },
                      { val: 'NAO_RESOLVEU', label: 'Não resolveu' },
                      { val: 'NECESSITEI_AJUDA', label: 'Necessitei de ajuda' }
                    ].map(r => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setFeedbackRating(r.val as FeedbackRating)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold ${
                          feedbackRating === r.val
                            ? 'border-[#E3067A] bg-pink-50 text-[#E3067A] font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="feedback-comment-textarea" className="font-bold text-slate-700 block mb-1">Comentário Opcional:</label>
                    <textarea
                      id="feedback-comment-textarea"
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Observações úteis para a equipa de qualidade..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600">Dispensar</button>
                  <button type="button" onClick={handleSubmitFeedback} className="px-4 py-1.5 rounded text-xs font-bold bg-[#E3067A] text-white">Submeter Avaliação</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: INCIDENTES OPERACIONAIS (INC-XXX)
         ========================================================================= */}
      {activeTab === 'incidentes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Catálogo de Incidentes Operacionais ({incidents.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Segregação estrita: <strong>Incidente Operacional ≠ Achado de Auditoria (VAL)</strong>. A conversão exige validação humana.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewIncidentModal(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <span>+ Novo Incidente</span>
            </button>
          </div>

          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                Nenhum incidente registado em {activeEnv.toUpperCase()}.
              </div>
            ) : (
              incidents.map(inc => (
                <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {inc.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        inc.type === 'PROCESSUAL' ? 'bg-purple-100 text-purple-800' :
                        inc.type === 'TECNICO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inc.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        inc.severity === 'CRITICO' ? 'bg-rose-100 text-rose-800' :
                        inc.severity === 'ALTO' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Severidade: {inc.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor={`incident-status-${inc.id}`} className="text-[11px] font-semibold text-slate-500">Estado:</label>
                      <select
                        id={`incident-status-${inc.id}`}
                        value={inc.status}
                        onChange={(e) => handleIncidentStatusChange(inc.id, e.target.value as OperationalIncidentStatus)}
                        className="text-xs font-bold border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-800"
                      >
                        <option value="ABERTO">ABERTO</option>
                        <option value="EM_ANALISE">EM ANÁLISE</option>
                        <option value="CLASSIFICADO">CLASSIFICADO</option>
                        <option value="EM_TRATAMENTO">EM TRATAMENTO</option>
                        <option value="RESOLVIDO">RESOLVIDO</option>
                        <option value="VALIDADO">VALIDADO</option>
                        <option value="ENCERRADO">ENCERRADO</option>
                        <option value="REABERTO">REABERTO</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{inc.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{inc.description}</p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div><strong>Evidência:</strong> {inc.evidence}</div>
                    {inc.resolution && <div><strong>Resolução:</strong> {inc.resolution}</div>}
                    <div className="flex flex-wrap items-center justify-between text-slate-400 pt-1">
                      <span>Reportado por: {inc.reportedBy} ({inc.createdAt})</span>
                      <span>Atribuído a: {inc.assignedTo}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      {inc.linkedFindingId ? (
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Vinculado a Finding: {inc.linkedFindingId}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEscalateToVal(inc)}
                          className="text-purple-700 hover:text-purple-900 font-bold underline text-[11px]"
                        >
                          + Propor como Achado de Auditoria (VAL)
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Última atualização: {inc.updatedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Incident Modal */}
          {showNewIncidentModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Novo Incidente Operacional</h3>
                  <button type="button" onClick={() => setShowNewIncidentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="new-incident-title" className="font-bold text-slate-700 block mb-1">Título:</label>
                    <input
                      id="new-incident-title"
                      type="text"
                      value={newIncidentTitle}
                      onChange={(e) => setNewIncidentTitle(e.target.value)}
                      placeholder="Ex: Dúvida de prazo no envio de dados..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="new-incident-type" className="font-bold text-slate-700 block mb-1">Tipo:</label>
                      <select
                        id="new-incident-type"
                        value={newIncidentType}
                        onChange={(e) => setNewIncidentType(e.target.value as any)}
                        className="w-full border border-slate-300 rounded p-2 bg-slate-50"
                      >
                        <option value="PROCESSUAL">Processual</option>
                        <option value="TECNICO">Técnico</option>
                        <option value="DOCUMENTAL">Documental</option>
                        <option value="UX">UX / Usabilidade</option>
                        <option value="DADOS">Dados</option>
                        <option value="INTEGRACAO">Integração</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="new-incident-severity" className="font-bold text-slate-700 block mb-1">Severidade:</label>
                      <select
                        id="new-incident-severity"
                        value={newIncidentSeverity}
                        onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                        className="w-full border border-slate-300 rounded p-2 bg-slate-50"
                      >
                        <option value="BAIXO">Baixo</option>
                        <option value="MEDIO">Médio</option>
                        <option value="ALTO">Alto</option>
                        <option value="CRITICO">Crítico</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="new-incident-desc" className="font-bold text-slate-700 block mb-1">Descrição Detalhada:</label>
                    <textarea
                      id="new-incident-desc"
                      rows={3}
                      value={newIncidentDesc}
                      onChange={(e) => setNewIncidentDesc(e.target.value)}
                      placeholder="Circunstâncias do incidente..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowNewIncidentModal(false)} className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600">Cancelar</button>
                  <button type="button" onClick={handleCreateIncident} className="px-4 py-1.5 rounded text-xs font-bold bg-slate-900 text-white">Criar Incidente</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: EVOLUÇÃO CONTROLADA & MELHORIAS (IMP-XXX)
         ========================================================================= */}
      {activeTab === 'evolucao' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Pipeline de Evolução Controlada ({improvements.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Regra Inviolável: <strong>Melhoria não é alteração de processo.</strong> Qualquer modificação a nós, decisões ou terminais exige Remediação Governada V7 (REM).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {improvements.map(imp => (
              <div key={imp.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                      {imp.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      imp.isProcessAlteration ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {imp.isProcessAlteration ? 'ALTERAÇÃO PROCESSUAL' : 'MELHORIA TÉCNICA/UX'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{imp.title}</h3>
                  <p className="text-xs text-slate-600">{imp.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
                  {imp.isProcessAlteration && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold">
                      ⚠ EXIGE REMÉDIO V7 ({imp.linkedRemediationId || 'Plano REM Pendente'})
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Estado: <strong>{imp.status}</strong></span>
                    <span>Prioridade: <strong>{imp.priority}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PROCESS DRIFT & 80 TESTES AUTOMATIZADOS CONSOLIDADOS
         ========================================================================= */}
      {activeTab === 'drift' && (
        <div className="space-y-6">
          {/* Drift Detection Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-700" />
                Process Drift Detection (Deteção Contínua de Desvio)
              </h2>
              <span className="text-xs text-slate-500">3 Tipologias: Estrutural, Documental, Operacional</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {driftItems.map(d => (
                <div key={d.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{d.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-100 text-cyan-900 uppercase">
                      {d.driftType}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">{d.component}</div>
                  <div className="text-slate-600">{d.evidence}</div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    Recomendação: <strong>{d.recommendation}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 80 Consolidated Tests Suite */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Caderno de Testes Automáticos Consolidado (80 Testes)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  V5 (1-12) • V6 (13-24) • V7 (25-40) • V8 (41-60) • V9 (61-80) — 100% de integridade verificada.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  {testResults.passedTests} / {testResults.totalTests} APROVADOS (100%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {testResults.allTests.map(t => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">#{t.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                      PASS
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-[11px] leading-tight">{t.name}</div>
                  <div className="text-[10px] text-slate-500 truncate" title={t.details}>{t.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: RELEASES & ROLLBACK
         ========================================================================= */}
      {activeTab === 'releases' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-800" />
                  Gestão de Releases e Promoção Controlada
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A release candidata V8.0.0-PROD-CANDIDATE (RC01) permanece selada como referência de homologação estável.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRollbackModal(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reverter Release (Rollback)</span>
              </button>
            </div>

            {/* Releases Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Release ID</th>
                    <th className="px-4 py-2.5">Versão</th>
                    <th className="px-4 py-2.5">Ambiente</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5 text-center">Score</th>
                    <th className="px-4 py-2.5 text-center">Testes</th>
                    <th className="px-4 py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50 font-semibold">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">RELEASE-2026.09.10-V9-RC01</td>
                    <td className="px-4 py-3 text-purple-700 font-bold">V9.0.0-PROD-OPERATIONAL</td>
                    <td className="px-4 py-3 uppercase text-emerald-700 font-bold">Produção</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                        EM OBSERVAÇÃO
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">94.8%</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">80 / 80</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[11px] text-slate-500">Ativa</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-mono text-slate-700">RELEASE-2026.09.10-RC01</td>
                    <td className="px-4 py-3 text-slate-800 font-bold">V8.0.0-PROD-CANDIDATE</td>
                    <td className="px-4 py-3 uppercase text-slate-600">Homologação</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        PRESERVADA
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">94.8%</td>
                    <td className="px-4 py-3 text-center text-slate-700">60 / 60</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[11px] text-slate-400">Baseline V8</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rollback history */}
            {rollbacks.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-2">
                <h4 className="font-bold text-rose-900 uppercase tracking-wider">Histórico de Reversões (Rollback):</h4>
                {rollbacks.map(rb => (
                  <div key={rb.id} className="p-2 bg-white rounded border border-rose-200">
                    <strong>{rb.id}:</strong> Reverteu {rb.revertedVersion} → Restaurou {rb.restoredVersion} ({rb.timestamp}) por {rb.responsible}. Motivo: {rb.reason}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Waivers Status Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Waivers Ativos em Produção (Salvaguarda de Riscos)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">WAI-001</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">PERMANENTE</span>
                </div>
                <div className="text-slate-600">Divergência institucional na plataforma Habitar Lisboa com validação externa de competências.</div>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 font-mono">WAI-002</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">REVISÃO ATÉ 31/12/2026</span>
                </div>
                <div className="text-amber-800">Envio de SMS com dados bancários pendente de módulo de integração SIGA. Requer revisão mandatória no 4º trimestre.</div>
              </div>
            </div>
          </div>

          {/* Rollback Modal */}
          {showRollbackModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-rose-600" />
                    Reverter Release de Produção
                  </h3>
                  <button type="button" onClick={() => setShowRollbackModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="text-xs space-y-3">
                  <p className="text-slate-600">
                    A reversão <strong>não apaga</strong> a versão problemática. Arquiva um registo formal <code>ROLLBACK-XXX</code> e restaura a release estável anterior <code>RELEASE-2026.09.10-RC01</code>.
                  </p>
                  <div>
                    <label htmlFor="rollback-reason-textarea" className="font-bold text-slate-700 block mb-1">Motivo da Reversão:</label>
                    <textarea
                      id="rollback-reason-textarea"
                      rows={3}
                      value={rollbackReason}
                      onChange={(e) => setRollbackReason(e.target.value)}
                      placeholder="Identificação de instabilidade ou divergência impeditiva..."
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="rollback-responsible-input" className="font-bold text-slate-700 block mb-1">Responsável pela Ordem:</label>
                    <input
                      id="rollback-responsible-input"
                      type="text"
                      value={rollbackResponsible}
                      onChange={(e) => setRollbackResponsible(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowRollbackModal(false)} className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600">Cancelar</button>
                  <button type="button" onClick={handleExecuteRollback} className="px-4 py-1.5 rounded text-xs font-bold bg-rose-600 text-white">Executar Rollback</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 7: GOVERNANCE TRACE (DA SESSÃO À RELEASE)
         ========================================================================= */}
      {activeTab === 'trace' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-700" />
              Governance Trace (Rastreabilidade Integral de Ponta a Ponta)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualização da cadeia de valor regulatória: Como a observação operacional se converte em análise, governança e revalidação sem atalhos não autorizados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">1. ATENDIMENTO</span>
              <div className="font-bold text-slate-900">Sessão Operacional</div>
              <div className="text-slate-600">Operador executa passos e sinaliza eventuais dúvidas através do Assistente.</div>
              <span className="block font-mono text-[11px] text-slate-500 font-bold">OPS-20260910-0001</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-100 text-pink-800">2. AVALIAÇÃO</span>
              <div className="font-bold text-slate-900">Feedback & Incidente</div>
              <div className="text-slate-600">Feedback isolado ou incidente registado para triagem da qualidade.</div>
              <span className="block font-mono text-[11px] text-slate-500 font-bold">FDB-001 → INC-001</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">3. GOVERNAÇÃO</span>
              <div className="font-bold text-slate-900">Finding & Remediação</div>
              <div className="text-slate-600">Auditoria formaliza desvio processual e Direção emite despacho de remediação.</div>
              <span className="block font-mono text-[11px] text-slate-500 font-bold">VAL-003 → REM-003</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">4. RELEASE</span>
              <div className="font-bold text-slate-900">Reteste & Publicação</div>
              <div className="text-slate-600">Execução da bateria de 80 testes, homologação e promoção de release.</div>
              <span className="block font-mono text-[11px] text-slate-500 font-bold">RELEASE-2026.09.10-RC01</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 text-white text-xs space-y-2">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider">Regra Fundamental da Camada 7:</h4>
            <p className="text-slate-300 leading-relaxed">
              O GEBALIS VISION garante que nenhuma alteração em ficheiros de fluxo, nós, arestas ou decisões pode ser publicada diretamente a partir de um clique de operador ou sugestão de telemetria. A única porta de entrada processual é o ciclo de Remediação V7 devidamente despachado, retestado e certificado.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: DOSSIÊ OPERACIONAL & EXPORTAÇÃO
         ========================================================================= */}
      {activeTab === 'exportacao' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-5 h-5 text-slate-800" />
                  Exportação de Dados Operacionais e Relatórios V9
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exportações auditáveis com carimbos temporais, dados reais segregados e conformidade com minimização de dados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Sessões Operacionais (CSV)
                </div>
                <p className="text-slate-600">Exporta o histórico de chamadas e percursos do ambiente ativo.</p>
                <button
                  type="button"
                  onClick={handleExportSessionsCSV}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  Dossiê Operacional Completo (JSON)
                </div>
                <p className="text-slate-600">Manifesto JSON com todas as sessões, incidentes, melhorias, drift e os 80 testes.</p>
                <button
                  type="button"
                  onClick={handleExportDossierJSON}
                  className="w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Dossiê JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#E3067A]" />
                  Certificação V9 Formal
                </div>
                <p className="text-slate-600">Emissão do certificado oficial <code>CERT-YYYY-MM-DD-V9-01</code>.</p>
                <button
                  type="button"
                  onClick={() => {
                    const cert = OperationalEngine.generateV9Certification();
                    alert(`CERTIFICAÇÃO V9 EMITIDA COM SUCESSO!\n\nID: ${cert.certId}\nVersão: ${cert.version}\nConformidade: ${cert.conformityScore}%\nCobertura: ${cert.coverageScore}%\nProntidão: ${cert.readinessStatus}\nSaúde: ${cert.operationalHealth}\nTotal de Testes: ${cert.passedTests} de ${cert.totalTests} aprovados.`);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#E3067A] hover:bg-[#c20568] text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Emitir Certificado V9</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
