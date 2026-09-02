# Estado atual — Adapta Cliente

- task_id: F1-T06
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-002-ativos-modelos-e-planejamento.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada — "sim" (2026-09-02, após relatório de análise da F1-T06)
- teste_humano: pendente
- verificacao_automatica: passou — migration 0008 aplicada (campaign_template + snapshot); aplicar compatível preenche config + snapshot; incompatível/inativo → 400 e config intocada; alterar template depois NÃO muda campanha; auditoria aplicar-modelo; build v0.0.34 QA ok
- aprendizado: pendente
- ultima_acao: F1-T06 implementada (biblioteca de modelos versionados + snapshot + rota aplicar-modelo + página Modelos + seção no detalhe); corrigido parse de JSONField (bytes/string) no runtime JSVM
- proxima_acao: teste humano no preview (biblioteca Modelos, aplicar modelo compatível, recusa incompatível, snapshot fixo)
- atualizado_em: 2026-09-02T12:55:00-03:00
