# AP-2026-08-31-1000 — RBAC server-side no SkipCloud (padrão IA Ferramenta)

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T01 / SPEC-1-001
- Sinal: RBAC interno implementado e verificado no SkipCloud: campo `role` (select) na coleção users + coleção `roles` (catálogo) + hooks de request (enforce_role.js, enforce_role_update.js) + rota custom de teste; signup público nasce sem papel; regras de users restringem list/view/update/delete ao próprio id.
- Evidência: migrations 0001/0002 aplicadas em 31/ago no projeto 53888; 401 sem token em /backend/v1/rbac-test; 403 ao criar usuário com role=administrador via API; roles listados (4); dashboards distintos no preview (admin vs comercial).
- Regra reutilizável: em tasks futuras (F1-T02+), qualquer mutação sensível deve ser bloqueada no servidor (hook onRecord*Request / RLS), nunca só na UI; papéis elevados exigem superusuário; manter catálogo de papéis em coleção própria.
- Quando aplicar: criação de campanhas, aprovações e demais superfícies da Fase 1 que dependem de alçada.
- Quando não aplicar: conteúdo público sem autenticação.
- Confiança: alta — comportamento observado diretamente na API e no preview.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto (credencial provisória fica fora deste arquivo).
