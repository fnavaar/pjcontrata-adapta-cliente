# Estado atual — Adapta Cliente

- task_id: F1-T01
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-1-001-nucleo-campanhas-e-permissoes.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada — "Pode executar" / "Pode fazer" (2026-08-27)
- teste_humano: pendente
- verificacao_automatica: passou — migrations 0001_setup_rbac e 0002_seed_admin aplicadas (31/ago); 401 sem token em /backend/v1/rbac-test; 403 ao criar usuário com role=administrador; roles seeded (4); login admin e usuária comercial validados no preview; build v0.0.3 QA ok
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-08-31-1000-rbac-server-side-skipcloud.md
- ultima_acao: retomada da F1-T01 com MCP do Skip disponível; RBAC server-side implementado e verificado automaticamente
- proxima_acao: teste humano no preview (login admin + papel comercial); se aprovado, concluir F1-T01
- atualizado_em: 2026-08-31T10:05:00-03:00
