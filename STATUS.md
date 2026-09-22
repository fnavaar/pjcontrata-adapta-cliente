# STATUS — Engaja PJ

**Atualizado em:** 2026-09-22
**Fase atual:** Fase 2 — Publicação controlada e recuperação
**Estado:** F2-T01..F2-T07 concluídas (7/9 — 78%); F2-T08 é a próxima elegível — pendência: conta de teste Google Ads (suporte Google Ads, app mobile ou MCC real).

## Fase 1

- F1-T01..F1-T09 concluídas.
- Regressão funcional v0.0.66 aprovada humanamente por Navaar em 11/09/2026.
- Fase encerrada; histórico preservado no Git.

## Fase 2

- SPEC-2-001 Meta Ads.
- SPEC-2-002 Google Ads.
- SPEC-2-003 orquestração, auditoria e recuperação.
- F2-T01 concluída (14/09/2026): núcleo transversal de publicação — 4 coleções, máquina de 9 estados, validação server-side, idempotência, auditoria append-only, revogação. Build v0.0.103; 23/23 testes; aceite do owner (14/09).
- F2-T02 concluída (14/09/2026): idempotência completa, trilha append-only reconstrutível, recibo versionado. Build v0.0.105; 15/15 testes; aceite do owner (14/09).
- F2-T03 concluída (16/09/2026): prova de acesso Meta (CA-2-001) — sandbox, token nos secrets, allowlist. Recibo; aceite do owner.
- F2-T04 concluída (16/09/2026): adaptador Meta real — publicação na sandbox sempre PAUSED, confirmação por consulta, idempotência real. Build v0.0.110; 12/12 testes; aceite do owner (16/09).
- F2-T05 concluída (17/09/2026): falha parcial com preservação RN-205, credencial expirada → BLOCKED, reconciliação REAL via remote_id_real. Build v0.0.117; 9/9 testes; aceite do owner após demo ao vivo (17/09).
- F2-T06 concluída (18/09/2026): prova de acesso Google (CA-2-006) — rota read-only /backend/v1/google/prova-acesso com BLOCKED_ACCESS sem credenciais e PROVA_OK com credenciais reais (OAuth válido, 4 customers listados e classificados contra allowlist, IDs mascarados, zero mutação). Credenciais OAuth do projeto agenda-hub nos secrets. Pendência transferida para F2-T07: conta de teste Google Ads (UI do Google prende o fluxo de criação num assistente de campanha que exige cartão — 3 rascunhos inertes sem cobrança). Build v0.0.118; 6/6 testes.
- F2-T07 concluída (22/09/2026): adaptador Google real — budget+campaign SEARCH sempre PAUSED, confirmação por consulta, credencial expirada → BLOCKED, timeout → UNCERTAIN, PARTIAL_FAILURE preserva budget, reconciliação real; gates server-side bloqueiam ANTES da API (allowlist vazia → BLOCKED, zero falso sucesso). Build v0.0.119; 8/9 testes (1 falha externa: Meta 500 transitório, não regressão); teste humano aprovado pelo owner após demo do bloqueio limpo (22/09).
- F2-T08..F2-T09 pendentes.

## Limites

Nenhuma task autoriza credencial, conta produtiva, ativação ou gasto. Meta e Google começam por prova de acesso em conta de teste/autorizada. Executar uma task por vez, com prova e teste humano.
