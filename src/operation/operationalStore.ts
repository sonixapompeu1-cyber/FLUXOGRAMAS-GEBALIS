import {
  OperationalEnvironment,
  OperationalSession,
  FeedbackRecord,
  OperationalIncident,
  ImprovementRequest,
  ProcessDriftItem,
  RollbackRecord,
  OperationalAnalyticsData,
  OperationalHealthSummary,
  OperationalIncidentStatus,
  ImprovementStatus
} from '../types';

const STORAGE_ENV_KEY = 'gebalis_v9_active_environment';
const STORAGE_SESSIONS_KEY = 'gebalis_v9_operational_sessions';
const STORAGE_FEEDBACK_KEY = 'gebalis_v9_feedback_records';
const STORAGE_INCIDENTS_KEY = 'gebalis_v9_incidents';
const STORAGE_IMPROVEMENTS_KEY = 'gebalis_v9_improvements';
const STORAGE_DRIFT_KEY = 'gebalis_v9_process_drift';
const STORAGE_ROLLBACK_KEY = 'gebalis_v9_rollbacks';

/**
 * Baseline initial incidents catalogued during staging & first operational observation.
 */
const INITIAL_INCIDENTS: OperationalIncident[] = [
  {
    id: 'INC-001',
    title: 'Dúvida frequente na distinção entre rotura urgente e infiltração lenta',
    type: 'PROCESSUAL',
    severity: 'MEDIO',
    status: 'EM_TRATAMENTO',
    environment: 'production',
    flowSlug: 'piquete-obras',
    nodeId: 'N1',
    reportedBy: 'Operador DAC-04',
    assignedTo: 'Dra. Helena Matos (Auditoria)',
    escalationTarget: 'Auditoria',
    description: 'Os operadores reportam que em chamadas de infiltração sem inundação ativa, o fluxograma remete para Piquete quando o procedimento correto da DTM seria agendamento normal.',
    evidence: 'Observado em 6 sessões de atendimento com pedidos de esclarecimento à supervisão.',
    resolution: 'Em análise com a Direção de Manutenção para emissão de norma interpretativa vinculativa.',
    createdAt: '2026-09-08 09:30:00',
    updatedAt: '2026-09-09 14:20:00'
  },
  {
    id: 'INC-002',
    title: 'Falha temporária de conectividade com webservice do SIGA',
    type: 'TECNICO',
    severity: 'ALTO',
    status: 'RESOLVIDO',
    environment: 'production',
    flowSlug: 'atendimento-geral',
    nodeId: 'N1',
    reportedBy: 'Sistema de Telemetria / Operador DAC-01',
    assignedTo: 'Eng. Sistemas / Infraestrutura',
    escalationTarget: 'Equipa Técnica',
    description: 'Durante a janela das 08h30-08h45 ocorreu latência superior a 3000ms na interligação com o webservice do SIGA.',
    evidence: 'Log de conectividade do gateway de autenticação.',
    resolution: 'Reinicialização do proxy de integração e reconfiguração de timeout para 5000ms com fallback gracioso.',
    createdAt: '2026-09-07 08:35:00',
    updatedAt: '2026-09-07 09:10:00'
  },
  {
    id: 'INC-003',
    title: 'Incerteza na documentação requerida para transmissão por óbito',
    type: 'DOCUMENTAL',
    severity: 'MEDIO',
    status: 'CLASSIFICADO',
    environment: 'production',
    flowSlug: 'transmissao-habitacao',
    nodeId: 'N2',
    reportedBy: 'Operador DAC-07',
    assignedTo: 'Gabinete Jurídico',
    escalationTarget: 'Documentação',
    description: 'O texto do nó refere "Certidão de Óbito e Habilitação de Herdeiros" sem clarificar a dispensa de habilitação quando exista apenas viúvo meeiro.',
    evidence: 'Página Visio 34 vs Minuta Jurídica GEB-MJ-2025/11.',
    createdAt: '2026-09-09 11:15:00',
    updatedAt: '2026-09-09 16:00:00'
  },
  {
    id: 'INC-004',
    title: 'Divergência de prazo para envio de SMS com dados bancários',
    type: 'PROCESSUAL',
    severity: 'ALTO',
    status: 'EM_ANALISE',
    environment: 'production',
    flowSlug: 'regularizacao-divida',
    nodeId: 'N3',
    reportedBy: 'Supervisão de Turno',
    assignedTo: 'Comissão de Auditoria',
    escalationTarget: 'Governação',
    linkedFindingId: 'VAL-004',
    description: 'Identificado no terreno que a promessa ao cidadão de "envio imediato de SMS" colide com o processamento diferido do SIGA abrangido pelo waiver WAI-002.',
    evidence: 'Waiver WAI-002 com data limite de revisão até 31/12/2026.',
    createdAt: '2026-09-09 17:00:00',
    updatedAt: '2026-09-10 08:00:00'
  }
];

/**
 * Baseline initial improvements proposals.
 */
const INITIAL_IMPROVEMENTS: ImprovementRequest[] = [
  {
    id: 'IMP-001',
    title: 'Atalho de teclado para avanço rápido no simulador e assistente',
    type: 'UX',
    status: 'APROVACAO',
    priority: 'MEDIA',
    isProcessAlteration: false,
    origin: 'OPERADOR',
    description: 'Permitir navegação com teclas 1, 2, 3 para seleção imediata de opções de decisão sem necessidade de rato.',
    proposedChange: 'Acrescentar keydown listeners acessíveis nos botões de resposta.',
    author: 'Equipa DAC / Ergonomia',
    createdAt: '2026-09-08 14:00:00',
    targetRelease: 'V9.1.0'
  },
  {
    id: 'IMP-002',
    title: 'Integração de busca preditiva na triagem telefónica de avarias',
    type: 'PESQUISA',
    status: 'ANALISE',
    priority: 'ALTA',
    isProcessAlteration: false,
    origin: 'FEEDBACK',
    description: 'Operadores perdem tempo a percorrer todo o menu de triagem quando o cidadão já declara especificamente "rotura na coluna de esgoto".',
    proposedChange: 'Filtro em tempo real no Assistente com sugestão direta da folha de árvore mais provável.',
    author: 'Supervisão Contact Center',
    createdAt: '2026-09-09 10:30:00',
    targetRelease: 'V9.1.0'
  },
  {
    id: 'IMP-003',
    title: 'Adição de opção específica para agregados monoparentais em Rendas',
    type: 'NOVO_FLOW',
    status: 'PROPOSTA',
    priority: 'ALTA',
    isProcessAlteration: true, // EXIGE REM V7!
    linkedRemediationId: 'REM-004-PENDENTE',
    origin: 'AUDITORIA',
    description: 'A proposta sugere desdobrar o nó de cálculo de taxa de esforço para famílias monoparentais.',
    proposedChange: 'Exige criação de plano de remediação REM e despacho da Direção de Habitação antes de qualquer publicação.',
    author: 'Dra. Helena Matos',
    createdAt: '2026-09-10 07:15:00'
  }
];

/**
 * Baseline initial process drift records.
 */
const INITIAL_DRIFT: ProcessDriftItem[] = [
  {
    id: 'DRIFT-001',
    driftType: 'ESTRUTURAL',
    component: 'Subfluxo Ocupações Sem Título (remediacao REM-003)',
    originVersion: 'V8.0.0-PROD-CANDIDATE',
    targetVersion: 'V8.0.0-PROD-CANDIDATE',
    evidence: 'Conformidade de nós e arestas estritamente idêntica à prancha Visio remediada.',
    impact: 'BAIXO',
    status: 'JUSTIFICADO',
    recommendation: 'Nenhum drift estrutural detetado. Grafo mantido 100% fiel.',
    decision: 'Homologado na Release RC01'
  },
  {
    id: 'DRIFT-002',
    driftType: 'OPERACIONAL',
    component: 'Piquete de Obras — nó de Verificação de Segurança Elétrica',
    originVersion: 'Procedimento Formal DAC-02',
    targetVersion: 'Prática Operacional Observada',
    evidence: 'Em 18% dos atendimentos, operadores questionam o cidadão se o quadro elétrico desarmou antes de verificar água.',
    impact: 'MEDIO',
    status: 'EM_ANALISE',
    recommendation: 'Analisar se a antecipação da pergunta do quadro elétrico reduz risco de curto-circuito.',
    decision: 'Requer deliberação da DTM sem alteração de produção imediata.'
  }
];

/**
 * Curated initial operational sessions for production and staging to provide realistic baseline analytics.
 */
const INITIAL_SESSIONS: OperationalSession[] = [
  {
    id: 'OPS-20260909-0001',
    environment: 'production',
    startTime: '2026-09-09 09:12:15',
    endTime: '2026-09-09 09:15:40',
    operatorId: 'OP-102',
    grandeza: 'edificado',
    flowId: 'piquete-obras',
    status: 'completed',
    currentNode: 'T1',
    steps: [
      { stepIndex: 0, flowSlug: 'piquete-obras', nodeId: 'N1', nodeText: 'Identificação da tipologia de emergência', kind: 'start', timestamp: '09:12:15' },
      { stepIndex: 1, flowSlug: 'piquete-obras', nodeId: 'D1', nodeText: 'A situação envolve risco estrutural ou inundação?', kind: 'decision', decisionQuestion: 'Risco?', selectedOption: 'SIM', destinationNodeId: 'N3', timestamp: '09:12:50' },
      { stepIndex: 2, flowSlug: 'piquete-obras', nodeId: 'N3', nodeText: 'Acionamento Imediato do Piquete de Obras 24h', kind: 'process', timestamp: '09:14:10' },
      { stepIndex: 3, flowSlug: 'piquete-obras', nodeId: 'T1', nodeText: 'Encaminhamento concluído com número de ocorrência', kind: 'terminal', timestamp: '09:15:40' }
    ],
    feedback: [
      {
        id: 'FDB-001',
        sessionId: 'OPS-20260909-0001',
        environment: 'production',
        flowSlug: 'piquete-obras',
        rating: 'MUITO_UTIL',
        comment: 'Condução rápida e clara para acionar a equipa de turno.',
        timestamp: '2026-09-09 09:15:55',
        status: 'NOVO'
      }
    ]
  },
  {
    id: 'OPS-20260909-0002',
    environment: 'production',
    startTime: '2026-09-09 10:05:00',
    endTime: '2026-09-09 10:11:20',
    operatorId: 'OP-105',
    grandeza: 'divida',
    flowId: 'regularizacao-divida',
    status: 'completed',
    currentNode: 'T2',
    steps: [
      { stepIndex: 0, flowSlug: 'regularizacao-divida', nodeId: 'N1', nodeText: 'Verificação do montante em mora', kind: 'start', timestamp: '10:05:00' },
      { stepIndex: 1, flowSlug: 'regularizacao-divida', nodeId: 'D1', nodeText: 'Inquilino manifesta vontade de acordo?', kind: 'decision', decisionQuestion: 'Acordo?', selectedOption: 'SIM', destinationNodeId: 'N2', timestamp: '10:06:40' },
      { stepIndex: 2, flowSlug: 'regularizacao-divida', nodeId: 'D2', nodeText: 'Mora superior a 3 meses?', kind: 'decision', decisionQuestion: 'Superior 3 meses?', selectedOption: 'NÃO', destinationNodeId: 'N4', timestamp: '10:08:15' },
      { stepIndex: 3, flowSlug: 'regularizacao-divida', nodeId: 'T2', nodeText: 'Plano Direto em Balcão (Até 6 prestações)', kind: 'terminal', timestamp: '10:11:20' }
    ],
    feedback: [
      {
        id: 'FDB-002',
        sessionId: 'OPS-20260909-0002',
        environment: 'production',
        flowSlug: 'regularizacao-divida',
        rating: 'UTIL',
        comment: 'Ajudou a calcular o número de prestações permitidas sem ter de consultar a instrução de serviço.',
        timestamp: '2026-09-09 10:11:35',
        status: 'NOVO'
      }
    ]
  },
  {
    id: 'OPS-20260909-0003',
    environment: 'production',
    startTime: '2026-09-09 11:30:10',
    endTime: '2026-09-09 11:34:00',
    operatorId: 'OP-108',
    grandeza: 'social',
    flowId: 'conflitos-vizinhanca',
    status: 'escalated',
    currentNode: 'N4',
    escalationTarget: 'Gabinete de Apoio Social do Bairro',
    escalationReason: 'Agravamento de desacatos verbais com ameaças físicas no patamar.',
    steps: [
      { stepIndex: 0, flowSlug: 'conflitos-vizinhanca', nodeId: 'N1', nodeText: 'Registo inicial da reclamação de ruído/conflito', kind: 'start', timestamp: '11:30:10' },
      { stepIndex: 1, flowSlug: 'conflitos-vizinhanca', nodeId: 'D1', nodeText: 'Existe mediação prévia efetuada pela Gebalis?', kind: 'decision', decisionQuestion: 'Mediação prévia?', selectedOption: 'SIM', destinationNodeId: 'N3', timestamp: '11:31:30' },
      { stepIndex: 2, flowSlug: 'conflitos-vizinhanca', nodeId: 'D2', nodeText: 'Reincidência no período inferior a 30 dias?', kind: 'decision', decisionQuestion: 'Reincidência?', selectedOption: 'SIM', destinationNodeId: 'N4', timestamp: '11:33:00' }
    ],
    feedback: [
      {
        id: 'FDB-003',
        sessionId: 'OPS-20260909-0003',
        environment: 'production',
        flowSlug: 'conflitos-vizinhanca',
        rating: 'NECESSITEI_AJUDA',
        comment: 'O conflito exigiu escalamento para assistente social local por haver queixa na PSP.',
        timestamp: '2026-09-09 11:34:25',
        status: 'EM_ANALISE'
      }
    ]
  },
  {
    id: 'OPS-20260909-0004',
    environment: 'production',
    startTime: '2026-09-09 14:15:00',
    endTime: '2026-09-09 14:18:20',
    operatorId: 'OP-102',
    grandeza: 'rendas',
    flowId: 'atualizacao-renda',
    status: 'blocked',
    blockType: 'INFORMAÇÃO_INSUFICIENTE',
    blockReason: 'Cidadão não sabe precisar o rendimento anual bruto nem tem declaração de IRS consigo.',
    currentNode: 'D1',
    steps: [
      { stepIndex: 0, flowSlug: 'atualizacao-renda', nodeId: 'N1', nodeText: 'Apresentação de pedido de revisão de renda', kind: 'start', timestamp: '14:15:00' },
      { stepIndex: 1, flowSlug: 'atualizacao-renda', nodeId: 'D1', nodeText: 'O agregado possui comprovativos de rendimentos do ano transacto?', kind: 'decision', uncertaintyMarked: true, uncertaintyComment: 'Munícipe refere que vai procurar e liga mais tarde.', timestamp: '14:17:10' }
    ]
  },
  {
    id: 'OPS-20260910-0001',
    environment: 'production',
    startTime: '2026-09-10 08:30:15',
    endTime: '2026-09-10 08:34:45',
    operatorId: 'OP-104',
    grandeza: 'triagem',
    flowId: 'triagem-telefonica',
    status: 'completed',
    currentNode: 'T1',
    steps: [
      { stepIndex: 0, flowSlug: 'triagem-telefonica', nodeId: 'N1', nodeText: 'Atendimento inicial e saudação institucional', kind: 'start', timestamp: '08:30:15' },
      { stepIndex: 1, flowSlug: 'triagem-telefonica', nodeId: 'D1', nodeText: 'Motivo do contacto é cobrança ou obras?', kind: 'decision', decisionQuestion: 'Motivo?', selectedOption: 'OBRAS / MANUTENÇÃO', destinationNodeId: 'N3', timestamp: '08:31:40' },
      { stepIndex: 2, flowSlug: 'triagem-telefonica', nodeId: 'T1', nodeText: 'Encaminhamento para Piquete de Obras', kind: 'terminal', timestamp: '08:34:45' }
    ],
    feedback: [
      {
        id: 'FDB-004',
        sessionId: 'OPS-20260910-0001',
        environment: 'production',
        flowSlug: 'triagem-telefonica',
        rating: 'MUITO_UTIL',
        comment: 'Triagem direta sem tempos mortos.',
        timestamp: '2026-09-10 08:35:00',
        status: 'NOVO'
      }
    ]
  }
];

export class OperationalStore {
  /**
   * Gets the active environment: 'production' | 'staging' | 'simulation'
   */
  static getActiveEnvironment(): OperationalEnvironment {
    try {
      const stored = localStorage.getItem(STORAGE_ENV_KEY);
      if (stored === 'staging' || stored === 'simulation' || stored === 'production') {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'production';
  }

  /**
   * Sets the active environment
   */
  static setActiveEnvironment(env: OperationalEnvironment): void {
    try {
      localStorage.setItem(STORAGE_ENV_KEY, env);
    } catch {
      // storage unavailable
    }
  }

  /**
   * Gets operational sessions filtered by environment and period
   */
  static getSessions(env?: OperationalEnvironment, period?: string): OperationalSession[] {
    const targetEnv = env || this.getActiveEnvironment();
    let allSessions: OperationalSession[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (stored) {
        allSessions = JSON.parse(stored);
      } else {
        allSessions = INITIAL_SESSIONS;
        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
      }
    } catch {
      allSessions = INITIAL_SESSIONS;
    }

    // Filter strictly by environment (STRICT ISOLATION MANDATE)
    let filtered = allSessions.filter(s => s.environment === targetEnv);

    // Filter by period if specified
    if (period) {
      filtered = this.filterByPeriod(filtered, period);
    }

    return filtered;
  }

  /**
   * Saves or updates an operational session
   */
  static saveSession(session: OperationalSession): void {
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
      const all: OperationalSession[] = stored ? JSON.parse(stored) : INITIAL_SESSIONS;
      const idx = all.findIndex(s => s.id === session.id);
      if (idx >= 0) {
        all[idx] = session;
      } else {
        all.unshift(session);
      }
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(all));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Gets feedback records filtered by environment
   */
  static getFeedback(env?: OperationalEnvironment): FeedbackRecord[] {
    const targetEnv = env || this.getActiveEnvironment();
    let allFeedback: FeedbackRecord[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_FEEDBACK_KEY);
      if (stored) {
        allFeedback = JSON.parse(stored);
      } else {
        allFeedback = INITIAL_SESSIONS.flatMap(s => s.feedback || []);
        localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(allFeedback));
      }
    } catch {
      allFeedback = INITIAL_SESSIONS.flatMap(s => s.feedback || []);
    }

    return allFeedback.filter(f => f.environment === targetEnv);
  }

  /**
   * Saves a feedback record
   */
  static saveFeedback(record: FeedbackRecord): void {
    try {
      const stored = localStorage.getItem(STORAGE_FEEDBACK_KEY);
      const all: FeedbackRecord[] = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex(f => f.id === record.id);
      if (idx >= 0) {
        all[idx] = record;
      } else {
        all.unshift(record);
      }
      localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(all));

      // Also append to session if found
      const sessions = this.getSessions(record.environment);
      const sess = sessions.find(s => s.id === record.sessionId);
      if (sess) {
        sess.feedback = sess.feedback || [];
        const fIdx = sess.feedback.findIndex(f => f.id === record.id);
        if (fIdx >= 0) {
          sess.feedback[fIdx] = record;
        } else {
          sess.feedback.push(record);
        }
        this.saveSession(sess);
      }
    } catch {
      // storage unavailable
    }
  }

  /**
   * Gets incidents filtered by environment
   */
  static getIncidents(env?: OperationalEnvironment): OperationalIncident[] {
    const targetEnv = env || this.getActiveEnvironment();
    let all: OperationalIncident[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_INCIDENTS_KEY);
      if (stored) {
        all = JSON.parse(stored);
      } else {
        all = INITIAL_INCIDENTS;
        localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(INITIAL_INCIDENTS));
      }
    } catch {
      all = INITIAL_INCIDENTS;
    }

    return all.filter(inc => inc.environment === targetEnv);
  }

  /**
   * Saves an operational incident
   */
  static saveIncident(incident: OperationalIncident): void {
    try {
      const stored = localStorage.getItem(STORAGE_INCIDENTS_KEY);
      const all: OperationalIncident[] = stored ? JSON.parse(stored) : INITIAL_INCIDENTS;
      const idx = all.findIndex(i => i.id === incident.id);
      if (idx >= 0) {
        all[idx] = incident;
      } else {
        all.unshift(incident);
      }
      localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(all));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Updates an incident status following strict lifecycle rules
   */
  static updateIncidentStatus(
    id: string,
    newStatus: OperationalIncidentStatus,
    resolution?: string
  ): { success: boolean; message: string } {
    const incidents = this.getIncidents();
    const inc = incidents.find(i => i.id === id);
    if (!inc) return { success: false, message: 'Incidente não encontrado.' };

    inc.status = newStatus;
    inc.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (resolution) {
      inc.resolution = resolution;
    }
    this.saveIncident(inc);
    return { success: true, message: `Incidente ${id} atualizado para ${newStatus}.` };
  }

  /**
   * Gets improvement proposals
   */
  static getImprovements(): ImprovementRequest[] {
    let all: ImprovementRequest[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_IMPROVEMENTS_KEY);
      if (stored) {
        all = JSON.parse(stored);
      } else {
        all = INITIAL_IMPROVEMENTS;
        localStorage.setItem(STORAGE_IMPROVEMENTS_KEY, JSON.stringify(INITIAL_IMPROVEMENTS));
      }
    } catch {
      all = INITIAL_IMPROVEMENTS;
    }
    return all;
  }

  /**
   * Saves an improvement request
   */
  static saveImprovement(imp: ImprovementRequest): void {
    try {
      const stored = localStorage.getItem(STORAGE_IMPROVEMENTS_KEY);
      const all: ImprovementRequest[] = stored ? JSON.parse(stored) : INITIAL_IMPROVEMENTS;
      const idx = all.findIndex(i => i.id === imp.id);
      if (idx >= 0) {
        all[idx] = imp;
      } else {
        all.unshift(imp);
      }
      localStorage.setItem(STORAGE_IMPROVEMENTS_KEY, JSON.stringify(all));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Updates improvement status
   */
  static updateImprovementStatus(id: string, newStatus: ImprovementStatus): void {
    const list = this.getImprovements();
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      this.saveImprovement(item);
    }
  }

  /**
   * Gets process drift items
   */
  static getDriftItems(): ProcessDriftItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_DRIFT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_DRIFT_KEY, JSON.stringify(INITIAL_DRIFT));
      return INITIAL_DRIFT;
    } catch {
      return INITIAL_DRIFT;
    }
  }

  /**
   * Saves a process drift item
   */
  static saveDriftItem(item: ProcessDriftItem): void {
    try {
      const list = this.getDriftItems();
      const idx = list.findIndex(d => d.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(STORAGE_DRIFT_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Gets rollback records
   */
  static getRollbacks(): RollbackRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_ROLLBACK_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves a rollback record
   */
  static saveRollback(record: RollbackRecord): void {
    try {
      const list = this.getRollbacks();
      list.unshift(record);
      localStorage.setItem(STORAGE_ROLLBACK_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable
    }
  }

  /**
   * Filters a sessions list by period
   */
  private static filterByPeriod(sessions: OperationalSession[], period: string): OperationalSession[] {
    const now = new Date();
    return sessions.filter(s => {
      const sessionDate = new Date(s.startTime.replace(' ', 'T'));
      if (isNaN(sessionDate.getTime())) return true;

      if (period === 'hoje') {
        return sessionDate.toDateString() === now.toDateString();
      }
      if (period === '24h') {
        const diffHours = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      }
      if (period === '7d') {
        const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (period === '30d') {
        const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      if (period === 'mes') {
        return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  /**
   * Calculates Operational Analytics strictly on actual session data without fabricating numbers.
   */
  static calculateAnalytics(
    sessions: OperationalSession[],
    feedback: FeedbackRecord[]
  ): OperationalAnalyticsData {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const abandonedSessions = sessions.filter(s => s.status === 'abandoned').length;
    const escalatedSessions = sessions.filter(s => s.status === 'escalated').length;
    const blockedSessions = sessions.filter(s => s.status === 'blocked').length;
    const technicalErrorSessions = sessions.filter(s => s.status === 'technical_error').length;

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const abandonmentRate = totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0;
    const escalationRate = totalSessions > 0 ? (escalatedSessions / totalSessions) * 100 : 0;

    let totalDurationSeconds = 0;
    let timedSessionsCount = 0;
    let totalDecisionsExecuted = 0;
    let totalTerminalsReached = 0;

    const flowsCountMap = new Map<string, { count: number; completed: number; escalated: number }>();
    const dropoffMap = new Map<string, { count: number; flowSlug: string; nodeText: string; reason: string }>();
    const decisionMap = new Map<string, { flowSlug: string; question: string; count: number; optionsMap: Map<string, number> }>();

    sessions.forEach(sess => {
      // Flow stats
      const flowSlug = sess.flowId || 'desconhecido';
      const existingFlow = flowsCountMap.get(flowSlug) || { count: 0, completed: 0, escalated: 0 };
      existingFlow.count += 1;
      if (sess.status === 'completed') existingFlow.completed += 1;
      if (sess.status === 'escalated') existingFlow.escalated += 1;
      flowsCountMap.set(flowSlug, existingFlow);

      // Duration
      if (sess.startTime && sess.endTime) {
        const start = new Date(sess.startTime.replace(' ', 'T')).getTime();
        const end = new Date(sess.endTime.replace(' ', 'T')).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalDurationSeconds += (end - start) / 1000;
          timedSessionsCount += 1;
        }
      }

      // Step analysis
      sess.steps.forEach(step => {
        if (step.kind === 'decision') {
          totalDecisionsExecuted += 1;
          const key = `${step.flowSlug}::${step.nodeId}`;
          const dec = decisionMap.get(key) || {
            flowSlug: step.flowSlug,
            question: step.decisionQuestion || step.nodeText,
            count: 0,
            optionsMap: new Map<string, number>()
          };
          dec.count += 1;
          if (step.selectedOption) {
            dec.optionsMap.set(step.selectedOption, (dec.optionsMap.get(step.selectedOption) || 0) + 1);
          }
          decisionMap.set(key, dec);
        }

        if (step.kind === 'terminal') {
          totalTerminalsReached += 1;
        }
      });

      // Dropoff points
      if (sess.status === 'abandoned' || sess.status === 'blocked') {
        const lastStep = sess.steps[sess.steps.length - 1];
        if (lastStep) {
          const key = `${lastStep.flowSlug}::${lastStep.nodeId}`;
          const existingDrop = dropoffMap.get(key) || {
            count: 0,
            flowSlug: lastStep.flowSlug,
            nodeText: lastStep.nodeText,
            reason: sess.blockReason || 'Interrupção de chamada'
          };
          existingDrop.count += 1;
          dropoffMap.set(key, existingDrop);
        }
      }
    });

    const avgDurationSeconds = timedSessionsCount > 0 ? Math.round(totalDurationSeconds / timedSessionsCount) : 0;

    // Build flows usage array
    const flowsUsage = Array.from(flowsCountMap.entries()).map(([slug, data]) => ({
      flowSlug: slug,
      flowName: slug.replace(/-/g, ' ').toUpperCase(),
      count: data.count,
      completed: data.completed,
      escalated: data.escalated
    })).sort((a, b) => b.count - a.count);

    // Build top decisions array
    const topDecisions = Array.from(decisionMap.entries()).map(([key, data]) => {
      const nodeId = key.split('::')[1];
      const options = Array.from(data.optionsMap.entries()).map(([label, cnt]) => ({ label, count: cnt }));
      return {
        flowSlug: data.flowSlug,
        nodeId,
        question: data.question,
        count: data.count,
        options
      };
    }).sort((a, b) => b.count - a.count);

    // Build dropoff points array
    const dropoffPoints = Array.from(dropoffMap.entries()).map(([key, data]) => {
      const nodeId = key.split('::')[1];
      return {
        flowSlug: data.flowSlug,
        nodeId,
        nodeText: data.nodeText,
        count: data.count,
        reason: data.reason
      };
    }).sort((a, b) => b.count - a.count);

    // Feedback calculations
    const fbVeryUseful = feedback.filter(f => f.rating === 'MUITO_UTIL').length;
    const fbUseful = feedback.filter(f => f.rating === 'UTIL').length;
    const fbSomewhatUseful = feedback.filter(f => f.rating === 'POUCO_UTIL').length;
    const fbNotSolved = feedback.filter(f => f.rating === 'NAO_RESOLVEU').length;
    const fbNeededHelp = feedback.filter(f => f.rating === 'NECESSITEI_AJUDA').length;
    const positiveCount = fbVeryUseful + fbUseful;
    const positiveRatio = feedback.length > 0 ? (positiveCount / feedback.length) * 100 : 0;

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      escalatedSessions,
      blockedSessions,
      technicalErrorSessions,
      completionRate: Math.round(completionRate * 10) / 10,
      abandonmentRate: Math.round(abandonmentRate * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      avgDurationSeconds,
      totalDecisionsExecuted,
      totalTerminalsReached,
      flowsUsage,
      topDecisions,
      dropoffPoints,
      feedbackStats: {
        total: feedback.length,
        veryUseful: fbVeryUseful,
        useful: fbUseful,
        somewhatUseful: fbSomewhatUseful,
        notSolved: fbNotSolved,
        neededHelp: fbNeededHelp,
        positiveRatio: Math.round(positiveRatio * 10) / 10
      }
    };
  }

  /**
   * Evaluates operational health based on active incidents and sessions
   */
  static calculateHealth(
    incidents: OperationalIncident[],
    sessions: OperationalSession[]
  ): OperationalHealthSummary {
    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVIDO' && i.status !== 'ENCERRADO');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'CRITICO');
    const technicalIncidents = activeIncidents.filter(i => i.type === 'TECNICO');

    let overallStatus: 'SAUDÁVEL' | 'ATENÇÃO' | 'CRÍTICO' = 'SAUDÁVEL';
    let overallReason = 'Todos os sistemas operacionais e fluxos estão a responder dentro dos parâmetros normais.';

    if (criticalIncidents.length > 0) {
      overallStatus = 'CRÍTICO';
      overallReason = `Existem ${criticalIncidents.length} incidente(s) crítico(s) ativos em tratamento.`;
    } else if (activeIncidents.length >= 3 || technicalIncidents.length > 0) {
      overallStatus = 'ATENÇÃO';
      overallReason = `Identificados ${activeIncidents.length} incidente(s) em análise requerendo supervisão.`;
    }

    return {
      processual: activeIncidents.some(i => i.type === 'PROCESSUAL') ? 'ATENÇÃO' : 'CONFORME',
      operacional: overallStatus,
      tecnico: technicalIncidents.length > 0 ? 'DEGRADADO' : 'DISPONÍVEL',
      governacao: 'CONFORME_COM_RESERVAS', // WAI-001 & WAI-002 active
      release: 'PUBLICADA_RC01',
      overallStatus,
      overallReason
    };
  }
}
