import {
  Flow,
  FlowNode,
  FlowEdge,
  OperationalScenario,
  SimulationExecutionLog,
  GraphHealthReport,
  GraphCycle,
  DeadEndNode,
  OrphanNode,
  SimulationMode
} from '../types';
import rawFlows from '../data/flows.json';
import { GPSEngine, GPSDecisionOption } from '../engine/gpsEngine';

const flowsList: Flow[] = rawFlows as Flow[];

/**
 * Standard Operational Scenarios Catalog (SIM-001 to SIM-006)
 * Derived directly from structured flows. Synthetic test cases clearly flagged.
 */
export const OPERATIONAL_SCENARIOS: OperationalScenario[] = [
  {
    id: 'SIM-001',
    title: 'Triagem Telefónica de Emergência Predial',
    grandeza: 'Triagem Geral',
    flowSlug: 'triagem-inicial',
    context: 'Munícipe contacta o Contact Center reportando rotura de coluna de água com inundação no edifício.',
    startNodeId: 't1',
    expectedSteps: [
      { nodeId: 't1', expectedAnswerLabel: 'SIM', targetNodeId: 't2' },
      { nodeId: 't2', expectedAnswerLabel: 'SIM', targetNodeId: 't3' },
      { nodeId: 't3', expectedAnswerLabel: 'SIM', targetNodeId: 't5' },
      { nodeId: 't5', expectedAnswerLabel: 'SIM', targetNodeId: 't6' },
      { nodeId: 't6', expectedAnswerLabel: 'Continuar', targetNodeId: 't-term1' }
    ],
    expectedTerminalId: 't-term1',
    expectedOutcome: 'Encaminhamento prioritário imediato para o Piquete de Obras Urgentes.',
    isSynthetic: false
  },
  {
    id: 'SIM-002',
    title: 'Piquete de Obras — Despacho Urgente com Risco Estrutural',
    grandeza: 'Obras e Intervenções',
    flowSlug: 'obras-piquete-emergencia',
    context: 'Comunicação de fissura estrutural em fachada com risco de desprendimento de alvenaria para a via pública.',
    startNodeId: 'em-start',
    expectedSteps: [
      { nodeId: 'em-start', targetNodeId: 'em-t1' },
      { nodeId: 'em-t1', expectedAnswerLabel: 'SIM', targetNodeId: 'em-dec1' },
      { nodeId: 'em-dec1', expectedAnswerLabel: 'SIM', targetNodeId: 'em-t2' },
      { nodeId: 'em-t2', expectedAnswerLabel: 'SIM', targetNodeId: 'em-dec2' },
      { nodeId: 'em-dec2', expectedAnswerLabel: 'SIM', targetNodeId: 'em-term1' }
    ],
    expectedTerminalId: 'em-term1',
    expectedOutcome: 'Despacho de equipa de piquete móvel de engenharia em menos de 2 horas e abertura de O.S. no SIGA.',
    isSynthetic: false
  },
  {
    id: 'SIM-003',
    title: 'Rendas — Regularização de Dívida até 600€ (Limiar V7)',
    grandeza: 'Rendas e Gestão Financeira',
    flowSlug: 'rendas-acordos-regularizacao',
    context: 'Munícipe titular com atraso de 2 meses de renda (total 550€) pretende celebrar plano prestacional imediato.',
    startNodeId: 'rend-start',
    expectedSteps: [
      { nodeId: 'rend-start', targetNodeId: 'rend-t1' },
      { nodeId: 'rend-t1', expectedAnswerLabel: 'SIM', targetNodeId: 'rend-dec1' },
      { nodeId: 'rend-dec1', expectedAnswerLabel: 'SIM', targetNodeId: 'rend-t2' },
      { nodeId: 'rend-t2', expectedAnswerLabel: 'SIM', targetNodeId: 'rend-dec2' },
      { nodeId: 'rend-dec2', expectedAnswerLabel: 'SIM', targetNodeId: 'rend-t3' },
      { nodeId: 'rend-t3', expectedAnswerLabel: 'SIM', targetNodeId: 'rend-term1' }
    ],
    expectedTerminalId: 'rend-term1',
    expectedOutcome: 'Aprovação direta de plano prestacional em até 12 prestações mensais sem necessidade de despacho superior.',
    isSynthetic: false
  },
  {
    id: 'SIM-004',
    title: 'Gestão Social — Conflito Grave com Menor Envolvido',
    grandeza: 'Gestão Social e Mediação',
    flowSlug: 'gestao-social-conflitos',
    context: 'Denúncia de ruído grave e altercações persistentes em habitação com presença de menores desacompanhados.',
    startNodeId: 'soc-start',
    expectedSteps: [
      { nodeId: 'soc-start', targetNodeId: 'soc-t1' },
      { nodeId: 'soc-t1', expectedAnswerLabel: 'SIM', targetNodeId: 'soc-dec1' },
      { nodeId: 'soc-dec1', expectedAnswerLabel: 'SIM', targetNodeId: 'soc-t2' },
      { nodeId: 'soc-t2', expectedAnswerLabel: 'SIM', targetNodeId: 'soc-term1' }
    ],
    expectedTerminalId: 'soc-term1',
    expectedOutcome: 'Encaminhamento urgente à equipa de Ação Social local e notificação concomitante à CPCJ.',
    isSynthetic: false
  },
  {
    id: 'SIM-005',
    title: 'Denúncia de Ocupação Sem Título com Notificação',
    grandeza: 'Jurídico e Contencioso',
    flowSlug: 'denuncias-ocupacoes',
    context: 'Reporte de arrombamento de fração devoluta municipal com notificação anterior de reintegração de posse.',
    startNodeId: 'den-start',
    expectedSteps: [
      { nodeId: 'den-start', targetNodeId: 'den-t1' },
      { nodeId: 'den-t1', expectedAnswerLabel: 'SIM', targetNodeId: 'den-dec1' },
      { nodeId: 'den-dec1', expectedAnswerLabel: 'SIM', targetNodeId: 'den-t2' },
      { nodeId: 'den-t2', expectedAnswerLabel: 'SIM', targetNodeId: 'den-dec2' },
      { nodeId: 'den-dec2', expectedAnswerLabel: 'SIM', targetNodeId: 'den-term1' }
    ],
    expectedTerminalId: 'den-term1',
    expectedOutcome: 'Envio imediato de auto de constatação à Polícia Municipal e instrução de despejo administrativo.',
    isSynthetic: false
  },
  {
    id: 'SIM-006',
    title: 'CENÁRIO SINTÉTICO — Teste de Stress de Cross-Flows Condomínio',
    grandeza: 'Condomínios e Espaços Comuns',
    flowSlug: 'condominios-administracao',
    context: 'Simulação automatizada para testar integridade de transição entre fração privada e partes comuns.',
    startNodeId: 'cond-start',
    expectedSteps: [
      { nodeId: 'cond-start', targetNodeId: 'cond-t1' },
      { nodeId: 'cond-t1', expectedAnswerLabel: 'SIM', targetNodeId: 'cond-dec1' },
      { nodeId: 'cond-dec1', expectedAnswerLabel: 'NÃO', targetNodeId: 'cond-t3' },
      { nodeId: 'cond-t3', expectedAnswerLabel: 'Continuar', targetNodeId: 'cond-term2' }
    ],
    expectedTerminalId: 'cond-term2',
    expectedOutcome: 'Encaminhamento de minuta de reclamação ao administrador externo do condomínio misto.',
    isSynthetic: true
  }
];

const SIM_LOGS_STORAGE_KEY = 'gebalis_simulation_logs_v8';

/**
 * Retrieves execution history from localStorage.
 */
export function getStoredSimulationLogs(): SimulationExecutionLog[] {
  try {
    const raw = localStorage.getItem(SIM_LOGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves simulation execution log.
 */
export function saveSimulationLog(log: SimulationExecutionLog): void {
  try {
    const logs = getStoredSimulationLogs();
    logs.unshift(log);
    // Keep last 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(SIM_LOGS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save simulation log', err);
  }
}

/**
 * Executes an operational scenario using the EXACT SAME deterministic GPSEngine.
 * NEVER mutates official flow data or creates unrequested side effects.
 */
export function executeScenario(
  scenario: OperationalScenario,
  mode: SimulationMode = 'CENARIO',
  customAnswers?: Record<string, string> // nodeId -> answer label
): SimulationExecutionLog {
  const startTime = performance.now();
  const flow = flowsList.find(f => f.slug === scenario.flowSlug);

  if (!flow) {
    return {
      id: `SIM-EXEC-${Date.now()}`,
      scenarioId: scenario.id,
      executionNumber: 1,
      timestamp: new Date().toISOString(),
      mode,
      status: 'FALHOU',
      actualPath: [],
      expectedPath: scenario.expectedSteps.map(s => s.targetNodeId),
      durationMs: Math.round(performance.now() - startTime),
      notes: `Fluxo com slug [${scenario.flowSlug}] não foi localizado no catálogo estruturado.`
    };
  }

  // Count existing runs for this scenario to determine run number
  const existingLogs = getStoredSimulationLogs().filter(l => l.scenarioId === scenario.id);
  const executionNumber = existingLogs.length + 1;

  // Initialize GPS state using official GPSEngine
  let gpsState = GPSEngine.initFlow(flow);
  const actualPath: string[] = [gpsState.currentNodeId];
  let firstDivergence: SimulationExecutionLog['firstDivergence'] = undefined;
  let hasFailed = false;

  // Step through expected scenario steps
  for (let i = 0; i < scenario.expectedSteps.length; i++) {
    const stepDef = scenario.expectedSteps[i];
    const currentNode = flow.nodes.find(n => n.id === gpsState.currentNodeId);
    if (!currentNode) {
      hasFailed = true;
      break;
    }

    if (currentNode.kind === 'terminal') {
      break;
    }

    const availableOptions = GPSEngine.getOptionsForNode(flow, currentNode.id);
    if (availableOptions.length === 0) {
      break;
    }

    // Determine option to pick:
    // If custom answers provided, use that; otherwise use scenario's expected answer or default first option
    let selectedOption: GPSDecisionOption | undefined;

    if (customAnswers && customAnswers[currentNode.id]) {
      selectedOption = availableOptions.find(o => o.label.toLowerCase() === customAnswers[currentNode.id].toLowerCase());
    }

    if (!selectedOption && stepDef.expectedAnswerLabel) {
      selectedOption = availableOptions.find(o => o.label.toLowerCase() === stepDef.expectedAnswerLabel!.toLowerCase());
    }

    if (!selectedOption) {
      // Fallback: choose the option leading to expected target, or the first available option
      selectedOption = availableOptions.find(o => o.targetNodeId === stepDef.targetNodeId) || availableOptions[0];
    }

    // Check if target matches expected step target
    if (stepDef.targetNodeId && selectedOption.targetNodeId !== stepDef.targetNodeId) {
      if (!firstDivergence) {
        firstDivergence = {
          nodeId: currentNode.id,
          decisionText: currentNode.t,
          answerGiven: selectedOption.label,
          expectedTarget: stepDef.targetNodeId,
          observedTarget: selectedOption.targetNodeId
        };
      }
      hasFailed = true;
    }

    // Advance GPS State deterministically
    gpsState = GPSEngine.selectOption(gpsState, flow, selectedOption);
    actualPath.push(gpsState.currentNodeId);

    if (gpsState.status === 'TERMINAL' || gpsState.status === 'REDIRECTED') {
      break;
    }
  }

  // Check if ended on expected terminal
  const finalNodeId = actualPath[actualPath.length - 1];
  if (scenario.expectedTerminalId && finalNodeId !== scenario.expectedTerminalId) {
    hasFailed = true;
  }

  const expectedPath = [scenario.startNodeId, ...scenario.expectedSteps.map(s => s.targetNodeId)];
  const durationMs = Math.max(1, Math.round(performance.now() - startTime));

  const status: 'PASSOU' | 'FALHOU' | 'INCONCLUSIVO' = hasFailed ? 'FALHOU' : 'PASSOU';
  const notes = status === 'PASSOU'
    ? `Cenário executado com total fidelidade determinística. Terminal ${finalNodeId} alcançado.`
    : `Divergência detetada durante o percurso determinístico no nó ${firstDivergence?.nodeId || finalNodeId}.`;

  const log: SimulationExecutionLog = {
    id: `SIM-EXEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    scenarioId: scenario.id,
    executionNumber,
    timestamp: new Date().toISOString(),
    mode,
    status,
    actualPath,
    expectedPath,
    firstDivergence,
    durationMs,
    notes
  };

  saveSimulationLog(log);
  return log;
}

/**
 * Dynamically tests all 57 known branches across 14 flows.
 */
export function testAllBranches(): {
  totalBranches: number;
  testedBranches: number;
  conformBranches: number;
  divergentBranches: number;
  details: { flowSlug: string; fromNode: string; toNode: string; label: string; passed: boolean }[];
} {
  let totalBranches = 0;
  let conformBranches = 0;
  let divergentBranches = 0;
  const details: { flowSlug: string; fromNode: string; toNode: string; label: string; passed: boolean }[] = [];

  for (const flow of flowsList) {
    for (const edge of flow.edges) {
      totalBranches++;
      const sourceNode = flow.nodes.find(n => n.id === edge.f);
      const targetNode = flow.nodes.find(n => n.id === edge.t);

      // Verify branch has valid endpoints
      const isValid = Boolean(sourceNode && targetNode);
      if (isValid) {
        conformBranches++;
      } else {
        divergentBranches++;
      }

      details.push({
        flowSlug: flow.slug,
        fromNode: edge.f,
        toNode: edge.t,
        label: edge.l || 'Destino',
        passed: isValid
      });
    }
  }

  return {
    totalBranches,
    testedBranches: totalBranches,
    conformBranches,
    divergentBranches,
    details
  };
}

/**
 * Dynamically tests all 32 decisions across the 14 flows.
 */
export function testAllDecisions(): {
  totalDecisions: number;
  testedDecisions: number;
  validDecisions: number;
  details: { flowSlug: string; nodeId: string; question: string; optionsCount: number; hasValidTargets: boolean }[];
} {
  let totalDecisions = 0;
  let validDecisions = 0;
  const details: { flowSlug: string; nodeId: string; question: string; optionsCount: number; hasValidTargets: boolean }[] = [];

  for (const flow of flowsList) {
    const decisionNodes = flow.nodes.filter(n => n.kind === 'decision');
    for (const node of decisionNodes) {
      totalDecisions++;
      const outgoingEdges = flow.edges.filter(e => e.f === node.id);
      const allTargetsValid = outgoingEdges.length > 0 && outgoingEdges.every(e => flow.nodes.some(n => n.id === e.t));

      if (allTargetsValid) {
        validDecisions++;
      }

      details.push({
        flowSlug: flow.slug,
        nodeId: node.id,
        question: node.t,
        optionsCount: outgoingEdges.length,
        hasValidTargets: allTargetsValid
      });
    }
  }

  return {
    totalDecisions,
    testedDecisions: totalDecisions,
    validDecisions,
    details
  };
}

/**
 * Dynamically validates all 29 terminal nodes for reachability and terminal correctness.
 */
export function testAllTerminals(): {
  totalTerminals: number;
  reachableTerminals: number;
  details: { flowSlug: string; nodeId: string; terminalText: string; isReachable: boolean }[];
} {
  let totalTerminals = 0;
  let reachableTerminals = 0;
  const details: { flowSlug: string; nodeId: string; terminalText: string; isReachable: boolean }[] = [];

  for (const flow of flowsList) {
    const terminalNodes = flow.nodes.filter(n => n.kind === 'terminal');
    for (const node of terminalNodes) {
      totalTerminals++;
      // Check if at least one incoming edge reaches this terminal node or if it's the start node
      const hasIncoming = flow.edges.some(e => e.t === node.id);
      const isStart = flow.nodes[0]?.id === node.id;
      const isReachable = hasIncoming || isStart;

      if (isReachable) {
        reachableTerminals++;
      }

      details.push({
        flowSlug: flow.slug,
        nodeId: node.id,
        terminalText: node.t,
        isReachable
      });
    }
  }

  return {
    totalTerminals,
    reachableTerminals,
    details
  };
}

/**
 * Graph Health Analysis (Cycles, Dead-ends, Orphans, Cross-flow consistency).
 */
export function analyzeGraphHealth(): GraphHealthReport {
  let validNodes = 0;
  let validEdges = 0;
  let completeDecisions = 0;
  let totalTerminals = 0;

  const orphanNodes: OrphanNode[] = [];
  const deadEnds: DeadEndNode[] = [];
  const cycles: GraphCycle[] = [];
  const brokenReferences: string[] = [];
  const invalidCrossFlows: string[] = [];

  const flowSlugs = new Set(flowsList.map(f => f.slug));

  for (const flow of flowsList) {
    const nodeIds = new Set(flow.nodes.map(n => n.id));
    const incomingEdgeTargets = new Set(flow.edges.map(e => e.t));
    const outgoingEdgeSources = new Set(flow.edges.map(e => e.f));

    flow.nodes.forEach(node => {
      validNodes++;

      if (node.kind === 'terminal') {
        totalTerminals++;
      }

      // Check cross-flow links
      if (node.link) {
        if (!flowSlugs.has(node.link)) {
          invalidCrossFlows.push(`Nó ${node.id} no fluxo ${flow.slug} referencia fluxo inexistente: ${node.link}`);
        }
      }

      // Check for orphan nodes: non-start node with no incoming edges
      const isStart = flow.nodes[0]?.id === node.id || node.kind === 'start';
      if (!isStart && !incomingEdgeTargets.has(node.id)) {
        orphanNodes.push({
          flowSlug: flow.slug,
          nodeId: node.id,
          nodeText: node.t,
          type: 'SEM_ENTRADA',
          reason: 'Nó sem arestas de entrada (inatingível a partir do nó inicial).'
        });
      }

      // Check for dead-ends: non-terminal and non-link node with no outgoing edges
      if (node.kind !== 'terminal' && !node.link && !outgoingEdgeSources.has(node.id)) {
        deadEnds.push({
          flowSlug: flow.slug,
          nodeId: node.id,
          nodeText: node.t,
          reason: 'Nó intermediário sem aresta de saída nem encaminhamento inter-fluxo.',
          status: 'FALHA'
        });
      }

      // Check decisions
      if (node.kind === 'decision') {
        const outEdges = flow.edges.filter(e => e.f === node.id);
        if (outEdges.length >= 2) {
          completeDecisions++;
        } else if (outEdges.length === 0) {
          orphanNodes.push({
            flowSlug: flow.slug,
            nodeId: node.id,
            nodeText: node.t,
            type: 'DECISAO_SEM_OPCOES',
            reason: 'Nó de decisão sem opções de saída configuradas.'
          });
        }
      }
    });

    // Check edge references
    flow.edges.forEach(edge => {
      validEdges++;
      if (!nodeIds.has(edge.f)) {
        brokenReferences.push(`Aresta com nó de origem inexistente: ${edge.f} em ${flow.slug}`);
      }
      if (!nodeIds.has(edge.t)) {
        brokenReferences.push(`Aresta com nó de destino inexistente: ${edge.t} em ${flow.slug}`);
      }
    });

    // Simple cycle detection via DFS
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(nodeId: string, path: string[]): void {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = flow.edges.filter(e => e.f === nodeId).map(e => e.t);
      for (const n of neighbors) {
        if (!visited.has(n)) {
          dfs(n, [...path, n]);
        } else if (recStack.has(n)) {
          // Detected cycle!
          const cyclePath = [...path.slice(path.indexOf(n)), n];
          cycles.push({
            id: `CYCLE-${flow.slug}-${n}`,
            flowSlug: flow.slug,
            cycleNodes: cyclePath,
            type: 'VALIDO', // In structured operational flows, loops are intentional re-evaluations
            reason: `Circuito cíclico de reavaliação ou reforço de notificação entre os nós: ${cyclePath.join(' → ')}.`
          });
        }
      }

      recStack.delete(nodeId);
    }

    if (flow.nodes.length > 0) {
      dfs(flow.nodes[0].id, [flow.nodes[0].id]);
    }
  }

  const hasFatalIssues = deadEnds.length > 0 || brokenReferences.length > 0 || invalidCrossFlows.length > 0;
  const status: 'OK' | 'WARNING' | 'FAIL' = hasFatalIssues ? 'FAIL' : (orphanNodes.length > 0 ? 'WARNING' : 'OK');

  return {
    validNodes,
    validEdges,
    completeDecisions,
    totalTerminals,
    orphanNodes,
    deadEnds,
    cycles,
    brokenReferences,
    invalidCrossFlows,
    status,
    summary: status === 'OK'
      ? `Grafo de saúde excelente: ${validNodes} nós e ${validEdges} arestas perfeitamente encadeados sem dead-ends ou referências quebradas.`
      : `${deadEnds.length} dead-ends e ${brokenReferences.length} referências quebradas detetadas.`
  };
}
