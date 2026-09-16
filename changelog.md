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
- Verificação automatizada: 23/23 (CA-2-011 RBAC, CA-2-012 idempotência, CA-2-013 auditoria sem segredo, CA-2-014 parcial/timeout→reconciliação, CA-2-016 revogação/reativação, RN-226 sanitização; regressão F1 3/3).
- Bugs corrigidos durante verificação: zero-date do PocketBase em revoked_at era truthy; resposta do adaptador sem estados dos objetos.
- Teste humano aprovado pelo owner (14/09/2026): publicação da campanha T-F2-PUB2 confirmada em CONFIRMED_PAUSED com 4 objetos PAUSED e trilha de auditoria visível.

## 2026-09-14 — F2-T02 concluída

- F2-T02 concluída: idempotência, log append-only sanitizado e recibos (builds v0.0.104–v0.0.105).
- CA-2-012: resposta idempotente distingue estados terminais (em_progresso=false) de intermediários (em_progresso=true); concorrência coberta por catch de unique constraint devolvendo a tentativa vencedora — provado com 5 requests simultâneos → 1 única tentativa, nenhum 500.
- CA-2-013: PEDIDO_CRIADO persiste payload_hash; eventos terminais persistem resposta estruturada (estado + objetos + erro sanitizado); trilha sem segredos (RN-226).
- CA-2-017: recibo versionado instituído em 05_entregas/fase-2/recibo-F2-T02.md (padrão para a fase).
- Verificação: 15/15 automatizados + revalidação final no fechamento; regressão F2-T01 e F1 passando.
- Teste humano aprovado pelo owner (14/09/2026): 3 publicações da T-F2-PUB2 → 1 única tentativa, mesmo payload_hash, nada duplicado.

## 2026-09-16 — F2-T03 concluída

- F2-T03 concluída: prova de autorização e conta Meta de teste (CA-2-001).
- Sandbox Meta criada pelo owner: act_1585807056675719 ("New Sandbox Ad Account", BRL, America/Sao_Paulo) no app "API oficial CRM" (1004482402468681).
- Prova read-only executada: identidade do token (Sandbox Ad Account Owner — token de sistema da sandbox), conta ativa, listagem de campanhas vazia; escopo mínimo ads_management+ads_read; nenhum segredo exposto.
- Token gravado nos secrets do Skip Cloud (META_ACCESS_TOKEN, META_SANDBOX_ACCOUNT_ID); conta cadastrada na allowlist (ad_connection ogzfs36ibb8tzbl, environment teste).
- Iteração relevante: token do Graph API Explorer não acessava a sandbox (403); resolvido com token gerado pela chave da própria sandbox (nasce vinculado ao ativo).
- Teste humano aprovado pelo owner (16/09/2026): "sim" após demonstração da prova.

## 2026-09-16 — F2-T04 concluída

- F2-T04 concluída: publicação Meta pausada, confirmada e idempotente (build v0.0.110).
- Adaptador Meta real no publicacao_nucleo.js: sem modo_fake, cria campaign+adset reais na sandbox (Marketing API v21.0) sempre PAUSED; token lido dos secrets do Skip.
- Confirmação por consulta (GET status) antes de marcar CONFIRMED_PAUSED — 2xx isolado não é sucesso.
- Idempotência real: retry da mesma chave devolve a tentativa existente sem recriar nada na Meta (provado: 1 campanha T-F2T04-REAL na sandbox após retry).
- Parâmetros obrigatórios descobertos no baseline: special_ad_categories=[], is_adset_budget_sharing_enabled=false, daily_budget mínimo 1000 centavos (sandbox).
- Cadeia aplicável na sandbox = campaign+adset (creative/ad exigem Página — limitação Meta; falha parcial é território da F2-T05).
- Verificação: 12/12 automatizados + revalidação final 9/9 com prova fresca na Meta.
- Teste humano aprovado pelo owner (16/09/2026): publicação real da T-F2-PUB2 (campaign 120330***615 + adset 120330***215, PAUSED), retry sem duplicar, campanha confirmada na API da Meta.
