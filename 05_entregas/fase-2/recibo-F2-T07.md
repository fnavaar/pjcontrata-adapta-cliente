# Recibo — F2-T07: Publicação Google pausada, confirmada e idempotente (CA-2-007..009)

- **Data:** 21/09/2026
- **SPEC:** SPEC-2-002 (Google Ads — publicação controlada)
- **Build:** v0.0.119 (QA ok)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim" em 21/09/2026, após relatório de análise)

## Escopo entregue

**Hook novo `publicacao_google.js`** (adaptador isolado por plataforma, reusando as coleções da F2-T01 — mesma máquina de estados e trilha append-only):

1. **`POST /backend/v1/publicacoes-google`** — tentativa idempotente (chave `pubg:campaign:snapshot:approval:google:customer`) + adaptador Google REAL (Marketing API v25 REST):
   - renova access token (OAuth server-side, secrets — nunca em código/log);
   - cria **campaignBudget** (amountMicros da config F1, status NORMAL) e depois **campaign** (SEARCH, **status PAUSED** — RN-213; ACTIVE proibido — RN-203);
   - **confirmação por consulta** (GET da campaign) antes de CONFIRMED_PAUSED — 2xx isolado não é sucesso;
   - credencial expirada (401/403) → **BLOCKED** com "renovar fora do log" (RN-222) — zero falso sucesso;
   - timeout de transporte → **UNCERTAIN** (RN-223 — consultar antes de retry);
   - budget criado + campaign falha → **PARTIAL_FAILURE com budget preservado** (par mascarado/real — AP-2026-09-17-0835).
2. **`POST /backend/v1/publicacoes-google/{id}/reconciliar`** — recuperação real: confirma/recupera budget, completa a campaign faltante (idempotente), confirma PAUSED na Google Ads → RECOVERED.
3. **Gates server-side completos (CA-2-007/RN-211/212)**: papel (admin/marketing), aprovação vigente, estado APPROVED, checklist READY, snapshot, plataforma google, allowlist (`ad_connection` platform=google), environment teste, não revogada — **todos bloqueiam ANTES de qualquer chamada à API**.
4. **Sem conta de teste na allowlist**, toda tentativa real cai em `BLOCKED` ("Conta não está na allowlist para google") antes da API — comportamento correto da SPEC (zero falso sucesso). O caminho real (budget+campaign+consulta+reconciliação) está codado e exercita **sem novo deploy** quando a conta de teste for cadastrada na allowlist.

## Provas (8/9 PASS; 1 falha externa documentada)

| Prova | Resultado |
|---|---|
| 401 sem autenticação | PASS |
| 403 papel sem permissão (aprovador) | PASS |
| Rota google rejeita campanha meta | PASS |
| Sem aprovação → 400 (antes da API) | PASS |
| Fora da allowlist google → 400 ANTES da API (RN-212) | PASS |
| Repetição de pedido bloqueado → 400 consistente (sem tentativa fantasma) | PASS |
| RN-226: nenhum segredo na resposta | PASS |
| Regressão: reconciliar Meta (gate 400 em confirmada) | PASS |
| Regressão: publicação Meta real | **FALHA EXTERNA** — Meta retornando HTTP 500 transitório (`is_transient: true, code: 2`) na criação de campaigns na sandbox; token válido (GET /me OK); diagnosticado chamando a Meta DIRETO fora do app — mesmo erro. O núcleo Meta não foi tocado nesta task (hook intocado, marcadores v0.0.117 verificados no deploy). |

## Observações de verificação

- Modelo Google da F1 ("Modelo Google - Search Leads") estava inativo — ativado pelo admin para os testes (objetivo `leads`, campos parametrizáveis: orçamento/moeda/público/URL).
- O hook `aplicar-modelo` valida plataforma E objetivo do modelo — campanha google precisa nascer com objetivo compatível.
- Erro 500 transitório da Meta documentado com fbtrace_id para auditoria; não é regressão desta task.

## Pendência (herdada da F2-T06)

Conta de teste Google Ads na allowlist — quando existir: gravar `GOOGLE_TEST_CUSTOMER_ID`/`GOOGLE_TEST_LOGIN_CUSTOMER_ID` nos secrets + criar `ad_connection` (platform=google, environment=teste) → a mesma rota executa a publicação real (CA-2-008/009) sem novo deploy.

## Arquivos alterados

- `pocketbase/hooks/publicacao_google.js` — novo (publicar + reconciliar, adaptador Google real)
- Modelo Google ativado (dados, não código)

## Aceite humano

- Pendente no momento da emissão deste recibo.
