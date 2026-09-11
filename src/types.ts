export type NodeKind = 'start' | 'process' | 'decision' | 'terminal' | 'note';

export interface FlowNode {
  id: string;
  t: string;
  kind: NodeKind;
  link?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlowEdge {
  f: string;
  t: string;
  l?: string; // label (e.g. "SIM", "NÃO", "Outro")
}

export interface Flow {
  name: string;
  slug: string;
  area?: string;
  description?: string;
  grandeza?: string;
  visioIndex?: number;
  visioPageId?: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  w: number;
  h: number;
}

export type GrandezaId =
  | 'edificado'
  | 'rendas'
  | 'divida'
  | 'lojas_garagens'
  | 'social'
  | 'juridico'
  | 'atendimento_geral'
  | 'renda_acessivel'
  | 'departamentos_centrais'
  | 'triagem';

export interface Grandeza {
  id: GrandezaId;
  order: number;
  name: string;
  code: string;
  description: string;
  iconName: string;
  color: string;
  flowSlugs: string[];
  visioPageIndices: number[];
}

export interface VisioEntry {
  pageIndex: number;
  pageID: number;
  pageName: string;
  priImage: string; // e.g. "xaml_1.htm"
  secImage: string; // e.g. "png_1.htm"
  grandezaId: GrandezaId;
  matchedSlug?: string;
  matchStatus: 'MATCH CONFIRMADO' | 'MATCH PROVÁVEL' | 'DADO NÃO ENCONTRADO NA FONTE';
  confidence: number;
  notes?: string;
}

export type ReconciliationStatus =
  | 'confirmed'     // CONFIRMADO (100% evidência forte)
  | 'probable'      // PROVÁVEL (60-99% indícios suficientes)
  | 'unconfirmed'   // NÃO CONFIRMADO (sem elementos suficientes)
  | 'subflow'       // SUBFLUXO (parte ou fase de outro fluxo)
  | 'auxiliary'     // AUXILIAR (legenda, tabela, minuta, apoio)
  | 'index'         // ÍNDICE/CAPA (introdutória, índice, capa)
  | 'duplicate'     // DUPLICADO (graficamente/estruturalmente duplicada)
  | 'orphan';       // ÓRFÃO (sem correspondência identificada)

export interface ReconciliationRecord {
  visioPageId: string; // e.g. "VISIO-001"
  visioPageNumber: number; // 1 to 145
  visioName: string;
  pageID: number;
  priImage: string;
  secImage: string;
  sourceFiles: string[];
  grandezaId: GrandezaId;
  grandezaName: string;
  flowId?: string;
  flowSlug?: string;
  flowName?: string;
  flowNodesCount?: number;
  flowDecisionsCount?: number;
  flowEdgesCount?: number;
  flowTerminalsCount?: number;
  status: ReconciliationStatus;
  confidence: number;
  matchReason: string;
  evidence: string[];
  notes?: string;
  isConflict?: boolean;
  conflictDetails?: string;
}

export interface ProvenanceRecord {
  id: string;
  element: string;
  value: string | number;
  source: string;
  evidence: string;
  confidence: number;
}

export interface BenchmarkAuditRecord {
  value: number; // 137
  title: string;
  classification: string;
  origin: string;
  context: string;
  documentAssociated: string;
  hypotheses: {
    title: string;
    description: string;
    plausibility: 'ALTA' | 'MÉDIA' | 'BAIXA';
  }[];
  warning: string;
  conclusion: string;
}

export interface AuditFinding {
  id: string;
  type: 'CONFLICT' | 'ORPHAN_VISIO' | 'FLOW_WITHOUT_VISIO' | 'INTEGRITY_WARNING' | 'SUBFLOW_IDENTIFIED' | 'AUXILIARY_PAGE';
  title: string;
  description: string;
  affectedPages?: number[];
  affectedFlowSlugs?: string[];
  evidence: string;
  recommendation: string;
}

export interface AutomatedAuditReport {
  timestamp: string;
  totalVisioPages: number; // 145
  totalStructuredFlows: number; // 14
  benchmarkHistoricalCount: number; // 137
  statusCounts: Record<ReconciliationStatus, number>;
  confidenceBuckets: {
    confirmed100: number;
    veryProbable80_99: number;
    probable60_79: number;
    uncertain40_59: number;
    unconfirmed0_39: number;
  };
  flowsWithoutVisio: string[];
  visioWithoutFlow: number[];
  conflicts: { flowSlug: string; pages: number[]; note: string }[];
  testResults: {
    id: number;
    name: string;
    passed: boolean;
    details: string;
  }[];
  isFullyAudited: boolean;
}

export interface IdentityGateMember {
  nome: string;
  parentesco: string;
  nif?: string;
  autorizado: boolean;
}

export interface IdentityGateState {
  nif: string;
  dataNascimento: string;
  comprovado: boolean;
  membros: IdentityGateMember[];
  interlocutorIndex: number | null;
  possuiProcuracao: boolean;
  status: 'NAO_INICIADO' | 'PENDENTE_VALIDACAO' | 'AUTORIZADO' | 'BLOQUEADO';
  motivoBloqueio?: string;
}

export interface GPSPathStep {
  nodeId: string;
  nodeText: string;
  nodeKind: NodeKind;
  chosenAnswer?: string;
  targetNodeId?: string;
  timestamp: string;
}

export interface GPSState {
  flowSlug: string;
  currentNodeId: string;
  history: GPSPathStep[];
  status: 'RUNNING' | 'TERMINAL' | 'REDIRECTED';
  redirectSlug?: string;
}

export interface InstitutionalMetrics {
  fluxos: number;
  nosCentrais: number;
  decisoes: number;
  ligacoes: number;
  terminais: number;
  grandezas: number;
}

export interface ForensicDivergence {
  id: string;
  categoria: 'FLUXOS' | 'NÓS' | 'DECISÕES' | 'LIGAÇÕES' | 'TERMINAIS' | 'GRANDEZAS' | 'IMAGENS' | 'ESTRUTURA';
  item: string;
  esperado: string | number;
  calculado: string | number;
  origem: string;
  justificacao: string;
  nivel: 'INFO' | 'AVISO' | 'DIVERGÊNCIA_FONTE';
}

export interface ComplianceRow {
  requisito: string;
  original: string | number;
  reconstruido: string | number;
  auditoria: string;
  estado: '✓' | '✕' | '⚠️';
  observacao: string;
}

export interface ForensicAuditReport {
  timestamp: string;
  metricsCalculated: InstitutionalMetrics;
  metricsTarget: InstitutionalMetrics;
  divergences: ForensicDivergence[];
  complianceMatrix: ComplianceRow[];
  visioTotalPages: number;
  visioMatchedCount: number;
  visioProbableCount: number;
  visioMissingDataCount: number;
  totalNodes: number;
  totalEdges: number;
  orphanNodes: { flowSlug: string; nodeId: string; nodeText: string }[];
  brokenEdges: { flowSlug: string; fromId: string; toId: string }[];
  brokenLinks: { flowSlug: string; nodeId: string; targetSlug: string }[];
  isApproved: boolean;
  approvalStatus: 'APROVADO' | 'APROVADO COM DIVERGÊNCIAS' | 'REPROVADO';
}

// Retained for backwards compatibility with any existing components
export interface FlowArea {
  id: string;
  name: string;
  description: string;
  iconName: string;
  flowSlugs: string[];
}

export interface ValidationReport {
  flowsCount: number;
  totalNodes: number;
  totalEdges: number;
  allSlugsValid: boolean;
  allNodesHaveId: boolean;
  allLinksValid: boolean;
  allEdgesValid: boolean;
  noOrphanNodes: boolean;
  brokenLinks: { flowSlug: string; nodeId: string; targetSlug: string }[];
  brokenEdges: { flowSlug: string; fromId: string; toId: string }[];
  orphanNodes: { flowSlug: string; nodeId: string; nodeText: string }[];
}

/* ==========================================================================
   PROMPT V6 — VALIDAÇÃO OPERACIONAL E CONFORMIDADE (TYPES)
   ========================================================================== */

export type ValidationStatus =
  | 'conforme'              // CONFORME (GPS reproduz o percurso documentado)
  | 'divergente'            // DIVERGENTE (diferença entre documentação e execução)
  | 'parcialmente_conforme' // PARCIALMENTE CONFORME (parte coincide, mas com desvios)
  | 'inconclusivo'          // INCONCLUSIVO (sem evidência suficiente no Visio)
  | 'nao_validavel'         // NÃO VALIDÁVEL (sem dados suficientes para comparação)
  | 'pendente_revisao';     // PENDENTE DE REVISÃO (achado a aguardar decisão humana)

export type FindingSeverity =
  | 'critical'      // CRÍTICO (encaminha para procedimento operacional diferente)
  | 'high'          // ALTO (alteração de decisão, destino ou terminal)
  | 'medium'        // MÉDIO (divergência estrutural ou de conteúdo relevante)
  | 'low'           // BAIXO (diferença textual sem impacto operacional)
  | 'informational';// INFORMATIVO (diferença de detalhe sem impacto no percurso)

export type FindingStatus =
  | 'open'          // Aberto
  | 'under_review'  // Em revisão
  | 'accepted'      // Aceite
  | 'resolved';     // Resolvido

export type OperationalImpact =
  | 'Sem impacto identificado'
  | 'Potencial impacto'
  | 'Impacto operacional'
  | 'Impacto crítico'
  | 'Não determinável';

export interface FindingHistoryItem {
  date: string;
  action: string;
  author?: string;
  note?: string;
}

export interface ValidationFinding {
  id: string; // e.g. "VAL-001"
  flowId?: string;
  flowSlug?: string;
  flowName?: string;
  visioPageId?: string;
  visioPageNumber?: number;
  nodeId?: string;
  nodeText?: string;
  type: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  visioEvidence?: string;
  flowEvidence?: string;
  gpsEvidence?: string;
  expected?: string;
  actual?: string;
  operationalImpact?: OperationalImpact;
  notes?: string;
  history?: FindingHistoryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenarioExecutionResult {
  id: string;
  flowSlug: string;
  flowName: string;
  nodeId: string;
  decisionText: string;
  optionLabel: string;
  expectedTargetId: string;
  gpsTargetId: string;
  expectedTerminalOrNext: string;
  gpsTerminalOrNext: string;
  result: 'conforme' | 'divergente' | 'inconclusivo';
  visioPageNumber?: number;
  notes?: string;
}

export interface FlowValidationResult {
  flowSlug: string;
  flowName: string;
  grandezaId: GrandezaId;
  grandezaName: string;
  visioPageNumber?: number;
  visioPageName?: string;
  v5ReconciliationStatus: ReconciliationStatus;
  v6ValidationStatus: ValidationStatus;
  complianceScore: number; // 0 - 100
  totalDecisions: number;
  testedDecisions: number;
  totalOptions: number;
  testedOptions: number;
  decisionCoveragePct: number;
  optionCoveragePct: number;
  findingsCount: number;
  maxSeverity?: FindingSeverity;
  findings: ValidationFinding[];
  scenarios: ScenarioExecutionResult[];
  auditSummary: string;
}

export interface AuditSnapshot {
  id: string;
  timestamp: string;
  name: string;
  totalFlows: number;
  totalVisioPages: number;
  conformeCount: number;
  divergenteCount: number;
  inconclusivoCount: number;
  findingsTotal: number;
  findingsBySeverity: Record<FindingSeverity, number>;
  flowScores: { flowSlug: string; score: number; status: ValidationStatus }[];
  notes?: string;
}

export interface OperationalValidationReport {
  timestamp: string;
  totalVisioPages: number; // 145
  totalStructuredFlows: number; // 14
  benchmarkHistoricalCount: number; // 137
  eligibleFlowsCount: number;
  validatedFlowsCount: number;
  conformeFlowsCount: number;
  divergenteFlowsCount: number;
  parcialmenteConformeFlowsCount: number;
  inconclusivoFlowsCount: number;
  naoValidavelFlowsCount: number;
  pendenteRevisaoFlowsCount: number;
  totalFindings: number;
  findingsBySeverity: Record<FindingSeverity, number>;
  findingsByStatus: Record<FindingStatus, number>;
  findingsByType: Record<string, number>;
  findingsByGrandeza: Record<GrandezaId, number>;
  decisionCoveragePct: number;
  optionCoveragePct: number;
  flowCoveragePct: number;
  pageCoveragePct: number;
  flowResults: FlowValidationResult[];
  allFindings: ValidationFinding[];
  allScenarios: ScenarioExecutionResult[];
  testsV6Results: { id: number; name: string; passed: boolean; details: string }[];
}

/* ==========================================================================
   PROMPT V7 — REMEDIAÇÃO CONTROLADA, GOVERNAÇÃO E REVALIDAÇÃO (TYPES)
   ========================================================================== */

export type FindingLifecycleStatus =
  | 'ABERTO'
  | 'EM_REVISAO'
  | 'ACEITE_WAIVER'
  | 'NAO_E_ERRO'
  | 'REMEDIAR'
  | 'INCONCLUSIVO'
  | 'REMEDIACAO_APROVADA'
  | 'EM_IMPLEMENTACAO'
  | 'IMPLEMENTADO'
  | 'AGUARDA_RETESTE'
  | 'REVALIDACAO'
  | 'RESOLVIDO'
  | 'REABERTO';

export type FindingDecisionType =
  | 'CORRIGIR_FLOW'
  | 'CORRIGIR_GPS'
  | 'CORRIGIR_DOCUMENTACAO'
  | 'DIFERENCA_INTENCIONAL'
  | 'ACEITE_WAIVER'
  | 'NAO_E_ERRO'
  | 'INCONCLUSIVO';

export type RemediationPriority =
  | 'P1_CRITICA'
  | 'P2_ALTA'
  | 'P3_MEDIA'
  | 'P4_BAIXA';

export type RemediationStatus =
  | 'PROPOSTA'
  | 'APROVADA'
  | 'EM_IMPLEMENTACAO'
  | 'IMPLEMENTADA'
  | 'AGUARDA_RETESTE'
  | 'REVALIDADA'
  | 'RESOLVIDA'
  | 'REABERTA';

export interface RemediationWaiver {
  id: string; // e.g. "WAI-001"
  findingId: string; // e.g. "VAL-007"
  reason: string;
  responsible: string;
  date: string;
  expiryType: 'unlimited' | 'has_review_date';
  reviewDate?: string; // YYYY-MM-DD
  conditions: string;
  evidence: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface RemediationImpactAnalysis {
  flowsAffected: number;
  nodesAffected: number;
  decisionsAffected: number;
  testsAffected: number;
  isHighImpact: boolean;
  affectedFlowSlugs: string[];
  affectedNodeIds: string[];
  details: string[];
}

export interface RemediationComment {
  id: string;
  timestamp: string;
  author: string;
  role: 'Auditor' | 'Responsável Operacional' | 'Implementador' | 'Validador';
  text: string;
  evidenceRef?: string;
}

export interface RemediationRetestResult {
  timestamp: string;
  passed: boolean;
  executedBy: string;
  beforeResult: string;
  afterResult: string;
  nodeTested: string;
  decisionTested: string;
  regressionsDetected: number;
  regressionDetails?: string[];
  terminalChecked: boolean;
  crossFlowChecked: boolean;
  pathOutcome: string;
}

export interface RemediationPlan {
  id: string; // e.g. "REM-001" (nunca reutilizado)
  findingId: string; // e.g. "VAL-004"
  flowSlug: string;
  flowName: string;
  visioPageId?: string;
  visioPageNumber?: number;
  nodeId?: string;
  problemDescription: string;
  probableCause: string;
  proposedSolution: string;
  affectedFiles: string[];
  expectedImpact: string;
  targetType: 'FLOW_JSON' | 'GPS_MOTOR' | 'DOCUMENTACAO';
  priority: RemediationPriority;
  status: RemediationStatus;
  
  // Separation of roles
  responsibleAnalysis: string;
  responsibleDecision: string;
  responsibleImplementation?: string;
  responsibleValidation?: string;

  // Diff representations
  currentState: {
    text?: string;
    destination?: string;
    codeSnippet?: string;
  };
  proposedState: {
    text?: string;
    destination?: string;
    codeSnippet?: string;
  };
  diffJsonSnippet?: {
    before: string;
    after: string;
  };

  impactAnalysis: RemediationImpactAnalysis;

  approval?: {
    approved: boolean;
    responsible: string;
    timestamp: string;
    decision: string;
    comments: string;
  };

  preSnapshotId: string;
  postSnapshotId?: string;
  versionTag?: string;

  retestResult?: RemediationRetestResult;
  comments: RemediationComment[];
  evidenceAttachments: {
    id: string;
    type: 'VISIO_PAGE' | 'FLOW_NODE' | 'DECISION' | 'SNAPSHOT' | 'DOC';
    reference: string;
    description: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface ChangeRecord {
  id: string;
  remediationId: string;
  findingId: string;
  timestamp: string;
  actor: string;
  component: string;
  file?: string;
  before: unknown;
  after: unknown;
  reason: string;
  approval: string;
  preSnapshot: string;
  postSnapshot?: string;
  validationResult?: string;
}

export type VersionStatus =
  | 'DRAFT'
  | 'EM_AUDITORIA'
  | 'EM_REMEDIACAO'
  | 'EM_REVALIDACAO'
  | 'APROVADA'
  | 'PUBLICADA'
  | 'BLOQUEADA';

export interface GovernanceVersion {
  id: string; // e.g. "VERSION-2026.09.10.01"
  label: string; // e.g. "V7.0 — Remediação Controlada"
  previousVersion: string;
  status: VersionStatus;
  changes: string[];
  remediationIds: string[];
  responsible: string;
  timestamp: string;
  isPublicationBlocked: boolean;
  publicationBlockReason?: string;
}

export interface V7AutomatedTestResult {
  id: number;
  name: string;
  passed: boolean;
  details: string;
}

export interface GovernanceKPIs {
  totalFindings: number;
  openCount: number;
  underReviewCount: number;
  acceptedWaiversCount: number;
  inRemediationCount: number;
  awaitingRetestCount: number;
  resolvedCount: number;
  reopenedCount: number;
  baselineScore: number; // 92.4%
  currentScore: number;
  avgResolutionTime: string;
  reopeningsCount: number;
  regressionsCount: number;
  publicationBlocked: boolean;
  publicationBlockReason?: string;
}

// ---------------------------------------------------------------------------
// CAMADA 6 — CONSOLIDAÇÃO, PRONTIDÃO OPERACIONAL E SIMULAÇÃO (V8)
// ---------------------------------------------------------------------------

export type OperationalReadinessState =
  | 'NAO_INICIADO'
  | 'EM_PREPARACAO'
  | 'EM_TESTE'
  | 'COM_PENDENCIAS'
  | 'APTO_COM_RESERVAS'
  | 'APTO_PARA_PRODUCAO'
  | 'BLOQUEADO';

export type ReadinessCheckStatus =
  | 'PENDENTE'
  | 'PASSOU'
  | 'FALHOU'
  | 'NAO_APLICAVEL'
  | 'PENDENTE_DE_EVIDENCIA';

export type ReadinessCategory =
  | 'A_DADOS'
  | 'B_MOTOR_GPS'
  | 'C_AUDITORIA'
  | 'D_REMEDIACAO'
  | 'E_GOVERNACAO'
  | 'F_UX'
  | 'G_PERFORMANCE';

export interface ReadinessCheckItem {
  id: string;
  category: ReadinessCategory;
  categoryLabel: string;
  title: string;
  description: string;
  status: ReadinessCheckStatus;
  evidence?: string;
  testRef?: string;
  responsible: string;
  updatedAt: string;
}

export interface ReadinessMatrixRow {
  area: string;
  status: OperationalReadinessState;
  evidence: string;
  lastValidation: string;
  responsible: string;
  notes?: string;
}

export interface SystemHealthItem {
  component: string;
  label: string;
  status: 'OK' | 'WARNING' | 'FAIL';
  message: string;
  metrics?: string;
}

export type SimulationMode =
  | 'LIVRE'
  | 'GUIADA'
  | 'CENARIO'
  | 'TESTE_CONFORMIDADE';

export interface OperationalScenario {
  id: string; // e.g. "SIM-001"
  title: string;
  grandeza: string;
  flowSlug: string;
  context: string;
  startNodeId: string;
  expectedSteps: {
    nodeId: string;
    expectedAnswerLabel?: string;
    targetNodeId: string;
  }[];
  expectedTerminalId: string;
  expectedOutcome: string;
  isSynthetic: boolean; // marked "CENÁRIO SINTÉTICO DE TESTE" if synthetic
}

export interface SimulationExecutionLog {
  id: string;
  scenarioId: string;
  executionNumber: number;
  timestamp: string;
  mode: SimulationMode;
  status: 'PASSOU' | 'FALHOU' | 'INCONCLUSIVO';
  actualPath: string[]; // sequence of node IDs
  expectedPath: string[]; // sequence of node IDs
  firstDivergence?: {
    nodeId: string;
    decisionText: string;
    answerGiven: string;
    expectedTarget: string;
    observedTarget: string;
  };
  durationMs: number;
  notes: string;
}

export interface GraphCycle {
  id: string;
  flowSlug: string;
  cycleNodes: string[];
  type: 'VALIDO' | 'SUSPEITO' | 'INVALIDO';
  reason: string;
}

export interface DeadEndNode {
  flowSlug: string;
  nodeId: string;
  nodeText: string;
  reason: string;
  status: 'FALHA';
}

export interface OrphanNode {
  flowSlug: string;
  nodeId: string;
  nodeText: string;
  type: 'SEM_ENTRADA' | 'SEM_SAIDA' | 'NAO_UTILIZADO' | 'DECISAO_SEM_OPCOES' | 'OPCAO_SEM_DESTINO';
  reason: string;
}

export interface GraphHealthReport {
  validNodes: number;
  validEdges: number;
  completeDecisions: number;
  totalTerminals: number;
  orphanNodes: OrphanNode[];
  deadEnds: DeadEndNode[];
  cycles: GraphCycle[];
  brokenReferences: string[];
  invalidCrossFlows: string[];
  status: 'OK' | 'WARNING' | 'FAIL';
  summary: string;
}

export type AppOperationMode =
  | 'DEMONSTRACAO'
  | 'OPERAÇÃO'
  | 'AUDITORIA'
  | 'ADMINISTRAÇÃO';

export type PerspectiveView =
  | 'EXECUTIVA'
  | 'TECNICA'
  | 'AUDITOR'
  | 'OPERACIONAL';

export interface ReleaseCandidate {
  id: string; // e.g. "RELEASE-2026.09.10-RC01"
  version: string;
  status: 'DRAFT' | 'VALIDACAO' | 'APROVACAO' | 'CANDIDATA' | 'PUBLICADA' | 'BLOQUEADA';
  timestamp: string;
  snapshotId: string;
  changesCount: number;
  passedTestsCount: number;
  totalTestsCount: number;
  regressionsCount: number;
  activeWaiversCount: number;
  score: number;
  checklistStatus: string;
  isBlocked: boolean;
  blockReason?: string;
  responsible: string;
}

export interface OperationalCertification {
  certId: string; // e.g. "CERT-2026-09-10-V8-01"
  version: string;
  snapshotId: string;
  currentScore: number;
  passedTests: number;
  totalTests: number;
  openFindingsCount: number;
  activeWaiversCount: number;
  responsible: string;
  timestamp: string;
  status: 'APTO_PARA_PRODUCAO' | 'APTO_COM_RESERVAS' | 'BLOQUEADO';
  disclaimer: string;
}

export interface V8AutomatedTestResult {
  id: number; // 41 to 60
  name: string;
  passed: boolean;
  details: string;
  category: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  source: 'VISIO' | 'FLOW' | 'GPS' | 'VALIDAÇÃO' | 'REMEDIAÇÃO' | 'SIMULAÇÃO' | 'AUDITORIA' | 'OPERAÇÃO' | 'INCIDENTE' | 'MELHORIA';
  linkPath: string;
  badgeText?: string;
  matchDetail: string;
}

/* =========================================================================
 * CAMADA 7 — OPERAÇÃO ASSISTIDA, MONITORIZAÇÃO CONTÍNUA E EVOLUÇÃO CONTROLADA (V9)
 * ========================================================================= */

export type OperationalEnvironment = 'production' | 'staging' | 'simulation';

export type OperationalSessionStatus =
  | 'active'
  | 'completed'
  | 'abandoned'
  | 'blocked'
  | 'escalated'
  | 'technical_error';

export type OperationalBlockType =
  | 'INFORMAÇÃO_INSUFICIENTE'
  | 'REGRA_AMBÍGUA'
  | 'DESTINO_INDISPONÍVEL'
  | 'ERRO_TÉCNICO'
  | 'PROCEDIMENTO_NÃO_CONTEMPLADO'
  | 'NECESSITA_DECISÃO_HUMANA';

export interface SessionStep {
  stepIndex: number;
  flowSlug: string;
  nodeId: string;
  nodeText: string;
  kind: NodeKind;
  decisionQuestion?: string;
  selectedOption?: string;
  destinationNodeId?: string;
  destinationFlowSlug?: string;
  timestamp: string;
  durationMs?: number;
  uncertaintyMarked?: boolean;
  uncertaintyComment?: string;
}

export type FeedbackRating =
  | 'MUITO_UTIL'
  | 'UTIL'
  | 'POUCO_UTIL'
  | 'NAO_RESOLVEU'
  | 'NECESSITEI_AJUDA';

export interface FeedbackRecord {
  id: string; // e.g. "FDB-001"
  sessionId: string;
  environment: OperationalEnvironment;
  flowSlug: string;
  nodeId?: string;
  rating: FeedbackRating;
  comment?: string;
  timestamp: string;
  status: 'NOVO' | 'EM_ANALISE' | 'ARQUIVADO' | 'CONVERTIDO_MELHORIA' | 'CONVERTIDO_INCIDENTE';
  linkedIncidentId?: string;
  linkedImprovementId?: string;
}

export interface OperationalSession {
  id: string; // e.g. "OPS-YYYYMMDD-XXXX"
  environment: OperationalEnvironment;
  startTime: string;
  endTime?: string;
  operatorId?: string;
  grandeza?: string;
  flowId?: string;
  status: OperationalSessionStatus;
  currentNode?: string;
  steps: SessionStep[];
  feedback?: FeedbackRecord[];
  incidentId?: string;
  blockReason?: string;
  blockType?: OperationalBlockType;
  escalationTarget?: string;
  escalationReason?: string;
}

export type OperationalIncidentType =
  | 'PROCESSUAL'
  | 'TECNICO'
  | 'DOCUMENTAL'
  | 'UX'
  | 'DADOS'
  | 'INTEGRACAO';

export type OperationalIncidentStatus =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'CLASSIFICADO'
  | 'EM_TRATAMENTO'
  | 'RESOLVIDO'
  | 'VALIDADO'
  | 'ENCERRADO'
  | 'REABERTO';

export interface OperationalIncident {
  id: string; // e.g. "INC-001"
  title: string;
  type: OperationalIncidentType;
  severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  status: OperationalIncidentStatus;
  environment: OperationalEnvironment;
  flowSlug?: string;
  nodeId?: string;
  sessionId?: string;
  feedbackId?: string;
  reportedBy: string;
  assignedTo: string;
  escalationTarget?: 'Auditoria' | 'Responsável Operacional' | 'Equipa Técnica' | 'Governação' | 'Documentação';
  linkedFindingId?: string; // e.g. "VAL-009"
  description: string;
  evidence: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export type ImprovementType =
  | 'UX'
  | 'PERFORMANCE'
  | 'PESQUISA'
  | 'NAVEGACAO'
  | 'CONTEUDO'
  | 'DOCUMENTACAO'
  | 'NOVO_FLOW'
  | 'NOVA_INTEGRACAO';

export type ImprovementStatus =
  | 'SUGESTAO'
  | 'ANALISE'
  | 'PRIORIZACAO'
  | 'PROPOSTA'
  | 'APROVACAO'
  | 'DESENVOLVIMENTO'
  | 'TESTE'
  | 'REVALIDACAO'
  | 'RELEASE';

export interface ImprovementRequest {
  id: string; // e.g. "IMP-001"
  title: string;
  type: ImprovementType;
  status: ImprovementStatus;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  isProcessAlteration: boolean; // Se true, EXIGE remediação formal V7 (REM-XXX)!
  linkedRemediationId?: string;
  origin: 'OPERADOR' | 'FEEDBACK' | 'AUDITORIA' | 'TECNICA';
  description: string;
  proposedChange: string;
  author: string;
  createdAt: string;
  targetRelease?: string;
}

export interface ProcessDriftItem {
  id: string; // e.g. "DRIFT-001"
  driftType: 'ESTRUTURAL' | 'DOCUMENTAL' | 'OPERACIONAL';
  component: string;
  originVersion: string;
  targetVersion: string;
  evidence: string;
  impact: 'ALTO' | 'MEDIO' | 'BAIXO';
  status: 'DETECTADO' | 'EM_ANALISE' | 'JUSTIFICADO' | 'REQUER_REVISAO';
  recommendation: string;
  decision?: string;
}

export interface RollbackRecord {
  id: string; // e.g. "ROLLBACK-001"
  revertedVersion: string;
  restoredVersion: string;
  reason: string;
  responsible: string;
  timestamp: string;
  snapshotId: string;
}

export interface V9AutomatedTestResult {
  id: number; // 61 to 80
  name: string;
  passed: boolean;
  details: string;
  category: string;
}

export interface OperationalAnalyticsData {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  escalatedSessions: number;
  blockedSessions: number;
  technicalErrorSessions: number;
  completionRate: number;
  abandonmentRate: number;
  escalationRate: number;
  avgDurationSeconds: number;
  totalDecisionsExecuted: number;
  totalTerminalsReached: number;
  flowsUsage: {
    flowSlug: string;
    flowName: string;
    count: number;
    completed: number;
    escalated: number;
    feedbackAvg?: string;
  }[];
  topDecisions: {
    flowSlug: string;
    nodeId: string;
    question: string;
    count: number;
    options: { label: string; count: number }[];
  }[];
  dropoffPoints: {
    flowSlug: string;
    nodeId: string;
    nodeText: string;
    count: number;
    reason: string;
  }[];
  feedbackStats: {
    total: number;
    veryUseful: number;
    useful: number;
    somewhatUseful: number;
    notSolved: number;
    neededHelp: number;
    positiveRatio: number;
  };
}

export interface OperationalHealthSummary {
  processual: 'CONFORME' | 'ATENÇÃO' | 'DIVERGENTE';
  operacional: 'SAUDÁVEL' | 'ATENÇÃO' | 'CRÍTICO';
  tecnico: 'DISPONÍVEL' | 'DEGRADADO' | 'INDISPONÍVEL';
  governacao: 'CONFORME_COM_RESERVAS' | 'BLOQUEIO_PENDENTE';
  release: 'PUBLICADA_RC01' | 'EM_OBSERVAÇÃO';
  overallStatus: 'SAUDÁVEL' | 'ATENÇÃO' | 'CRÍTICO';
  overallReason: string;
}


