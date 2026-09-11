import { BenchmarkAuditRecord } from '../types';

export const BENCHMARK_137_AUDIT: BenchmarkAuditRecord = {
  value: 137,
  title: "Benchmark Histórico de 137 Fluxos",
  classification: "Métrica Documental Prévia / Benchmark Histórico",
  origin: "Documentação preliminar do projeto GEBALIS VISION e especificações de versões iniciais",
  context: "Identificado em sumários executivos e documentação preparatória que referiam a existência de '137 fluxos operacionais' no ecossistema do Contact Center da GEBALIS.",
  documentAssociated: "Especificações de Requisitos Preliminares e Inventário Teórico de Atendimento",
  hypotheses: [
    {
      title: "Hipótese 1: Contagem de Caminhos / Casos de Uso Subordinados",
      description: "O número 137 pode representar o total de caminhos de decisão únicos, folhas terminais ou ramificações operacionais identificadas em questionários de processo, posteriormente consolidados nos 14 grafos mestres interativos.",
      plausibility: "ALTA"
    },
    {
      title: "Hipótese 2: Páginas Úteis vs Páginas Totais do Ficheiro Visio",
      description: "O ficheiro original Microsoft Visio contém 145 páginas exportadas (xaml_1 a xaml_145). Descontando páginas de capa (Pág 1), páginas introdutórias de organigrama (Pág 6) e minutas/anexos auxiliares, o conjunto de páginas com processos estritos situa-se entre 135 e 138 páginas.",
      plausibility: "ALTA"
    },
    {
      title: "Hipótese 3: Versão Anterior do Mapeamento (Legado)",
      description: "Representa um levantamento anterior da consultoria ou equipa de processos onde cada subprocesso ou tipologia de atendimento era contabilizado como um fluxo individual antes da unificação arquitetural em grafos de decisão.",
      plausibility: "MÉDIA"
    }
  ],
  warning: "AVISO DE AUDITORIA FORENSE: O valor 137 NÃO deve ser forçado a coincidir com 145 (páginas Visio) nem com 14 (fluxos core JSON). Cada camada documental deve ser mantida com proveniência e integridade distintas até obtenção de documentação primária adicional.",
  conclusion: "A reconciliação forense demonstra que os 14 fluxos estruturados em flows.json concentram a lógica de atendimento interativo, enquanto as 145 páginas Visio constituem o acervo gráfico integral. O número 137 permanece como benchmark histórico devidamente documentado e catalogado."
};
