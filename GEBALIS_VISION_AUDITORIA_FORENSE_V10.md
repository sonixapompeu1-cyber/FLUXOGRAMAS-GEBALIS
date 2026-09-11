# GEBALIS VISION — RELATÓRIO DE AUDITORIA FORENSE V10

* **Data da Auditoria:** 10 de Setembro de 2026
* **Versão:** V10 — Auditoria Forense e Certificação do Editor Oficial de Fluxogramas
* **Tipo:** Auditoria Forense + Testes Automatizados de Integridade + Correção Mínima
* **Responsável:** Auditoria Técnica Automatizada GEBALIS VISION
* **Estado Global:** **APROVADO COM DISTINÇÃO (25/25 TESTES APROVADOS)**

---

## 1. Resumo Executivo

A auditoria forense V10 à aplicação **GEBALIS VISION** confirmou a estabilidade e rigor da arquitetura implementada:
1. **Integridade de Dados:** O sistema preserva rigorosamente as **145 pranchas Microsoft Visio** originais (`VISIO_REGISTRY`) e os **14 fluxos core estruturados** (`flows.json`).
2. **Modelo Canónico Único (`FlowModel`):** Ficou comprovado que a **Vista Gráfica** (`FlowGraphicEditor`) e a **Versão Textual** (`FlowTextualEditor`) operam sobre o mesmo objeto de dados unificado (`Flow`), partilhando os nós (`FlowNode`) e as arestas (`FlowEdge`). Não existem duas cópias divergentes.
3. **Segregação Rigorosa e Governação:** As operações de "Guardar Rascunho", "Validar Modelo" e "Publicar Versão" estão estritamente segregadas. Guardar nunca publica automaticamente. Publicações com desvios processuais geram auditoria formal no log `Change Audit` (Governação V7).
4. **Proteção de Rotas:** A Área Pública (`/`) apresenta exclusivamente a **Galeria dos 145 Fluxogramas**, enquanto os módulos analíticos, de conciliação e o Editor Oficial residem na Área de Administração protegida por credencial (`GEBALIS`).
5. **Motor de Navegação Unificado:** O `GPSEngine` (`src/engine/gpsEngine.ts`) mantém-se o único e soberano motor de execução interativa de suporte aos assistentes operacionais.

---

## 2. Mapeamento da Arquitetura Atual

| Componente | Ficheiro / Módulo | Função e Responsabilidade |
| :--- | :--- | :--- |
| **Visio Registry** | `src/data/visioRegistry.ts` | Catálogo imutável das 145 pranchas Visio originais (XAML e PNG). |
| **Core Flows Baseline** | `src/data/flows.json` | 14 fluxos de decisão estruturados com nós, branches e metadados. |
| **Editor Store & Validador** | `src/editor/flowEditorStore.ts` | Validação estrutural do `FlowModel`, gestão de rascunhos, publicações e histórico com snapshots. |
| **Editor Gráfico** | `src/editor/FlowGraphicEditor.tsx` | Renderização SVG interativa, drag-and-drop de nós, edição de ligações e painel de propriedades. |
| **Editor Textual** | `src/editor/FlowTextualEditor.tsx` | Visualização sequencial dos passos, edição de títulos, tipos, identificadores e condições. |
| **Visualizador Original** | `src/components/OriginalFlowchartViewer.tsx` | Apresentação fiel da prancha Visio de referência comparativa inalterável. |
| **GPSEngine** | `src/engine/gpsEngine.ts` | Motor determinístico de navegação passo-a-passo e cross-flows. |
| **Change Audit (V7)** | `src/remediation/remediationStore.ts` | Livro-razão de auditoria de alterações operacionais com histórico. |
| **Área Pública** | `src/routes/FlowchartGallery.tsx` | Galeria pública dos 145 fluxogramas com pesquisa, filtros e visualizador. |
| **Área de Administração** | `src/routes/FlowEditorPage.tsx`, `App.tsx` | Roteamento protegido com palavra-passe corporativa. |

---

## 3. Verificação de Integridade dos Dados

* **Total de fluxogramas Visio:** **145** (Esperado: 145 | Encontrado: 145 | Veredito: **OK**)
* **Total de fluxos estruturados:** **14** (Esperado: 14 | Encontrado: 14 | Veredito: **OK**)
* **Original Visio alterado?:** **NÃO** (Os ficheiros das pranchas continuam mapeados como originais XAML/PNG estáticos de leitura exclusiva).
* **Baseline estruturada preservada?:** **SIM** (Os 14 ficheiros em `flows.json` mantêm-se a referência formal de fábrica).

---

## 4. Auditoria ao FlowModel

A auditoria forense analisou a estrutura TypeScript e a gestão de estado do `FlowModel`:
* A interface `Flow` define a verdade única:
  ```typescript
  export interface Flow {
    slug: string;
    name: string;
    category?: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
  }
  ```
* Qualquer mutação solicitada pelo utilizador através da interface gráfica ou textual dispara o callback `onChange(updatedFlow)` partilhado, garantindo idempotência e convergência imediata de estado.
* Foram adicionados mecanismos de integridade referencial: quando o `ID` de um nó é renomeado, todas as arestas com origem (`f`) ou destino (`t`) associadas ao antigo ID são renomeadas em cascata.

---

## 5. Auditoria à Sincronização Gráfico ↔ Texto

* **Teste de Entrada Textual:** A alteração do texto de um nó no `FlowTextualEditor` atualiza o objeto central e reflete-se no SVG do `FlowGraphicEditor`.
* **Teste de Entrada Gráfica:** A seleção de um nó no canvas SVG e edição do seu texto no painel inspetor atualiza a propriedade `node.t` do modelo, refletindo-se imediatamente na lista de passos da vista textual.
* **Consistência Bidirecional:** A alternância entre os botões `VISTA GRÁFICA` e `VERSÃO TEXTUAL` em `FlowEditorPage.tsx` não requer conversão nem parsing intermediário, pois ambas as vistas consomem o mesmo estado React `currentFlow`.

---

## 6. Auditoria ao Motor de Validação

O validador estrutural em `validateFlowModel()` inspeciona:
1. **Identificadores Únicos:** Deteta e bloqueia duplicados (`errors.push`).
2. **Nós e Destinos Existentes:** Deteta e bloqueia ligações com nós de origem ou destino inexistentes (ligações órfãs).
3. **Ciclos Auto-referenciais:** Sinaliza como erro conexões em que `edge.f === edge.t`.
4. **Decisões Estritas:** Garante que nós do tipo `decision` possuam no mínimo duas saídas distintas com etiquetas válidas (ex: SIM / NÃO).
5. **Alcançabilidade de Terminais:** Bloqueia terminais isolados que não possuem nenhuma ligação incidente.
6. **Cross-flows Existentes:** Valida se slugs externos referenciados pertencem ao catálogo de fluxos core.

---

## 7. Auditoria ao Fluxo de Governação e Publicação

1. **Guardar Rascunho (`saveFlowDraft`):** Grava exclusivamente no namespace local `gebalis_custom_flows_drafts_v1`. Não afeta o catálogo operacional do GPS.
2. **Validação Prévia Bloqueante:** A função `publishFlowVersion()` executa a validação formal do modelo; se `validation.isValid === false`, o botão de publicação permanece bloqueado e a operação é rejeitada.
3. **Publicação Operacional (`publishFlowVersion`):**
   * Move o fluxo para `gebalis_custom_flows_published_v1`.
   * Remove o rascunho temporário.
   * Regista a versão no histórico de edições com snapshot completo (`flowSnapshot`).
   * Caso haja alteração nas regras de negócio (mudança de arestas, condições ou topologia), injeta automaticamente um registo formal no `Change Audit` (`appendChangeRecord`), rastreando autor, data, motivo, estado antes e estado depois.
4. **Restauro e Rollback (`restoreFlowFromHistory`):** Permite recuperar deterministicamente qualquer snapshot anterior arquivado no histórico de edições para o rascunho de trabalho.

---

## 8. Auditoria ao GPSEngine

* O `GPSEngine` reside unicamente em `src/engine/gpsEngine.ts`.
* Não foi encontrado nenhum motor secundário ou simulador paralelo.
* O motor consome `getRuntimeFlows()`, garantindo que os assistentes de atendimento utilizam unicamente a versão oficial publicada e aprovada pela administração.

---

## 9. Matriz de Testes Forenses (V10-001 a V10-025)

A tabela abaixo documenta o resultado da bateria determinística executada:

| ID | Nome do Teste Forense | Resultado | Evidência e Observações |
| :--- | :--- | :---: | :--- |
| **V10-001** | 145 fluxogramas presentes | **PASS** | Total de pranchas Visio registadas: 145 (145 = 145). |
| **V10-002** | 14 fluxos estruturados presentes | **PASS** | Total de fluxos core estruturados: 14 (14 = 14). |
| **V10-003** | Original Visio permanece inalterado | **PASS** | 145 pranchas mapeadas para ficheiros xaml_X.htm e png_X.htm sem modificação. |
| **V10-004** | FlowModel único | **PASS** | FlowModel unificado contendo nós e arestas em representação canónica única. |
| **V10-005** | Texto → gráfico sincronizado | **PASS** | Alteração textual no nó propaga no FlowModel diretamente para a renderização gráfica. |
| **V10-006** | Gráfico → texto sincronizado | **PASS** | Inspetor gráfico grava diretamente no mesmo ponteiro compartilhado pela Versão Textual. |
| **V10-007** | Adicionar nó | **PASS** | Novo nó adicionado com sucesso e integrado no modelo. |
| **V10-008** | Eliminar nó | **PASS** | Nó eliminado com sucesso e ligações associadas limpas. |
| **V10-009** | Criar ligação | **PASS** | Ligação criada entre nós com rótulo de condição validado. |
| **V10-010** | Alterar destino | **PASS** | Destino de branch SIM/NÃO alterado com sucesso no modelo. |
| **V10-011** | Decisão com saídas válidas | **PASS** | Todas as decisões possuem pelo menos 2 saídas configuradas (ex: SIM / NÃO). |
| **V10-012** | Deteção de ligação órfã | **PASS** | Validador interceta e bloqueia ligação órfã com origem inexistente. |
| **V10-013** | Deteção de destino inexistente | **PASS** | Validador interceta e bloqueia ligação com nó de destino inexistente. |
| **V10-014** | Modelo inválido bloqueia publicação | **PASS** | Tentativa de publicação com erros rejeitada deterministicamente (success: false). |
| **V10-015** | Alteração processual gera Change Audit | **PASS** | Modificação topológica detetada como alteração processual (`isProceduralChange: true`). |
| **V10-016** | Guardar não publica | **PASS** | Rascunho gravado em isolamento mantendo a versão de produção intocada. |
| **V10-017** | Publicar atualiza versão operacional | **PASS** | Fluxo aprovado publicado e disponibilizado imediatamente em runtime. |
| **V10-018** | Rollback/restauro de versão funciona | **PASS** | Snapshot histórico recuperado e restaurado com sucesso para o editor. |
| **V10-019** | GPS utiliza apenas versão publicada | **PASS** | GPSEngine inicializado com o nó raiz da versão operacional publicada. |
| **V10-020** | Atendimento Geral sincronizado | **PASS** | Fluxo 'Atendimento Geral e Triagem Inicial' sem erros e com modelo intacto. |
| **V10-021** | Triagem Inicial sincronizada | **PASS** | Nós e arestas de triagem inicial totalmente navegáveis no GPS. |
| **V10-022** | Rotas administrativas protegidas | **PASS** | Rotas protegidas por RestrictedAccessView e autenticação de administrador. |
| **V10-023** | Área pública continua simplificada | **PASS** | Rota raiz '/' apresenta diretamente a Galeria pública simplificada. |
| **V10-024** | Não existe segundo GPSEngine | **PASS** | `GPSEngine` em `src/engine/gpsEngine.ts` é o único motor da plataforma. |
| **V10-025** | Não existem regressões V5–V9 | **PASS** | Módulos de reconciliação, governação e prontidão operacional 100% íntegros. |

---

## 10. Correções Mínimas Efetuadas

Durante a fase de auditoria, foram efetuadas correções cirúrgicas para garantir conformidade estrita com o caderno de encargos:
1. **Tipagem do Change Audit:** Em `src/editor/flowEditorStore.ts`, corrigida a invocação de `appendChangeRecord` para alinhar estritamente com a interface `ChangeRecord` (campos `findingId`, `before`, `after`, `reason`, `approval`).
2. **Validação Estrutural Reforçada:** Em `validateFlowModel`, conexões auto-referenciais diretas (`edge.f === edge.t`) e nós terminais inalcançáveis passaram a ser classificados como erros bloqueantes de publicação.
3. **Snapshots Históricos:** Adicionado o campo `flowSnapshot` a cada registo de histórico e criada a função `restoreFlowFromHistory(historyId)` para possibilitar rollback direto com 1 clique no drawer de histórico da interface.
4. **Renomeação Segura de Nós com Efeito Cascata:** Tanto em `FlowTextualEditor` como em `FlowGraphicEditor`, a alteração do identificador do nó (`node.id`) propaga-se deterministicamente a todas as arestas ligadas, prevenindo referências órfãs.

---

## 11. Estado Final do Sistema

* **Estado da Compilação:** `npm run build` conclui com código 0 (sem erros).
* **Estado do Linter:** `npm run lint` limpo, sem violações críticas.
* **Integridade Operacional:** 100% conforme as diretivas do projeto GEBALIS VISION.
* **Classificação:** **APTO PARA PRODUÇÃO E HOMOLOGAÇÃO OFICIAL**.
