# STATUS — IA Ferramenta

**Atualizado em:** 2026-08-31  
**Fase atual:** Fase 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** F1-T01 implementada — aguardando teste humano.

## Ambiente

- Construção: GoSkip.
- Persistência, autenticação e RBAC: SkipCloud (integrados).
- Projeto Skip: IA Ferramenta, `projectId 53888`, preview https://ia-ferramenta-562d3--preview.goskip.app (v0.0.3).
- Migrations aplicadas: `0001_setup_rbac`, `0002_seed_admin`.
- Hooks de servidor: `enforce_role.js`, `enforce_role_update.js`, `http_permission_test.js`.
- Frontend: login + dashboard por papel (superfícies permitidas).

## Escopo e SPECs

- `02-Escopo-Definitivo.md` v1.1: aquisição própria da IA Ferramenta.
- SPEC-1-001, SPEC-1-002 e SPEC-1-003 aprovadas pelo consultor.

## Tasks

- F1-T01: criar projeto GoSkip e configurar SkipCloud Auth/RBAC interno — **IMPLEMENTADA (aguardando teste humano)**.
- F1-T02 a F1-T09: bloqueadas pelas dependências indicadas em `00-Tasks_Gerais.md`.

## Gate

A execução da F1-T01 foi autorizada e implementada; as verificações automáticas passaram (login por papel, negação server-side, 401 sem token, 403 em escalada). **Aguardando teste humano explícito** antes de concluir ou avançar.
