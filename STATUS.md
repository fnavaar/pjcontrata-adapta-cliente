# STATUS — Engaja PJ

**Atualizado em:** 2026-09-16
**Fase atual:** Fase 2 — Publicação controlada e recuperação
**Estado:** F2-T01, F2-T02 e F2-T03 concluídas (3/9 — 33%); F2-T04 é a próxima elegível, aguardando pedido do champion.

## Fase 1

- F1-T01..F1-T09 concluídas.
- Regressão funcional v0.0.66 aprovada humanamente por Navaar em 11/09/2026.
- Fase encerrada; histórico preservado no Git.

## Fase 2

- SPEC-2-001 Meta Ads.
- SPEC-2-002 Google Ads.
- SPEC-2-003 orquestração, auditoria e recuperação.
- F2-T01 concluída (14/09/2026): núcleo transversal de publicação — 4 coleções (ad_connection, publication_attempt, remote_object, publication_event), máquina de 9 estados (ACTIVE proibido), validação server-side CA-2-011, idempotência CA-2-012, auditoria append-only CA-2-013, reconciliação CA-2-014, revogação CA-2-016. Build v0.0.103; 23/23 testes automatizados + regressão F1; teste humano aprovado pelo owner (14/09).
- F2-T02 concluída (14/09/2026): idempotência completa (retry distingue terminal de em_progresso; concorrência sem 500), trilha append-only reconstrutível (payload_hash + resposta estruturada nos eventos), recibo versionado instituído (05_entregas/fase-2/recibo-F2-T02.md). Build v0.0.105; 15/15 testes + revalidação final; teste humano aprovado pelo owner (14/09).
- F2-T03 concluída (16/09/2026): prova de acesso Meta (CA-2-001) — sandbox act_1585807056675719 ativa (BRL, São Paulo), token de sistema com escopo mínimo ads_management+ads_read gravado nos secrets do Skip, conta na allowlist (environment teste). Recibo em 05_entregas/fase-2/recibo-F2-T03.md; aceite humano do owner.
- F2-T04..F2-T09 pendentes; F2-T04 é a próxima elegível.

## Limites

Nenhuma task autoriza credencial, conta produtiva, ativação ou gasto. Meta e Google começam por prova de acesso em conta de teste/autorizada. Executar uma task por vez, com prova e teste humano.
