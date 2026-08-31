# Debug Summary — F1-T01 (2026-08-31, verificação independente)

**Task e problema:** F1-T01 — RBAC server-side. Durante a verificação independente de entrega (checklist concluir-task), identificou-se falha de segurança: usuária comum conseguia se autopromover a administrador pela API (PATCH no próprio registro com role=administrador → 200) e, em consequência, deletar papel do catálogo.

**Reprodução:** usuária maria.teste (sem papel) → PATCH /api/collections/users/records/{id} com body {"role":"administrador"} → HTTP 200 e papel persistido como administrador. O hook enforce_role_update.js comparava e.record.get('role') após o merge do body, então o papel "atual" já vinha com o valor novo e a comparação nunca disparava bloqueio.

**Causa raiz:** no hook onRecordUpdateRequest, e.record já reflete o body da requisição; ler o papel "atual" dele é ler o valor proposto. A comparação current != new nunca era verdadeira.

**Correção:**
- enforce_role_update.js reescrito: lê o papel PERSISTIDO via $app.findRecordById('_pb_users_auth_', id) no momento do request; nenhum usuário pode alterar o próprio papel; alterar papel de outro exige papel administrador no auth; superusuário passa.
- enforce_role.js reescrito: criar usuário com papel exige superusuário OU usuário com papel administrador (antes só superusuário; mantém bloqueio de signup público com papel elevado).
- migration 0003_reseed_roles_harden_rules: re-seed idempotente dos 4 papéis (administrador havia sido deletado pelo teste), endurece regras da coleção roles (create/update/delete só administrador; remove marketing do create) e rebaixa a fixture maria.teste promovida indevidamente.

**Verificação automática (reverificação completa do zero):**
- Autopromoção (6): maria PATCH role=administrador no próprio id → 403 "Você não pode alterar o próprio papel"; banco permanece com role vazio.
- Signup público role=administrador (7): 403.
- rbac-test sem token (10): 401.
- RLS (5): usuária comum lista users → vê apenas a si (totalItems 1).
- Catálogo (11): 4 papéis presentes (administrador, marketing, aprovador, comercial).
- Mutações na coleção roles por usuário comum (8/9): criação negada (400 Failed to create record — rule block) e delecção retorna 404 (recurso escondido pela regra).
- Observação: gestão de papel de OUTRO usuário não é exposta pela API comum (RLS updateRule = id = @request.auth.id esconde o registro; 404). Atribuição de papéis fica no mecanismo RBAC existente (superusuário do Skip/console), conforme SPEC-1-001 "integração com o mecanismo de RBAC existente".

**Gate atual:** aguardando teste humano (correção aplicada, build v0.0.4 QA ok)
