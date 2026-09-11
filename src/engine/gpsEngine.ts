import { Flow, FlowNode, FlowEdge, GPSPathStep, GPSState, IdentityGateState, IdentityGateMember } from '../types';

export interface GPSDecisionOption {
  label: string;
  targetNodeId: string;
  isTerminal: boolean;
  targetLink?: string;
}

export class GPSEngine {
  /**
   * Initializes a GPS run for a given flow.
   */
  static initFlow(flow: Flow): GPSState {
    const startNode = flow.nodes.find(n => n.kind === 'start') || flow.nodes[0];
    const initialStep: GPSPathStep = {
      nodeId: startNode.id,
      nodeText: startNode.t,
      nodeKind: startNode.kind,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    return {
      flowSlug: flow.slug,
      currentNodeId: startNode.id,
      history: [initialStep],
      status: startNode.kind === 'terminal' ? 'TERMINAL' : 'RUNNING',
      redirectSlug: startNode.link
    };
  }

  /**
   * Obtains the available choices/outgoing branches for the current node.
   */
  static getOptionsForNode(flow: Flow, nodeId: string): GPSDecisionOption[] {
    const node = flow.nodes.find(n => n.id === nodeId);
    if (!node) return [];

    const outgoingEdges = flow.edges.filter(e => e.f === nodeId);

    // If node has an inter-flow link
    if (node.link) {
      return [{
        label: `Encaminhar para Fluxo [${node.link}]`,
        targetNodeId: node.id,
        isTerminal: true,
        targetLink: node.link
      }];
    }

    if (outgoingEdges.length === 0) {
      return [];
    }

    return outgoingEdges.map((edge, idx) => {
      const targetNode = flow.nodes.find(n => n.id === edge.t);
      const isTerminal = targetNode?.kind === 'terminal';
      const label = edge.l || (outgoingEdges.length === 2 ? (idx === 0 ? 'SIM' : 'NÃO') : `Opção ${idx + 1}`);

      return {
        label,
        targetNodeId: edge.t,
        isTerminal,
        targetLink: targetNode?.link
      };
    });
  }

  /**
   * Deterministically transitions to the next node based on selected option.
   */
  static selectOption(
    currentState: GPSState,
    flow: Flow,
    option: GPSDecisionOption
  ): GPSState {
    const targetNode = flow.nodes.find(n => n.id === option.targetNodeId);
    if (!targetNode) return currentState;

    // Update last history step with chosen answer
    const updatedHistory = [...currentState.history];
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1] = {
        ...updatedHistory[updatedHistory.length - 1],
        chosenAnswer: option.label,
        targetNodeId: targetNode.id
      };
    }

    // Add new step
    const newStep: GPSPathStep = {
      nodeId: targetNode.id,
      nodeText: targetNode.t,
      nodeKind: targetNode.kind,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const isTerminal = targetNode.kind === 'terminal' || Boolean(option.targetLink);

    return {
      flowSlug: flow.slug,
      currentNodeId: targetNode.id,
      history: [...updatedHistory, newStep],
      status: isTerminal ? (option.targetLink ? 'REDIRECTED' : 'TERMINAL') : 'RUNNING',
      redirectSlug: option.targetLink || targetNode.link
    };
  }

  /**
   * Rolls back the Call Trail to an earlier step, truncating all subsequent invalid steps deterministically.
   */
  static rollbackToStep(
    currentState: GPSState,
    stepIndex: number
  ): GPSState {
    if (stepIndex < 0 || stepIndex >= currentState.history.length) {
      return currentState;
    }

    const truncatedHistory = currentState.history.slice(0, stepIndex + 1);
    // Clear chosen answer of target step since the user is re-evaluating it
    const targetStep = {
      ...truncatedHistory[stepIndex],
      chosenAnswer: undefined,
      targetNodeId: undefined
    };
    truncatedHistory[stepIndex] = targetStep;

    return {
      ...currentState,
      currentNodeId: targetStep.nodeId,
      history: truncatedHistory,
      status: targetStep.nodeKind === 'terminal' ? 'TERMINAL' : 'RUNNING',
      redirectSlug: undefined
    };
  }

  /**
   * Default Identity Gate State factory.
   */
  static createDefaultIdentityGate(): IdentityGateState {
    return {
      nif: '',
      dataNascimento: '',
      comprovado: false,
      membros: [
        { nome: 'Manuel Silva (Arrendatário Titular)', parentesco: 'Titular do Contrato', nif: '123456789', autorizado: true },
        { nome: 'Maria Silva (Cônjuge)', parentesco: 'Cônjuge / Membro do Agregado', nif: '987654321', autorizado: true },
        { nome: 'João Silva (Filho Maior)', parentesco: 'Descendente', nif: '234567890', autorizado: false },
      ],
      interlocutorIndex: 0,
      possuiProcuracao: false,
      status: 'NAO_INICIADO'
    };
  }

  /**
   * Evaluates identity gate rules deterministically.
   */
  static validateIdentityGate(
    state: IdentityGateState,
    inputNif: string,
    inputBirthDate: string,
    selectedInterlocutorIndex: number,
    hasPowerOfAttorney: boolean
  ): IdentityGateState {
    const cleanNif = inputNif.replace(/\D/g, '');
    if (cleanNif.length !== 9) {
      return {
        ...state,
        nif: cleanNif,
        status: 'BLOQUEADO',
        motivoBloqueio: 'NIF inválido. O NIF deve conter exatamente 9 dígitos numéricos.'
      };
    }

    if (!inputBirthDate) {
      return {
        ...state,
        nif: cleanNif,
        status: 'BLOQUEADO',
        motivoBloqueio: 'Data de nascimento é de preenchimento obrigatório para autenticação de dados RGPD.'
      };
    }

    const selectedMember = state.membros[selectedInterlocutorIndex];
    if (!selectedMember) {
      return {
        ...state,
        nif: cleanNif,
        dataNascimento: inputBirthDate,
        status: 'BLOQUEADO',
        motivoBloqueio: 'Interlocutor não identificado no registo cadastral do agregado.'
      };
    }

    // Rule: If interlocutor is not the direct authorized holder or spouse, they MUST have a formal power of attorney
    const isDirectlyAuthorized = selectedMember.autorizado;
    if (!isDirectlyAuthorized && !hasPowerOfAttorney) {
      return {
        ...state,
        nif: cleanNif,
        dataNascimento: inputBirthDate,
        interlocutorIndex: selectedInterlocutorIndex,
        possuiProcuracao: false,
        status: 'BLOQUEADO',
        motivoBloqueio: `O interlocutor (${selectedMember.nome}) não possui autorização direta no contrato e não foi apresentada procuração forense ou autorização escrita de representação. Atendimento bloqueado nos termos do RGPD.`
      };
    }

    return {
      ...state,
      nif: cleanNif,
      dataNascimento: inputBirthDate,
      comprovado: true,
      interlocutorIndex: selectedInterlocutorIndex,
      possuiProcuracao: hasPowerOfAttorney,
      status: 'AUTORIZADO',
      motivoBloqueio: undefined
    };
  }
}
