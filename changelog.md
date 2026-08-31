# Changelog — IA Ferramenta

## 2026-08-31

- DEBUG F1-T01: causa raiz do bloqueio confirmada (MCP do Skip sem conexão em 27/ago; nenhuma alteração havia sido aplicada na época). MCP restabelecido e construção retomada.
- Implementado Auth/RBAC server-side no projeto Skip IA Ferramenta (projectId 53888): campo `role` na coleção users (administrador, marketing, aprovador, comercial), coleção `roles` com catálogo e seed dos 4 papéis, hooks de guarda enforce_role.js / enforce_role_update.js (bloqueio de escalada e autopromoção), rota GET /backend/v1/rbac-test e frontend com login + dashboard por papel (superfícies permitidas).
- Seed de usuário administrador inicial (credencial provisória para teste humano, a ser trocada após aceite).
- Versão preview v0.0.3 (build e QA ok). Verificações automáticas passaram: 401 sem token, 403 em escalada de papel, 200 em signup sem papel, listagem de 4 papéis, login admin e papel comercial validados no preview.
- F1-T01 **aguardando teste humano** explícito antes de concluir ou avançar.

## 2026-08-27

- Corrigido `02-Escopo-Definitivo.md` para delimitar o produto à aquisição própria da IA Ferramenta; removida a interpretação de operação de mídia para clientes.
- Registrado aceite explícito do consultor para a correção de escopo e geração das SPECs da Fase 1.
- Geradas SPEC-1-001, SPEC-1-002 e SPEC-1-003 em `02-Plano_de_acao/01.Fase_1/01-SPECs/`.
- Ambiente de construção definido: GoSkip com SkipCloud para persistência, autenticação e RBAC; repositório será criado após a pasta do cliente e comandos automatizados ainda não foram definidos.
- Geradas F1-T01 a F1-T09 e sincronizadas em `00-Tasks_Gerais.md`, Jornada, SPECs e matriz de rastreabilidade.
- F1-T01 é a única task elegível; nenhuma task, integração produtiva, credencial, publicação ou gasto de mídia foi iniciado.
- Verificada a execução autorizada da F1-T01: o projeto Skip IA Ferramenta (`projectId 53880`) existe, mas não está integrado ao Skip Cloud; Auth/RBAC não pôde ser configurado. Estado persistente registrado em `.adapta-cliente/estado-atual.md`.

## Próximo passo

Teste humano da F1-T01 no preview. Se aprovado, concluir a task e liberar F1-T02.
