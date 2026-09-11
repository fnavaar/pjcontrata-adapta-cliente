# SPEC-2-002 — Conector e publicação controlada Google Ads

**Fase:** 2  
**Status:** planejada; execução bloqueada até prova de acesso  
**Dono:** Gustavo (champion) + executor autorizado  
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01  
**Degrau:** dependência existente — Google Ads API oficial via adaptador server-side versionado.

## Contexto e decisões fechadas

- **Atual:** campanha F1 aprovada, READY e com snapshot; sem integração externa.
- **Desejado:** criar recursos Google Ads em conta de teste/autorizada, inicialmente pausados, guardar resource names/resposta e confirmar estado.
- **Fechado:** OAuth 2.0 + developer token são exigências oficiais; acesso Test só opera em test accounts; produção exige nível e autorização próprios; segredos server-side.
- **Bloqueios:** projeto Google Cloud/OAuth, developer token, customer/test account e eventual login-customer-id precisam ser fornecidos e provados. Nenhuma conta produtiva entra sem autorização imediata.

## Resultado observável

Em conta Google Ads de teste/autorizada, um publicador autorizado cria a configuração mínima aplicável inicialmente `PAUSED`, visualiza resource names e estado confirmado; falha não gera publicação fictícia.

## Limites e dependências

- **Inclui:** prova de acesso; allowlist; mapeamento explícito; mutate controlado; consulta; log; compensação/pausa quando suportada.
- **Fora:** ativação, gasto, otimização, Performance Max ou tipo específico não aprovado, conversões/baseline, CRM/WhatsApp.
- **Entradas:** snapshot F1 aprovado/READY, conta permitida e credenciais server-side.
- **Saídas:** tentativa, resource names, estado confirmado e erro sanitizado.
- **Permissões:** administrador configura; publicador autorizado solicita; demais negados.
- **Plano B:** acesso Test ou conta indisponível → somente validação do contrato e `BLOCKED_ACCESS`.
- **Rollback:** manter recursos pausados; remoção/pausa compensatória somente com resource name confirmado e suporte da API.

## Dados e integração

| Origem/destino | Fonte | Contrato | Autenticação | Idempotência | Erro |
|---|---|---|---|---|---|
| Engaja PJ → Google Ads | snapshot F1 | adaptador fixado à versão validada; operations explícitas | OAuth server-side + developer token; login-customer-id quando aplicável | chave `campaign_id:snapshot_version:customer_id:google`; consulta antes de repetir | guardar request id/código sanitizado; parcial visível |
| Google Ads → Engaja PJ | mutate/consulta | resource names e status | mesma conexão | upsert por resource name | sem sucesso antes da confirmação |

**Fontes oficiais:** mutate REST e criação `PAUSED`: https://developers.google.com/google-ads/api/rest/common/mutate ; OAuth e developer token: https://developers.google.com/google-ads/api/docs/oauth/overview ; níveis Test/produção: https://developers.google.com/google-ads/api/docs/api-policy/access-levels ; modelo de acesso: https://developers.google.com/google-ads/api/docs/oauth/access-model . Consultado em 11/09/2026.

| Regra | Condição | Resultado |
|---|---|---|
| RN-211 | approval/READY/papel/conta inválidos | negar antes da API |
| RN-212 | acesso Test | somente test account |
| RN-213 | criação | status inicial `PAUSED` |
| RN-214 | mesma chave idempotente | não duplicar; reutilizar tentativa/resource names |
| RN-215 | mutate parcial/timeout | marcar parcial/incerto e reconciliar antes de retry |

## Fluxo e erros

1. Listar/confirmar customers acessíveis e cruzar com allowlist.
2. Validar campanha, papel, aprovação, READY e snapshot.
3. Persistir hash do payload sem segredo.
4. Executar operations mínimas na conta de teste/autorizada com status pausado.
5. Persistir resource names e consultar estado.
6. Tratar partial failure/timeout por reconciliação e compensação segura.

| Cenário | Resultado | Recuperação |
|---|---|---|
| Principal | recursos confirmados pausados | aceite humano |
| Token/nível insuficiente | `BLOCKED_ACCESS` | regularizar acesso, sem fallback fictício |
| Partial failure | recursos e erros discriminados | compensar/reconciliar |
| Produção | bloqueado | autorização humana imediata + nível compatível |

## Instruções ao Ethos

1. Ler SPECs F1 e regressão RBAC aceita.
2. Provar OAuth/developer token/customer sem mutação antes de criar recursos.
3. Manter credenciais fora de código, UI e logs.
4. Não escolher tipo, estratégia, orçamento, assets, customer ou objetivo ausentes.
5. Usar conta de teste/autorizada e estado `PAUSED`; parar antes de qualquer ativação/gasto.
6. Preservar F1 e registrar recibo reproduzível no handoff.

## Critérios de aceite

- [ ] **CA-2-006:** prova de acesso lista apenas customers permitidos e classifica Test/produção sem segredo.
- [ ] **CA-2-007:** papel, aprovação, READY, nível de acesso ou conta inválidos bloqueiam antes de mutate.
- [ ] **CA-2-008:** publicação de teste cria recursos aplicáveis pausados e registra resource names/hash/operador/hora.
- [ ] **CA-2-009:** repetição/timeout não duplica recursos e consulta antes de recriar.
- [ ] **CA-2-010:** partial failure/credencial inválida é visível e recuperável, sem falso sucesso.

## TDD da SPEC

| Etapa | Prova | Ação | Esperado | Evidência |
|---|---|---|---|---|
| RED | conta fora da allowlist, acesso Test→produção, approval/READY inválidos | fixtures | bloqueio antes da API | recibo |
| GREEN | test customer + snapshot aprovado | mutate PAUSED + consulta | resource names + estado confirmado | resposta sanitizada + captura |
| REGRESSÃO | repetir chave, partial failure e timeout | suíte adaptador | sem duplicidade/falso sucesso; F1 íntegra | relatório + teste humano |

**Fixtures:** Google Ads test account; campanha sintética aprovada. Produção proibida sem novo gate.  
**Evidência:** recibo versionado, build, customer/resource names mascarados, consulta e aceite humano.

## Tasks vinculadas

| ID | Task | Dono | Critério | Recorte da prova | Evidência | Pré-condições | Status |
|---|---|---|---|---|---|---|---|
| F2-T06 | Prova de acesso Google | Gustavo + Executor | CA-2-006 | OAuth/token/nível/customer | resposta sanitizada | acesso Google fornecido | Bloqueada por acesso |
| F2-T07 | Publicação Google pausada | Executor | CA-2-007..009 | gates/mutate/consulta/idempotência | resource names + hash | F2-T02/T06 | Bloqueada |
| F2-T08 | Falha e reconciliação Google | Executor | CA-2-010 | inválido/parcial/timeout | estado recuperável | F2-T07 | Bloqueada |

## Emendas

| Data | Origem | Micro-spec/task | Motivo |
|---|---|---|---|
