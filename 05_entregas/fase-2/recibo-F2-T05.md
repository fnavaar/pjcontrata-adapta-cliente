# Recibo — F2-T05: Falha parcial, timeout e reconciliação Meta

- **Data:** 2026-09-16
- **SPEC:** SPEC-2-001 (Meta — publicação controlada)
- **Build:** v0.0.111–v0.0.117 (QA ok em todos os applies)
- **Champion:** Gustavo — Gerente de Marketing
- **Autorização:** owner ("sim" em 16/09/2026, após relatório de análise)

## Escopo entregue

1. **Migration 0013**: campo `remote_id_real` em `remote_object` — guarda o ID real do objeto na Meta para a reconciliação consultá-lo; NUNCA exposto nas respostas (RN-226).
2. **Falha parcial com preservação (RN-205)**: quando o adset falha na Meta, a campaign já criada é persistida com ID real e aparece na resposta como `DESCONHECIDO` — nada se perde.
3. **Credencial expirada (code 190)** → estado `BLOCKED` com erro claro "renovar o token fora do log" — zero falso sucesso (CA-2-005).
4. **Reconciliação REAL**: UNCERTAIN → consulta cada objeto na Meta pelo ID real (todos PAUSED → CONFIRMED_PAUSED; nenhum existe → FAILED_FINAL; parcial → permanece RECOVERY_PENDING para nova reconciliação). PARTIAL_FAILURE → completa o adset faltante REAL na Meta (idempotente) → RECOVERED.
5. **RN-226 reforçado**: eventos e resposta estruturada não carregam mais `remote_id_real` (vazamento corrigido nos builds 116/117).

## Provas (9/9 automatizadas)

| Prova | Resultado |
|---|---|
| CA-2-005: falha parcial REAL (orçamento rejeitado pela Meta) → PARTIAL_FAILURE | PASS |
| RN-205: campaign preservada na resposta (DESCONHECIDO) | PASS |
| CA-2-005: reconciliação → RECOVERED | PASS |
| CA-2-005: adset REAL criado na Meta em PAUSED pela reconciliação (1 único) | PASS |
| RN-226: remote_id_real não exposto (detalhe+eventos) | PASS |
| Reconciliar tentativa confirmada → 400 | PASS |
| Regressão F1: rbac-test | PASS |
| Regressão F1: prévia determinística | PASS |
| Regressão F2-T04: publicação real continua OK | PASS |

## Observações de verificação

- Cenário de falha parcial provocado com orçamento acima do limite da sandbox (R$ 5.550.000/dia) — rejeição REAL da Meta.
- Bug pego e corrigido durante a verificação: transição inválida RECOVERY_PENDING → PARTIAL_FAILURE (v0.0.113/114); vazamento de remote_id_real nos eventos (v0.0.116/117).
- Incidente 503 do Skip Cloud durante o ciclo (v0.0.113) — recuperou sozinho, retry do apply resolveu (padrão conhecido).

## IDs mascarados (sandbox)

- Conta: `act_1585807056675719`
- Objetos da prova: campaign `120330***715` (DESCONHECIDO→confirmada), adset recriado pela reconciliação — PAUSED

## Arquivos alterados

- `pocketbase/migrations/0013_f2t05_remote_id_real.js` — campo remote_id_real
- `pocketbase/hooks/publicacao_nucleo.js` — code 190 → BLOCKED; reconciliação real; preservação RN-205; RN-226 nos eventos

## Aceite humano

- Pendente no momento da emissão deste recibo.
