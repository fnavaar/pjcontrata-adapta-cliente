# Debug Summary — F1-T01 (2026-08-31)

**Task e problema:** F1-T01 — criar projeto GoSkip e configurar SkipCloud Auth/RBAC interno; bloqueada desde 27/ago por falha técnica.

**Reprodução:** em 27/ago o MCP do Skip encerrou a conexão ("connection closed") durante a inspeção do projeto 53888, por 2 vezes; nenhuma alteração funcional foi aplicada. Em 31/ago o MCP respondeu normalmente e o projeto seguia no estado base (zero migrations, coleção users padrão).

**Causa raiz:** falha de conectividade do MCP do Skip na data original; não havia erro de implementação nem requisito ambíguo.

**Correção:** com o MCP disponível, implementou-se o RBAC conforme SPEC-1-001:
- migration 0001_setup_rbac: campo `role` (select: administrador, marketing, aprovador, comercial) em users; regras de acesso restritas ao próprio registro; coleção `roles` com catálogo; seed idempotente dos 4 papéis.
- migration 0002_seed_admin: usuário administrador inicial (credencial provisória para teste humano).
- hooks: enforce_role.js (criação bloqueia papel elevado sem superusuário), enforce_role_update.js (bloqueia autopromoção), http_permission_test.js (rota GET /backend/v1/rbac-test).
- frontend: AuthProvider (PocketBase), página de login, Dashboard por papel com superfícies permitidas e rota protegida.

**Verificação automática:** migrations 0001/0002 aplicadas; build v0.0.3 QA ok (setup/static/build/integrations/test); GET /backend/v1/rbac-test sem token → 401; criação pela API com role=administrador → 403; signup sem papel → 200; login admin (administrador) e usuária de teste (comercial) validados no preview, com superfícies distintas.

**Gate atual:** aguardando teste humano
