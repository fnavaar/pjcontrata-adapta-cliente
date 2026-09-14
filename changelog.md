# Changelog — IA Ferramenta

## 2026-09-09

- Certificação dos 4 níveis de conta via API (22 testes): encontrados 2 bugs reais — aprovador não decidia campanha alheia e `REJECTED` não era estado válido. Correção v0.0.65/v0.0.66; recertificação 15/15. Regressão humana aprovada por Navaar em 11/09/2026.

## 2026-09-04

- F1-T09 concluída: prévia determinística, prova de não integração e teste humano aprovado. **Fase 1 100% (9/9).**

## 2026-09-11 — Fase 2 liberada

- Fase 2 publicada com 3 SPECs e F2-T01..F2-T09.
- F2-T01 é a única task elegível; F2-T02..F2-T09 mantêm dependências e gates de acesso.
- Fase 1 arquivada em `05_entregas/fase-1/`; unidade legada removida da raiz ativa.
- Nenhuma implementação, credencial, conta produtiva, ativação ou gasto autorizado.

## 2026-09-14 — F2-T01 concluída

- F2-T01 concluída: núcleo transversal de publicação com adaptador fake (builds v0.0.100–v0.0.103).
- Migration 0012: ad_connection, publication_attempt, remote_object, publication_event (append-only, sem delete).
- Hook publicacao_nucleo.js: 4 rotas server-side (criar tentativa idempotente, detalhe, reconciliar, revogar/reativar conexão).
- Máquina de 9 estados implementada; ACTIVE proibido (RN-203); segredos nunca persistidos (secret_ref; RN-226 sanitiza tokens em erros).
- Verificação automatizada: 23/23 (CA-2-011 RBAC, CA-2-012 idempotência, CA-2-013 auditoria sem segredo, CA-2-014 parcial/timeout→reconciliação, CA-2-016 revogação/reativação, RN-226 sanitização; regressão F1 3/3).
- Bugs corrigidos durante verificação: zero-date do PocketBase em revoked_at era truthy; resposta do adaptador sem estados dos objetos.
- Teste humano aprovado pelo owner (14/09/2026): publicação da campanha T-F2-PUB2 confirmada em CONFIRMED_PAUSED com 4 objetos PAUSED e trilha de auditoria visível.
