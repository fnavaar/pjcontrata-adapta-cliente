# Recibo — F2-T06: Prova de acesso Google (CA-2-006)

- **Data:** 17-18/09/2026
- **SPEC:** SPEC-2-002 (Google Ads — publicação controlada)
- **Build:** v0.0.118 (QA ok)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim, me instrua como conseguir as credenciais do google" em 17/09/2026)

## Escopo entregue

1. **Hook `google_prova.js`** — rota server-side READ-ONLY `POST /backend/v1/google/prova-acesso` (papéis administrador/marketing):
   - sem credenciais nos secrets → `BLOCKED_ACCESS` com a lista do que falta; nenhuma chamada externa (plano B da SPEC);
   - com credenciais → renova access token (OAuth server-side), chama `customers:listAccessibleCustomers` (v25), cruza com a allowlist (`ad_connection` platform=google) e classifica por `environment`; consulta opcional ao customer de teste;
   - credencial expirada (401 OAuth) → `BLOCKED_ACCESS` com "renovar fora do log" — zero falso acesso;
   - header `developer-token` opcional (sunset 09/09/2026 — nível de acesso vem do projeto Cloud);
   - IDs mascarados (`123-456-***`); sanitização `[TOKEN_REMOVIDO]` (RN-226); nenhuma mutação.
2. **Credenciais provisionadas pelo owner (17/09)**: projeto Cloud **agenda-hub** (client OAuth "AgendaHub", tipo Web, redirect oauthplayground); consent screen "Em produção" Externo (aviso de 100 logins até verificação — irrelevante, escopo sensível adwords); refresh token gerado no OAuth Playground (escopo `https://www.googleapis.com/auth/adwords`, "Use your own OAuth credentials"). Regra mantida: credencial NUNCA por screenshot — refresh token veio em texto.
3. **Secrets gravados no Skip (53888)**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`. `GOOGLE_TEST_CUSTOMER_ID`/`GOOGLE_TEST_LOGIN_CUSTOMER_ID` aguardam conta de teste; `GOOGLE_DEVELOPER_TOKEN` opcional.
4. **Prova real executada (CA-2-006)**: `PROVA_OK` na 1ª tentativa — 4 customers acessíveis, classificados `fora_da_allowlist` (429-956-***, 171-276-***, 852-277-***, 785-059-***), IDs mascarados, zero mutação, zero segredo na resposta. A conta real (171-276-***) apareceu na listagem mas fora da allowlist — prova prática de que só publica onde autorizar.

## Provas

| Prova | Resultado |
|---|---|
| 401 sem autenticação | PASS |
| 403 papel sem permissão (aprovador) | PASS |
| `BLOCKED_ACCESS` sem credenciais — sem chamada externa | PASS |
| Lista do que falta correta | PASS |
| Nenhum valor de credencial na resposta | PASS |
| Prova real: `PROVA_OK`, 4 customers classificados, sem mutação | PASS |

## Pendência explícita (transfere para F2-T07)

**Conta de teste Google Ads não criada** — a UI do Google (ads.google.com, set/2026) prende o fluxo "Nova conta" num assistente de campanha que exige forma de pagamento, mesmo com `?test=1`, outra conta Google sem vínculos e URL `sf=mt` (404). Três rascunhos de conta ficaram pendurados (852-277-7243, 785-059-****, 549-***-****) — todos INERTES, sem pagamento confirmado, sem cobrança; não confirmar cartão.

Impacto: CA-2-006 provado no que a API permite sem conta de teste (listagem + classificação + allowlist). A classificação Test/produção de uma conta de teste real e a allowlist `ad_connection` (platform=google) ficam para o início da F2-T07 — caminhos a tentar: suporte Google Ads (MCC de teste via atendimento), conta de gerenciador via app mobile, ou MCC real (que também pode operar contas de teste).

## Mudança de regras do Google (verificada 17/09/2026)

- Developer tokens sunset em 09/09/2026; nível de acesso (Test/Basic/Standard) agora pertence ao projeto Google Cloud que emite as credenciais OAuth.
- Projeto recém-habilitado para a Google Ads API nasce com acesso Test (só contas de teste) — suficiente para a Fase 2.

## Arquivos alterados

- `pocketbase/hooks/google_prova.js` — novo (rota read-only de prova de acesso)

## Aceite humano

- Pendente no momento da emissão deste recibo.
