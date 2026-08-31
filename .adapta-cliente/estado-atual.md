# Estado atual — Adapta Cliente

- task_id: F1-T01
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-001-nucleo-campanhas-e-permissoes.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada — "Pode executar" / "Pode fazer" (2026-08-27)
- teste_humano: pendente — aguardando novo teste após correção de segurança (autopromoção bloqueada)
- verificacao_automatica: passou — verificação independente completa: autopromoção 403 e banco inalterado; signup elevado 403; rbac-test 401 sem token; RLS lista apenas o próprio; catálogo 4 papéis; mutação de roles por usuário comum negada; build v0.0.4 QA ok
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-08-31-1430-hook-request-e-record-body-merge.md
- ultima_acao: corrigida falha de autopromoção de papel encontrada na verificação independente (hooks + migration 0003); v0.0.4 aplicado
- proxima_acao: novo teste humano no preview (login admin continua igual); se aprovado, concluir F1-T01
- atualizado_em: 2026-08-31T14:35:00-03:00
