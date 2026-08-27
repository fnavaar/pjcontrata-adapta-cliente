# STATUS — IA Ferramenta

**Atualizado em:** 2026-08-27  
**Fase atual:** Fase 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** tasks geradas; F1-T01 é a única task elegível.

## Ambiente

- Construção: GoSkip.
- Persistência, autenticação e RBAC: SkipCloud.
- Repositório: será criado somente após a geração da pasta do cliente; não bloqueia F1-T01.
- Comandos automatizados: ainda não definidos; cada task exige evidência verificável no preview/SkipCloud e teste humano.

## Escopo e SPECs

- `02-Escopo-Definitivo.md` v1.1: aquisição própria da IA Ferramenta.
- SPEC-1-001, SPEC-1-002 e SPEC-1-003 aprovadas pelo consultor.

## Tasks

- F1-T01: criar projeto GoSkip e configurar SkipCloud Auth/RBAC interno — **ELEGÍVEL**.
- F1-T02 a F1-T09: bloqueadas pelas dependências indicadas em `00-Tasks_Gerais.md`.

## Gate

Nenhuma task foi iniciada. A próxima ação segura é autorização explícita para executar somente F1-T01. Após prova e teste humano, aguardar nova autorização antes de F1-T02.
