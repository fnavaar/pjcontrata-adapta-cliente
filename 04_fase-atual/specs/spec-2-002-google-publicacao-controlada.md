# SPEC-2-002 — Conector e publicação controlada Google Ads

**Fase:** 2
**Status:** planejada; execução bloqueada até prova de acesso
**Dono:** Gustavo (champion) + executor autorizado
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01
**Degrau:** dependência existente — Google Ads API via adaptador server-side versionado.

## Contexto e decisões fechadas
- **Atual:** campanha F1 aprovada, READY e com snapshot; sem integração externa.
- **Desejado:** criar recursos Google Ads em conta de teste/autorizada, inicialmente pausados, guardar resource names e confirmar estado.
- **Fechado:** OAuth 2.0 + developer token; acesso Test só opera em test accounts; produção exige nível e autorização; segredos server-side.
- **Bloqueios:** projeto OAuth, developer token, customer/test account e eventual login-customer-id precisam ser provados.

## Resultado observável
Em conta Google Ads de teste/autorizada, publicador autorizado cria configuração mínima pausada, vê resource names e estado confirmado; falha não gera publicação fictícia.

## Limites e dependências
- **Inclui:** prova de acesso, allowlist, mapeamento, mutate, consulta, log e compensação.
- **Fora:** ativação, gasto, otimização, tipo não aprovado, conversões/baseline, CRM/WhatsApp.
- **Entradas:** snapshot aprovado/READY, conta permitida e credenciais server-side.
- **Saídas:** tentativa, resource names, estado confirmado e erro sanitizado.
- **Plano B:** acesso Test/conta indisponível → `BLOCKED_ACCESS`.
- **Rollback:** manter pausado; compensar apenas com resource name confirmado e suporte da API.

## Dados e integração
| Fluxo | Contrato | Autenticação | Idempotência | Erro |
|---|---|---|---|---|
| Engaja PJ → Google | adaptador fixado à versão validada | OAuth + developer token server-side | `campaign_id:snapshot_version:customer_id:google` | request id/código sanitizado |
| Google → Engaja PJ | resource names e status | mesma conexão | upsert por resource name | sem sucesso antes da confirmação |

**Fontes oficiais:** https://developers.google.com/google-ads/api/rest/common/mutate ; https://developers.google.com/google-ads/api/docs/oauth/overview ; https://developers.google.com/google-ads/api/docs/api-policy/access-levels ; https://developers.google.com/google-ads/api/docs/oauth/access-model . Consultado em 11/09/2026.

| Regra | Condição | Resultado |
|---|---|---|
| RN-211 | approval/READY/papel/conta inválidos | negar antes da API |
| RN-212 | acesso Test | somente test account |
| RN-213 | criação | `PAUSED` |
| RN-214 | mesma chave | não duplicar |
| RN-215 | parcial/timeout | reconciliar antes de retry |

## Fluxo e erros
1. Confirmar customers e allowlist.
2. Validar papel, aprovação, READY e snapshot.
3. Persistir hash sem segredo.
4. Executar operations mínimas pausadas.
5. Persistir resource names e consultar estado.
6. Reconciliar partial failure/timeout.

## Instruções ao Ethos
1. Ler F1 e regressão RBAC aceita.
2. Provar OAuth/token/customer sem mutação.
3. Credenciais fora de código/UI/log.
4. Não escolher tipo, estratégia, orçamento, assets, customer ou objetivo ausentes.
5. Usar test account e `PAUSED`; parar antes de ativação/gasto.
6. Preservar F1 e gerar recibo.

## Critérios de aceite
- [ ] **CA-2-006:** acesso lista somente customers permitidos e classifica Test/produção sem segredo.
- [ ] **CA-2-007:** papel, aprovação, READY, nível ou conta inválidos bloqueiam antes de mutate.
- [ ] **CA-2-008:** teste cria recursos pausados e registra resource names/hash/operador/hora.
- [ ] **CA-2-009:** repetição/timeout não duplica e consulta antes de recriar.
- [ ] **CA-2-010:** partial failure/credencial inválida é recuperável, sem falso sucesso.

## TDD da SPEC
| Etapa | Prova | Esperado | Evidência |
|---|---|---|---|
| RED | allowlist, Test→produção, approval/READY | bloqueio antes da API | recibo |
| GREEN | test customer + snapshot | resource names + estado confirmado | resposta sanitizada + captura |
| REGRESSÃO | replay, partial failure, timeout | sem duplicidade/falso sucesso; F1 íntegra | relatório + teste humano |

**Fixtures:** Google Ads test account e campanha sintética aprovada. Produção proibida sem novo gate.

## Tasks vinculadas
| ID | Task | Critério | Pré-condições | Status |
|---|---|---|---|---|
| F2-T06 | Prova de acesso Google | CA-2-006 | acesso fornecido | Bloqueada por acesso |
| F2-T07 | Publicação Google pausada | CA-2-007..009 | F2-T02/T06 | Bloqueada |
| F2-T08 | Falha e reconciliação Google | CA-2-010 | F2-T07 | Bloqueada |
