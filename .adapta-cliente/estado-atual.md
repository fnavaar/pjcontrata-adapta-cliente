# Estado atual — Adapta Cliente

- task_id: F2-T06
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-2-002-google-publicacao-controlada.md
- etapa: concluida
- autorizacao_implementacao: confirmada (17/09/2026 09:41 — "sim, me instrua como conseguir as credenciais do google" após relatório de análise)
- teste_humano: aprovado (18/09/2026 — owner acompanhou a prova real em tempo real: credenciais fornecidas por ele, PROVA_OK exibida na conversa com os 4 customers classificados)
- verificacao_automatica: passou
  - build v0.0.118 QA ok
  - recorte 1: 5/5 (401, 403, BLOCKED_ACCESS sem credenciais, lista do que falta, sem valor de credencial na resposta)
  - recorte 2 (prova real CA-2-006): PROVA_OK — 4 customers listados e classificados fora_da_allowlist (429-956, 171-276, 852-277, 785-059 — mascarados), zero mutação, zero segredo
- aprendizado: ok (AP-2026-09-18-1520 — UI do Google Ads prende criação de conta no assistente de campanha com cartão; conta de teste não é criável pela UI web atual; credencial sempre em texto, nunca screenshot)
- pendencia_transferida: conta de teste Google Ads → F2-T07 (caminhos: suporte Google Ads, app mobile, MCC real)
- secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN gravados (17/09)
- ultima_acao: F2-T06 concluída; fechamento commitado (151c554, 3811024)
- proxima_acao: F2-T07 é a próxima elegível, com pendência de conta de teste; aguarda pedido do champion
- atualizado_em: 2026-09-18T15:30:00-03:00
