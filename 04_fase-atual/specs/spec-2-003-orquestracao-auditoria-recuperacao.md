# SPEC-2-003 — Orquestração, auditoria e recuperação da publicação

**Fase:** 2  
**Status:** planejada  
**Dono:** Gustavo (champion) + executor autorizado  
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01/02  
**Degrau:** construção mínima — camada transversal sobre os adaptadores Meta/Google, sem lógica de plataforma duplicada.

## Contexto e decisões fechadas

- **Atual:** F1 registra aprovação/checklist/prévia; adaptadores F2 serão isolados por plataforma.
- **Desejado:** uma tentativa de publicação possui estado confiável, idempotência, auditoria, reconciliação e ação de recuperação sem confundir aprovação, prontidão e estado remoto.
- **Fechado:** somente aprovação vigente + READY + papel publicador + conta permitida; nenhuma ativação/gasto; logs sem segredos; recibos versionados no handoff.
- **Bloqueios:** esta SPEC pode construir o núcleo com adaptador fake; prova ponta a ponta depende de ao menos um conector com acesso de teste aprovado.

## Resultado observável

O operador acompanha cada tentativa do pedido ao estado remoto, distingue sucesso, bloqueio, falha parcial e estado incerto, e pode reconciliar/pausar com trilha completa sem duplicar recursos.

## Limites e dependências

- **Inclui:** modelo de conexão/allowlist/tentativa/objetos remotos/eventos; máquina de estados; idempotência; fila/retry; auditoria; reconciliação; recibo por task.
- **Fora:** ativar campanha, automatizar decisão/orçamento, substituir F1, métricas/insights da F3.
- **Entradas:** snapshot_version imutável, approval_version vigente, checklist READY, platform, account allowlisted, operator.
- **Saídas:** tentativa e eventos append-only, hash, IDs, estado confirmado, erro sanitizado, ação recomendada.
- **Superfícies:** backend server-side, detalhe/prévia da campanha e histórico; arquivos concretos devem ser inventariados no projeto Skip antes da primeira alteração.
- **Rollback:** feature flag por conector; desabilitar nova publicação preservando histórico; pausa/compensação somente confirmada pela plataforma.

## Modelo mínimo

| Entidade | Campos obrigatórios |
|---|---|
| ad_connection | platform, account_ref mascarada, environment, enabled, secret_ref, granted_by, granted_at, revoked_at |
| publication_attempt | id, idempotency_key, campaign_id, snapshot_version, approval_version, platform, account_ref, operator, state, payload_hash, created_at, updated_at |
| remote_object | attempt_id, object_type, remote_id/resource_name mascarado, requested_state, confirmed_state, confirmed_at |
| publication_event | attempt_id, sequence, event_type, actor, timestamp, request_correlation, response_code, sanitized_detail |

Estados: `REQUESTED`, `BLOCKED`, `SENDING`, `PARTIAL_FAILURE`, `UNCERTAIN`, `CONFIRMED_PAUSED`, `RECOVERY_PENDING`, `RECOVERED`, `FAILED_FINAL`. `ACTIVE` não é estado permitido nesta fase sem emenda/autorização específica.

| Regra | Condição | Resultado |
|---|---|---|
| RN-221 | aprovação/snapshot mudou após pedido | bloquear/inutilizar tentativa antes do envio |
| RN-222 | segredo revogado/expirado | bloquear e não revelar valor |
| RN-223 | timeout após envio | `UNCERTAIN`; consultar antes de retry |
| RN-224 | objeto remoto confirmado | anexar ID/estado e evento append-only |
| RN-225 | recuperação solicitada | apenas administrador/publicador autorizado; confirmar resultado remoto |
| RN-226 | log/recibo | sanitizar token, PII e payload sensível; preservar hash/correlação |

## Fluxo e erros

1. Criar pedido idempotente a partir da prévia F1.
2. Revalidar tudo server-side no instante do envio.
3. Travar concorrência por chave/versão e encaminhar ao adaptador.
4. Persistir evento antes/depois de cada efeito remoto confirmado.
5. Consultar estado; distinguir parcial/incerto de confirmado.
6. Executar reconciliação; pausa/compensação só se suportada.
7. Produzir recibo versionado e solicitar teste humano.

| Cenário | Resultado | Recuperação |
|---|---|---|
| Duplo clique/retry | uma tentativa e um conjunto remoto | devolver estado existente |
| Mudança material | pedido antigo bloqueado | nova aprovação + nova chave |
| Timeout | `UNCERTAIN` | consulta antes de retry |
| Falha parcial | IDs + passos faltantes visíveis | compensar ou completar por decisão humana |
| Segredo no erro | removido antes de persistir/exibir | alerta de segurança e rotação |

## Instruções ao Ethos

1. Inventariar hooks/migrations/UI reais antes de editar e anexar o inventário ao recibo.
2. Implementar modelo/máquina de estados com adaptador fake antes das APIs.
3. Revalidar RBAC, aprovação e checklist no servidor; frontend nunca é autoridade.
4. Não persistir token bruto; usar secret manager/secret_ref.
5. Não tratar HTTP 2xx isolado como sucesso: confirmar objetos/estado.
6. Parar após cada task para provas e teste humano; uma task por vez.

## Critérios de aceite

- [ ] **CA-2-011:** validação server-side bloqueia papel, conta, aprovação, READY ou snapshot inválidos.
- [ ] **CA-2-012:** mesma idempotency key produz uma tentativa e não repete efeito remoto.
- [ ] **CA-2-013:** eventos append-only permitem reconstruir operador, payload hash, objetos, resposta e estado sem segredo.
- [ ] **CA-2-014:** timeout/parcial viram `UNCERTAIN`/`PARTIAL_FAILURE` e exigem reconciliação antes de retry.
- [ ] **CA-2-015:** pausa/compensação registra pedido, resposta e confirmação; falha permanece visível.
- [ ] **CA-2-016:** feature flag/revogação interrompe novas publicações sem apagar histórico nem quebrar F1.
- [ ] **CA-2-017:** cada task gera recibo no handoff com build, provas, IDs mascarados e aceite humano.

## TDD da SPEC

| Etapa | Prova | Ação | Esperado | Evidência |
|---|---|---|---|---|
| RED | concorrência, mudança material, timeout, parcial, segredo em erro | adaptador fake determinístico | testes falham antes do núcleo | recibo RED |
| GREEN | pedido válido | enviar fake/real de teste e confirmar pausado | estado/eventos/IDs corretos | log sanitizado + UI |
| REGRESSÃO | replay, revogação, recuperação e RBAC F1 | suíte transversal | sem duplicidade/segredo/regressão | relatório + teste humano |

**Fixtures:** adaptador fake para bordas; contas de teste para integração.  
**Evidência:** testes, eventos exportados sem segredo, captura do histórico e recibo de aceite.

## Tasks vinculadas

| ID | Task | Dono | Critério | Recorte da prova | Evidência | Pré-condições | Status |
|---|---|---|---|---|---|---|---|
| F2-T01 | Contrato transversal e estados | Executor | CA-2-011,016 | validação/flag/revogação | testes + inventário | F1 selada | Elegível |
| F2-T02 | Idempotência, log e recibos | Executor | CA-2-012,013,017 | replay/append-only/scan | suíte + recibo | F2-T01 | Bloqueada |
| F2-T09 | Painel e recuperação assistida | Executor | CA-2-014,015 | parcial/incerto/compensação | painel + eventos | um conector testável | Bloqueada |

## Emendas

| Data | Origem | Micro-spec/task | Motivo |
|---|---|---|---|
