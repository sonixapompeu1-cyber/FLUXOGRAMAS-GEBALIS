import { ValidationFinding, FindingSeverity, FindingStatus, OperationalImpact } from '../types';

const STORAGE_KEY = 'gebalis_v6_validation_findings';

export const INITIAL_FINDINGS: ValidationFinding[] = [
  {
    id: 'VAL-001',
    flowSlug: 'triagem-inicial',
    flowName: 'Atendimento Geral e Triagem Inicial',
    visioPageId: 'VISIO-003',
    visioPageNumber: 3,
    nodeId: 't3',
    nodeText: 'O interlocutor é arrendatário titular ou mandatário com procuração válida?',
    type: 'OPCAO_DOCUMENTAL_AUSENTE',
    title: 'Opção documental "Processo de transmissão em curso" não contemplada nas alternativas do nó t3',
    severity: 'medium',
    status: 'open',
    visioEvidence: 'Prancha Visio pág. #3 ("2 val"): Apresenta 3 ramificações de validação: "Titular/Mandatário", "Não Titular" e "Transmissão/Habilitação de Herdeiros em análise".',
    flowEvidence: 'flows.json nó t3: Possui apenas 2 arestas direcionais: "Sim" (t5) e "Não" (t4).',
    gpsEvidence: 'GPS Operacional apresenta 2 botões determinísticos: [Sim → t5] e [Não → t4].',
    expected: 'Disponibilização de 3 vias de encaminhamento na fase 2 de validação.',
    actual: 'Apenas 2 opções determinísticas ativas (Sim / Não). Casos de transmissão são integrados no desvio "Não".',
    operationalImpact: 'Potencial impacto',
    notes: 'A opção "Não" desvia para salvaguarda RGPD (t4), assegurando proteção legal dos dados, mas sem sub-rotina imediata de transmissão no contact center.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado automaticamente pela auditoria forense V6', author: 'Motor V6' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:00'
  },
  {
    id: 'VAL-002',
    flowSlug: 'triagem-inicial',
    flowName: 'Atendimento Geral e Triagem Inicial',
    visioPageId: 'VISIO-007',
    visioPageNumber: 7,
    nodeId: 't6',
    nodeText: 'Situação de Risco Iminente à Vida ou Estrutura (Fuga de Gás, Ruína, Inundação Ativa)?',
    type: 'DIVERGENCIA_ESTRUTURAL',
    title: 'Desvio de representação de aviso de emergência 112 antecedendo acionamento do piquete',
    severity: 'low',
    status: 'under_review',
    visioEvidence: 'Prancha Visio pág. #7 ("Triagem geral"): Bloco de texto lateral recomenda alertar munícipe para ligar 112 se houver cheiro intenso a gás antes de abrir chamada piquete.',
    flowEvidence: 'flows.json nó t7: "Encaminhamento Imediato para Piquete de Emergência 24H (Linha Direta de Obras)" com link para obras-piquete-emergencia.',
    gpsEvidence: 'GPS transita diretamente para o nó t7 e permite saltar para o fluxo "obras-piquete-emergencia".',
    expected: 'Caixa de alerta de chamada de bombeiros/112 visível antes do reencaminhamento.',
    actual: 'Aviso integrado no texto descritivo do piquete sem nó isolado de pré-alerta.',
    operationalImpact: 'Sem impacto identificado',
    notes: 'No guião falado o operador fornece logo a indicação do 112 caso haja risco de vida ativo.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' },
      { date: '2026-09-10 04:15', action: 'Marcado "Em revisão"', author: 'Auditor Chefe' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:15'
  },
  {
    id: 'VAL-003',
    flowSlug: 'obras-piquete-emergencia',
    flowName: 'Obras — Avarias Urgentes e Piquete 24 Horas',
    visioPageId: 'VISIO-014',
    visioPageNumber: 14,
    nodeId: 'em-term1',
    nodeText: 'Registo de Chamada de Emergência no SIGA / Salesforce e Envio de SMS com Código do Piquete',
    type: 'DIVERGENCIA_TERMINAL',
    title: 'Omissão de menção a SMS de confirmação no nó terminal de emergência no flows.json',
    severity: 'low',
    status: 'open',
    visioEvidence: 'Prancha Visio pág. #14: Desfecho com "Registo no SIGA + Envio de SMS ao munícipe com código de intervenção".',
    flowEvidence: 'flows.json nó em-term1: Menciona "Registo Prioritário com Envio Imediato de Equipa Móvel", mas omite a palavra SMS.',
    gpsEvidence: 'GPS apresenta desfecho de registo prioritário no CRM Gebalis.',
    expected: 'Menção expressa ao disparo de SMS transacional com ID do piquete.',
    actual: 'Menção a registo e envio de equipa sem explicitação do canal SMS.',
    operationalImpact: 'Sem impacto identificado',
    notes: 'Funcionalidade de SMS é automática ao gravar a ocorrência com tipologia Piquete Urgente no SIGA.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:00'
  },
  {
    id: 'VAL-004',
    flowSlug: 'rendas-acordos-regularizacao',
    flowName: 'Rendas — Acordos de Regularização de Dívida',
    visioPageId: 'VISIO-028',
    visioPageNumber: 28,
    nodeId: 'rend-dec2',
    nodeText: 'O valor da dívida é inferior ao limite de 3 meses de renda ou < 500€?',
    type: 'DIVERGENCIA_SEMANTICA',
    title: 'Discrepância no limiar financeiro de aprovação direta de plano de pagamento (500€ vs 600€)',
    severity: 'high',
    status: 'open',
    visioEvidence: 'Prancha Visio pág. #28: Limite para plano simplificado direto no balcão telefónico fixado em "Até 3 RM ou 600€".',
    flowEvidence: 'flows.json nó rend-dec2: Pergunta estruturada como "< 500€ ou 3 meses de renda".',
    gpsEvidence: 'GPS apresenta a decisão com o limiar de 500€.',
    expected: 'Coerência estrita entre o teto monetário documental e o parâmetro do motor GPS.',
    actual: 'Divergência de 100€ no critério de elegibilidade para aprovação imediata sem parecer de superior hierárquico.',
    operationalImpact: 'Impacto operacional',
    notes: 'Requer validação formal junto da Direção de Gestão Financeira e Rendas da GEBALIS para confirmar se a alçada foi alterada por deliberação recente do Conselho de Administração.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:00'
  },
  {
    id: 'VAL-005',
    flowSlug: 'gestao-social-conflitos',
    flowName: 'Gestão Social — Mediação e Conflitos de Vizinhança',
    visioPageId: 'VISIO-066',
    visioPageNumber: 66,
    nodeId: 'soc-dec1',
    nodeText: 'Existência de queixa formal por escrito com identificação das partes?',
    type: 'OPCAO_DOCUMENTAL_AUSENTE',
    title: 'Opção de denúncia anónima qualificada agregada na resposta negativa padrão',
    severity: 'medium',
    status: 'under_review',
    visioEvidence: 'Prancha Visio pág. #66: Prevê ramificação secundária: "Denúncia anónima com indícios de gravidade / risco para menores".',
    flowEvidence: 'flows.json nó soc-dec1: Duas opções: "Sim (Queixa Formal)" e "Não (Queixa Verbal / Genérica)".',
    gpsEvidence: 'GPS força a escolha entre Sim e Não.',
    expected: 'Tratamento diferenciado para denúncias anónimas com risco social agudo.',
    actual: 'Agregação no ramo "Não", encaminhando para pedido de formalização por email/atendimento presencial.',
    operationalImpact: 'Potencial impacto',
    notes: 'A Gebalis não aceita por norma denúncias anónimas salvo quando envolvem proteção de menores ou maus tratos (articulado com CPCJ).',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' },
      { date: '2026-09-10 04:20', action: 'Adicionada nota sobre encaminhamento CPCJ', author: 'Auditor Social' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:20'
  },
  {
    id: 'VAL-006',
    flowSlug: 'denuncias-ocupacoes',
    flowName: 'Fiscalização — Ocupações Indevidas e Denúncias de Vandalismo',
    visioPageId: 'VISIO-105',
    visioPageNumber: 105,
    nodeId: 'den-dec2',
    nodeText: 'Fogo com processo judicial de reintegração de posse pendente?',
    type: 'DIVERGENCIA_DESTINO',
    title: 'Sequência de consulta jurídica vs deslocação da fiscalização ao fogo',
    severity: 'medium',
    status: 'open',
    visioEvidence: 'Prancha Visio pág. #105: Se processo judicial em curso, notificar mandatário antes da ida da fiscalização ao bairro.',
    flowEvidence: 'flows.json nós den-p3 e den-dec2: Instruem simultaneamente registo de fiscalização e notificação à Direção Jurídica.',
    gpsEvidence: 'GPS permite encaminhamento direto ao contencioso.',
    expected: 'Prioridade à coordenação jurídica prévia para evitar conflito com ordem judicial de despejo.',
    actual: 'Ações paralelas de fiscalização e registo jurídico.',
    operationalImpact: 'Potencial impacto',
    notes: 'Deve ser assegurada a concordância com o procedimento do Gabinete de Apoio Jurídico da Gebalis.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:00'
  },
  {
    id: 'VAL-007',
    flowSlug: 'habitacao-atribuicao',
    flowName: 'Habitação — Informação sobre Candidaturas e Realojamento',
    visioPageId: 'VISIO-085',
    visioPageNumber: 85,
    nodeId: 'hab-term1',
    nodeText: 'Informação Prestada: Candidaturas através da Plataforma Habitar Lisboa da CML',
    type: 'DIFERENCA_TEXTUAL_SEM_IMPACTO',
    title: 'Designação da plataforma de candidaturas municipais mais descritiva no GPS',
    severity: 'informational',
    status: 'accepted',
    visioEvidence: 'Prancha Visio pág. #85: Sigla abreviada "Plat. Habitar LIS".',
    flowEvidence: 'flows.json nó hab-term1: "Plataforma de Candidaturas da Câmara Municipal de Lisboa (Habitar Lisboa)".',
    gpsEvidence: 'Texto expandido e claro para facilitação da dicção do operador telefónico.',
    expected: 'Alinhamento terminológico com a marca oficial do município.',
    actual: 'Designação expandida e mais clara no GPS que no documento gráfico abreviado.',
    operationalImpact: 'Sem impacto identificado',
    notes: 'Melhoria deliberada de usabilidade para o assistente de contact center.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' },
      { date: '2026-09-10 04:22', action: 'Marcado "Aceite" (Melhoria comunicacional validada)', author: 'Auditor Chefe' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:22'
  },
  {
    id: 'VAL-008',
    flowSlug: 'condominios-administracao',
    flowName: 'Condomínios — Administração e Quotas de Partes Comuns',
    visioPageId: 'VISIO-102',
    visioPageNumber: 102,
    nodeId: 'cond-dec1',
    nodeText: 'Prédio em regime de propriedade horizontal mista (Gebalis + Arrendatários Privados)?',
    type: 'INCONCLUSIVO_DOCUMENTAL',
    title: 'Ilegibilidade parcial de prazo de envio de ata em imagem gráfica original',
    severity: 'low',
    status: 'open',
    visioEvidence: 'Prancha Visio pág. #102: Texto na caixa inferior de suporte à assembleia de condóminos possui compressão gráfica com artefactos visuais em torno do número de dias (15 ou 30).',
    flowEvidence: 'flows.json nó cond-p2: Refere "Convocatória e envio de ata nos termos do Código Civil (30 dias)".',
    gpsEvidence: 'GPS aplica o prazo geral supletivo de 30 dias.',
    expected: 'Confirmação se o regulamento de condomínio Gebalis prevê prazo encurtado de 15 dias para comunicação de deliberações.',
    actual: 'Documento gráfico original inconclusivo na visualização rasterizada.',
    operationalImpact: 'Não determinável',
    notes: 'Necessita verificação no regulamento interno de gestão de partes comuns.',
    history: [
      { date: '2026-09-10 04:00', action: 'Achado criado', author: 'Motor V6' }
    ],
    createdAt: '2026-09-10 04:00',
    updatedAt: '2026-09-10 04:00'
  }
];

export function getStoredFindings(): ValidationFinding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar achados do localStorage:', e);
  }
  return INITIAL_FINDINGS;
}

export function saveFindings(findings: ValidationFinding[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(findings));
  } catch (e) {
    console.warn('Erro ao guardar achados no localStorage:', e);
  }
}

export function updateFindingStatus(
  id: string,
  newStatus: FindingStatus,
  author = 'Auditor',
  note?: string
): ValidationFinding[] {
  const current = getStoredFindings();
  const updated = current.map(f => {
    if (f.id === id) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const history = f.history ? [...f.history] : [];
      history.push({
        date: now,
        action: `Estado alterado de '${f.status}' para '${newStatus}'`,
        author,
        note
      });
      return {
        ...f,
        status: newStatus,
        notes: note ? `${f.notes ? f.notes + ' | ' : ''}${note}` : f.notes,
        history,
        updatedAt: now
      };
    }
    return f;
  });
  saveFindings(updated);
  return updated;
}

export function addFindingNote(
  id: string,
  noteText: string,
  author = 'Auditor'
): ValidationFinding[] {
  const current = getStoredFindings();
  const updated = current.map(f => {
    if (f.id === id) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const history = f.history ? [...f.history] : [];
      history.push({
        date: now,
        action: 'Observação de auditoria adicionada',
        author,
        note: noteText
      });
      return {
        ...f,
        notes: f.notes ? `${f.notes} | ${noteText}` : noteText,
        history,
        updatedAt: now
      };
    }
    return f;
  });
  saveFindings(updated);
  return updated;
}

export function resetFindingsToDefault(): ValidationFinding[] {
  saveFindings(INITIAL_FINDINGS);
  return INITIAL_FINDINGS;
}
