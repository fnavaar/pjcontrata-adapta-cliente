# SPEC-2-001 — Conector e publicação controlada Meta Ads

**Fase:** 2
**Status:** planejada; execução bloqueada até prova de acesso
**Dono:** Gustavo (champion) + executor autorizado
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01
**Degrau:** dependência existente — Marketing API oficial, isolada atrás de adaptador server-side.

## Contexto e decisões fechadas
- **Atual:** F1 produz campanha aprovada, checklist e snapshot, sem integração externa.
- **Desejado:** publicar configuração aprovada em conta Meta autorizada, inicialmente `PAUSED`, guardar IDs/resposta e consultar estado real.
- **Fechado:** aquisição própria da Digitoel; aprovação válida é pré-condição; segredos só no servidor; nenhuma ativação/gasto por inferência.
- **Bloqueios:** App/Business/ad account de teste ou autorizada, token mínimo e confirmação de uso sem veiculação. Produção exige autorização separada.

## Resultado observável
Em conta de teste/autorizada, publicador autorizado transforma campanha aprovada em objetos Meta pausados, vê IDs e estado confirmado; falha não cria falso sucesso.

## Limites e dependências
- **Inclui:** conexão, mapeamento do snapshot, criação pausada, consulta, log e reconciliação.
- **Fora:** ativar, aumentar orçamento, otimizar, insights/baseline, WhatsApp/CRM, público/copy por IA.
- **Entradas:** campaign, snapshot, approval vigente, checklist READY, conta permitida e segredo server-side.
- **Saídas:** publication_attempt, IDs, estado confirmado, resposta sanitizada e erro recuperável.
- **Permissões:** administrador configura; publicador autorizado solicita; marketing/comercial sem alçada não publicam.
- **Plano B:** acesso indisponível → `BLOCKED_ACCESS`, mantendo prévia F1.
- **Rollback:** objetos pausados; pausa adicional somente com ID confirmado e suporte da API.

## Dados e integração
| Fluxo | Fonte/contrato | Autenticação | Idempotência | Erro |
|---|---|---|---|---|
| Engaja PJ → Meta | snapshot aprovado; adaptador versionado | token server-side, escopo mínimo | `campaign_id:snapshot_version:account_id:meta` | código/correlação sanitizados; sem sucesso antes da consulta |
| Meta → Engaja PJ | IDs e status confirmados | mesma conexão | upsert por ID remoto | parcial lista objetos criados |

**Fontes oficiais:** https://developers.facebook.com/documentation/ads-commerce/marketing-api ; https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization ; https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/basic-ad-creation/create-an-ad-campaign . Consultado em 11/09/2026.

| Regra | Condição | Resultado |
|---|---|---|
| RN-201 | approval inexistente/inválida ou não READY | negar antes da Meta |
| RN-202 | conta fora da allowlist | negar e auditar |
| RN-203 | criação | `PAUSED`, nunca `ACTIVE` |
| RN-204 | mesma chave | devolver tentativa/IDs existentes |
| RN-205 | falha parcial | preservar IDs e reconciliar antes de retry |

## Fluxo e erros
1. Validar papel, aprovação, checklist, snapshot e allowlist.
2. Persistir hash do payload sem segredo.
3. Criar cadeia Meta em `PAUSED`, persistindo IDs confirmados.
4. Consultar estado e só então marcar `CONFIRMED_PAUSED`.
5. Em timeout, consultar antes de retry.
6. Exibir histórico e reconciliação.

## Instruções ao Ethos
1. Ler SPECs F1 e correção RBAC v0.0.66.
2. Criar adaptador server-side; segredo nunca no frontend.
3. Não ativar, usar produção ou escolher objetivo/orçamento/público/conta.
4. Começar por prova read-only e usar fixture aprovada.
5. Parar se acesso/campos/conta não forem demonstrados.
6. Preservar F1.

## Critérios de aceite
- [ ] **CA-2-001:** acesso identifica somente contas permitidas, sem segredo.
- [ ] **CA-2-002:** papel, aprovação, READY ou conta inválidos são negados antes da API.
- [ ] **CA-2-003:** teste cria cadeia pausada e registra IDs/hash/operador/hora.
- [ ] **CA-2-004:** mesma chave não duplica; timeout consulta antes de recriar.
- [ ] **CA-2-005:** parcial/credencial expirada é recuperável, sem falso sucesso.

## TDD da SPEC
| Etapa | Prova | Esperado | Evidência |
|---|---|---|---|
| RED | permissão/READY/conta/idempotência | falhas antes da entrega | recibo |
| GREEN | conta de teste + snapshot aprovado | IDs + `CONFIRMED_PAUSED` | resposta sanitizada + captura |
| REGRESSÃO | replay, token expirado, timeout | sem duplicidade/falso sucesso; F1 íntegra | relatório + teste humano |

**Fixtures:** conta Meta de teste/autorizada e campanha sintética aprovada. Produção proibida sem novo gate.

## Tasks vinculadas
| ID | Task | Critério | Pré-condições | Status |
|---|---|---|---|---|
| F2-T03 | Prova de acesso Meta | CA-2-001 | acesso fornecido | Bloqueada por acesso |
| F2-T04 | Publicação Meta pausada | CA-2-002..004 | F2-T02/T03 | Bloqueada |
| F2-T05 | Falha e reconciliação Meta | CA-2-005 | F2-T04 | Bloqueada |
