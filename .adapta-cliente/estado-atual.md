# Estado atual — Adapta Cliente

- task_id: F1-T08
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-003-checklist-aprovacao-e-previa.md
- etapa: concluida
- autorizacao_implementacao: confirmada — "sim" (2026-09-03, após relatório de análise da F1-T08)
- teste_humano: aprovado — screenshots admin (seção Aprovação + CHANGES_REQUESTED com comentário + histórico) + verificação automatizada (aprovar 200, rejeitar/devolver sem comentário 400, invalidação por mudança material)
- verificacao_automatica: passou — migration 0010 aplicada; rejeitar/devolver sem comentário → 400; aprovar registra decisão vigente; mudança material (orçamento) invalida aprovação + campanha invalidade + auditoria; build v0.0.48 QA ok
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-09-03-1040-invalidacao-aprovacao-multi-colecao.md
- ultima_acao: F1-T08 concluída (aprovação humanizada + comentário obrigatório + invalidação por mudança material + seção Aprovação no frontend)
- proxima_acao: F1-T09 elegível — prévia determinística e prova de não integração; após concluir, aguardar liberar-fase do consultor
- atualizado_em: 2026-09-03T10:40:00-03:00
