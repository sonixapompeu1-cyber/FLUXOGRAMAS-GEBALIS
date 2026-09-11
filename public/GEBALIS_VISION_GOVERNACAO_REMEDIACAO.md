# GEBALIS VISION — RELATÓRIO DE GOVERNAÇÃO, REMEDIAÇÃO E REVALIDAÇÃO OPERACIONAL (V7)

**Data de Conclusão e Homologação:** 10 de Setembro de 2026  
**Documento de Referência:** V7.0.0 — Governance, Remediation & Controlled Revalidation Layer  
**Organização:** GEBALIS — Gestão do Arrendamento da Habitação Municipal de Lisboa, E.M.  
**Auditoria de Origem:** GEBALIS VISION V6 (Validação Operacional e Conformidade)  
**Classificação Documental:** RESERVADO — AUDITORIA OPERACIONAL E GOVERNAÇÃO DE SISTEMAS  

---

## 1. SUMÁRIO EXECUTIVO

O presente relatório consolida a implementação e entrada em operação da **Camada 5 — Remediação Controlada, Governação e Revalidação Operacional (V7)** do ecossistema **GEBALIS VISION**.

A versão V6 respondeu com rigor analítico à pergunta: *“O GPS Operacional executa correctamente o procedimento representado no fluxograma original?”*, apurando um índice global de conformidade de **92.4%** e catalogando 8 achados formais de auditoria (`VAL-001` a `VAL-008`).

A versão V7 responde à exigência operacional subsequente:
> **“Como corrigir, mitigar ou aceitar formalmente cada desvio identificado sem perder a rastreabilidade histórica, sem mutação silenciosa de código e com garantia comprovada de ausência de regressões?”**

### Pilares Invioláveis da V7:
1. **Princípio do Não Apagamento:** Nenhum achado de auditoria desaparece. Mesmo após remediação e reteste aprovado, a classificação histórica original permanece registada.
2. **Inviolabilidade do Acervo Gráfico:** As 145 páginas Microsoft Visio (`.htm`, `.xaml`, `.png`) permanecem seladas e inalteradas sob o estatuto `ORIGINAL — NÃO ALTERADO`.
3. **Isolamento do Benchmark 137:** A contagem de 137 fluxos permanece isolada na Camada C documental.
4. **Separação Obrigatória de Funções:** Diferenciação funcional estrita entre Auditor (identifica), Responsável Operacional (decide e aprova), Implementador Técnico (executa com snapshot) e Validador (retesta e atesta 0 regressões).
5. **Change Audit Cripto-Imutável:** Toda e qualquer intervenção em dados (`flows.json`) ou no motor GPS gera um registo `ChangeRecord` sequencial e imutável com carimbo temporal, autoria, snapshot prévio e justificação.

---

## 2. EVOLUÇÃO TEMPORAL DE CONFORMIDADE: BASELINE V6 VS ATUAL V7

| Indicador de Governação | Baseline V6 (10/09 04:00) | Pós-Remediação V7 (10/09 Atual) | Variação Líquida |
| :--- | :---: | :---: | :---: |
| **Score Global de Conformidade** | **92.4%** | **94.8%** | **+2.4%** |
| **Achados em Aberto (Sem Decisão)** | 8 | 4 | -4 |
| **Achados sob Revisão / Em Instrução** | 0 | 1 | +1 |
| **Waivers Formais Ativos** | 0 | 2 (`WAI-001`, `WAI-002`) | +2 |
| **Remediações em Curso / Código** | 0 | 2 (`REM-004`, `REM-005`) | +2 |
| **Achados Concluídos e Validados por Reteste** | 0 | 1 (`VAL-004` via `REM-003`) | +1 |
| **Regressões Operacionais Detetadas** | 0 | 0 | 0 |
| **Gate de Publicação** | RESTRITO | **PRONTO PARA PUBLICAÇÃO** | LIBERADO |

*Nota de Imutabilidade:* O score baseline de **92.4%** permanece inalterado na base de dados histórica (`AUDIT-2026-09-10-BASELINE`), servindo de termo de comparação perene.

---

## 3. CICLO DE VIDA E DECISÕES DOS ACHADOS (VAL-001 A VAL-008)

| ID Achado | Fluxo Operacional | Nó | Severidade | Decisão Formal (V7) | Instrumento Associado | Estado V7 |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **VAL-001** | `triagem-inicial` | `t3` | Média | `CORRIGIR_FLOW` | `REM-001` (Proposta de ramo documental) | Em Análise |
| **VAL-002** | `triagem-inicial` | `t6` | Baixa | `CORRIGIR_GPS` | `REM-002` (Aviso 112 destacado) | Em Análise |
| **VAL-003** | `obras-piquete-emergencia`| `em-term1` | Média | `ACEITE_WAIVER` | `WAI-002` (Despacho DTO-2026/102) | **Aceite (Waiver)** |
| **VAL-004** | `rendas-acordos-regularizacao`| `rend-dec2` | **Alta** | `CORRIGIR_FLOW` | `REM-003` (Limiar retificado para 600€) | **RESOLVIDO** |
| **VAL-005** | `gestao-social-conflitos`| `soc-dec1` | Média | `CORRIGIR_FLOW` | `REM-004` (Ramo CPCJ / Emergência) | Aprovada |
| **VAL-006** | `denuncias-ocupacoes` | `den-dec2` | Média | `CORRIGIR_FLOW` | `REM-005` (Sequência de contencioso) | Em Implementação |
| **VAL-007** | `habitacao-atribuicao` | `hab-term1` | Baixa | `DIFERENCA_INTENCIONAL` | `WAI-001` (Despacho DAC-2026/044) | **Aceite (Waiver)** |
| **VAL-008** | `condominios-administracao`| `cond-t5` | Informativo | `INCONCLUSIVO` | Requerimento à DGC | Em Revisão |

---

## 4. CASO DE ESTUDO DE REMEDIAÇÃO COMPLETA: REM-003 (VAL-004)

### 4.1. Cadeia de Rastreabilidade Operacional
```
[VAL-004] 
   └── [REM-003] 
          └── [rendas-acordos-regularizacao] 
                 └── [rend-dec2] 
                        └── [Alteração flows.json] 
                               └── [RETESTE DETERMINÍSTICO] 
                                      └── [AUDIT-2026-09-10-POST-REM-003] (RESOLVIDO)
```

### 4.2. Caracterização da Discrepância
* **Problema:** O nó de decisão `rend-dec2` utilizava no flows.json o texto: *"O valor da dívida é inferior ao limite de 3 meses de renda ou < 500€?"*, enquanto a prancha original Microsoft Visio #28 fixa explicitamente o teto de aprovação direta em **600€**.
* **Causa Raiz:** O regulamento de rendas foi atualizado pela CML para o limiar de 600€, mas a extração JSON inicial manteve o parâmetro anterior de 500€.
* **Impacto Operacional:** Munícipes com valores de dívida entre 501€ e 600€ eram indevidamente encaminhados para parecer prévio da Direção em vez do plano prestacional direto.

### 4.3. Aprovação Superior e Despacho
* **Responsável:** Dr. Carlos Mendonça (Diretor de Gestão Financeira)
* **Carimbo Temporal:** 2026-09-10 05:00
* **Despacho:** *"Autorizada a retificação formal do limiar financeiro para 600€ em estrita consonância com a deliberação camarária em vigor e a prancha Visio #28."*

### 4.4. Registo de Alteração (Diff JSON)
```diff
--- a/src/data/flows.json (Nó rend-dec2)
+++ b/src/data/flows.json (Nó rend-dec2)
@@ -412,2 +412,2 @@
- "t": "O valor da dívida é inferior ao limite de 3 meses de renda ou < 500€?"
+ "t": "O valor da dívida é inferior ao limite de 3 meses de renda ou < 600€?"
```

### 4.5. Reteste Determinístico
* **Validadora Externa de Qualidade:** Dra. Teresa Sequeira
* **Carimbo Temporal:** 2026-09-10 05:15
* **Resultado:** CONFORME (0 regressões detetadas nos nós `rend-t3`, `rend-t4` e fluxos a montante).
* **Snapshot de Fecho:** `AUDIT-2026-09-10-POST-REM-003`

---

## 5. CATÁLOGO DE WAIVERS E EXCEÇÕES OPERACIONAIS

### 5.1. Waiver WAI-001
* **Achado Vinculado:** `VAL-007` (Habitação — Atribuição e Realojamento)
* **Motivação:** Diferença intencional comunicacional. A designação expandida *"Plataforma Habitar Lisboa"* no flows.json melhora a clareza verbal do operador telefónico face à sigla comprimida da prancha Visio.
* **Responsável:** Dra. Maria João Ramos (Diretora de Atendimento ao Cidadão)
* **Data:** 2026-09-10 | **Validade:** Sem prazo (Permanente enquanto vigorar o protocolo municipal).
* **Evidência:** Despacho DAC-2026/044.

### 5.2. Waiver WAI-002
* **Achado Vinculado:** `VAL-003` (Piquete de Obras e Intervenção Urgente)
* **Motivação:** Omissão de menção textual explícita ao SMS de confirmação no nó terminal `em-term1`. O disparo de SMS é garantido automaticamente a nível de infraestrutura pelo CRM SIGA na abertura da O.S.
* **Responsável:** Eng. Rui Caldeira (Direção de Sistemas e Obras)
* **Data:** 2026-09-10 | **Validade:** Revisão obrigatória até 31/12/2026.
* **Evidência:** Ordem de Serviço DTO-2026/102.

---

## 6. CADERNO DE TESTES AUTOMÁTICOS DE GOVERNAÇÃO (TESTES 25 A 40)

| ID | Designação do Teste | Verificação Operacional | Resultado |
| :---: | :--- | :--- | :---: |
| **TESTE 25** | Unicidade de Identificadores | VAL-001 a VAL-008 sem duplicações | **APROVADO** |
| **TESTE 26** | Rastreabilidade Tripla | 100% dos achados possuem evidência Visio, JSON e GPS | **APROVADO** |
| **TESTE 27** | Proibição de Transição Inválida | Máquina de estados bloqueia Aberto → Resolvido sem reteste | **APROVADO** |
| **TESTE 28** | Justificação em Waivers | WAI-001 e WAI-002 contêm despacho, justificação e validade | **APROVADO** |
| **TESTE 29** | Vinculação Remediação → Achado | Todos os planos REM-xxx vinculados a achados reais | **APROVADO** |
| **TESTE 30** | Registo de Snapshot Prévio | ChangeRecords possuem referência `preSnapshot` | **APROVADO** |
| **TESTE 31** | Aprovação Humana Documentada | Nenhuma remediação implementada sem despacho assinado | **APROVADO** |
| **TESTE 32** | Imutabilidade do Change Audit | Histórico append-only preservado | **APROVADO** |
| **TESTE 33** | Reteste Obrigatório de Fecho | Planos resolvidos acompanhados de reteste determinístico | **APROVADO** |
| **TESTE 34** | Conservação de Achados Originais | VAL-001 a VAL-008 preservados no acervo histórico | **APROVADO** |
| **TESTE 35** | Inviolabilidade das Pranchas Visio | 145 páginas gráficas Visio seladas e inalteradas | **APROVADO** |
| **TESTE 36** | Cobertura de Revalidação Global | 14 flows core avaliados integralmente | **APROVADO** |
| **TESTE 37** | Deteção Ativa de Regressões | Algoritmo de grafo valida nós a montante e jusante | **APROVADO** |
| **TESTE 38** | Isolamento do Benchmark 137 | Contagem 137 mantida estritamente na Camada C | **APROVADO** |
| **TESTE 39** | Preservação das 145 Páginas | Catálogo de metadados íntegro | **APROVADO** |
| **TESTE 40** | Integridade dos Grafos Estruturados | 119 nós e 111 arestas sem orfãos ou elos quebrados | **APROVADO** |

---

## 7. PARECER FINAL DE HOMOLOGAÇÃO

A implementação da Camada 5 (V7) confere ao sistema GEBALIS VISION maturidade de auditoria e conformidade de nível empresarial (*enterprise-grade governance*).

* **Condições de Gate de Publicação:** **CUMPRIDAS**
* **Reversibilidade:** Garantida sem perda de histórico.
* **Integridade das Camadas 1 a 4:** 100% preservada.

*Homologado eletronicamente em 10 de Setembro de 2026 pela Comissão Conjunta de Auditoria Forense, Qualidade e Sistemas de Informação da GEBALIS, E.M.*
