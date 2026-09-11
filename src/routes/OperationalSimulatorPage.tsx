import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  GitFork,
  Compass,
  FileCheck,
  ShieldCheck,
  Split,
  ChevronRight,
  ExternalLink,
  Layers,
  History,
  Activity,
  Workflow
} from 'lucide-react';
import {
  Flow,
  FlowNode,
  GPSState,
  IdentityGateState,
  SimulationMode,
  OperationalScenario,
  SimulationExecutionLog,
  GraphHealthReport
} from '../types';
import rawFlows from '../data/flows.json';
import { GPSEngine, GPSDecisionOption } from '../engine/gpsEngine';
import {
  OPERATIONAL_SCENARIOS,
  executeScenario,
  getStoredSimulationLogs,
  testAllBranches,
  testAllDecisions,
  testAllTerminals,
  analyzeGraphHealth
} from '../simulation/simulationEngine';

const flowsList: Flow[] = rawFlows as Flow[];

interface OperationalSimulatorPageProps {
  onNavigate: (path: string) => void;
}

export const OperationalSimulatorPage: React.FC<OperationalSimulatorPageProps> = ({ onNavigate }) => {
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('CENARIO');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SIM-001');
  const [selectedFlowSlug, setSelectedFlowSlug] = useState<string>('triagem-inicial');

  // Interactive GPS state for Free & Guided Simulation
  const currentFlow = useMemo(() => {
    return flowsList.find(f => f.slug === selectedFlowSlug) || flowsList[0];
  }, [selectedFlowSlug]);

  const [gpsState, setGpsState] = useState<GPSState>(() => GPSEngine.initFlow(currentFlow));
  const [previousTrail, setPreviousTrail] = useState<string[] | null>(null);

  // Identity Gate State with synthetic tag
  const [identityState, setIdentityState] = useState<IdentityGateState>(() => {
    const s = GPSEngine.createDefaultIdentityGate();
    s.nif = '123456789';
    s.dataNascimento = '1975-05-12';
    s.comprovado = true;
    s.status = 'AUTORIZADO';
    return s;
  });

  // Automated batch test modal / drawer state
  const [activeBatchTest, setActiveBatchTest] = useState<'NONE' | 'BRANCHES' | 'DECISIONS' | 'TERMINALS' | 'GRAPH_HEALTH'>('NONE');
  const [batchResults, setBatchResults] = useState<any>(null);

  // Scenario execution logs
  const [executionLogs, setExecutionLogs] = useState<SimulationExecutionLog[]>(() => getStoredSimulationLogs());
  const [lastLog, setLastLog] = useState<SimulationExecutionLog | null>(null);

  const selectedScenario = useMemo(() => {
    return OPERATIONAL_SCENARIOS.find(s => s.id === selectedScenarioId) || OPERATIONAL_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Handle Scenario Run
  const handleRunScenario = (sc: OperationalScenario) => {
    const log = executeScenario(sc, 'CENARIO');
    setLastLog(log);
    setExecutionLogs(getStoredSimulationLogs());
  };

  // Free/Guided GPS options
  const currentNode = currentFlow.nodes.find(n => n.id === gpsState.currentNodeId);
  const availableOptions = currentNode ? GPSEngine.getOptionsForNode(currentFlow, currentNode.id) : [];

  // Handle GPS option selection
  const handleSelectOption = (option: GPSDecisionOption) => {
    // Save current path to previous trail before advancing for diff comparison
    setPreviousTrail(gpsState.history.map(h => h.nodeId));
    const nextState = GPSEngine.selectOption(gpsState, currentFlow, option);
    setGpsState(nextState);
  };

  // Handle Rollback / Reset in Call Trail 2.0
  const handleRollback = (index: number) => {
    setPreviousTrail(gpsState.history.map(h => h.nodeId));
    const nextState = GPSEngine.rollbackToStep(gpsState, index);
    setGpsState(nextState);
  };

  const handleResetGPS = () => {
    setPreviousTrail(gpsState.history.map(h => h.nodeId));
    setGpsState(GPSEngine.initFlow(currentFlow));
  };

  // Run Batch Tests
  const handleRunBranchesTest = () => {
    const res = testAllBranches();
    setBatchResults(res);
    setActiveBatchTest('BRANCHES');
  };

  const handleRunDecisionsTest = () => {
    const res = testAllDecisions();
    setBatchResults(res);
    setActiveBatchTest('DECISIONS');
  };

  const handleRunTerminalsTest = () => {
    const res = testAllTerminals();
    setBatchResults(res);
    setActiveBatchTest('TERMINALS');
  };

  const handleRunGraphHealth = () => {
    const res = analyzeGraphHealth();
    setBatchResults(res);
    setActiveBatchTest('GRAPH_HEALTH');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                CAMADA 6 — SIMULADOR OPERACIONAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-100 text-emerald-800">
                MOTOR DETERMINÍSTICO GPS UNIFICADO
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-amber-100 text-amber-800">
                DADOS FICTÍCIOS — SIMULAÇÃO
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulador Operacional & Testes Determinísticos
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Execução e teste rigoroso dos 14 fluxos operacionais da GEBALIS recorrendo ao mesmo motor formal do GPS.
              Validação de cenários ponta a ponta, deteção de ciclos, nós órfãos e análise comparativa de percursos (Call Trail 2.0).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('/prontidao-operacional')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Painel de Prontidão</span>
            </button>
            <button
              onClick={handleRunGraphHealth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Health Check do Grafo</span>
            </button>
          </div>
        </div>

        {/* Quick Batch Actions Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Testes Globais Instantâneos:
          </span>
          <button
            onClick={handleRunBranchesTest}
            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5 text-teal-600" />
            <span>Testar Todas as Ramificações (57)</span>
          </button>
          <button
            onClick={handleRunDecisionsTest}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Split className="w-3.5 h-3.5 text-indigo-600" />
            <span>Testar Todas as Decisões (32)</span>
          </button>
          <button
            onClick={handleRunTerminalsTest}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Testar Terminais (29)</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        {[
          { id: 'CENARIO', label: 'Simulação de Cenários (SIM-xxx)', icon: Workflow },
          { id: 'LIVRE', label: 'Simulação Livre & Call Trail 2.0', icon: Compass },
          { id: 'GUIADA', label: 'Simulação Guiada com Apoio', icon: HelpCircle },
          { id: 'TESTE_CONFORMIDADE', label: 'Histórico de Execuções & Conformidade', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = simulationMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSimulationMode(tab.id as SimulationMode)}
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

      {/* TAB 1: CENÁRIOS OPERACIONAIS (SIM-001 A SIM-006) */}
      {simulationMode === 'CENARIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Scenarios List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Catálogo de Cenários Operacionais
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {OPERATIONAL_SCENARIOS.length} Cenários
              </span>
            </div>

            <div className="space-y-2">
              {OPERATIONAL_SCENARIOS.map(sc => {
                const isSelected = sc.id === selectedScenarioId;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-black text-slate-800">
                        {sc.id}
                      </span>
                      {sc.isSynthetic ? (
                        <span className="px-2 py-0.5 rounded text-2xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          CENÁRIO SINTÉTICO DE TESTE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                          PROCEDIMENTO OFICIAL
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{sc.title}</h4>
                    <p className="text-2xs text-slate-500 font-medium mt-1">{sc.grandeza} • [{sc.flowSlug}]</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center/Right: Selected Scenario Execution & Verification Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-black text-primary">{selectedScenario.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">{selectedScenario.grandeza}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedScenario.title}</h2>
                </div>
                <button
                  onClick={() => handleRunScenario(selectedScenario)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Executar Cenário</span>
                </button>
              </div>

              {/* Context & Description */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Contexto Munícipe & Situação Reportada:
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {selectedScenario.context}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Ponto de Entrada: <strong className="font-mono text-slate-800">{selectedScenario.startNodeId}</strong></span>
                  <span>Terminal Esperado: <strong className="font-mono text-slate-800">{selectedScenario.expectedTerminalId}</strong></span>
                </div>
              </div>

              {/* Step Sequence Blueprint */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                  Sequência Determinística Esperada:
                </h4>
                <div className="space-y-2">
                  {selectedScenario.expectedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-800 shrink-0">Nó [{step.nodeId}]</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {step.expectedAnswerLabel ? (
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold shrink-0">
                          Resposta: {step.expectedAnswerLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Transição direta</span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-emerald-800 shrink-0">Destino: [{step.targetNodeId}]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Result (if executed) */}
              {lastLog && lastLog.scenarioId === selectedScenario.id && (
                <div className={`p-4 rounded-xl border ${
                  lastLog.status === 'PASSOU'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {lastLog.status === 'PASSOU' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-extrabold text-sm">
                        Resultado da Simulação #{lastLog.executionNumber}: {lastLog.status}
                      </span>
                    </div>
                    <span className="text-2xs font-mono opacity-75">
                      Duração: {lastLog.durationMs}ms
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{lastLog.notes}</p>

                  {/* Path comparison */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 font-mono text-2xs space-y-1">
                    <div>
                      <span className="font-bold opacity-80">Percurso Realizado: </span>
                      <span>{lastLog.actualPath.join(' → ')}</span>
                    </div>
                    <div>
                      <span className="font-bold opacity-80">Percurso Esperado: </span>
                      <span>{lastLog.expectedPath.join(' → ')}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleRunScenario(selectedScenario)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Repetir Teste</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: SIMULAÇÃO LIVRE & GUIADA COM CALL TRAIL 2.0 */}
      {(simulationMode === 'LIVRE' || simulationMode === 'GUIADA') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Flow Selector & Identity Gate */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Configuração do Teste
              </h3>

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">
                  Fluxo Operacional Sob Teste
                </label>
                <select
                  value={selectedFlowSlug}
                  onChange={(e) => {
                    setSelectedFlowSlug(e.target.value);
                    const f = flowsList.find(flow => flow.slug === e.target.value) || flowsList[0];
                    setGpsState(GPSEngine.initFlow(f));
                    setPreviousTrail(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-primary"
                >
                  {flowsList.map(f => (
                    <option key={f.slug} value={f.slug}>
                      {f.name} ({f.nodes.length} nós)
                    </option>
                  ))}
                </select>
              </div>

              {/* Gate of Identity status preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-bold text-slate-500 uppercase">Gate of Identity</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {identityState.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  Munícipe: <strong>Manuel Silva</strong> (NIF: {identityState.nif})
                </p>
                <p className="text-2xs text-amber-700 italic">
                  * Modo de simulação: credenciais sintéticas não persistentes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetGPS}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar Simulação a Partir do Nó Inicial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Columns: Interactive Node Execution + Call Trail 2.0 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active GPS Node Step Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-black text-xs">
                    {currentNode?.id}
                  </span>
                  <span className="text-2xs uppercase font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Tipo: {currentNode?.kind.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Passo {gpsState.history.length}
                </span>
              </div>

              {/* Question / Instruction */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {currentNode?.t}
                </h3>
                {simulationMode === 'GUIADA' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Orientação ao Operador:</strong> Confirme a identidade do cidadão e certifique-se de que os dados foram confirmados antes de validar a transição.
                  </div>
                )}
              </div>

              {/* Choices / Actions */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Opções Determinísticas Disponíveis:
                </h4>
                {availableOptions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm">
                    {currentNode?.kind === 'terminal' ? (
                      <div className="text-emerald-700 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Fim do percurso operacional. Terminal alcançado.</span>
                      </div>
                    ) : (
                      <span>Nenhuma opção de saída disponível.</span>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">
                            {opt.label}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-2xs font-mono text-slate-500">
                          Destino: Nó [{opt.targetNodeId}]
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CALL TRAIL 2.0 (Diff & Rollback) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    Call Trail 2.0 & Comparação de Percursos
                  </h3>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Histórico sequencial determinístico com capacidade de rollback e visualização diff.
                  </p>
                </div>
                {previousTrail && (
                  <span className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 text-2xs font-bold">
                    Diff de Percurso Ativo
                  </span>
                )}
              </div>

              {/* Call Trail Step Sequence */}
              <div className="space-y-2">
                {gpsState.history.map((step, idx) => {
                  const isCurrent = idx === gpsState.history.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isCurrent
                          ? 'bg-primary/5 border-primary/30 font-bold text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-2xs flex items-center justify-center font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-slate-800">[{step.nodeId}]</span>
                        <span className="truncate max-w-xs sm:max-w-md">{step.nodeText}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {step.chosenAnswer && (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-primary font-bold text-2xs">
                            {step.chosenAnswer}
                          </span>
                        )}
                        {!isCurrent && (
                          <button
                            onClick={() => handleRollback(idx)}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 font-bold text-2xs border border-slate-200 transition-colors"
                            title="Recalcular a partir deste nó"
                          >
                            Voltar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Diff: Percurso Anterior vs Percurso Atual */}
              {previousTrail && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white font-mono text-2xs space-y-2">
                  <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Diff Comparativo de Execução:
                  </div>
                  <div className="text-amber-400">
                    <span className="text-slate-500 font-bold mr-2">PERCURSO ANTERIOR:</span>
                    {previousTrail.join(' → ')}
                  </div>
                  <div className="text-emerald-400">
                    <span className="text-slate-500 font-bold mr-2">PERCURSO ATUAL:</span>
                    {gpsState.history.map(h => h.nodeId).join(' → ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTÓRICO DE SIMULAÇÃO */}
      {simulationMode === 'TESTE_CONFORMIDADE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Histórico Consolidado de Execuções de Simulação
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {executionLogs.length} Registos
            </span>
          </div>

          {executionLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhuma simulação registada nesta sessão. Execute um dos cenários para gerar histórico.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold text-2xs">
                  <tr>
                    <th className="p-3">ID Cenário</th>
                    <th className="p-3">Execução</th>
                    <th className="p-3">Modo</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Duração</th>
                    <th className="p-3">Percurso</th>
                    <th className="p-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {executionLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{log.scenarioId}</td>
                      <td className="p-3 font-mono">#{log.executionNumber}</td>
                      <td className="p-3 text-slate-600 font-bold">{log.mode}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-2xs font-extrabold ${
                          log.status === 'PASSOU'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{log.durationMs}ms</td>
                      <td className="p-3 font-mono text-2xs text-slate-600 max-w-xs truncate">
                        {log.actualPath.join(' → ')}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Batch Test Modal / Drawer */}
      {activeBatchTest !== 'NONE' && batchResults && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {activeBatchTest === 'BRANCHES' && 'Resultado do Teste de Ramificações (57)'}
                  {activeBatchTest === 'DECISIONS' && 'Resultado do Teste de Decisões (32)'}
                  {activeBatchTest === 'TERMINALS' && 'Resultado do Teste de Terminais (29)'}
                  {activeBatchTest === 'GRAPH_HEALTH' && 'Health Check Estrutural do Grafo'}
                </h3>
              </div>
              <button
                onClick={() => setActiveBatchTest('NONE')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {activeBatchTest === 'BRANCHES' && (
                <div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm mb-4">
                    {batchResults.conformBranches} / {batchResults.totalBranches} ramificações testadas e conformes com a topologia do grafo.
                  </div>
                  <div className="space-y-1 font-mono text-2xs">
                    {batchResults.details.slice(0, 30).map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                        <span>{d.flowSlug}: [{d.fromNode}] → [{d.toNode}] ({d.label})</span>
                        <span className="text-emerald-700 font-bold">CONFORME</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeBatchTest === 'DECISIONS' && (
                <div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-sm mb-4">
                    {batchResults.validDecisions} / {batchResults.totalDecisions} decisões possuem saídas válidas para nós ou terminais.
                  </div>
                  <div className="space-y-1 text-xs">
                    {batchResults.details.map((d: any, i: number) => (
                      <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">[{d.nodeId}] </span>
                          <span className="text-slate-600">{d.question}</span>
                        </div>
                        <span className="font-mono text-2xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded shrink-0">
                          {d.optionsCount} opções
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeBatchTest === 'TERMINALS' && (
                <div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm mb-4">
                    {batchResults.reachableTerminals} / {batchResults.totalTerminals} terminais alcançáveis sem caminhos impossíveis.
                  </div>
                  <div className="space-y-1 text-xs">
                    {batchResults.details.map((d: any, i: number) => (
                      <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800">[{d.nodeId}] </span>
                          <span className="text-slate-700">{d.terminalText}</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-2xs bg-emerald-100 px-2 py-0.5 rounded">
                          ALCANÇÁVEL
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeBatchTest === 'GRAPH_HEALTH' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <h4 className="font-bold text-sm mb-1">Estado Global: {batchResults.status}</h4>
                    <p className="text-xs">{batchResults.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-2xs text-slate-400 font-bold uppercase">Nós Válidos</span>
                      <p className="text-lg font-black text-slate-900">{batchResults.validNodes}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-2xs text-slate-400 font-bold uppercase">Arestas Válidas</span>
                      <p className="text-lg font-black text-slate-900">{batchResults.validEdges}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-2xs text-slate-400 font-bold uppercase">Dead-ends</span>
                      <p className="text-lg font-black text-emerald-600">{batchResults.deadEnds.length}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-2xs text-slate-400 font-bold uppercase">Ciclos Válidos</span>
                      <p className="text-lg font-black text-indigo-600">{batchResults.cycles.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveBatchTest('NONE')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
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
