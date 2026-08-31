# Estado atual — Adapta Cliente

- task_id: F1-T01
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-001-nucleo-campanhas-e-permissoes.md
- etapa: concluida
- autorizacao_implementacao: confirmada — "Pode executar" / "Pode fazer" (2026-08-27)
- teste_humano: aprovado — screenshot do dashboard (31/ago 12:49): admin logado, papel administrador, pode aprovar Sim, pode criar/editar Sim, superfícies campanhas/aprovacoes/admin
- verificacao_automatica: passou — verificação independente completa: autopromoção 403 e banco inalterado; signup elevado 403; rbac-test 401 sem token; RLS lista apenas o próprio; catálogo 4 papéis; mutação de roles por usuário comum negada; build v0.0.4 QA ok; rbac-test admin fresco em 31/ago 12:49 OK
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-08-31-1430-hook-request-e-record-body-merge.md
- ultima_acao: F1-T01 concluída (RBAC server-side implementado, corrigido e aprovado no teste humano)
- proxima_acao: seleção da próxima task (F1-T02) aguarda novo pedido
- atualizado_em: 2026-08-31T12:50:00-03:00
