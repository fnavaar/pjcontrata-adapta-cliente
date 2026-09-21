# Changelog — IA Ferramenta

## 2026-09-09

- Certificação dos 4 níveis de conta via API (22 testes): encontrados 2 bugs reais — aprovador não decidia campanha alheia e `REJECTED` não era estado válido. Correção v0.0.65/v0.0.66; recertificação 15/15. Regressão humana aprovada por Navaar em 11/09/2026.

## 2026-09-04

- F1-T09 concluída: prévia determinística, prova de não integração e teste humano aprovado. **Fase 1 100% (9/9).**

## 2026-09-11 — Fase 2 liberada

- Fase 2 publicada com 3 SPECs e F2-T01..F2-T09.
- F2-T01 é a única task elegível; F2-T02..F2-T09 mantêm dependências e gates de acesso.
- Fase 1 arquivada em `05_entregas/fase-1/`; unidade legada removida da raiz ativa.
- Nenhuma implementação, credencial, conta produtiva, ativação ou gasto autorizado.

## 2026-09-14 — F2-T01 concluída

- F2-T01 concluída: núcleo transversal de publicação com adaptador fake (builds v0.0.100–v0.0.103).
- Migration 0012: ad_connection, publication_attempt, remote_object, publication_event (append-only, sem delete).
- Hook publicacao_nucleo.js: 4 rotas server-side (criar tentativa idempotente, detalhe, reconciliar, revogar/reativar conexão).
- Máquina de 9 estados implementada; ACTIVE proibido (RN-203); segredos nunca persistidos (secret_ref; RN-226 sanitiza tokens em erros).
- Verificação automatizada: 23/23; regressão F1 3/3.
- Teste humano aprovado pelo owner (14/09/2026).

## 2026-09-14 — F2-T02 concluída

- F2-T02 concluída: idempotência, log append-only sanitizado e recibos (builds v0.0.104–v0.0.105).
- CA-2-012: resposta idempotente distingue terminais de intermediários; concorrência sem 500 (5 requests simultâneos → 1 tentativa).
- CA-2-013: PEDIDO_CRIADO persiste payload_hash; eventos terminais persistem resposta estruturada; trilha sem segredos.
- CA-2-017: recibo versionado instituído (recibo-F2-T02.md).
- Verificação: 15/15; teste humano aprovado pelo owner (14/09/2026).

## 2026-09-16 — F2-T03 concluída

- F2-T03 concluída: prova de autorização e conta Meta de teste (CA-2-001).
- Sandbox act_1585807056675719; token de sistema com escopo mínimo nos secrets; allowlist (ad_connection ogzfs36ibb8tzbl, environment teste).
- Token do Graph API Explorer não acessava a sandbox (403); resolvido com token gerado pela chave da própria sandbox.
- Teste humano aprovado pelo owner (16/09/2026).

## 2026-09-16 — F2-T04 concluída

- F2-T04 concluída: publicação Meta pausada, confirmada e idempotente (build v0.0.110).
- Adaptador Meta real: campaign+adset reais na sandbox sempre PAUSED; confirmação por consulta; idempotência real.
- Parâmetros obrigatórios: special_ad_categories=[], is_adset_budget_sharing_enabled=false, daily_budget mínimo 1000 centavos.
- Verificação: 12/12 + revalidação final 9/9 com prova fresca na Meta.
- Teste humano aprovado pelo owner (16/09/2026).

## 2026-09-16 — F2-T05 implementada

- F2-T05: falha parcial, timeout e reconciliação Meta (builds v0.0.111–v0.0.117).
- Migration 0013: campo remote_id_real em remote_object (interno, nunca exposto — RN-226).
- Credencial expirada (code 190) → BLOCKED com erro "renovar fora do log" — zero falso sucesso (CA-2-005).
- Falha parcial preserva a campaign criada (RN-205) com ID real para recuperação.
- Reconciliação REAL: UNCERTAIN consulta objetos na Meta pelo ID real; PARTIAL_FAILURE completa o adset faltante REAL (idempotente) → RECOVERED.
- RN-226 reforçado: eventos e resposta estruturada sem remote_id_real (vazamento corrigido v0.0.116/117).
- Verificação: 9/9 com falha parcial provocada por orçamento rejeitado pela Meta (rejeição real) e adset recriado verificado na API da Meta.

## 2026-09-17 — F2-T05 concluída

- Teste humano aprovado pelo owner (17/09/2026, 08:31): "sim" após demonstração ao vivo.
- Demonstração: campanha DEMO-F2T05 publicada com orçamento acima do limite da sandbox → rejeição REAL da Meta → PARTIAL_FAILURE com erro visível e campaign preservada (RN-205); orçamento corrigido → reconciliação → RECOVERED com adset REAL criado na Meta (PAUSED, R$ 10/dia, verificado na API da Meta, 1 único — idempotente).
- Recibo 05_entregas/fase-2/recibo-F2-T05.md com aceite registrado.
- Aprendizado AP-2026-09-17-0835: par (ID mascarado p/ exibição, ID real p/ operação server-side); RN-226 em TODAS as superfícies de saída incl. eventos; RECOVERY_PENDING não volta a PARTIAL_FAILURE.
- Fase 2: 5/9 (56%).

## 2026-09-17/18 — F2-T06 concluída

- F2-T06: prova de acesso Google (CA-2-006) — build v0.0.118.
- Hook google_prova.js: rota server-side READ-ONLY /backend/v1/google/prova-acesso — sem credenciais → BLOCKED_ACCESS com lista do que falta (nenhuma chamada externa); com credenciais → renova access token, chama customers:listAccessibleCustomers (v25), cruza com allowlist e classifica; credencial expirada → BLOCKED_ACCESS "renovar fora do log"; IDs mascarados; RN-226; nenhuma mutação.
- Credenciais OAuth provisionadas pelo owner (projeto Cloud agenda-hub): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN nos secrets do Skip. Developer token opcional (sunset 09/09/2026 — nível de acesso vem do projeto Cloud).
- Prova real: PROVA_OK na 1ª tentativa — 4 customers acessíveis classificados fora_da_allowlist (429-956, 171-276, 852-277, 785-059 — mascarados), zero mutação, zero segredo na resposta. Conta real 171-276 fora da allowlist: prova prática de que só publica onde autorizar.
- Verificação: 6/6 (401, 403, BLOCKED_ACCESS sem credenciais, lista do que falta, sem valor de credencial, prova real).
- Pendência transferida para F2-T07: conta de teste Google Ads — a UI do Google prende o fluxo de criação num assistente de campanha que exige forma de pagamento (mesmo com ?test=1, outra conta Google e URL sf=mt/404); 3 rascunhos de conta inertes sem cobrança (852-277-7243, 785-059-****, 549-***-****); não confirmar cartão. Caminhos a tentar: suporte Google Ads, app mobile, MCC real.
- Recibo 05_entregas/fase-2/recibo-F2-T06.md.
- Fase 2: 6/9 (67%).
