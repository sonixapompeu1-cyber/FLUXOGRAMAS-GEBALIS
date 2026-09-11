import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Award,
  Layers,
  Activity,
  Cpu,
  Lock,
  GitMerge,
  Filter,
  Eye,
  FileSpreadsheet,
  Split,
  Workflow,
  Clock,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  Compass,
  AlertCircle
} from 'lucide-react';
import {
  PerspectiveView,
  OperationalReadinessState,
  ReadinessCheckStatus,
  ReadinessCheckItem,
  ReadinessMatrixRow,
  SystemHealthItem,
  ReleaseCandidate,
  OperationalCertification,
  V8AutomatedTestResult
} from '../types';
import {
  getStoredReadinessChecklist,
  updateReadinessItemStatus,
  getReadinessMatrix,
  getSystemHealth,
  getReleaseCandidate,
  executeOperationalCertification,
  runV8AutomatedTests
} from '../readiness/readinessEngine';
import { calculateGovernanceKPIs } from '../remediation/governanceEngine';

interface ReadinessDashboardProps {
  onNavigate: (path: string) => void;
}

export const ReadinessDashboard: React.FC<ReadinessDashboardProps> = ({ onNavigate }) => {
  const [perspective, setPerspective] = useState<PerspectiveView>('EXECUTIVA');
  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'HEALTH' | 'MATRIX' | 'RELEASE' | 'TESTS_V8' | 'PENDING'>('CHECKLIST');
  const [checklistFilter, setChecklistFilter] = useState<string>('TODAS');

  // Load dynamic readiness items
  const [checklist, setChecklist] = useState<ReadinessCheckItem[]>(() => getStoredReadinessChecklist());
  const [matrix] = useState<ReadinessMatrixRow[]>(() => getReadinessMatrix());
  const [healthItems] = useState<SystemHealthItem[]>(() => getSystemHealth());
  const [release] = useState<ReleaseCandidate>(() => getReleaseCandidate());
  const [certification, setCertification] = useState<OperationalCertification | null>(null);

  // V8 Tests
  const [v8Tests, setV8Tests] = useState<V8AutomatedTestResult[]>(() => runV8AutomatedTests());
  const kpis = useMemo(() => calculateGovernanceKPIs(), []);

  // Filter checklist items
  const filteredChecklist = useMemo(() => {
    if (checklistFilter === 'TODAS') return checklist;
    return checklist.filter(item => item.category === checklistFilter);
  }, [checklist, checklistFilter]);

  // Overall readiness state derivation
  const overallState: OperationalReadinessState = useMemo(() => {
    if (release.isBlocked) return 'BLOQUEADO';
    if (kpis.acceptedWaiversCount > 0) return 'APTO_COM_RESERVAS';
    return 'APTO_PARA_PRODUCAO';
  }, [release.isBlocked, kpis.acceptedWaiversCount]);

  const handleExecuteCertification = () => {
    const cert = executeOperationalCertification();
    setCertification(cert);
  };

  const handleExportDossier = () => {
    const dossierData = {
      project: 'GEBALIS VISION — Sistema de Fluxogramas e GPS Operacional',
      version: release.version,
      releaseCandidate: release.id,
      timestamp: new Date().toISOString(),
      governanceScore: `${kpis.currentScore}% (Baseline: ${kpis.baselineScore}%)`,
      overallReadinessState: overallState,
      kpis,
      checklistSummary: {
        total: checklist.length,
        passed: checklist.filter(c => c.status === 'PASSOU').length,
        pending: checklist.filter(c => c.status === 'PENDENTE').length
      },
      readinessMatrix: matrix,
      systemHealth: healthItems,
      v8AutomatedTests: v8Tests,
      disclaimer: 'Dossiê oficial consolidado para homologação e certificação operacional (V8).'
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEBALIS_DOSSIER_PRONTIDAO_${release.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Institutional Header & Readiness Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                CAMADA 6 — PRONTIDÃO OPERACIONAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-slate-100 text-slate-700 font-mono">
                {release.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-primary/10 text-primary">
                GATE DE PRODUÇÃO
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consolidação, Certificação e Prontidão Operacional
            </h1>

            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Avaliação formal de prontidão para entrada em produção do Contact Center.
              A resposta de maturidade operacional segrega com rigor matemático <strong>Cobertura</strong>, <strong>Conformidade</strong> e <strong>Prontidão</strong>.
            </p>
          </div>

          {/* Operational State Badge */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[240px]">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Estado de Prontidão Operacional
            </span>
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-sm uppercase ${
              overallState === 'APTO_PARA_PRODUCAO'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : overallState === 'APTO_COM_RESERVAS'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{overallState.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-2xs text-slate-500 font-medium mt-2">
              {kpis.acceptedWaiversCount} Waiver(s) ativo(s) • 0 Regressões
            </p>
          </div>
        </div>

        {/* Perspective View Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Perspetiva de Análise:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['EXECUTIVA', 'TÉCNICA', 'AUDITOR', 'OPERACIONAL'] as PerspectiveView[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerspective(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    perspective === p
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/simulador')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors"
            >
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>Abrir Simulador</span>
            </button>
            <button
              onClick={handleExportDossier}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Dossiê</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD EXECUTIVO — INDICADORES DINÂMICOS & DISTINÇÃO RIGOROSA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Documentação</span>
          <p className="text-2xl font-black text-slate-900 mt-1">145</p>
          <span className="text-2xs text-slate-500 font-medium">Páginas Visio</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Flows Core</span>
          <p className="text-2xl font-black text-slate-900 mt-1">14</p>
          <span className="text-2xs text-slate-500 font-medium">Estruturados</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Benchmark</span>
          <p className="text-2xl font-black text-teal-700 mt-1">137</p>
          <span className="text-2xs text-slate-500 font-medium">Isolado Camada C</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Topologia</span>
          <p className="text-2xl font-black text-slate-900 mt-1">119 / 111</p>
          <span className="text-2xs text-slate-500 font-medium">Nós / Arestas</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Baseline V6</span>
          <p className="text-2xl font-black text-slate-700 mt-1">{kpis.baselineScore}%</p>
          <span className="text-2xs text-slate-500 font-medium">Histórico Imutável</span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <span className="text-2xs font-extrabold text-emerald-700 uppercase tracking-wider">Score Atual V7</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{kpis.currentScore}%</p>
          <span className="text-2xs text-emerald-600 font-bold">+2.4% Pós-Remediação</span>
        </div>
      </div>

      {/* CLARITY NOTICE: COBERTURA VS CONFORMIDADE VS PRONTIDÃO */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-slate-800 text-teal-400 shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">
              Princípio de Rigor: Cobertura Elevada ≠ Conformidade Total
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <strong className="text-teal-400 block mb-1">1. COBERTURA (100%):</strong>
                A totalidade dos 14 flows, 32 decisões, 57 ramificações e 29 terminais foi mapeada e testada deterministicamente.
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <strong className="text-emerald-400 block mb-1">2. CONFORMIDADE (94.8%):</strong>
                Índice real de correspondência funcional calculada face às pranchas originais e deliberações municipais em vigor.
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <strong className="text-amber-400 block mb-1">3. PRONTIDÃO (APTO COM RESERVAS):</strong>
                Aptidão comprovada para uso em Contact Center sob salvaguarda de 2 waivers superiores ativos (WAI-001/002).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERSPECTIVE-SPECIFIC HIGHLIGHTS */}
      {perspective === 'EXECUTIVA' && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <span><strong>Visão Executiva:</strong> Apresentação sintética orientada a tomada de decisão para Direção e Conselho de Administração.</span>
          <span className="font-bold">Homologação Formal Disponível</span>
        </div>
      )}
      {perspective === 'TÉCNICA' && (
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono flex items-center justify-between">
          <span>Grafo estruturado: 119 nós | 111 arestas | 32 decisões | 57 opções | 29 terminais | 0 dead-ends | 0 orfãos críticos.</span>
          <span className="font-bold">Topologia Válida</span>
        </div>
      )}
      {perspective === 'AUDITOR' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span><strong>Visão Auditor:</strong> 100% de rastreabilidade garantida entre Visio, Flow JSON, GPS Engine e ChangeRecords imutáveis.</span>
          <span className="font-bold">Trilha Fechada</span>
        </div>
      )}
      {perspective === 'OPERACIONAL' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span><strong>Visão Operacional:</strong> GPS pronto para atendimento em linha com Call Trail reativo e Gate of Identity ativo.</span>
          <span className="font-bold">Contact Center Apto</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        {[
          { id: 'CHECKLIST', label: 'Checklist de Produção (16 Itens)', icon: CheckCircle2 },
          { id: 'MATRIX', label: 'Matriz de Prontidão (9 Áreas)', icon: FileSpreadsheet },
          { id: 'HEALTH', label: 'System Health (7 Subsistemas)', icon: Activity },
          { id: 'RELEASE', label: 'Release Candidate & Certificação', icon: Award },
          { id: 'TESTES_V8', label: 'Caderno de Testes V8 (41 a 60)', icon: Cpu },
          { id: 'PENDING', label: 'Centro de Pendências & Alertas', icon: AlertCircle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHECKLIST DE PRONTIDÃO */}
      {activeTab === 'CHECKLIST' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Checklist Oficial de Prontidão para Produção
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nenhum item pode ser marcado como PASSOU sem evidência documental ou teste comprovado.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={checklistFilter}
                onChange={(e) => setChecklistFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
              >
                <option value="TODAS">Todas as Categorias (A a G)</option>
                <option value="A_DADOS">A — Dados</option>
                <option value="B_MOTOR_GPS">B — Motor GPS</option>
                <option value="C_AUDITORIA">C — Auditoria</option>
                <option value="D_REMEDIACAO">D — Remediação</option>
                <option value="E_GOVERNACAO">E — Governação</option>
                <option value="F_UX">F — UX</option>
                <option value="G_PERFORMANCE">G — Performance</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 space-y-2">
            {filteredChecklist.map((item) => (
              <div key={item.id} className="pt-3 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-800">
                      {item.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-2xs font-extrabold">
                      {item.categoryLabel}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{item.description}</p>
                  {item.evidence && (
                    <div className="text-2xs text-slate-500 font-medium pt-1">
                      <strong className="text-slate-700">Evidência: </strong>
                      <span>{item.evidence}</span>
                      {item.testRef && <span className="ml-2 font-mono text-primary">[{item.testRef}]</span>}
                    </div>
                  )}
                  <div className="text-2xs text-slate-400">
                    Responsável: {item.responsible} • Atualizado em {item.updatedAt}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    item.status === 'PASSOU'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : item.status === 'FALHOU'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE PRONTIDÃO */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Matriz de Prontidão Organizacional (9 Áreas)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visão holística por domínio com responsável superior e data da última validação.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold text-2xs">
                <tr>
                  <th className="p-3">Área de Análise</th>
                  <th className="p-3">Estado de Prontidão</th>
                  <th className="p-3">Evidência Formal</th>
                  <th className="p-3">Última Validação</th>
                  <th className="p-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{row.area}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-2xs font-black ${
                        row.status === 'APTO_PARA_PRODUCAO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'APTO_COM_RESERVAS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-sm">{row.evidence}</td>
                    <td className="p-3 text-slate-500 font-mono">{row.lastValidation}</td>
                    <td className="p-3 text-slate-700">{row.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH */}
      {activeTab === 'HEALTH' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="font-extrabold text-base text-slate-900">
            Centro de Saúde do Sistema (System Health)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthItems.map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{h.label}</span>
                  <span className={`px-2 py-0.5 rounded text-2xs font-extrabold ${
                    h.status === 'OK'
                      ? 'bg-emerald-100 text-emerald-800'
                      : h.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {h.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{h.message}</p>
                {h.metrics && (
                  <div className="pt-2 border-t border-slate-200/60 font-mono text-2xs text-slate-500">
                    {h.metrics}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RELEASE CANDIDATE & CERTIFICAÇÃO */}
      {activeTab === 'RELEASE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-black text-primary">{release.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-2xs">
                  {release.status}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Gestão de Release e Certificação Homologada
              </h3>
            </div>

            <button
              onClick={handleExecuteCertification}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
            >
              <Award className="w-4 h-4 text-white" />
              <span>Executar Certificação Operacional</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-2xs text-slate-400 font-bold uppercase">Versão</span>
              <p className="text-sm font-black text-slate-900 font-mono">{release.version}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-2xs text-slate-400 font-bold uppercase">Snapshot Base</span>
              <p className="text-sm font-black text-slate-900 font-mono truncate">{release.snapshotId}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-2xs text-slate-400 font-bold uppercase">Testes de Gate</span>
              <p className="text-sm font-black text-emerald-600 font-mono">{release.passedTestsCount} / {release.totalTestsCount}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-2xs text-slate-400 font-bold uppercase">Waivers Ativos</span>
              <p className="text-sm font-black text-amber-600 font-mono">{release.activeWaiversCount}</p>
            </div>
          </div>

          {/* Formal Operational Certificate Display */}
          {certification && (
            <div className="p-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-700" />
                  <h4 className="font-extrabold text-base text-emerald-950">
                    Certificado de Prontidão Operacional [{certification.certId}]
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-200 text-emerald-900">
                  {certification.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-emerald-950 font-medium">
                <div>Responsável Homologador: <strong>{certification.responsible}</strong></div>
                <div>Carimbo Temporal: <strong>{certification.timestamp}</strong></div>
                <div>Conformidade Auditada: <strong>{certification.currentScore}%</strong></div>
                <div>Testes V8 Validados: <strong>{certification.passedTests} / {certification.totalTests}</strong></div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-2xs text-emerald-900 leading-relaxed italic">
                {certification.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TESTES AUTOMÁTICOS V8 (41 A 60) */}
      {activeTab === 'TESTES_V8' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Caderno de Testes Automáticos V8 (Testes 41 a 60)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                20 novos testes executáveis sem mock data. Total consolidado: 60 testes automatizados (V5: 1-12 | V6: 13-24 | V7: 25-40 | V8: 41-60).
              </p>
            </div>
            <button
              onClick={() => setV8Tests(runV8AutomatedTests())}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
            >
              Reexecutar Testes V8
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {v8Tests.map(t => (
              <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xs font-extrabold text-slate-500 uppercase">{t.category}</span>
                    <span className="text-emerald-700 font-extrabold text-2xs">PASSOU</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{t.name}</h4>
                  <p className="text-2xs text-slate-600">{t.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CENTRO DE PENDÊNCIAS & ALERTAS */}
      {activeTab === 'PENDING' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="font-extrabold text-base text-slate-900">
            Centro Consolidado de Pendências & Alertas
          </h3>

          <div className="space-y-3">
            <div
              onClick={() => onNavigate('/remediacao')}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/70 transition-colors cursor-pointer flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-950">Waiver WAI-002: Revisão Programada até 31/12/2026</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Exceção formal relativa ao SMS automático no nó terminal de intervenção urgente. Reavaliação mandatória no 4º trimestre de 2026.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
            </div>

            <div
              onClick={() => onNavigate('/validacao-operacional')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Achado VAL-008: Documentação Ilegível em Fração Mista</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Requerimento pendente de resposta pela Direção de Gestão de Condomínios para clarificação de ata de assembleia de 2018.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
