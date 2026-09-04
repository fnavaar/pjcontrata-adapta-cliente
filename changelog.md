# Changelog — IA Ferramenta

## 2026-09-04

- 2026-09-04 · [champion: Gustavo] · Task F1-T09 concluída: prévia determinística + prova de não integração. Rota custom `GET /backend/v1/previa/{campaignId}` (autenticada) monta JSON determinístico só com dados internos (campanha, configuração, ativos, pauta, modelo/snapshot, checklist, aprovação) + bloco `fase2_nao_configurados` (todos null/"não configurado") + metadados (gerado_em, fonte "dados internos", integracao_externa "nenhuma"); seção "Prévia determinística" no detalhe da campanha (sem botão de publicar). Evidência: build v0.0.49 QA ok; testes de API 200/401/404; prova de não integração (nenhum fetch externo/credencial nos hooks e migrations; frontend só chama /backend/v1); teste humano aprovado com screenshot (dados reais + Fase 2 não configurado). Aprendizado AP-2026-09-04-1132 (skip_file_patch cirúrgico para arquivos grandes). **Fase 1 100% (9/9).**

## 2026-09-03

- F1-T07 concluída: motor de checklist determinístico (checklist_rule + checklist_evaluation + seeds), recálculo automático em mudanças de campanha/config/ativos/brief, decisão READY/BLOCKED com itens PASS/FAIL/PENDING/NOT_APPLICABLE e ação sugerida, regra ausente → BLOCKED sem fallback. Rota custom `POST /backend/v1/recalcular-checklist` para campanhas pré-existentes. Teste humano aprovado (screenshot admin: checklist com 12 PASS + 1 FAIL ativo com ação, badge BLOCKED). Build v0.0.44 QA ok.
- Aprendizado capturado: onRecordAfterCreateSuccess/AfterUpdateSuccess genéricos processam TODAS as coleções — ao gravar checklist_evaluation dentro do hook, entrava em loop infinito (861 avaliações em 1 campanha); corrigido com guarda de coleção (AP-2026-09-03-1025).
- F1-T08 fica elegível para nova análise (aprovação auditada e invalidação).

## 2026-09-03

- F1-T06 concluída: biblioteca de modelos versionados (campaign_template), rota custom `/backend/v1/aplicar-modelo` (aplica compatível, recusa incompatível/inativo com 400 e configuração intocada), snapshot fixo na campanha (alteração posterior do modelo NÃO reescreve a campanha) e auditoria `aplicar-modelo`. Teste humano aprovado (screenshot: "Modelo aplicado com snapshot (auditado)" na campanha T06 - Debug). Build v0.0.34 QA ok.
- Aprendizado capturado: JSONField no JSVM do Skip Cloud chega como array de bytes/string — normalizar com String.fromCharCode + JSON.parse (AP-2026-09-03-0934).

## 2026-09-02

- F1-T06 implementada e verificada automaticamente (aplicar compatível preenche config, recusa 400, snapshot imutável).

## 2026-09-01

- F1-T05 concluída: pauta (brief), ativos (creative_asset) e configuração declarada (campaign_configuration) vinculados à campanha, com pendências dinâmicas (some ao declarar) e auditoria create:* no histórico. Teste humano aprovado (screenshots: pauta salva, pendências, ativo listado, histórico com create:brief/create:creative_asset). Build v0.0.24 QA ok.
- Aprendizado capturado: hooks do Skip Cloud não podem ter declarações top-level (JSVM roda callbacks em pool separado) e onRecordAfterCreateSuccess não aceita filtro de coleção — auditoria de create deve usar onRecordCreateRequest com filtro (AP-2026-09-01-1900).

## 2026-09-01

- F1-T04 concluída: transições de estado, auditoria antes/depois (coleção campaign_logs), conflito de edição por version e arquivamento recuperável. Teste humano aprovado (screenshot admin: histórico + restauração) + verificação automatizada (conflito 400, transições 400/200, arquivamento, 18 logs). Build v0.0.17 QA ok.
- Aprendizado capturado: auditoria de create no Skip Cloud deve ser feita em hook pós-commit (onRecordAfterCreateSuccess); request hook de create não tem id do novo registro (AP-2026-09-01-1438).

## 2026-09-01

- F1-T03 concluída: lista, filtros e detalhe de campanhas (plataforma, canal, ICP, oferta, funil, conta, período, estado, responsável) + tela de detalhe /campanhas/:id. Teste humano aprovado (screenshot do detalhe). Build v0.0.7 QA ok.
- Aprendizado capturado: em produto interno, leitura liberada a autenticados e alçada nas mutações (AP-2026-09-01-1400).

## 2026-08-31

- F1-T02 concluída (modelagem e persistência de campanhas internas): coleção campaigns, seed de 2 campanhas, hook de validação de período e campos, página de listagem + criação. Teste humano aprovado (screenshot: campanha criada e listada). Build v0.0.6.
- Aprendizado capturado: hooks do Skip Cloud exigem lógica 100% inline dentro dos callbacks (sem helper top-level) — AP-2026-08-31-1530.
- Verificação independente da F1-T01 encontrou e corrigiu falha de segurança: usuária comum conseguia se autopromover a administrador pela API. Reescritos enforce_role.js e enforce_role_update.js (leitura do papel persistido via $app.findRecordById), migration 0003, build v0.0.4 QA ok.
- `[champion: Gustavo]` · Task F1-T01 concluída: projeto GoSkip criado e SkipCloud Auth/RBAC interno configurado. Evidência: preview v0.0.4, migrations 0001-0003, autopromoção 403, signup elevado 403, RLS self-only, screenshot admin.

## 2026-08-27

- Corrigido `02-Escopo-Definitivo.md` para delimitar o produto à aquisição própria da IA Ferramenta; removida a interpretação de operação de mídia para clientes.
- Registrado aceite explícito do consultor para a correção de escopo e geração das SPECs da Fase 1.
- Geradas SPEC-1-001, SPEC-1-002 e SPEC-1-003.
- Ambiente de construção definido: GoSkip com SkipCloud; repositório será criado após a pasta do cliente e comandos automatizados ainda não foram definidos.
- Geradas F1-T01 a F1-T09 e sincronizadas.
- F1-T01 é a única task elegível; nenhuma task, integração produtiva, credencial, publicação ou gasto de mídia foi iniciado.

## Próximo passo

F1-T09 concluída — **Fase 1 100% (9/9)**. Fase 1 encerra somente via liberar-fase do consultor (envio de nova fase/SPECs). Não iniciar nova task.
