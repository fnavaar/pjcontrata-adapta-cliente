# AP-2026-09-01-1438 — Auditoria de criação no Skip Cloud exige hook pós-commit

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T04 (SPEC-1-001 § Exceções e recuperação)
- Sinal: ao gravar auditoria de criação dentro de `onRecordCreateRequest`, o `campaign_id` vinha vazio (o id do novo registro só existe após o save) e a mutação inteira falhava com 400 genérico "Failed to create record". Ao mover a auditoria para `onRecordAfterCreateSuccess`, a criação passou a funcionar e os logs de create passaram a ser gravados normalmente.
- Evidência: verificação automatizada no preview v0.0.17 — create com 12 logs de auditoria; conflito de version → 400; transições inválidas → 400; arquivamento → 200; total 18 logs. Antes da correção, create 400 sem id; com hook desativado, create 200 mas sem auditoria.
- Regra reutilizável: em hooks do Skip Cloud/PocketBase, auditoria de **criação** deve ser registrada em `onRecordAfterCreateSuccess` (pós-commit, `e.record.id` disponível); jamais dentro do request hook de create, onde o id ainda não existe. Auditoria de **update** pode permanecer no `onRecordUpdateRequest` (o id do registro já existe).
- Quando aplicar: qualquer hook que precise auditar a criação de um registro cujo id é gerado no save.
- Quando não aplicar: quando a auditoria precisa travar a mutação antes de salvar (aí usar validação no request hook, não auditoria pós-commit).
- Confiança: alta — observado diretamente na verificação da F1-T04 (id vazio causava 400; pós-commit resolveu).
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
