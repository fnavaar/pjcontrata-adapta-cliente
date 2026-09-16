# Recibo — F2-T04: Publicação Meta pausada, confirmada e idempotente

- **Data:** 2026-09-16
- **SPEC:** SPEC-2-001 (Meta — publicação controlada)
- **Build:** v0.0.110 (QA ok: setup + static + build + integrations + test)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim" em 16/09/2026, após relatório de análise)

## Escopo entregue

1. **Adaptador Meta real** (`adaptadorMetaReal` no `publicacao_nucleo.js`): sem `modo_fake`, a publicação cria objetos **reais** na conta sandbox via Marketing API v21.0 — token lido dos secrets (`META_ACCESS_TOKEN`/`META_SANDBOX_ACCOUNT_ID`), nunca em código/log.
2. **Cadeia aplicável**: campaign + adset (creative/ad exigem Página que a sandbox não tem — limitação documentada da Meta; falha parcial desse tipo é território da F2-T05).
3. **Sempre PAUSED** (RN-203): `status=PAUSED` na criação; `ACTIVE` proibido.
4. **Confirmação por consulta** (SPEC: 2xx não é sucesso): `GET /{id}?fields=status` — `CONFIRMED_PAUSED` só com status confirmado; sem confirmação → `DESCONHECIDO`/`PARTIAL_FAILURE`/`UNCERTAIN`.
5. **Idempotência real** (RN-204): retry da mesma chave devolve a tentativa existente sem recriar nada na Meta.
6. **Parâmetros obrigatórios descobertos no baseline**: `special_ad_categories=[]`, `is_adset_budget_sharing_enabled=false`, `daily_budget` mínimo 1000 centavos (sandbox).

## Provas (12/12 automatizadas)

| Prova | Resultado |
|---|---|
| CA-2-002: comercial bloqueado antes da Meta | PASS |
| CA-2-002: conta fora da allowlist bloqueada | PASS |
| CA-2-003: publicação real → CONFIRMED_PAUSED | PASS |
| CA-2-003: 2 objetos reais (campaign+adset) PAUSED | PASS |
| CA-2-003: IDs remotos mascarados | PASS |
| CA-2-003: campanha REAL existe na Meta em PAUSED (verificada via API) | PASS |
| CA-2-004: retry idempotente (não recria na Meta) | PASS |
| CA-2-004: apenas 1 campanha T-F2T04-REAL na Meta | PASS |
| Trilha real completa (pedido→envio→objetos→confirmação) | PASS |
| Trilha sem segredo | PASS |
| Regressão F1: rbac-test | PASS |
| Regressão F1: prévia determinística | PASS |

## IDs mascarados (sandbox)

- Conta: `act_1585807056675719` (allowlist `ogzfs36ibb8tzbl`, environment teste)
- Objetos reais criados na prova: campaign `120330***415`, adset `120330***615` — PAUSED confirmados
- Campanhas de teste arquivadas na ferramenta (`T-F2T04-*`)

## Arquivos alterados

- `pocketbase/hooks/publicacao_nucleo.js` — adaptador Meta real + seleção fake/real por `modo_fake`.

## Aceite humano

- Pendente no momento da emissão deste recibo.
