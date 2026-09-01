# Changelog — IA Ferramenta

## 2026-09-01

- F1-T04 concluída: transições de estado, auditoria antes/depois (coleção campaign_logs), conflito de edição por version e arquivamento recuperável. Teste humano aprovado (screenshot admin: histórico + restauração) + verificação automatizada (conflito 400, transições 400/200, arquivamento, 18 logs). Build v0.0.17 QA ok. Durante a verificação, o hook de auditoria de create foi corrigido (não podia gravar campaign_id no momento do request create — passou para after-create-success).
- Aprendizado capturado: auditoria de create no Skip Cloud deve ser feita em hook pós-commit (onRecordAfterCreateSuccess); request hook de create não tem id do novo registro (AP-2026-09-01-1438).
- F1-T05 fica elegível para nova análise (pauta, ativos e configuração declarada).

## 2026-09-01

- F1-T03 concluída: lista, filtros e detalhe de campanhas (plataforma, canal, ICP, oferta, funil, conta, período, estado, responsável) + tela de detalhe /campanhas/:id. Teste humano aprovado (screenshot do detalhe). Build v0.0.7 QA ok.
- Aprendizado capturado: em produto interno, leitura liberada a autenticados e alçada nas mutações (AP-2026-09-01-1400).
- F1-T04 selecionada para análise (estados, auditoria, conflito, arquivamento).

## 2026-08-31

- F1-T02 concluída (modelagem e persistência de campanhas internas): coleção campaigns, seed de 2 campanhas, hook de validação de período e campos, página de listagem + criação. Teste humano aprovado (screenshot: campanha criada e listada). Build v0.0.6.
- Aprendizado capturado: hooks do Skip Cloud exigem lógica 100% inline dentro dos callbacks (sem helper top-level) — AP-2026-08-31-1530.
- Verificação independente da F1-T01 encontrou e corrigiu falha de segurança: usuária comum conseguia se autopromover a administrador pela API (e.record em hook de request já refletia o body proposto; comparação atual/novo nunca disparava). Reescritos enforce_role.js e enforce_role_update.js (leitura do papel persistido via $app.findRecordById), migration 0003 com re-seed dos 4 papéis e endurecimento das regras da coleção roles (create/update/delete só administrador). Build v0.0.4 QA ok.
- `[champion: Gustavo]` · Task F1-T01 concluída: projeto GoSkip criado e SkipCloud Auth/RBAC interno configurado. Evidência: preview v0.0.4, migrations 0001-0003, autopromoção 403, signup elevado 403, RLS self-only, screenshot admin.

## 2026-08-27

- Corrigido `02-Escopo-Definitivo.md` para delimitar o produto à aquisição própria da IA Ferramenta; removida a interpretação de operação de mídia para clientes.
- Registrado aceite explícito do consultor para a correção de escopo e geração das SPECs da Fase 1.
- Geradas SPEC-1-001, SPEC-1-002 e SPEC-1-003.
- Ambiente de construção definido: GoSkip com SkipCloud; repositório será criado após a pasta do cliente e comandos automatizados ainda não foram definidos.
- Geradas F1-T01 a F1-T09 e sincronizadas.
- F1-T01 é a única task elegível; nenhuma task, integração produtiva, credencial, publicação ou gasto de mídia foi iniciado.

## Próximo passo

F1-T04 concluída. Próxima task elegível: F1-T05 (pauta, ativos e configuração declarada) — nova seleção mediante novo pedido explícito.
