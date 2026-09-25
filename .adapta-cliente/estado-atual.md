# Estado atual — Adapta Cliente

- task_id: F2-T07
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-2-002-google-publicacao-controlada.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada (21/09/2026 15:48 — "sim" após relatório de análise)
- teste_humano: aprovado (22/09/2026 08:19 — "sim" após teste ao vivo do bloqueio; 25/09 publicação real executada, aguardando novo aceite)
- verificacao_automatica: passou
  - builds v0.0.119–v0.0.125 QA ok
  - PUBLICAÇÃO REAL COMPLETA (25/09): campanha T-F2T07-REAL-FINAL criada NA GOOGLE ADS pela rota do sistema — budget + campaign SEARCH, status PAUSED confirmado por consulta GAQL (CA-2-008)
  - IDEMPOTÊNCIA REAL (CA-2-009): retry da mesma chave → "nada duplicado"; 1 única campanha na conta de teste, provado via GAQL
  - gates server-side 8/9 (falha externa Meta 500 transitória documentada)
  - RN-226: nenhum segredo/remote_id_real nas respostas
- aprendizado: ok (AP-2026-09-25-1445 — containsEuPoliticalAdvertising obrigatório na v25; mutate combinado atômico; GAQL para consultas; camelCase no REST)
- ultima_acao: publicação real Google executada e verificada; aguardando teste humano
- proxima_acao: teste humano do Tarcísio; não concluir nem iniciar outra task até confirmação
- atualizado_em: 2026-09-25T14:50:00-03:00