import rawFlows from '../data/flows.json';
import { Flow, FlowArea, ValidationReport } from '../types';
import { normalizeText } from './utils';
import { getRuntimeFlows } from '../editor/flowEditorStore';

export const flows: Flow[] = rawFlows as Flow[];

/**
 * Returns all flows (including published custom versions if any).
 */
export function getAllFlows(): Flow[] {
  return getRuntimeFlows();
}

/**
 * Finds a flow by its unique slug.
 */
export function getFlowBySlug(slug: string): Flow | undefined {
  const currentFlows = getRuntimeFlows();
  return currentFlows.find((f) => f.slug === slug);
}

/**
 * Maps thematic areas from the flows based on domain and prefixes.
 */
export function getAreas(): FlowArea[] {
  return [
    {
      id: 'triagem',
      name: 'Triagem & Geral',
      description: 'Atendimento inicial, identificação do arrendatário e encaminhamento prioritário de chamadas.',
      iconName: 'PhoneCall',
      flowSlugs: ['triagem-inicial'],
    },
    {
      id: 'rendas',
      name: 'Rendas & Regularização',
      description: 'Acordos de pagamento prestacional, regularização de dívidas e pedidos de carência económica.',
      iconName: 'Receipt',
      flowSlugs: ['rendas-acordos-regularizacao', 'rendas-reducao-carencia'],
    },
    {
      id: 'obras',
      name: 'Obras & Conservação',
      description: 'Piquete urgente 24h, intervenções no interior dos fogos e conservação das partes comuns.',
      iconName: 'Wrench',
      flowSlugs: ['obras-piquete-emergencia', 'obras-interior-fogo', 'obras-partes-comuns'],
    },
    {
      id: 'social',
      name: 'Gestão Social & Conflitos',
      description: 'Acompanhamento de famílias em risco, mediação comunitária e resolução de queixas de vizinhança.',
      iconName: 'Users',
      flowSlugs: ['gestao-social-apoio', 'gestao-social-conflitos'],
    },
    {
      id: 'habitacao',
      name: 'Habitação & Património',
      description: 'Informação sobre candidaturas CML, realojamento, transmissões por óbito e permuta de habitações.',
      iconName: 'Home',
      flowSlugs: ['habitacao-atribuicao', 'habitacao-transmissao-troca'],
    },
    {
      id: 'administracao',
      name: 'Condomínios, Fiscalização & Qualidade',
      description: 'Administração de partes comuns, denúncias de ocupações e gestão de reclamações.',
      iconName: 'Building2',
      flowSlugs: ['condominios-administracao', 'denuncias-ocupacoes', 'administrativo-certidoes', 'reclamacoes-qualidade'],
    },
  ];
}

/**
 * Searches flows by name or node text without accents, case-insensitive.
 * e.g. "rendas" matches "Rendas" or nodes containing "renda".
 */
export function pesquisarFlows(query: string): Flow[] {
  const cleanQuery = normalizeText(query.trim());
  if (!cleanQuery) return flows;

  return flows.filter((flow) => {
    const flowNameNormalized = normalizeText(flow.name);
    if (flowNameNormalized.includes(cleanQuery)) return true;

    // Check node texts
    return flow.nodes.some((node) => {
      const nodeTextNormalized = normalizeText(node.t);
      return nodeTextNormalized.includes(cleanQuery);
    });
  });
}

/**
 * Returns previous and next flow for sequential navigation.
 */
export function getNextAndPrevFlow(currentSlug: string): { prev: Flow | null; next: Flow | null } {
  const index = flows.findIndex((f) => f.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? flows[index - 1] : flows[flows.length - 1];
  const next = index < flows.length - 1 ? flows[index + 1] : flows[0];

  return { prev, next };
}

/**
 * Performs rigorous internal validation of flows data as required by Rule 26.
 */
export function validateFlowsData(): ValidationReport {
  const slugSet = new Set<string>();
  const brokenLinks: { flowSlug: string; nodeId: string; targetSlug: string }[] = [];
  const brokenEdges: { flowSlug: string; fromId: string; toId: string }[] = [];
  const orphanNodes: { flowSlug: string; nodeId: string; nodeText: string }[] = [];

  let totalNodes = 0;
  let totalEdges = 0;
  let allSlugsValid = true;
  let allNodesHaveId = true;

  for (const flow of flows) {
    if (!flow.slug || slugSet.has(flow.slug)) {
      allSlugsValid = false;
    }
    slugSet.add(flow.slug);
    totalNodes += flow.nodes.length;
    totalEdges += flow.edges.length;

    const nodeIds = new Set<string>();
    for (const node of flow.nodes) {
      if (!node.id) {
        allNodesHaveId = false;
      }
      nodeIds.add(node.id);
    }

    // Check edges
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.f) || !nodeIds.has(edge.t)) {
        brokenEdges.push({ flowSlug: flow.slug, fromId: edge.f, toId: edge.t });
      }
    }

    // Check orphan nodes (nodes that are not 'start' or 'note' and have neither incoming nor outgoing edges)
    const connectedNodeIds = new Set<string>();
    for (const edge of flow.edges) {
      connectedNodeIds.add(edge.f);
      connectedNodeIds.add(edge.t);
    }

    for (const node of flow.nodes) {
      if (node.kind !== 'note' && !connectedNodeIds.has(node.id)) {
        orphanNodes.push({ flowSlug: flow.slug, nodeId: node.id, nodeText: node.t });
      }
    }
  }

  // Check inter-flow links
  for (const flow of flows) {
    for (const node of flow.nodes) {
      if (node.link && !slugSet.has(node.link)) {
        brokenLinks.push({ flowSlug: flow.slug, nodeId: node.id, targetSlug: node.link });
      }
    }
  }

  return {
    flowsCount: flows.length,
    totalNodes,
    totalEdges,
    allSlugsValid,
    allNodesHaveId,
    allLinksValid: brokenLinks.length === 0,
    allEdgesValid: brokenEdges.length === 0,
    noOrphanNodes: orphanNodes.length === 0,
    brokenLinks,
    brokenEdges,
    orphanNodes,
  };
}
