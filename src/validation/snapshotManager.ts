import { AuditSnapshot, OperationalValidationReport } from '../types';

const SNAPSHOTS_KEY = 'gebalis_v6_audit_snapshots';

export const BASELINE_SNAPSHOT: AuditSnapshot = {
  id: 'AUDIT-2026-09-10-BASELINE',
  timestamp: '2026-09-10 04:00:00',
  name: 'Auditoria Baseline V6 — Instalação Inicial',
  totalFlows: 14,
  totalVisioPages: 145,
  conformeCount: 9,
  divergenteCount: 4,
  inconclusivoCount: 1,
  findingsTotal: 8,
  findingsBySeverity: {
    critical: 0,
    high: 1,
    medium: 3,
    low: 3,
    informational: 1
  },
  flowScores: [
    { flowSlug: 'triagem-inicial', score: 82, status: 'divergente' },
    { flowSlug: 'rendas-acordos-regularizacao', score: 74, status: 'divergente' },
    { flowSlug: 'rendas-reducao-carencia', score: 100, status: 'conforme' },
    { flowSlug: 'obras-piquete-emergencia', score: 94, status: 'parcialmente_conforme' },
    { flowSlug: 'obras-interior-fogo', score: 100, status: 'conforme' },
    { flowSlug: 'obras-partes-comuns', score: 100, status: 'conforme' },
    { flowSlug: 'gestao-social-apoio', score: 100, status: 'conforme' },
    { flowSlug: 'gestao-social-conflitos', score: 85, status: 'divergente' },
    { flowSlug: 'habitacao-atribuicao', score: 98, status: 'conforme' },
    { flowSlug: 'habitacao-transmissao-troca', score: 100, status: 'conforme' },
    { flowSlug: 'condominios-administracao', score: 80, status: 'inconclusivo' },
    { flowSlug: 'denuncias-ocupacoes', score: 78, status: 'divergente' },
    { flowSlug: 'administrativo-certidoes', score: 100, status: 'conforme' },
    { flowSlug: 'reclamacoes-qualidade', score: 100, status: 'conforme' }
  ],
  notes: 'Snapshot de referência oficial inicializado com a auditoria operacional V6.'
};

export function getAllSnapshots(): AuditSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler snapshots do localStorage:', e);
  }
  return [BASELINE_SNAPSHOT];
}

export function saveSnapshotFromReport(
  report: OperationalValidationReport,
  customName?: string,
  notes?: string
): AuditSnapshot {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  const id = `AUDIT-${now.toISOString().substring(0, 10)}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const newSnapshot: AuditSnapshot = {
    id,
    timestamp: dateStr,
    name: customName || `Snapshot de Auditoria ${id}`,
    totalFlows: report.totalStructuredFlows,
    totalVisioPages: report.totalVisioPages,
    conformeCount: report.conformeFlowsCount,
    divergenteCount: report.divergenteFlowsCount,
    inconclusivoCount: report.inconclusivoFlowsCount,
    findingsTotal: report.totalFindings,
    findingsBySeverity: { ...report.findingsBySeverity },
    flowScores: report.flowResults.map(r => ({
      flowSlug: r.flowSlug,
      score: r.complianceScore,
      status: r.v6ValidationStatus
    })),
    notes: notes || 'Snapshot guardado pelo utilizador na interface de validação operacional.'
  };

  const current = getAllSnapshots();
  const updated = [newSnapshot, ...current];
  try {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao gravar snapshots no localStorage:', e);
  }
  return newSnapshot;
}

export interface SnapshotComparison {
  snapshotA: AuditSnapshot;
  snapshotB: AuditSnapshot;
  conformeDiff: number;
  divergenteDiff: number;
  inconclusivoDiff: number;
  findingsDiff: number;
  flowChanges: {
    flowSlug: string;
    scoreA: number;
    scoreB: number;
    scoreDiff: number;
    statusA: string;
    statusB: string;
    hasRegression: boolean;
  }[];
}

export function compareSnapshots(snapshotA: AuditSnapshot, snapshotB: AuditSnapshot): SnapshotComparison {
  const conformeDiff = snapshotB.conformeCount - snapshotA.conformeCount;
  const divergenteDiff = snapshotB.divergenteCount - snapshotA.divergenteCount;
  const inconclusivoDiff = snapshotB.inconclusivoCount - snapshotA.inconclusivoCount;
  const findingsDiff = snapshotB.findingsTotal - snapshotA.findingsTotal;

  const flowChanges = snapshotB.flowScores.map(bItem => {
    const aItem = snapshotA.flowScores.find(a => a.flowSlug === bItem.flowSlug);
    const scoreA = aItem ? aItem.score : 0;
    const scoreB = bItem.score;
    const statusA = aItem ? aItem.status : 'desconhecido';
    const statusB = bItem.status;
    const scoreDiff = scoreB - scoreA;
    // Regression if score decreased or status went from conforme to divergente
    const hasRegression = scoreDiff < 0 || (statusA === 'conforme' && statusB !== 'conforme');

    return {
      flowSlug: bItem.flowSlug,
      scoreA,
      scoreB,
      scoreDiff,
      statusA,
      statusB,
      hasRegression
    };
  });

  return {
    snapshotA,
    snapshotB,
    conformeDiff,
    divergenteDiff,
    inconclusivoDiff,
    findingsDiff,
    flowChanges
  };
}
