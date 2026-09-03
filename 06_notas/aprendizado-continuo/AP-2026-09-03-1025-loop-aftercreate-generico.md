# AP-2026-09-03-1025 — AfterCreateSuccess/AfterUpdateSuccess genéricos entram em loop ao gravar a própria coleção

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T07 (SPEC-1-003)
- Sinal: o hook checklist_engine usava onRecordAfterCreateSuccess genérico (sem filtro de coleção) e, dentro dele, gravava um registro em checklist_evaluation. Ao criar a avaliação, o hook disparava de novo para checklist_evaluation → recursão infinita (861 avaliações em uma única campanha em poucos minutos).
- Evidência: durante a verificação, uma campanha acumulou 861 avaliações; após adicionar guarda `if (colName === 'checklist_evaluation' || colName === 'campaign_logs') return` no create (e filtro de coleção no update), o recálculo passou a gerar exatamente 1 avaliação por mutação (3 avaliações BLOCKED→BLOCKED→READY esperadas). Build v0.0.39+ QA ok.
- Regra reutilizável: em hooks After*Success do Skip Cloud/PocketBase, SEMPRE filtrar/guardar contra as coleções que o próprio hook grava (ex.: a coleção de saída do hook) — o hook dispara para toda mutação, incluindo as internas. Ou usar o filtro de coleção disponível nos request hooks / onRecordAfterUpdateSuccess com lista explícita de coleções.
- Quando aplicar: qualquer hook que escreva em uma coleção e escute After*Success genérico.
- Quando não aplicar: hooks com filtro de coleção nativo ou que só leem (sem gravar registros que disparem o mesmo evento).
- Confiança: alta — observado diretamente (861 avaliações) e corrigido com guarda mínima.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
