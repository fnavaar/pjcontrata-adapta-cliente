# Changelog — IA Ferramenta

## 2026-09-25 — F2-T07: publicação REAL na Google Ads provada

- Contas de teste criadas pelo owner: MCC "EngajaPJ Teste" 103-812-9898 + cliente "EngajaPJ Cliente Teste" 2391563500 (testAccount TRUE; status CLOSED é o estado normal de conta de teste na v25).
- Secrets GOOGLE_TEST_CUSTOMER_ID/GOOGLE_TEST_LOGIN_CUSTOMER_ID gravados; allowlist ad_connection google/teste criada (mnm3k9i72kgpnn4).
- Prova de acesso agora mostra o customer de teste completo (239-156-***, BRL, São Paulo) — consulta via GAQL searchStream (GET direto de resource name retorna 404 HTML na v25).
- PUBLICAÇÃO REAL (builds v0.0.120–125): campanha T-F2T07-REAL-FINAL criada NA GOOGLE ADS pela rota do sistema — budget + campaign SEARCH em PAUSED, confirmada por consulta GAQL (CA-2-008).
- Idempotência real (CA-2-009): retry da mesma chave → "nada duplicado"; 1 única campanha na conta de teste, provado via GAQL.
- Descobertas v25: containsEuPoliticalAdvertising é OBRIGATÓRIO (FieldError.REQUIRED sem ele; UNDECLARED/UNSPECIFIED inválidos — usar DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING); mutate combinado budget+campaign com resource names temporários (-1/-2) é atômico; REST devolve camelCase (resourceName); BudgetStatus "NORMAL" não existe no enum.
- RN-226 verificado: nenhum segredo/remote_id_real nas respostas.
- Pendência restante da task: aceite humano da publicação real (o owner já aprovou o bloqueio em 22/09).

## 2026-09-22 — F2-T07 concluída (parte 1: gates e adaptador)

- F2-T07: publicação Google pausada, confirmada e idempotente (build v0.0.119).
- Hook publicacao_google.js (adaptador isolado por plataforma, reusa coleções F2-T01): POST /backend/v1/publicacoes-google + reconciliar.
- Gates server-side (CA-2-007/RN-211/212): papel, aprovação, APPROVED, checklist READY, snapshot, plataforma google, allowlist, environment teste — todos ANTES da API.
- Credencial expirada (401/403) → BLOCKED (RN-222); timeout → UNCERTAIN (RN-223).
- Idempotência `pubg:` prefix; reconciliação completa campaign faltante → RECOVERED.
- Verificação: 8/9 (falha externa: Meta 500 transitório is_transient na sandbox — token válido, núcleo Meta intocado).
- Modelo Google da F1 ativado (estava inativo; aplicar-modelo valida plataforma E objetivo — campanha google precisa objective 'leads').
- Teste humano aprovado pelo owner (22/09/2026, 08:19): campanha Google válida → BLOCKED limpo antes da API, zero tentativa fantasma, repetição consistente.
- Aprendizado AP-2026-09-22-0822: adaptador por plataforma em hook próprio reusando o núcleo; ausência de conta de teste não bloqueia implementação (gates bloqueiam antes da API; caminho real pronto sem novo deploy).
- Fase 2: 7/9 (78%).

## 2026-09-21/22 — F2-T06 concluída

- F2-T06: prova de acesso Google (CA-2-006) — build v0.0.118.
- Hook google_prova.js: rota server-side READ-ONLY /backend/v1/google/prova-acesso — sem credenciais → BLOCKED_ACCESS com lista do que falta (nenhuma chamada externa); com credenciais → renova access token, chama customers:listAccessibleCustomers (v25), cruza com allowlist e classifica; credencial expirada → BLOCKED_ACCESS "renovar fora do log"; IDs mascarados; RN-226; nenhuma mutação.
- Credenciais OAuth provisionadas pelo owner (projeto Cloud agenda-hub): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN nos secrets do Skip. Developer token opcional (sunset 09/09/2026 — nível de acesso vem do projeto Cloud).
- Prova real: PROVA_OK na 1ª tentativa — 4 customers acessíveis classificados fora_da_allowlist (429-956, 171-276, 852-277, 785-059 — mascarados), zero mutação, zero segredo na resposta.
- Pendência transferida para F2-T07: conta de teste Google Ads — a UI do Google prende o fluxo de criação num assistente de campanha que exige forma de pagamento; 3 rascunhos de conta inertes sem cobrança; não confirmar cartão.
- Recibo 05_entregas/fase-2/recibo-F2-T06.md.
- Fase 2: 6/9 (67%).

## 2026-09-22 — F2-T07 concluída (parte 1)

- Fase 2: 7/9 (78%). Próxima elegível: F2-T08.

## Histórico anterior (14/09–17/09)

- F2-T01 concluída (14/09): núcleo transversal de publicação (v0.0.100–103, 23/23 testes).
- F2-T02 concluída (14/09): idempotência, log append-only e recibos (v0.0.104–105, 15/15).
- F2-T03 concluída (16/09): prova de acesso Meta (sandbox act_1585807056675719, token nos secrets, allowlist).
- F2-T04 concluída (16/09): publicação Meta real (v0.0.110, 12/12 testes).
- F2-T05 implementada e concluída (16–17/09, v0.0.111–117): falha parcial com preservação RN-205, credencial expirada → BLOCKED, reconciliação REAL via remote_id_real; 9/9 testes; aceite do owner após demo ao vivo (falha real + recuperação real com adset verificado na Meta).
- F2-T06 concluída (18/09): prova de acesso Google (v0.0.118, 6/6 testes; PROVA_OK com credenciais OAuth reais do projeto agenda-hub).
