# SPEC-2-001 — Conector e publicação controlada Meta Ads

**Fase:** 2  
**Status:** planejada; execução bloqueada até prova de acesso  
**Dono:** Gustavo (champion) + executor autorizado  
**Origem:** Escopo Definitivo v1.1, Fase 2; EV-F1-01  
**Degrau:** dependência existente — Marketing API oficial, isolada atrás de adaptador server-side.

## Contexto e decisões fechadas

- **Atual:** a F1 produz campanha aprovada, checklist e snapshot, sem integração externa.
- **Desejado:** publicar a configuração aprovada em conta Meta autorizada, inicialmente `PAUSED`, guardar IDs/resposta e consultar o estado real.
- **Fechado:** aquisição própria da Digitoel; aprovação válida é pré-condição; segredos só no servidor; publicação nunca ativa campanha nem autoriza gasto por inferência.
- **Bloqueios:** antes da task de integração, o champion deve disponibilizar App/Business/ad account de teste ou explicitamente autorizada, token com escopo mínimo e confirmar que a conta pode ser usada sem veiculação. Conta produtiva exige autorização imediata separada.

## Resultado observável

Em conta Meta de teste/autorizada, um publicador autorizado transforma uma campanha interna aprovada em objetos Meta inicialmente pausados, vê IDs e estado confirmado; falha de acesso/configuração não cria falso sucesso.

## Limites e dependências

- **Inclui:** contrato da conexão; mapeamento explícito do snapshot; criação pausada; consulta de estado; log e reconciliação.
- **Fora:** ativar, aumentar orçamento, otimizar, insights/baseline, WhatsApp/CRM, público/copy gerados por IA.
- **Entradas:** campaign, snapshot, approval vigente, checklist READY, conta permitida e segredo server-side.
- **Saídas:** publication_attempt, IDs remotos, estado confirmado, resposta sanitizada e erro recuperável.
- **Permissões:** administrador configura conexão; publicador autorizado solicita; aprovador decide na F1; marketing/comercial sem alçada não publicam.
- **Risco/plano B:** API/acesso indisponível → manter prévia F1 e marcar `BLOCKED_ACCESS`, sem simular publicação.
- **Rollback:** objetos são criados pausados; remoção/pausa adicional apenas quando API suportar e houver ID confirmado.

## Dados e integração

| Origem/destino | Fonte | Contrato | Autenticação | Idempotência | Erro |
|---|---|---|---|---|---|
| Engaja PJ → Meta | snapshot aprovado F1 | adaptador versionado; payload permitido por objetivo/conta | token server-side, escopo mínimo; nunca logar token | chave `campaign_id:snapshot_version:account_id:meta`; retry reutiliza IDs existentes | registrar código/correlação sanitizados; sem `PUBLISHED` antes da consulta |
| Meta → Engaja PJ | resposta/consulta oficial | IDs campaign/ad set/creative/ad e status quando criados | mesma conexão | upsert por ID remoto | parcial = `PARTIAL_FAILURE`, com objetos criados listados |

**Fonte oficial:** Marketing API e estrutura de campanhas: https://developers.facebook.com/documentation/ads-commerce/marketing-api ; autorização e `ads_management`: https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization ; criação pausada: https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/basic-ad-creation/create-an-ad-campaign . Consultado em 11/09/2026.

| Regra | Condição | Resultado |
|---|---|---|
| RN-201 | approval inválida/inexistente ou checklist não READY | negar antes de chamar Meta |
| RN-202 | conta fora da allowlist | negar e auditar |
| RN-203 | primeira criação | solicitar estado `PAUSED`; nunca `ACTIVE` |
| RN-204 | mesma chave idempotente | devolver tentativa/IDs existentes, sem duplicar |
| RN-205 | falha parcial | preservar IDs, marcar parcial e oferecer reconciliação, não recriar cegamente |

## Fluxo e erros

1. Validar papel, aprovação, checklist, snapshot e allowlist.
2. Montar e persistir hash do payload sem segredo.
3. Criar cadeia Meta em `PAUSED`, persistindo cada ID confirmado.
4. Consultar estado remoto e só então marcar `CONFIRMED_PAUSED`.
5. Em timeout, consultar pela tentativa/IDs antes de retry.
6. Exibir histórico e ação segura de reconciliação.

| Cenário | Resultado | Recuperação |
|---|---|---|
| Principal | objetos confirmados pausados | aceite humano sem ativar |
| Token expirado/permissão | `BLOCKED_ACCESS`, zero falso sucesso | renovar fora do log e repetir prova |
| Timeout/parcial | IDs preservados, sem duplicidade | consulta/reconciliação |
| Conta produtiva | bloqueio por gate explícito | autorização humana imediata |

## Instruções ao Ethos

1. Ler SPECs F1 e a correção RBAC v0.0.66.
2. Criar adaptador server-side e registros de conexão/tentativa; não expor segredo ao frontend.
3. Não ativar campanha, publicar em produção nem escolher objetivo, orçamento, público ou conta.
4. Começar pela prova read-only de identidade/conta; depois usar fixture aprovada em conta de teste.
5. Parar se acesso, objetivo/campos ou conta não estiverem demonstrados.
6. Preservar todo fluxo F1 e manter prévia utilizável.

## Critérios de aceite

- [ ] **CA-2-001:** prova de acesso identifica somente contas permitidas, sem revelar segredo.
- [ ] **CA-2-002:** usuário sem papel, aprovação vigente, READY ou conta permitida é negado antes da API.
- [ ] **CA-2-003:** publicação de teste cria a cadeia aplicável inicialmente pausada e registra IDs/hash/operador/hora.
- [ ] **CA-2-004:** retry da mesma chave não duplica objetos; timeout consulta antes de recriar.
- [ ] **CA-2-005:** falha parcial/credencial expirada fica visível e recuperável, sem estado falso de sucesso.

## TDD da SPEC

| Etapa | Prova | Ação | Esperado | Evidência |
|---|---|---|---|---|
| RED | permissão/READY/conta/idempotência falham | fixtures server-side | chamadas bloqueadas ou testes vermelhos | recibo da task |
| GREEN | conta de teste + snapshot aprovado | criar em PAUSED e consultar | IDs + `CONFIRMED_PAUSED` | resposta sanitizada + captura |
| REGRESSÃO | repetir, expirar token e simular timeout | suíte do adaptador | sem duplicidade/falso sucesso; F1 íntegra | relatório + teste humano |

**Fixtures:** conta Meta de teste/autorizada; campanha sintética aprovada. Dados produtivos são proibidos sem novo gate.  
**Evidência:** recibo versionado, build, IDs mascarados, resultado da consulta e aceite humano.

## Tasks vinculadas

| ID | Task | Dono | Critério | Recorte da prova | Evidência | Pré-condições | Status |
|---|---|---|---|---|---|---|---|
| F2-T03 | Prova de acesso Meta | Gustavo + Executor | CA-2-001 | identidade/allowlist/negação | resposta sanitizada | acesso Meta fornecido | Bloqueada por acesso |
| F2-T04 | Publicação Meta pausada | Executor | CA-2-002..004 | gates/criação/consulta/idempotência | IDs + hash + consulta | F2-T02/T03 | Bloqueada |
| F2-T05 | Falha e reconciliação Meta | Executor | CA-2-005 | expirado/timeout/parcial | estado recuperável | F2-T04 | Bloqueada |

## Emendas

| Data | Origem | Micro-spec/task | Motivo |
|---|---|---|---|
