# STATUS — IA Ferramenta

**Atualizado em:** 2026-09-01  
**Fase atual:** Fase 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** F1-T03 CONCLUÍDA (3/9 tasks — 33%).

## Ambiente

- Construção: GoSkip.
- Persistência, autenticação e RBAC: SkipCloud (integrados).
- Projeto Skip: IA Ferramenta, `projectId 53888`, preview https://ia-ferramenta-562d3--preview.goskip.app (v0.0.7).
- Migrations aplicadas: `0001_setup_rbac` a `0005_seed_campaigns`.
- Hooks de servidor: `enforce_role.js`, `enforce_role_update.js`, `http_permission_test.js`, `validate_campaign.js`.
- Frontend: login + dashboard por papel + campanhas (criar/listar/filtrar/detalhe).

## Escopo e SPECs

- `02-Escopo-Definitivo.md` v1.1: aquisição própria da IA Ferramenta.
- SPEC-1-001, SPEC-1-002 e SPEC-1-003 aprovadas pelo consultor.

## Tasks

- F1-T01: Auth/RBAC — **CONCLUÍDA (31/08/2026)**.
- F1-T02: modelar/persistir campanhas — **CONCLUÍDA (31/08/2026)**.
- F1-T03: lista, filtros e detalhe — **CONCLUÍDA (01/09/2026)**.
- F1-T04 a F1-T09: bloqueadas por dependência; aguardam seleção e autorização.

## Gate

F1-T01 a F1-T03 concluídas com teste humano aprovado (screenshots admin). Próximas tasks somente mediante novo pedido, com relatório de análise antes de qualquer implementação.
