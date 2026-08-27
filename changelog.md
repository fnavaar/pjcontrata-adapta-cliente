# Changelog — IA Ferramenta

## 2026-08-27

- Corrigido `02-Escopo-Definitivo.md` para delimitar o produto à aquisição própria da IA Ferramenta; removida a interpretação de operação de mídia para clientes.
- Registrado aceite explícito do consultor para a correção de escopo e geração das SPECs da Fase 1.
- Geradas SPEC-1-001, SPEC-1-002 e SPEC-1-003 em `02-Plano_de_acao/01.Fase_1/01-SPECs/`.
- Ambiente de construção definido: GoSkip com SkipCloud para persistência, autenticação e RBAC; repositório será criado após a pasta do cliente e comandos automatizados ainda não foram definidos.
- Geradas F1-T01 a F1-T09 e sincronizadas em `00-Tasks_Gerais.md`, Jornada, SPECs e matriz de rastreabilidade.
- F1-T01 é a única task elegível; nenhuma task, integração produtiva, credencial, publicação ou gasto de mídia foi iniciado.
- Verificada a execução autorizada da F1-T01: o projeto Skip IA Ferramenta (`projectId 53880`) existe, mas não está integrado ao Skip Cloud; Auth/RBAC não pôde ser configurado. Estado persistente registrado em `.adapta-cliente/estado-atual.md`.

## Próximo passo

Integrar o projeto IA Ferramenta ao Skip Cloud. Depois, retomar exclusivamente a F1-T01, configurar Auth/RBAC e solicitar teste humano antes de qualquer avanço.
