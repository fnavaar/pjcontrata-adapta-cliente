# Estado atual — Adapta Cliente

- task_id: F2-T06
- champion: Gustavo - Gerente de Marketing
- spec: 04_fase-atual/specs/spec-2-002-google-publicacao-controlada.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada (17/09/2026 09:41 — "sim, me instrua como conseguir as credenciais do google" após relatório de análise)
- teste_humano: pendente
- verificacao_automatica: passou
  - build v0.0.118 QA ok
  - recorte 1: 5/5 (401, 403, BLOCKED_ACCESS sem credenciais, lista do que falta, sem valor de credencial na resposta)
  - recorte 2 (prova real CA-2-006, 17/09 ~12:20): PROVA_OK — credenciais OAuth válidas (client agenda-hub + refresh token), 4 customers acessíveis listados e classificados contra allowlist (429-956-***, 171-276-***, 852-277-***, 785-059-*** — todos fora_da_allowlist, correto pois nenhuma conta Google foi cadastrada ainda); IDs mascarados; nenhuma mutação
- aprendizado: pendente
- pendencia: conta de teste Google Ads ainda não existe — 852-277-7243 nasceu de fluxo errado (assistente de campanha fora do MCC de teste, pediu cartão; NÃO confirmar pagamento); caminho correto: ads.google.com/um/Welcome/Home?test=1 → Nova conta → conta de GERENCIADOR (MCC de teste) → dentro dela criar conta cliente de teste; allowlist (ad_connection google) só após conta de teste criada
- secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN gravados (17/09); GOOGLE_TEST_CUSTOMER_ID/GOOGLE_TEST_LOGIN_CUSTOMER_ID aguardam conta de teste; GOOGLE_DEVELOPER_TOKEN opcional (sunset 09/09/2026 — nível de acesso vem do projeto Cloud)
- ultima_acao: prova de acesso real executada — CA-2-006 parcialmente provada (listagem/classificação OK; classificação Test/produção completa exige conta de teste na allowlist)
- proxima_acao: teste humano do Tarcísio; depois criar conta de teste (MCC teste) para fechar CA-2-006 e destravar F2-T07
- atualizado_em: 2026-09-17T12:25:00-03:00
