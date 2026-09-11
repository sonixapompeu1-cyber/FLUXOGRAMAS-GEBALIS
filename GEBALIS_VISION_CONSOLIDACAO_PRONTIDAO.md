# GEBALIS VISION — CONSOLIDAÇÃO, CERTIFICAÇÃO E PRONTIDÃO OPERACIONAL (V8)

**Documento Oficial de Homologação e Entrada em Produção**  
**Entidade Gestora:** GEBALIS — Gestão do Arrendamento da Habitação Municipal de Lisboa, E.M.  
**Data de Emissão:** 10 de Setembro de 2026  
**Versão:** V8.0.0-PROD-CANDIDATE  
**Release Candidate:** `RELEASE-2026.09.10-RC01`  
**Snapshot Base:** `AUDIT-2026-09-10-POST-REM-003`  
**Estatuto de Prontidão:** **APTO COM RESERVAS** (Salvaguarda de Waivers WAI-001 e WAI-002)

---

## 1. INTRODUÇÃO E RESUMO EXECUTIVO

O presente documento consubstancia o encerramento da **Camada 6 — Consolidação, Prontidão Operacional e Simulação Determinística (V8)** do sistema GEBALIS VISION.

A aplicação responde cabalmente à pergunta norteadora da V8:
> **“O GEBALIS VISION está preparado para utilização operacional pelos operadores do Contact Center?”**

A resposta oficial é **APTO COM RESERVAS**:
- **Cobertura Operacional:** **100%** (14 flows, 32 decisões, 57 opções e 29 terminais mapeados e navegáveis);
- **Conformidade Funcional:** **94.8%** (+2.4% acima do baseline V6 de 92.4% após remediação aprovada REM-003);
- **Reserva Operacional:** Existência do waiver temporário **WAI-002** (revisão obrigatória até 31/12/2026 para envio de SMS automático pelo SIGA) e **WAI-001** (divergência institucional na plataforma Habitar Lisboa).

---

## 2. PRINCÍPIO DE RIGOR: COBERTURA vs. CONFORMIDADE vs. PRONTIDÃO

O sistema rejeita categoricamente a confusão entre cobertura e conformidade:

| Conceito | Medição | Significado Operacional |
| :--- | :---: | :--- |
| **Cobertura** | **100.0%** | Todos os nós (119), arestas (111), decisões (32) e terminais (29) existem no grafo e são alcançáveis. |
| **Conformidade** | **94.8%** | Correspondência exata entre o procedimento executado e as deliberações oficiais aprovadas. |
| **Prontidão** | **APTO C/ RESERVAS** | O sistema pode entrar em exploração no Contact Center sob as salvaguardas dos waivers ativos. |

---

## 3. CADERNO DE TESTES AUTOMÁTICOS V8 (TESTES 41 A 60)

Com a incorporação dos 20 testes da V8, a plataforma totaliza **60 testes automáticos sequenciais** sem dados fictícios ou simulações artificiais:
- **V5 (Testes 1 a 12):** Reconciliação Documental e Integridade Estrutural
- **V6 (Testes 13 a 24):** Validação Operacional e Divergências
- **V7 (Testes 25 a 40):** Governação, Máquina de Estados e Remediação
- **V8 (Testes 41 a 60):** Prontidão Operacional, Simulação e Rastreabilidade

### Tabela de Verificação dos Testes 41 a 60:
1. **TESTE 41 — 145 Páginas Microsoft Visio Acessíveis:** PASSOU (145 pranchas catalogadas com imagens primárias e secundárias).
2. **TESTE 42 — 14 Flows Estruturados Core Acessíveis:** PASSOU (14 JSONs operacionais no `flows.json`).
3. **TESTE 43 — Isolamento Perene do Benchmark 137:** PASSOU (Isolamento estrito na Camada C).
4. **TESTE 44 — 119 Nós Íntegros no Grafo:** PASSOU (119 nós com tipologia válida: start, process, decision, terminal).
5. **TESTE 45 — 111 Arestas com Origem e Destino Válidos:** PASSOU (111 arestas sem conexões quebradas).
6. **TESTE 46 — 32 Nós de Decisão Determinísticos:** PASSOU (32 decisões avaliadas com opções de saída).
7. **TESTE 47 — 57 Ramificações/Opções Mapeadas:** PASSOU (57 ramificações conformes com a topologia).
8. **TESTE 48 — 29 Nós Terminais Válidos e Alcançáveis:** PASSOU (29 terminais sem caminhos impossíveis).
9. **TESTE 49 — Deteção de Dead-Ends no Grafo:** PASSOU (0 dead-ends inválidos detetados).
10. **TESTE 50 — Ausência de Referências Quebradas ou Cross-Flows Inválidos:** PASSOU (0 links inexistentes).
11. **TESTE 51 — Bloqueio de Saltos Inválidos na Máquina de Estados:** PASSOU (Transições diretas não autorizadas são bloqueadas).
12. **TESTE 52 — Simulador Utiliza o Motor GPS Real:** PASSOU (Unidade de regras e determinismo com `GPSEngine`).
13. **TESTE 53 — Simulação Não Altera Dados Oficiais:** PASSOU (Logs isolados em `localStorage`, `flows.json` imutável).
14. **TESTE 54 — Snapshots Históricos Preservados:** PASSOU (Auditorias baseline e pós-remediação intactas).
15. **TESTE 55 — Imutabilidade dos Registos ChangeRecord:** PASSOU (Trilha append-only com antes vs depois e despacho).
16. **TESTE 56 — Waivers Formais Não Transformam Falha em Conformidade Fictícia:** PASSOU (Discriminação clara da exceção).
17. **TESTE 57 — Release Gate Bloqueia Ativamente Falhas Críticas:** PASSOU (Bloqueio automático se houver achados críticos sem waiver).
18. **TESTE 58 — Deteção Ativa e Transparente de Regressões:** PASSOU (0 regressões após reteste de REM-003).
19. **TESTE 59 — Pesquisa Global Transversal Discrimina Origem dos Dados:** PASSOU (Indexação multi-camada com badges de proveniência).
20. **TESTE 60 — Validação e Integridade dos Dados de Exportação:** PASSOU (Dossiês JSON completos com assinaturas e versões).

---

## 4. MATRIZ DE PRONTIDÃO ORGANIZACIONAL (9 ÁREAS)

| # | Área de Análise | Estado | Evidência Formal | Responsável |
| :- | :--- | :---: | :--- | :--- |
| 1 | **Dados e Acervo** | `APTO PARA PRODUÇÃO` | 145 páginas Visio seladas, 14 flows core, benchmark 137 isolado. | Dr. Alberto Fontes |
| 2 | **Motor GPS** | `APTO PARA PRODUÇÃO` | 32 decisões, 57 ramificações e 29 terminais determinísticos. | Eng. Rui Caldeira |
| 3 | **Auditoria** | `APTO PARA PRODUÇÃO` | Baseline V6 a 92.4%, 8 achados catalogados e snapshots selados. | Dra. Helena Matos |
| 4 | **Remediação** | `APTO PARA PRODUÇÃO` | REM-003 concluída, testada sem regressões (score 94.8%). | Dr. Carlos Mendonça |
| 5 | **Governação** | `APTO COM RESERVAS` | WAI-001 homologado; WAI-002 sujeito a revisão até 31/12/2026. | Dra. Maria João Ramos |
| 6 | **UX & Navegação** | `APTO PARA PRODUÇÃO` | Pesquisa multi-origem, Call Trail 2.0 e navegação adaptada. | Eng. Frontend |
| 7 | **Performance** | `APTO PARA PRODUÇÃO` | Resposta em memória < 100ms e lazy-loading de pranchas Visio. | Infraestrutura |
| 8 | **Segurança / RGPD**| `APTO PARA PRODUÇÃO` | Gate of Identity com NIF/Nascimento e isolamento de simulação. | Gabinete DPO |
| 9 | **Gestão de Release**| `APTO PARA PRODUÇÃO` | Candidata RC01 validada sem impedimentos críticos. | Comissão de Auditoria |

---

## 5. SIMULADOR OPERACIONAL E CALL TRAIL 2.0

O Simulador Operacional (`/simulador`) permite o ensaio prévio das equipas do Contact Center sob as seguintes garantias:
1. **Mesmo Motor Formal:** Utiliza a mesma biblioteca e lógica de transição que o GPS oficial (`GPSEngine`).
2. **Call Trail 2.0 com Comparação Diff:** O operador ou auditor pode retroceder a qualquer passo, alterar a resposta e visualizar em tempo real:
   - **PERCURSO ANTERIOR vs PERCURSO ATUAL** com destaque visual da divergência exata.
3. **Catálogo de Cenários:** Casos reais (`SIM-001` a `SIM-005`) e casos de stress identificados expressamente com o selo `CENÁRIO SINTÉTICO DE TESTE` (`SIM-006`).
4. **Isolamento Total:** As execuções geram logs de simulação sem alterar nem sobrescrever as definições de fluxo ou os achados de auditoria.

---

## 6. DISPOSIÇÕES FINAIS E HOMOLOGAÇÃO

A presente certificação atesta a prontidão formal e técnica do GEBALIS VISION para utilização em ambiente de produção do Contact Center.  
Fica determinado que a Direção de Atendimento ao Cidadão (DAC) procederá à revisão mandatória do waiver **WAI-002** até ao encerramento do 4º trimestre de 2026.

*Aprovado pela Comissão Conjunta de Auditoria Forense e Sistemas da GEBALIS, E.M.*
