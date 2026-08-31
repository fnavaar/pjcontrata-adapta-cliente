# Changelog — IA Ferramenta

## 2026-08-31

- Verificação independente da F1-T01 encontrou e corrigiu falha de segurança: usuária comum conseguia se autopromover a administrador pela API (e.record em hook de request já refletia o body proposto; comparação atual/novo nunca disparava). Reescritos enforce_role.js e enforce_role_update.js (leitura do papel persistido via $app.findRecordById), migration 0003 com re-seed dos 4 papéis e endurecimento das regras da coleção roles (create/update/delete só administrador). Build v0.0.4 QA ok.
- Reverificação completa do zero: autopromoção 403 e banco inalterado; signup com papel elevado 403; rbac-test 401 sem token; RLS lista apenas o próprio; catálogo com 4 papéis; mutação de roles por usuário comum negada no servidor.
- F1-T01 aguardando NOVO teste humano após a correção (login admin no preview deve continuar funcionando).
- `[champion: Gustavo]` · Task F1-T01 concluída: projeto GoSkip criado e SkipCloud Auth/RBAC interno configurado (campo role + catálogo roles + hooks server-side + rota /backend/v1/rbac-test + frontend login/dashboard). Evidência: preview v0.0.4, migrations 0001-0003 aplicadas, autopromoção 403, signup elevado 403, RLS self-only, screenshot de aprovação do admin.
- Próxima task elegível após novo pedido: F1-T02 (modelar campanhas internas).

## 2026-08-27

- Corrigido `02-Escopo-Definitivo.md` para delimitar o produto à aquisição própria da IA Ferramenta; removida a interpretação de operação de mídia para clientes.
- Registrado aceite explícito do consultor para a correção de escopo e geração das SPECs da Fase 1.
- Geradas SPEC-1-001, SPEC-1-002 e SPEC-1-003 em `02-Plano_de_acao/01.Fase_1/01-SPECs/`.
- Ambiente de construção definido: GoSkip com SkipCloud para persistência, autenticação e RBAC; repositório será criado após a pasta do cliente e comandos automatizados ainda não foram definidos.
- Geradas F1-T01 a F1-T09 e sincronizadas em `00-Tasks_Gerais.md`, Jornada, SPECs e matriz de rastreabilidade.
- F1-T01 é a única task elegível; nenhuma task, integração produtiva, credencial, publicação ou gasto de mídia foi iniciado.
- Verificada a execução autorizada da F1-T01: o projeto Skip IA Ferramenta (`projectId 53880`) existe, mas não está integrado ao Skip Cloud; Auth/RBAC não pôde ser configurado. Estado persistente registrado em `.adapta-cliente/estado-atual.md`.

## Próximo passo

F1-T01 concluída. Nova seleção de task (F1-T02) somente mediante novo pedido explícito.
