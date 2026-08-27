# SPEC-1-001 — Núcleo de campanhas e permissões internas

**Fase:** 1 — Núcleo de operação e prontidão de campanhas  
**Estado:** decomposta em tasks; nenhuma task foi iniciada  
**Degrau da solução:** Sistema operacional interno. A entrega palpável é o registro e a consulta controlada de campanhas de aquisição da própria IA Ferramenta, sem publicação externa.

## Resultado

Um usuário interno autorizado cria, consulta e edita uma campanha de aquisição da IA Ferramenta, identificada por canal, segmento/ICP, oferta, funil, conta de referência e período. O sistema impede que um usuário sem a alçada necessária altere, aprove ou publique a campanha.

## Limites

- O produto atende somente a aquisição da própria IA Ferramenta; não há cliente externo, tenancy, espaço de cliente ou operação de mídia como serviço.
- Não conectar Google Ads, Meta Ads, Drive, CRM, WhatsApp ou secret manager nesta SPEC.
- Não publicar, pausar, alterar orçamento em plataforma externa ou afirmar estado externo.
- Não inferir orçamento, público, copy, pixel, URL, oferta ou dados de mensuração.

## Atores e permissões

| Papel | Ler | Criar/editar rascunho | Aprovar | Publicar externo |
|---|---:|---:|---:|---:|
| Administrador/Gustavo | sim | sim | se configurado | não nesta fase |
| Marketing/Gestor de tráfego | sim | sim | não, salvo alçada configurada | não nesta fase |
| Aprovador | sim, itens atribuídos | não obrigatório | sim, itens atribuídos | não nesta fase |
| Comercial/resultado | apenas leitura necessária | não | não | não |

A autorização deve ser avaliada no servidor para cada leitura e mutação. A ausência de permissão responde acesso negado sem expor dados da campanha.

## Dados e estados

### Entidade `campaign`

Campos obrigatórios no rascunho: `id`, `name`, `platform` (`meta` ou `google`), `objective`, `channel`, `segment_icp`, `offer`, `funnel`, `reference_account`, `start_date`, `end_date`, `owner_id`, `status`, `created_at`, `updated_at`.

Campos podem ficar pendentes nesta fase, mas o checklist da SPEC-1-003 decide se a campanha está pronta. `reference_account` é cadastro de referência sem credencial, token ou chamada a API.

Estados permitidos: `DRAFT`, `IN_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `READY`, `BLOCKED`, `ARCHIVED`. Transições: rascunho pode ir a revisão; aprovação só ocorre se regra configurada; `READY` e `BLOCKED` são calculados pelo checklist; arquivamento preserva auditoria e não apaga dados.

## Regras

1. Cada campanha é aquisição da IA Ferramenta e não possui `client_id`, espaço de cliente ou compartilhamento externo.
2. `platform`, canal, segmento/ICP, oferta, funil, conta de referência e período devem permanecer distinguíveis em lista, detalhe e auditoria.
3. Datas exigem início igual ou anterior ao fim; datas passadas não são bloqueadas em rascunho, pois podem representar planejamento/histórico, mas não tornam campanha pronta para publicação.
4. Toda criação, edição, transição e arquivamento registra autor, horário, antes/depois e motivo quando houver devolução/arquivamento.
5. Uma campanha arquivada não pode voltar a `READY` sem restauração explícita e auditoria.
6. Esta SPEC não cria regras de campanha das plataformas; apenas prepara dados internos para validação futura.

## Superfícies

- Lista filtrável por plataforma, canal, segmento/ICP, oferta, funil, conta, período, estado e responsável.
- Formulário de criação/edição com campos acima e validações locais/servidor.
- Detalhe com estado, histórico de alterações e referência às pendências/checklist.
- Administração de papéis/alçadas ou integração com o mecanismo de RBAC existente, sem presumir provedor de autenticação.

## Exceções e recuperação

- Conflito de edição: rejeitar atualização baseada em versão desatualizada e pedir recarga; não sobrescrever silenciosamente.
- Referência de conta inativa: permitir visualizar histórico, mas bloquear uma transição futura para pronto.
- Falha de persistência/auditoria: falhar a mutação inteira; não salvar campanha sem trilha correspondente.
- Rollback: restauração de campo/estado é uma nova ação auditada, nunca remoção do histórico.

## Critérios de aceite binários

1. Usuário autorizado cria duas campanhas internas com combinações distintas de canal, segmento/ICP ou oferta e as encontra pelos filtros.
2. Usuário sem alçada não lê nem altera campanha fora da permissão concedida.
3. Edição inválida de período é rejeitada com mensagem acionável e não altera o registro.
4. Toda alteração de campo ou estado gera evento de auditoria com antes/depois e autor.
5. Nenhuma tela, API ou modelo desta entrega cria cliente externo, credencial ou recurso em Google/Meta.

## TDD da SPEC

### RED

Criar testes que falham para: criação sem campos mínimos; período inválido; leitura/mutação sem alçada; filtro que mistura campos; edição sem evento de auditoria; arquivada marcada como pronta.

### GREEN

Implementar modelo, validação, RBAC no servidor, lista/detalhe/formulário e persistência auditável até os cenários RED passarem.

### REFACTOR/REGRESSÃO

Rodar a suíte unitária e de integração do projeto. Adicionar teste de concorrência de edição e regressão garantindo ausência de `client_id`/fluxo multi-cliente no domínio da campanha.

**Evidências exigidas:** saída dos testes, captura ou gravação da criação/listagem, tentativa negada por alçada e registro de auditoria inspecionável.

## Tasks vinculadas

- F1-T01 — Criar projeto GoSkip e configurar SkipCloud Auth/RBAC interno.
- F1-T02 — Modelar e persistir campanhas internas.
- F1-T03 — Criar lista, filtros e detalhe de campanhas.
- F1-T04 — Implementar estados, auditoria, conflito e arquivamento.
