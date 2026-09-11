/**
 * GEBALIS VISION — Sistema de Modelo Único de Fluxos (FlowModel Store)
 * Sincronização estrita entre:
 * [VISTA GRÁFICA] <---> [FLOW MODEL] <---> [VERSÃO TEXTUAL]
 */

import { Flow, FlowNode, FlowEdge, NodeKind } from '../types';
import rawFlows from '../data/flows.json';
import { appendChangeRecord } from '../remediation/remediationStore';

const DRAFTS_STORAGE_KEY = 'gebalis_custom_flows_drafts_v1';
const PUBLISHED_STORAGE_KEY = 'gebalis_custom_flows_published_v1';
const HISTORY_STORAGE_KEY = 'gebalis_flow_editor_history_v1';

export interface FlowEditorHistoryItem {
  id: string;
  flowSlug: string;
  flowName: string;
  timestamp: string;
  adminName: string;
  changeSummary: string;
  previousVersion: string;
  newVersion: string;
  isProceduralChange: boolean;
  status: 'Rascunho' | 'Publicado' | 'Validado';
  nodesCount: number;
  edgesCount: number;
  flowSnapshot?: Flow;
}

export interface ModelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isProceduralChange: boolean;
  changesDetected: string[];
}

/**
 * Retorna todos os fluxos ativos, sobrepondo com as versões publicadas pelo Administrador se existirem.
 */
export function getRuntimeFlows(): Flow[] {
  const baseFlows = rawFlows as Flow[];
  if (typeof window === 'undefined') return baseFlows;

  try {
    const raw = localStorage.getItem(PUBLISHED_STORAGE_KEY);
    if (raw) {
      const publishedMap = JSON.parse(raw) as Record<string, Flow>;
      return baseFlows.map(bf => publishedMap[bf.slug] || bf);
    }
  } catch (e) {
    console.warn('Erro ao carregar fluxos publicados:', e);
  }
  return baseFlows;
}

/**
 * Retorna um fluxo para edição (prioridade: Rascunho > Publicado > Base original).
 */
export function getFlowForEditing(slug: string): { flow: Flow; isDraft: boolean; isPublishedCustom: boolean } {
  const baseFlows = rawFlows as Flow[];
  const original = baseFlows.find(f => f.slug === slug);
  if (!original) {
    throw new Error(`Fluxo não encontrado: ${slug}`);
  }

  if (typeof window === 'undefined') {
    return { flow: JSON.parse(JSON.stringify(original)), isDraft: false, isPublishedCustom: false };
  }

  try {
    // 1. Verificar se existe rascunho
    const draftsRaw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (draftsRaw) {
      const drafts = JSON.parse(draftsRaw) as Record<string, Flow>;
      if (drafts[slug]) {
        return { flow: JSON.parse(JSON.stringify(drafts[slug])), isDraft: true, isPublishedCustom: false };
      }
    }

    // 2. Verificar se existe versão publicada personalizada
    const pubRaw = localStorage.getItem(PUBLISHED_STORAGE_KEY);
    if (pubRaw) {
      const published = JSON.parse(pubRaw) as Record<string, Flow>;
      if (published[slug]) {
        return { flow: JSON.parse(JSON.stringify(published[slug])), isDraft: false, isPublishedCustom: true };
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar fluxo para edição:', e);
  }

  return { flow: JSON.parse(JSON.stringify(original)), isDraft: false, isPublishedCustom: false };
}

/**
 * Validação rigorosa do modelo único de fluxo conforme Requisito 19.
 */
export function validateFlowModel(flow: Flow): ModelValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const changesDetected: string[] = [];

  const baseFlows = rawFlows as Flow[];
  const original = baseFlows.find(f => f.slug === flow.slug);

  // 1. Validação de IDs únicos e não vazios
  const nodeIds = new Set<string>();
  const duplicateIds = new Set<string>();

  flow.nodes.forEach(node => {
    if (!node.id || node.id.trim() === '') {
      errors.push(`Existe um nó sem identificador (ID) válido.`);
    } else {
      if (nodeIds.has(node.id)) {
        duplicateIds.add(node.id);
      }
      nodeIds.add(node.id);
    }

    if (!node.t || node.t.trim() === '') {
      warnings.push(`O nó '${node.id}' não tem texto descritivo preenchido.`);
    }
  });

  if (duplicateIds.size > 0) {
    errors.push(`Identificadores duplicados encontrados: ${Array.from(duplicateIds).join(', ')}.`);
  }

  // 2. Nós existentes e destinos existentes
  flow.edges.forEach((edge, idx) => {
    if (!edge.f || !nodeIds.has(edge.f)) {
      errors.push(`A ligação #${idx + 1} tem nó de origem inexistente: '${edge.f}'.`);
    }
    if (!edge.t || !nodeIds.has(edge.t)) {
      errors.push(`A ligação #${idx + 1} (a partir de '${edge.f}') tem nó de destino inexistente: '${edge.t}'.`);
    }
    if (edge.f === edge.t) {
      errors.push(`O nó '${edge.f}' tem uma ligação auto-referencial direta para si próprio (ciclo acidental).`);
    }
  });

  // 3. Decisões válidas (devem ter pelo menos 2 saídas configuradas)
  flow.nodes.filter(n => n.kind === 'decision').forEach(decNode => {
    const outgoing = flow.edges.filter(e => e.f === decNode.id);
    if (outgoing.length === 0) {
      errors.push(`O nó de decisão '${decNode.id}' não tem qualquer saída configurada.`);
    } else if (outgoing.length < 2) {
      errors.push(`O nó de decisão '${decNode.id}' ("${decNode.t.substring(0, 30)}...") tem apenas ${outgoing.length} saída. Decisões exigem pelo menos 2 opções (ex: SIM / NÃO).`);
    }
  });

  // 4. Terminais válidos (não devem ter saídas e devem ser alcançáveis)
  flow.nodes.filter(n => n.kind === 'terminal').forEach(termNode => {
    const outgoing = flow.edges.filter(e => e.f === termNode.id);
    if (outgoing.length > 0) {
      warnings.push(`O nó terminal '${termNode.id}' tem ${outgoing.length} ligação(ões) de saída desnecessária(s).`);
    }
    const incoming = flow.edges.filter(e => e.t === termNode.id);
    if (incoming.length === 0) {
      errors.push(`O nó terminal '${termNode.id}' é impossível de alcançar (nenhuma ligação aponta para ele).`);
    }
  });

  // 5. Cross-flows válidos
  const allKnownSlugs = new Set(baseFlows.map(f => f.slug));
  flow.nodes.forEach(node => {
    if (node.link && !allKnownSlugs.has(node.link)) {
      errors.push(`O nó '${node.id}' referencia um cross-flow inexistente no catálogo: '${node.link}'.`);
    }
  });

  // 6. Deteção de Alteração Processual (Requisito 23)
  let isProceduralChange = false;
  if (original) {
    // Compara decisões
    const origDecisions = original.nodes.filter(n => n.kind === 'decision');
    const currDecisions = flow.nodes.filter(n => n.kind === 'decision');
    if (origDecisions.length !== currDecisions.length) {
      isProceduralChange = true;
      changesDetected.push(`Número de decisões alterado: de ${origDecisions.length} para ${currDecisions.length}.`);
    }

    // Compara arestas
    if (original.edges.length !== flow.edges.length) {
      isProceduralChange = true;
      changesDetected.push(`Número de ligações e percursos alterado: de ${original.edges.length} para ${flow.edges.length}.`);
    } else {
      // Verifica se mudou destinos ou labels
      const edgeDiff = flow.edges.some(ce => {
        const matching = original.edges.find(oe => oe.f === ce.f && oe.t === ce.t && oe.l === ce.l);
        return !matching;
      });
      if (edgeDiff) {
        isProceduralChange = true;
        changesDetected.push(`Percursos ou rótulos de condição modificados.`);
      }
    }

    // Compara nós
    if (original.nodes.length !== flow.nodes.length) {
      isProceduralChange = true;
      changesDetected.push(`Número de nós alterado: de ${original.nodes.length} para ${flow.nodes.length}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isProceduralChange,
    changesDetected
  };
}

/**
 * Salva rascunho de alterações.
 */
export function saveFlowDraft(flow: Flow, adminName = 'Administrador GEBALIS'): void {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    const drafts = raw ? JSON.parse(raw) : {};
    drafts[flow.slug] = flow;
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));

    // Adiciona ao histórico com snapshot
    recordHistory({
      flowSlug: flow.slug,
      flowName: flow.name,
      adminName,
      changeSummary: 'Guardado rascunho em edição',
      previousVersion: 'Rascunho Anterior',
      newVersion: `Draft-${new Date().toISOString().substring(0, 16).replace('T', ' ')}`,
      isProceduralChange: false,
      status: 'Rascunho',
      nodesCount: flow.nodes.length,
      edgesCount: flow.edges.length,
      flowSnapshot: JSON.parse(JSON.stringify(flow))
    });
  } catch (e) {
    console.warn('Erro ao salvar rascunho:', e);
  }
}

/**
 * Publica versão do fluxo aprovada.
 */
export function publishFlowVersion(
  flow: Flow, 
  reason: string,
  adminName = 'Administrador GEBALIS'
): { success: boolean; validation: ModelValidationResult } {
  const validation = validateFlowModel(flow);
  if (!validation.isValid) {
    return { success: false, validation };
  }

  try {
    // 1. Guardar nos publicados
    const pubRaw = localStorage.getItem(PUBLISHED_STORAGE_KEY);
    const published = pubRaw ? JSON.parse(pubRaw) : {};
    published[flow.slug] = flow;
    localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(published));

    // 2. Limpar rascunho se existir
    const draftsRaw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (draftsRaw) {
      const drafts = JSON.parse(draftsRaw);
      delete drafts[flow.slug];
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    }

    // 3. Registar no histórico de fluxo
    const newVersionTag = `V-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-REV`;
    recordHistory({
      flowSlug: flow.slug,
      flowName: flow.name,
      adminName,
      changeSummary: reason || 'Publicação de nova versão operacional',
      previousVersion: 'Baseline Oficial',
      newVersion: newVersionTag,
      isProceduralChange: validation.isProceduralChange,
      status: 'Publicado',
      nodesCount: flow.nodes.length,
      edgesCount: flow.edges.length,
      flowSnapshot: JSON.parse(JSON.stringify(flow))
    });

    // 4. Se for alteração processual, registar no Change Audit formal de Governação V7 (Requisito 23)
    if (validation.isProceduralChange) {
      appendChangeRecord({
        remediationId: 'REM-FLOW-EDITOR',
        findingId: 'VAL-GOV-FLOW-UPDATE',
        actor: adminName,
        component: `FlowModel: ${flow.name} (${flow.slug})`,
        file: 'src/editor/flowEditorStore.ts (Published FlowModel)',
        before: { version: 'Baseline Oficial' },
        after: { 
          version: newVersionTag, 
          nodesCount: flow.nodes.length, 
          edgesCount: flow.edges.length,
          changes: validation.changesDetected 
        },
        reason: reason || 'Atualização de regras e decisões operacionais aprovadas pelo Administrador',
        approval: `${adminName} (Despacho de Publicação)`,
        preSnapshot: 'AUDIT-BASELINE',
        postSnapshot: `POST-PUBLISH-${flow.slug}`,
        validationResult: 'Conforme (Validado pelo motor determinístico do Editor)'
      });
    }

    window.dispatchEvent(new CustomEvent('gebalis-flow-updated', { detail: { slug: flow.slug } }));
    return { success: true, validation };
  } catch (e) {
    console.error('Erro ao publicar fluxo:', e);
    return { success: false, validation };
  }
}

/**
 * Reverte fluxo para a versão base original de fábrica.
 */
export function revertFlowToOriginal(slug: string): void {
  try {
    const draftsRaw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (draftsRaw) {
      const drafts = JSON.parse(draftsRaw);
      delete drafts[slug];
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    }

    const pubRaw = localStorage.getItem(PUBLISHED_STORAGE_KEY);
    if (pubRaw) {
      const published = JSON.parse(pubRaw);
      delete published[slug];
      localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(published));
    }

    recordHistory({
      flowSlug: slug,
      flowName: slug,
      adminName: 'Administrador GEBALIS',
      changeSummary: 'Restauro para versão original de fábrica',
      previousVersion: 'Personalizado',
      newVersion: 'Original (Fábrica)',
      isProceduralChange: true,
      status: 'Publicado',
      nodesCount: 0,
      edgesCount: 0
    });

    window.dispatchEvent(new CustomEvent('gebalis-flow-updated', { detail: { slug } }));
  } catch (e) {
    console.warn('Erro ao reverter fluxo:', e);
  }
}

function recordHistory(item: Omit<FlowEditorHistoryItem, 'id' | 'timestamp'>): void {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history: FlowEditorHistoryItem[] = raw ? JSON.parse(raw) : [];
    const newItem: FlowEditorHistoryItem = {
      ...item,
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    const updated = [newItem, ...history].slice(0, 50); // manter últimos 50
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao gravar histórico do editor:', e);
  }
}

export function getFlowEditorHistory(slug?: string): FlowEditorHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw) as FlowEditorHistoryItem[];
      if (slug) {
        return list.filter(item => item.flowSlug === slug);
      }
      return list;
    }
  } catch (e) {
    console.warn('Erro ao ler histórico do editor:', e);
  }
  return [];
}

/**
 * Recupera e restaura uma versão anterior armazenada no histórico.
 */
export function restoreFlowFromHistory(historyId: string): Flow | null {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as FlowEditorHistoryItem[];
    const item = list.find(h => h.id === historyId);
    if (item && item.flowSnapshot) {
      // Salva como rascunho ativo
      saveFlowDraft(item.flowSnapshot, 'Rollback Restaurado');
      window.dispatchEvent(new CustomEvent('gebalis-flow-updated', { detail: { slug: item.flowSlug } }));
      return JSON.parse(JSON.stringify(item.flowSnapshot));
    }
  } catch (e) {
    console.warn('Erro ao restaurar histórico:', e);
  }
  return null;
}

