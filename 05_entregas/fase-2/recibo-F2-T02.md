# Recibo — F2-T02: Idempotência, log append-only sanitizado e recibos

- **Data:** 2026-09-14
- **SPEC:** SPEC-2-003 (orquestração, auditoria e recuperação)
- **Build:** v0.0.104–v0.0.105 (QA ok: setup + static + build + integrations + test)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim" em 14/09/2026, após relatório de análise)

## Escopo entregue

1. **CA-2-012 — idempotência completa**: resposta idempotente distingue estados terminais (`em_progresso=false`) de estados intermediários (`em_progresso=true` — "consulte em instantes"); concorrência coberta por catch de unique constraint que devolve a tentativa vencedora (nunca erro 500).
2. **CA-2-013 — reconstrução pela trilha**: `PEDIDO_CRIADO` persiste `payload_hash=sha256:...`; eventos terminais (`ESTADO_CONFIRMADO`, `FALHA_PARCIAL`, `TIMEOUT`, `ERRO_FINAL`) persistem resposta estruturada (estado + objetos + erro sanitizado). Trilha permanece append-only e sem segredos (RN-226).
3. **CA-2-017 — recibo versionado**: este documento institui o padrão de recibo por task em `05_entregas/fase-2/`.

## Provas (15/15 automatizadas)

| Prova | Resultado |
|---|---|
| Caminho feliz → CONFIRMED_PAUSED | PASS |
| Criação inclui payload_hash (recibo) | PASS |
| Retry pós-terminal → idempotente, em_progresso=false, payload_hash | PASS |
| PEDIDO_CRIADO com payload_hash na trilha | PASS |
| ESTADO_CONFIRMADO com resposta estruturada na trilha | PASS |
| Trilha sem segredo (EAAC/ya29) | PASS |
| 5 requests simultâneos → 1 única tentativa | PASS |
| Nenhum 500 na concorrência | PASS |
| Retry pós-concorrência → estado final | PASS |
| erro_final sanitizado na resposta (RN-226) | PASS |
| Evento de erro sem token real (RN-226) | PASS |
| Regressão F2-T01: parcial → PARTIAL_FAILURE | PASS |
| Regressão F2-T01: reconciliação → RECOVERED | PASS |
| Regressão F1: rbac-test | PASS |
| Regressão F1: prévia determinística | PASS |

## IDs mascarados (conta de teste)

- Conexão de teste: `ACT-TESTE-001` (meta, environment teste)
- IDs remotos do adaptador fake: mascarados (`FAK***NNN`)
- Tentativas de teste arquivadas com as campanhas `T-F2T02-*`

## Arquivos alterados

- `pocketbase/hooks/publicacao_nucleo.js` — resposta idempotente com `em_progresso` + `payload_hash`; catch de concorrência; eventos com hash e resposta estruturada.

## Aceite humano

- Pendente no momento da emissão deste recibo.
