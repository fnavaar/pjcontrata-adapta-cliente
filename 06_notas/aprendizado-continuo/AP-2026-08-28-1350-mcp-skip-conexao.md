# AP-2026-08-28-1350 — MCP Skip encerra conexão durante inspeção de projeto

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T01 / SPEC-1-001
- Sinal: o MCP Skip encerrou a conexão ("connection closed") durante a inspeção do projeto 53888 em 27/ago, após consulta à documentação docs.adapta.org/skip; ocorrência repetida na segunda tentativa autorizada, sem alteração funcional aplicada.
- Evidência: `.adapta-cliente/estado-atual.md` (verificacao_automatica: falhou) e commits 3faebe3/b615639/de7b496 (autor gustavocgrs, 27/ago).
- Regra reutilizável: ao executar tasks do Adapta que dependem do MCP Skip, verificar conectividade antes de iniciar; se ocorrer "connection closed" na inspeção, não aplicar alteração funcional, registrar estado em_correcao e retomar quando a conexão estiver disponível; documentação de referência indicada pelo cliente é docs.adapta.org/skip.
- Quando aplicar: outras tasks da Fase 1 que exijam SkipCloud (F1-T02 em diante).
- Quando não aplicar: se a causa for bug local do MCP ou ambiente saudável.
- Confiança: média — observado duas vezes no mesmo dia, sem diagnóstico do servidor.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
