# AP-2026-09-14-0905 — Zero-date do PocketBase é truthy em checks de campo date

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F2-T01 / SPEC-2-003
- Sinal: campo date vazio do PocketBase pode retornar '0001-01-01 00:00:00.000Z' (zero date), que é TRUTHY em JS; um check `if (record.get('campo_date'))` trata "sem data" como "com data" e bloqueia indevidamente (ocorreu no check de revogação de ad_connection).
- Evidência: build v0.0.101 bloqueava conexões válidas com "Conexão revogada"; corrigido em v0.0.102 tratando explicitamente '' e '0001-01-01' como vazio; bateria 23/23 após o fix.
- Regra reutilizável: em hooks JSVM do PocketBase, nunca confiar em truthiness de campo date opcional — normalizar com String(v || '') e tratar '' e prefixo '0001-01-01' como ausente antes de qualquer decisão.
- Quando aplicar: qualquer hook/rota que leia campo date opcional (revoked_at, confirmed_at, deleted_at, datas de invalidação).
- Quando não aplicar: campos date obrigatórios (required no schema) sempre têm valor real.
- Confiança: alta — reproduzido e corrigido com bateria de regressão passando.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
