# Estado atual — Adapta Cliente

- task_id: F2-T07
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-2-002-google-publicacao-controlada.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada (21/09/2026 15:48 — "sim" em resposta ao relatório de análise da F2-T07)
- teste_humano: pendente
- verificacao_automatica: passou
  - build v0.0.119 QA ok
  - bateria F2-T07: 8/9 PASS (401, 403, rejeita meta, sem aprovação, fora da allowlist ANTES da API, repetição consistente, RN-226, reconciliar Meta)
  - 1 falha EXTERNA documentada: publicação Meta real retornando HTTP 500 transitório da Meta (is_transient, code 2; token válido; diagnosticado fora do app; núcleo Meta intocado — marcadores v0.0.117 verificados no deploy)
  - integridade do hook Google: 12/12 marcadores no deploy
- aprendizado: pendente
- pendencia: conta de teste Google Ads na allowlist (herdada da F2-T06) — quando existir: secrets GOOGLE_TEST_CUSTOMER_ID/GOOGLE_TEST_LOGIN_CUSTOMER_ID + ad_connection google/teste → publicação real CA-2-008/009 sem novo deploy
- ultima_acao: F2-T07 implementada e verificada; recibo emitido (commit 3a6292d)
- proxima_acao: teste humano; não concluir nem iniciar outra task até confirmação
- atualizado_em: 2026-09-21T16:20:00-03:00
