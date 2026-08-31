# AP-2026-08-31-1430 — Hook onRecord*Request: e.record já reflete o body; ler papel persistido via $app.findRecordById

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T01 / SPEC-1-001
- Sinal: em onRecordUpdateRequest, a comparação de papel atual era feita com e.record.get('role') — que já contém o valor proposto no body — permitindo autopromoção de papel (PATCH role=administrador → 200).
- Evidência: reprodução e correção registradas em 06_notas/debug/debug-2026-08-31-f1-t01-autopromocao.md; autopromoção agora 403 e banco inalterado.
- Regra reutilizável: em hooks de request (onRecord*Request), nunca confiar em e.record para ler o estado anterior de um campo que o body pode alterar; ler o valor persistido com $app.findRecordById(...) no momento do request ou usar e.record original capturado antes do merge. Qualquer regra de segurança que compare antes/depois deve operar sobre o valor do banco.
- Quando aplicar: hooks de RBAC, auditoria, validação de transições de estado em F1-T04+, e qualquer guarda de segurança que compare valor antigo vs novo.
- Quando não aplicar: hooks after-success (onRecordAfter*Success) onde e.record já é o estado final persistido.
- Confiança: alta — bug reproduzido e verificado o comportamento corrigido.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
