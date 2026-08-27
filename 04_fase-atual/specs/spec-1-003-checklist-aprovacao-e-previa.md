# SPEC-1-003 — Checklist de prontidão, aprovação e prévia determinística

**Fase:** 1 — Núcleo de operação e prontidão de campanhas  
**Dependências:** SPEC-1-001 e SPEC-1-002  
**Estado:** decomposta em tasks; nenhuma task foi iniciada  
**Degrau da solução:** Sistema de controle operacional. A entrega palpável é explicar objetivamente por que uma campanha está pronta ou bloqueada e permitir aprovação humana rastreável.

## Resultado

Para cada campanha interna da Digitoel, o sistema calcula um checklist explícito de prontidão, registra aprovação/reprovação quando aplicável e mostra uma prévia determinística da configuração que seria enviada ao conector futuro. Nenhum comando externo é exibido como publicação nesta fase.

## Limites

- A prévia não chama Google/Meta, não verifica token, pixel, conta, URL, arquivo ou saldo externamente.
- Não inventar requisitos de plataforma. A lista de itens obrigatórios é configurável por plataforma/objetivo e toda regra sem fonte fica marcada como pendente de configuração.
- Não executar publicação, fila, job, upload, retry ou rollback externo.
- Não substituir aprovação humana por estado calculado.

## Checklist

Cada item tem: `code`, descrição, fonte do requisito, plataforma/objetivo aplicável, obrigatório, estado (`PASS`, `FAIL`, `PENDING`, `NOT_APPLICABLE`), evidência interna, timestamp da avaliação e responsável/ação sugerida.

Itens-base para Fase 1, sujeitos à configuração: plataforma e objetivo; canal, segmento/ICP, oferta e funil; conta de referência; período; orçamento/moeda; ao menos um ativo; destino/URL; público/localidade; evento/pixel de referência quando o modelo o exigir; alçada do usuário; aprovação quando a regra estiver ativa.

A campanha é `READY` somente se: não houver item obrigatório `FAIL` ou `PENDING`; tiver aprovação exigida em `APPROVED`; e não estiver arquivada. Caso contrário é `BLOCKED`. O checklist não declara campanha ativa/publicada.

## Aprovação

Regras de aprovação são configuráveis por plataforma, objetivo e/ou modelo, com aprovadores internos nomeados. Um aprovador não pode aprovar campanha fora de sua alçada. Decisões possíveis: `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`; as duas últimas exigem comentário. Mudança material posterior à aprovação — ativo, orçamento, público/localidade, URL/destino, período, conta ou modelo — invalida a aprovação e retorna a campanha para revisão.

## Prévia determinística

A prévia apresenta, a partir dos dados internos: nome da campanha, plataforma, objetivo, canal, segmento/ICP, oferta, funil, conta de referência, período, orçamento, ativos, destino, público/localidade, evento/pixel de referência, modelo/snapshot, estado de aprovação e checklist.

Nomes externos, templates Meta, adsets, criativos, anúncios, conversão para centavos, timezone, copy final, targeting técnico e status `PAUSED/ACTIVE` são itens da Fase 2: enquanto não houver contrato aprovado, devem aparecer como **não configurados**, nunca como valores fictícios.

## Regras e auditoria

1. Recalcular checklist após toda alteração relevante e manter histórico de avaliações.
2. Não esconder itens pendentes; uma ausência deve aparecer como `PENDING` com ação sugerida.
3. Uma prévia sempre identifica a versão/snapshot de dados usada e horário de geração.
4. Aprovação e invalidação são eventos de auditoria com usuário, horário, decisão e comentário quando exigido.
5. Lista e detalhe devem distinguir `DRAFT`, `IN_REVIEW`, `APPROVED`, `READY` e `BLOCKED`; `READY` não é aprovação para gasto externo.
6. Ações de publicação futuras devem exigir novo gate de alçada/conexão mesmo que o checklist Fase 1 esteja pronto.

## Exceções e recuperação

- Regra de checklist ausente para plataforma/objetivo: campanha fica `BLOCKED` com pendência de administração; não usar regra genérica escondida.
- Aprovador removido/inativo: preservar decisão anterior, mas impedir nova decisão até nova alçada válida.
- Recalcular checklist falha: preservar última avaliação como desatualizada e bloquear transição para `READY`.
- Dados alterados após aprovação: invalidar aprovação automaticamente, registrar motivo e solicitar nova revisão.

## Critérios de aceite binários

1. Uma campanha completa passa nos itens internos e mostra `READY` apenas quando não exige aprovação ou quando está aprovada.
2. Falta de ativo, URL, orçamento, conta de referência ou regra de checklist aparece nominalmente e bloqueia o estado pronto.
3. Uma aprovação exigida só pode ser dada por aprovador autorizado; reprovação e devolução exigem comentário.
4. Alterar orçamento, ativo, público/localidade, URL, período, conta ou modelo após aprovação invalida a decisão e deixa evidência.
5. A prévia mostra os dados reais do snapshot e marca dados de integração Fase 2 como não configurados, sem valores inventados.
6. Não há request a Google/Meta/Drive, nem botão ou estado que alegue publicação.

## TDD da SPEC

### RED

Criar testes para: campanha incompleta marcada pronta; aprovação por usuário sem alçada; aprovação que sobrevive a mudança material; checklist com regra ausente que libera; prévia que cria fallback técnico; falha de recálculo que conserva `READY`.

### GREEN

Implementar motor determinístico de checklist, transições, aprovação auditada, invalidação e prévia baseada em snapshot até os casos RED passarem.

### REFACTOR/REGRESSÃO

Rodar testes unitários do motor e integração das permissões/transições. Cobrir todas as mudanças materiais e provar que não há cliente de API, token, credencial ou chamada externa na Fase 1.

**Evidências exigidas:** saída de testes; demonstração de bloqueio e mensagem acionável; aprovação e invalidação; prévia com snapshot; inspeção de que nenhuma integração externa foi executada.

## Tasks vinculadas

- F1-T07 — Implementar checklist e cálculo de prontidão.
- F1-T08 — Implementar aprovação auditada e invalidação.
- F1-T09 — Implementar prévia determinística e prova de não integração.
