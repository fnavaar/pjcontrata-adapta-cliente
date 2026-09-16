# Estado atual — Adapta Cliente

- task_id: F2-T03
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-2-001-meta-publicacao-controlada.md (pré-condição CA-2-001)
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada (16/09/2026 — owner forneceu acesso e acompanhou a prova)
- teste_humano: pendente
- verificacao_automatica: passou
  - prova read-only CA-2-001: /me (identidade), /act_1585807056675719 (conta ativa, BRL, SP), /campaigns (vazio)
  - token válido com escopo mínimo ads_management+ads_read; sem segredo em qualquer saída
  - allowlist: ad_connection ogzfs36ibb8tzbl (meta, environment teste, enabled)
  - secrets: META_ACCESS_TOKEN + META_SANDBOX_ACCOUNT_ID gravados no Skip Cloud
- aprendizado: pendente
- ultima_acao: prova de acesso executada e passou; token nos secrets; conta na allowlist; recibo emitido
- proxima_acao: teste humano (owner confirma a prova); depois concluir F2-T03 e liberar F2-T04
- atualizado_em: 2026-09-16T14:20:00-03:00
