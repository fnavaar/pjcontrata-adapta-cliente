# Recibo — F2-T06 (recorte 1): rota read-only de prova de acesso Google

- **Data:** 2026-09-17
- **SPEC:** SPEC-2-002 (Google Ads — publicação controlada)
- **Build:** v0.0.118 (QA ok)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim, me instrua como conseguir as credenciais do google" em 17/09/2026)

## Escopo autorizado e entregue

Plano B da SPEC (acesso indisponível → validação do contrato + `BLOCKED_ACCESS`, sem fallback fictício):

- **Hook `google_prova.js`** — rota server-side READ-ONLY `POST /backend/v1/google/prova-acesso` (papéis administrador/marketing):
  - sem credenciais nos secrets → `BLOCKED_ACCESS` com a lista do que falta; **nenhuma chamada externa é feita**;
  - com credenciais → renova access token (OAuth server-side), chama `customers:listAccessibleCustomers` (v25), cruza com a allowlist (`ad_connection` platform=google) e classifica Test/produção por `environment`; consulta opcional ao customer de teste (nome, moeda, fuso, status);
  - credencial expirada/inválida (401 do OAuth) → `BLOCKED_ACCESS` com "renovar fora do log" — zero falso acesso;
  - header `developer-token` enviado apenas se o secret existir (tokens foram sunset em 09/09/2026 — header opcional/ignorado; nível de acesso vem do projeto Cloud);
  - IDs mascarados (`123-456-***`); sanitização `[TOKEN_REMOVIDO]` (RN-226); NENHUMA mutação (read-only).

## Provas (5/5 automatizadas)

| Prova | Resultado |
|---|---|
| 401 sem autenticação | PASS |
| 403 papel sem permissão (aprovador) | PASS |
| `BLOCKED_ACCESS` sem credenciais (admin) — sem chamada externa | PASS |
| Lista do que falta correta (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) | PASS |
| `BLOCKED_ACCESS` (marketing) + nenhum valor de credencial na resposta | PASS |

Nota: o nome da chave ausente (ex.: `GOOGLE_CLIENT_SECRET`) aparece na lista `faltando` de propósito — é o que o operador precisa fornecer; nenhum VALOR de credencial é exposto.

## Estado da prova de acesso (CA-2-006)

- **Bloqueada por credenciais** — faltam ao owner: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (obrigatórios), `GOOGLE_TEST_CUSTOMER_ID` / `GOOGLE_TEST_LOGIN_CUSTOMER_ID` (conta de teste), `GOOGLE_DEVELOPER_TOKEN` (opcional pós-sunset).
- Quando as credenciais forem gravadas nos secrets do Skip, a mesma rota executa a prova real (CA-2-006) sem novo deploy.

## Mudança de regras do Google (verificada 17/09/2026)

- Developer tokens foram **sunset em 09/09/2026**; o nível de acesso (Test/Basic/Standard) agora pertence ao **projeto Google Cloud** que emite as credenciais OAuth.
- Projeto Cloud recém-habilitado para a Google Ads API nasce com **Test access** → só opera em contas de teste (perfeito para esta fase).
- Contas de teste são criadas a partir de um **test manager account** (MCC de teste).

## Arquivos alterados

- `pocketbase/hooks/google_prova.js` — novo (rota read-only de prova de acesso)

## Aceite humano

- Pendente no momento da emissão deste recibo.
