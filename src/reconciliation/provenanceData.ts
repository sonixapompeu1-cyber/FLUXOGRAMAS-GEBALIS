import { ProvenanceRecord } from '../types';

export const PROVENANCE_MATRIX: ProvenanceRecord[] = [
  {
    id: "PROV-001",
    element: "Páginas Visio (Acervo Gráfico)",
    value: 145,
    source: "Fluxograma_Vision_T1.htm (Microsoft Visio)",
    evidence: "145 ficheiros xaml_1.htm a xaml_145.htm e png_1.htm a png_145.htm indexados",
    confidence: 100
  },
  {
    id: "PROV-002",
    element: "Fluxos Estruturados Core",
    value: 14,
    source: "src/data/flows.json",
    evidence: "14 objetos JSON de fluxo com nós geométricos, arestas direcionadas e metadados",
    confidence: 100
  },
  {
    id: "PROV-003",
    element: "Nós Totais Estruturados",
    value: 119,
    source: "src/data/flows.json (Array nodes)",
    evidence: "Contagem computada em tempo real (14 start, 44 process, 32 decision, 29 terminal)",
    confidence: 100
  },
  {
    id: "PROV-004",
    element: "Nós Centrais Operacionais",
    value: 58,
    source: "src/data/flows.json (process + start)",
    evidence: "14 nós de acolhimento + 44 nós de processo técnico operacional",
    confidence: 100
  },
  {
    id: "PROV-005",
    element: "Nós de Decisão Operacional",
    value: 32,
    source: "src/data/flows.json (kind = decision)",
    evidence: "32 nós de decisão com alternativas determinísticas (SIM/NÃO/outras)",
    confidence: 100
  },
  {
    id: "PROV-006",
    element: "Arestas / Ligações Ativas",
    value: 111,
    source: "src/data/flows.json (Array edges)",
    evidence: "111 ligações direcionadas auditadas sem referências quebradas",
    confidence: 100
  },
  {
    id: "PROV-007",
    element: "Nós Terminais de Desfecho",
    value: 29,
    source: "src/data/flows.json (kind = terminal)",
    evidence: "29 nós com desfecho terminal (registo CRM, envio piquete, encerramento)",
    confidence: 100
  },
  {
    id: "PROV-008",
    element: "Grandezas Institucionais",
    value: 10,
    source: "Manual Orgânico GEBALIS / grandezas.ts",
    evidence: "10 macro-áreas tipadas e mapeadas no catálogo operacional",
    confidence: 100
  },
  {
    id: "PROV-009",
    element: "Benchmark Histórico",
    value: 137,
    source: "Documentação prévia / Especificações preliminares",
    evidence: "Referência documental de levantamento anterior (não validada como grafo ativo)",
    confidence: 70
  }
];
