# STATUS — IA Ferramenta

**Atualizado em:** 2026-09-03  
**Fase atual:** Fase 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** F1-T06 CONCLUÍDA (6/9 tasks — 67%).

## Ambiente

- Construção: GoSkip.
- Persistência, autenticação e RBAC: SkipCloud (integrados).
- Projeto Skip: IA Ferramenta, `projectId 53888`, preview https://ia-ferramenta-562d3--preview.goskip.app (v0.0.34).
- Migrations aplicadas: `0001_setup_rbac` a `0008_campaign_template`.
- Hooks de servidor: `enforce_role.js`, `enforce_role_update.js`, `http_permission_test.js`, `validate_campaign.js`, `campaign_guards.js`, `pauta_ativos_config_guards.js`, `aplicar_modelo.js`.
- Frontend: login + dashboard por papel + campanhas (criar/listar/filtrar/detalhe/histórico/transições/arquivar/restaurar + pauta/ativos/configuração/pendências + modelos/snapshot).

## Escopo e SPECs

- `02-Escopo-Definitivo.md` v1.1: aquisição própria da IA Ferramenta.
- SPEC-1-001, SPEC-1-002 e SPEC-1-003 aprovadas pelo consultor.

## Tasks

- F1-T01: Auth/RBAC — **CONCLUÍDA (31/08/2026)**.
- F1-T02: modelar/persistir campanhas — **CONCLUÍDA (31/08/2026)**.
- F1-T03: lista, filtros e detalhe — **CONCLUÍDA (01/09/2026)**.
- F1-T04: estados, auditoria, conflito, arquivamento — **CONCLUÍDA (01/09/2026)**.
- F1-T05: pauta, ativos e configuração declarada — **CONCLUÍDA (01/09/2026)**.
- F1-T06: modelos versionados + snapshot — **CONCLUÍDA (03/09/2026)**.
- F1-T07 a F1-T09: bloqueadas por dependência; aguardam seleção e autorização.

## Gate

F1-T01 a F1-T06 concluídas com teste humano aprovado (screenshots admin) + verificação automatizada. Próximas tasks somente mediante novo pedido, com relatório de análise antes de qualquer implementação.
