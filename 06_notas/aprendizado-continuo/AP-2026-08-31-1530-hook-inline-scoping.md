# AP-2026-08-31-1530 — Hook PocketBase exige lógica inline (sem helper top-level)

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T02 / SPEC-1-001
- Sinal: ao aplicar o hook validate_campaign com função helper no topo do arquivo (validatorBody) referenciada dentro dos callbacks onRecordCreateRequest/onRecordUpdateRequest, o deploy falhou com erro de scoping: callbacks rodam em VM pool separado e não enxergam declarações do nível superior (ReferenceError em runtime).
- Evidência: build v0.0.5 falhou (integrations) com o erro; corrigido movendo toda a lógica inline dentro de cada callback; build v0.0.6 QA ok e validação funcionando (período inválido → 400).
- Regra reutilizável: em hooks do Skip Cloud (PocketBase goja), todo o código de um callback deve ser autossuficiente — nunca declarar função/const no topo e referenciá-la dentro de onRecord*/routerAdd/cronAdd. Se precisar repetir lógica, duplique inline ou divida em arquivos.
- Quando aplicar: qualquer hook novo (F1-T04 em diante: auditoria, transições, validadores).
- Quando não aplicar: migrations (mesmo runtime, mas sem callbacks assíncronos de request) e código frontend TS/React.
- Confiança: alta — falha reproduzida no pipeline e corrigida com reaplicação bem-sucedida.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
