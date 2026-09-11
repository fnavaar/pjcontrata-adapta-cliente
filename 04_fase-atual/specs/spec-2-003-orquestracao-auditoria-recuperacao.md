# SPEC-2-003 — Orquestração, auditoria e recuperação da publicação

**Fase:** 2
**Status:** planejada
**Dono:** Gustavo (champion) + executor autorizado
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01/02
**Degrau:** construção mínima — camada transversal sobre adaptadores Meta/Google.

## Contexto e decisões fechadas
- **Atual:** F1 registra aprovação/checklist/prévia.
- **Desejado:** tentativa com estado confiável, idempotência, auditoria e recuperação.
- **Fechado:** approval vigente + READY + publicador + conta permitida; sem ativação/gasto; logs sem segredos; recibos por task.
- **Bloqueios:** núcleo usa adaptador fake; prova ponta a ponta depende de conector de teste.

## Resultado observável
Operador acompanha pedido ao estado remoto, distingue sucesso, bloqueio, parcial e incerto, e reconcilia sem duplicar recursos.

## Limites e dependências
- **Inclui:** conexão/allowlist/tentativa/objetos/eventos, estados, idempotência, fila, auditoria, reconciliação e recibo.
- **Fora:** ativar, decidir orçamento, substituir F1, métricas da F3.
- **Entradas:** snapshot_version, approval_version, READY, platform, account allowlisted e operator.
- **Rollback:** feature flag por conector; desabilitar novas publicações preservando histórico.

## Modelo mínimo
| Entidade | Campos obrigatórios |
|---|---|
| ad_connection | platform, account_ref mascarada, environment, enabled, secret_ref, grant/revocation |
| publication_attempt | id, idempotency_key, campaign/snapshot/approval, platform/account/operator, state, payload_hash, timestamps |
| remote_object | attempt, type, remote ref mascarada, requested/confirmed state |
| publication_event | attempt, sequence, event, actor, timestamp, correlation, response code, sanitized detail |

Estados: `REQUESTED`, `BLOCKED`, `SENDING`, `PARTIAL_FAILURE`, `UNCERTAIN`, `CONFIRMED_PAUSED`, `RECOVERY_PENDING`, `RECOVERED`, `FAILED_FINAL`. `ACTIVE` é proibido sem emenda/autorização.

| Regra | Condição | Resultado |
|---|---|---|
| RN-221 | approval/snapshot mudou | bloquear antes do envio |
| RN-222 | segredo revogado/expirado | bloquear sem revelar valor |
| RN-223 | timeout após envio | `UNCERTAIN`; consultar antes de retry |
| RN-224 | objeto confirmado | anexar ref/estado e evento |
| RN-225 | recuperação | somente papel autorizado; confirmar resultado |
| RN-226 | log/recibo | sanitizar segredo/PII; preservar hash/correlação |

## Fluxo e erros
1. Criar pedido idempotente da prévia F1.
2. Revalidar server-side.
3. Travar concorrência e encaminhar ao adaptador.
4. Persistir eventos dos efeitos confirmados.
5. Consultar estado e distinguir parcial/incerto.
6. Reconciliar/compensar somente quando suportado.
7. Produzir recibo e pedir teste humano.

## Instruções ao Ethos
1. Inventariar hooks/migrations/UI antes de editar.
2. Implementar estados com adaptador fake antes das APIs.
3. RBAC/aprovação/checklist validados no servidor.
4. Nunca persistir token bruto.
5. HTTP 2xx não é sucesso sem confirmação.
6. Uma task por vez e teste humano.

## Critérios de aceite
- [ ] **CA-2-011:** validação server-side bloqueia papel, conta, approval, READY ou snapshot inválidos.
- [ ] **CA-2-012:** mesma idempotency key produz uma tentativa e um efeito.
- [ ] **CA-2-013:** eventos append-only reconstroem operação sem segredo.
- [ ] **CA-2-014:** timeout/parcial exige reconciliação antes de retry.
- [ ] **CA-2-015:** compensação registra pedido, resposta e confirmação; falha permanece visível.
- [ ] **CA-2-016:** feature flag/revogação bloqueia novas publicações sem apagar histórico/quebrar F1.
- [ ] **CA-2-017:** cada task gera recibo com build, provas, refs mascaradas e aceite humano.

## TDD da SPEC
| Etapa | Prova | Esperado | Evidência |
|---|---|---|---|
| RED | concorrência, mudança, timeout, parcial, segredo | falhas antes do núcleo | recibo RED |
| GREEN | pedido válido | estados/eventos/refs corretos | log sanitizado + UI |
| REGRESSÃO | replay, revogação, recuperação, RBAC F1 | sem duplicidade/segredo/regressão | relatório + teste humano |

**Fixtures:** adaptador fake e contas de teste.

## Tasks vinculadas
| ID | Task | Critério | Pré-condições | Status |
|---|---|---|---|---|
| F2-T01 | Contrato transversal e estados | CA-2-011,016 | F1 selada | Elegível |
| F2-T02 | Idempotência, log e recibos | CA-2-012,013,017 | F2-T01 | Bloqueada |
| F2-T09 | Painel e recuperação assistida | CA-2-014,015 | um conector testável | Bloqueada |
