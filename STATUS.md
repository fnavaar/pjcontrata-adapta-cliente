# STATUS — IA Ferramenta

**Atualizado em:** 2026-08-27  
**Fase atual:** Fase 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** F1-T01 bloqueada por falta de integração com Skip Cloud.

## Ambiente

- Construção: GoSkip.
- Persistência, autenticação e RBAC: SkipCloud.
- Projeto Skip criado: IA Ferramenta, `projectId 53880`, preview v0.0.2.
- Integração Skip Cloud: não configurada; coleções e migrações não estão disponíveis.
- Comandos automatizados: ainda não definidos; cada task exige evidência verificável no preview/SkipCloud e teste humano.

## Escopo e SPECs

- `02-Escopo-Definitivo.md` v1.1: aquisição própria da IA Ferramenta.
- SPEC-1-001, SPEC-1-002 e SPEC-1-003 aprovadas pelo consultor.

## Tasks

- F1-T01: criar projeto GoSkip e configurar SkipCloud Auth/RBAC interno — **BLOQUEADA** por integração Skip Cloud ausente.
- F1-T02 a F1-T09: bloqueadas pelas dependências indicadas em `00-Tasks_Gerais.md`.

## Gate

A execução da F1-T01 foi autorizada, mas não pode prosseguir até integrar o projeto IA Ferramenta ao Skip Cloud. Após a integração, retomar a configuração de Auth/RBAC e então solicitar teste humano.
