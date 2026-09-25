# Recibo — F2-T07 (parte 2): Publicação REAL na Google Ads (CA-2-008/009)

- **Data:** 25/09/2026
- **SPEC:** SPEC-2-002 (Google Ads — publicação controlada)
- **Build:** v0.0.120–v0.0.125 (QA ok em todos os applies)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("tente novamente" em 25/09/2026, retomando a publicação real)

## O que destravou

- **Contas de teste criadas pelo owner** (25/09): MCC "EngajaPJ Teste" 103-812-9898 (URL correta: ads.google.com/aw/signup/manager com selo "Conta de teste") + cliente "EngajaPJ Cliente Teste" 2391563500.
- **Status CLOSED é o estado NORMAL de conta de teste** (doc v25: "Test account will also have CLOSED status") — não é erro.
- Secrets `GOOGLE_TEST_CUSTOMER_ID` (2391563500) e `GOOGLE_TEST_LOGIN_CUSTOMER_ID` (1038129898) gravados; allowlist `ad_connection` google/teste criada (mnm3k9i72kgpnn4, granted_by admin).

## Provas

| Prova | Resultado |
|---|---|
| Prova de acesso mostra o customer de teste completo (239-156-***, BRL, São Paulo, test_account true) | PASS |
| **CA-2-008: publicação real** — campanha T-F2T07-REAL-FINAL criada NA GOOGLE ADS pela rota do sistema: budget + campaign SEARCH, **status PAUSED confirmado por consulta GAQL** | PASS |
| **CA-2-009: idempotência real** — retry da mesma chave → "nada duplicado"; 1 única campanha com o nome na conta de teste, provado via GAQL | PASS |
| RN-226: nenhum segredo/remote_id_real nas respostas e trilha | PASS |
| Trilha append-only: PEDIDO_CRIADO → ENVIO_INICIADO → ESTADO_CONFIRMADO | PASS |
| Gates server-side (401/403/allowlist/aprovação/READY) | PASS (8/9 da bateria anterior; 1 falha externa Meta 500 transitória documentada) |

## Descobertas técnicas Google Ads API v25 (evidência AP-2026-09-25-1445)

1. **`containsEuPoliticalAdvertising` é OBRIGATÓRIO** na criação de campaign (FieldError.REQUIRED sem ele); `UNDECLARED`/`UNSPECIFIED` são inválidos — usar `DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING`.
2. **Mutate combinado atômico**: budget + campaign num único `googleAds:mutate` com resource names temporários (`campaigns/-1` referenciando `campaignBudgets/-2`) — padrão oficial "Mutate Best Practices"; falha no request inteiro = nada criado (zero objeto órfão).
3. **Consultas são via GAQL searchStream** — GET direto de resource name retorna 404 HTML.
4. **REST v25 devolve camelCase** (`resourceName`) — aceitar `resource_name` OU `resourceName`.
5. **BudgetStatus "NORMAL" não existe** no enum v25 (default UNSPECIFIED é o correto).
6. Conta de teste rejeita enhancedCpc (OPERATION_NOT_PERMITTED_FOR_CONTEXT) e maximize* (CONVERSION_TRACKING_NOT_ENABLED) — `manualCpc {enhancedCpcEnabled: false}` é o caminho.

## IDs mascarados

- MCC de teste: `103-812-***` · Conta cliente de teste: `239-156-***`
- Publicação real: budget `customers/239-156-***/campaignBudgets/15897070493` (NORMAL) + campaign `customers/239-156-***/campaigns/2428***` (PAUSED, id real 24289350920)
- Diagnóstico (fora do sistema): DIAG-M9 24283944699 PAUSED

## Arquivos alterados

- `pocketbase/hooks/publicacao_google.js` — mutate combinado + EU declaration + GAQL
- `pocketbase/hooks/google_prova.js` — consulta do customer de teste via GAQL
- `pocketbase/migrations/0014_f2t07_google_object_types.js` — object_type += campaign_budget; states += NORMAL
- Modelo Google da F1 ativado (dados)

## Aceite humano

- Bloqueio limpo aprovado pelo owner (22/09/2026, 08:19).
- Publicação real executada em 25/09/2026 — aceite humano pendente no momento da emissão deste recibo.
