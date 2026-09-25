# STATUS — Engaja PJ

**Atualizado em:** 2026-09-25
**Fase atual:** Fase 2 — Publicação controlada e recuperação
**Estado:** F2-T01..F2-T07 concluídas (7/9 — 78%); F2-T07 com PUBLICAÇÃO REAL na Google Ads provada (25/09) — aguardando aceite humano da publicação real; F2-T08 é a próxima elegível.

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
- F2-T06 concluída (18/09/2026): prova de acesso Google (CA-2-006) — rota read-only com BLOCKED_ACCESS sem credenciais e PROVA_OK com credenciais reais. Build v0.0.118; 6/6 testes.
- F2-T07 concluída (22/09/2026): adaptador Google real + gates server-side. Build v0.0.119; 8/9 testes; aceite do owner (22/09).
- F2-T07 — PUBLICAÇÃO REAL PROVADA (25/09/2026, builds v0.0.120–125): contas de teste criadas pelo owner (MCC EngajaPJ Teste 103-812-9898 + cliente EngajaPJ Cliente Teste 2391563500), secrets gravados, allowlist criada. Campanha T-F2T07-REAL-FINAL criada NA GOOGLE ADS pela rota do sistema — budget + campaign SEARCH em PAUSED, confirmada por consulta GAQL (CA-2-008). Idempotência real: retry → "nada duplicado", 1 única campanha na conta, provado via GAQL (CA-2-009). Fix v25: containsEuPoliticalAdvertising obrigatório; mutate combinado atômico budget+campaign; consultas via GAQL searchStream.
- F2-T08..F2-T09 pendentes.

## Limites

Nenhuma task autoriza credencial, conta produtiva, ativação ou gasto. Meta e Google começam por prova de acesso em conta de teste/autorizada. Executar uma task por vez, com prova e teste humano.
