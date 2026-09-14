# AP-2026-09-14-1130 — Unique index + catch como resposta idempotente em concorrência

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F2-T02 / SPEC-2-003
- Sinal: a proteção de idempotência sob concorrência não é o find prévio (há janela de corrida), e sim o UNIQUE INDEX do banco + catch do erro de constraint devolvendo a tentativa vencedora como resposta idempotente (200, nunca 500). Provado com 5 requests simultâneos → 1 tentativa.
- Evidência: bateria F2-T02 (race test 5 simultâneos, 1 tentativa, nenhum 500); builds v0.0.104–105.
- Regra reutilizável: em toda criação idempotente no PocketBase, além do find prévio, envolver o save em try/catch e, no catch, rebuscar pela chave única e devolver o registro vencedor com a mesma resposta idempotente.
- Quando aplicar: F2-T04/T07 (adaptadores Meta/Google reais), qualquer rota de criação com chave de idempotência.
- Quando não aplicar: operações sem chave única natural (nada a rebuscar no catch).
- Confiança: alta — reproduzido em teste de concorrência real.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
