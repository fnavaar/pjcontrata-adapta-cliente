# AP-2026-09-01-1900 — Hooks do Skip Cloud: scoping JSVM e AfterCreateSuccess sem filtro de coleção

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T05 (SPEC-1-002)
- Sinal: hooks com declarações top-level (function helper) referenciadas dentro de callbacks falhavam no deploy (Hook scoping error: top-level declaration not accessible in JSVM pool); e onRecordAfterCreateSuccess não aceita filtro de coleção, então auditoria de create de brief/creative_asset/campaign_configuration não rodava. Solução: tudo inline e auditoria de create via onRecordCreateRequest (que aceita filtro por coleção; id da campanha vem no body).
- Evidência: deploy v0.0.22 falhava scoping; v0.0.24 QA ok e testes API (URL inválida 400, auditoria create:creative_asset com campos).
- Regra reutilizável: em hooks Skip Cloud/PocketBase, (1) nunca usar funções/const top-level referenciadas em callbacks — mover inline; (2) auditoria de create de coleções específicas usa onRecordCreateRequest com filtro (não onRecordAfterCreateSuccess, que não filtra coleção); (3) para id do registro novo no create, usar body.campaign_id (relação já vem no body).
- Quando aplicar: qualquer hook de auditoria/validação de novas coleções no Skip Cloud.
- Quando não aplicar: quando precisar de pós-commit id do registro gerado (aí usar AfterCreateSuccess sem filtro).
- Confiança: alta — observado diretamente (deploy falhou, corrigiu, passou).
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
