# Estado atual — Adapta Cliente

- task_id: F1-T06
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-002-ativos-modelos-e-planejamento.md
- etapa: concluida
- autorizacao_implementacao: confirmada — "sim" (2026-09-02, após relatório de análise da F1-T06)
- teste_humano: aprovado — screenshot "Modelo aplicado com snapshot (auditado)" na campanha T06 - Debug (2026-09-03) + verificação automatizada (compatível preenche, incompatível/inativo 400, snapshot imutável)
- verificacao_automatica: passou — migration 0008 aplicada; aplicar compatível preenche config (status completo) + snapshot; incompatível/inativo → 400 e config intocada; alterar template depois NÃO muda campanha; auditoria aplicar-modelo; build v0.0.34 QA ok
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-09-03-0934-jsonfield-bytes-jsvm.md
- ultima_acao: F1-T06 concluída (biblioteca de modelos versionados + snapshot + rota aplicar-modelo + página Modelos + seção no detalhe); corrigido parse de JSONField (bytes/string) no runtime JSVM
- proxima_acao: F1-T07 elegível — nova análise mediante novo pedido explícito
- atualizado_em: 2026-09-03T09:34:00-03:00
