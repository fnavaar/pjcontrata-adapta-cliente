# SPEC-1-002 — Ativos, modelos e planejamento de campanha

**Fase:** 1 — Núcleo de operação e prontidão de campanhas  
**Dependência:** SPEC-1-001 — Núcleo de campanhas e permissões internas  
**Estado:** decomposta em tasks; nenhuma task foi iniciada  
**Degrau da solução:** Sistema de organização e preparação. A entrega palpável é uma campanha interna que reúne seus ativos e parâmetros declarados, sem duplicação de informação.

## Resultado

O Marketing registra pauta, criativos, texto, landing page, público/localidade, orçamento e modelo associados a uma campanha interna. A plataforma torna explícita a origem de cada dado e permite reutilizar modelos aprovados sem inventar parâmetros.

## Limites

- Links e metadados de ativos são cadastrados manualmente; não baixar arquivo, validar permissão de Drive, subir mídia ou chamar APIs externas.
- Não gerar copy, criativo, público, estratégia, orçamento ou URL com IA.
- Não criar campanhas/adsets/ads nem modelos específicos de integração Meta/Google; isso pertence à fase posterior.
- Não assumir lista oficial de localidades, contas, ICPs ou ofertas não fornecida: o cadastro deve suportar administração interna e indicar pendência quando inexistente.

## Dados

### Pauta e ativos

`brief`: campanha, objetivo, oferta, mensagem/orientação, responsável, estado e decisão de aprovação quando aplicável.

`creative_asset`: campanha, tipo (`video`, `static`, `text` ou `landing_page_reference`), nome exibido, origem/link, versão, responsável, estado, observações e timestamps. O sistema preserva nome/origem informados; não tenta normalizar encoding nem identifica mídia por chamada externa nesta fase.

`campaign_configuration`: campanha, público/localidade declarados, orçamento declarado e moeda, período, URL/destino, evento/pixel de referência, conta de referência, fonte de cada valor e status de completude.

### Modelo reutilizável

`campaign_template`: nome, plataforma, objetivo, campos parametrizáveis, valores predefinidos aprovados, versão, ativo/inativo, criador/aprovador e timestamps. Um modelo só pode ser aplicado se plataforma e objetivo forem compatíveis. Sua aplicação cria snapshot na campanha; mudanças posteriores no modelo não reescrevem a campanha silenciosamente.

## Regras

1. Um ativo pertence a uma única campanha nesta fase; reuso requer criar uma referência explícita com nova auditoria, sem ocultar origem.
2. O sistema exige ao menos um ativo criativo ou uma pendência explícita antes de enviar uma campanha para revisão.
3. Orçamento é dado humano declarado; validar número não negativo e moeda. A regra de unidade mínima por plataforma não é implementada nesta fase.
4. URL deve ter formato válido quando preenchida, mas acessibilidade e tracking são verificados apenas na SPEC-1-003 como requisito de prontidão, sem fazer chamada externa nesta fase.
5. Campos de modelo preenchem somente valores declarados no template. Se exigir parâmetro ausente, marcar pendência; nunca aplicar fallback oculto.
6. Edição de ativo, modelo, configuração ou pauta produz auditoria e atualiza o estado de prontidão da campanha.
7. Modelos inativos não podem ser aplicados a novas campanhas; campanhas históricas mantêm o snapshot.

## Fluxo

1. Usuário autorizado abre campanha `DRAFT` da SPEC-1-001.
2. Cria pauta e vincula ou registra pendência para ativos.
3. Adiciona criativos, texto, landing page, público/localidade, orçamento e período, declarando a fonte quando aplicável.
4. Escolhe modelo compatível ou mantém configuração manual documentada.
5. Sistema salva snapshot do modelo e atualiza as pendências de configuração.
6. Usuário envia para aprovação, se esta estiver configurada; o checklist da SPEC-1-003 calcula bloqueio/prontidão.

## Superfícies

- Seção de pauta no detalhe da campanha.
- Biblioteca de ativos vinculados com tipo, versão, estado, origem e responsável.
- Editor de configuração e painel de campos pendentes.
- Biblioteca administrativa de modelos com versionamento e estado.
- Comparação entre configuração de campanha e snapshot aplicado, sem edição indireta.

## Exceções e recuperação

- Link malformado: salvar somente como rascunho se política permitir, mas exibir pendência e bloquear pronto.
- Modelo incompatível/inativo: rejeitar aplicação, sem alterar configuração existente.
- Exclusão de ativo usado: bloquear exclusão física; arquivar/referenciar e manter histórico.
- Alteração de template: criar nova versão ou nova edição auditada; não propagar para campanhas já criadas.

## Critérios de aceite binários

1. Usuário cria uma campanha e vincula vídeo ou estático, texto, destino, público/localidade, orçamento e período como dados declarados.
2. Aplicar modelo compatível grava snapshot; mudar o modelo depois não altera a campanha existente.
3. Aplicar modelo incompatível ou inativo falha sem alterar a campanha.
4. Ativo sem origem ou configuração incompleta aparece como pendência para o checklist.
5. Cada alteração em pauta, ativo, modelo ou configuração fica visível no histórico.
6. A entrega não acessa Drive, não gera mídia/copy e não publica em plataformas.

## TDD da SPEC

### RED

Testar falhas para modelo incompatível/inativo, template que sobrescreve snapshot, orçamento inválido, ativo removido sem histórico, configuração sem pendência e mutação sem auditoria.

### GREEN

Implementar entidades, vínculos, versão/snapshot de modelo, validações e telas até os testes passarem.

### REFACTOR/REGRESSÃO

Executar testes de domínio e integração. Cobrir reuso explícito de ativo, alteração posterior de template e ausência de qualquer cliente externo/integrador produtivo.

**Evidências exigidas:** testes, demonstração de campanha com ativos/configuração, aplicação de template e comparação de snapshot, e histórico de alterações.

## Tasks vinculadas

- F1-T05 — Implementar pauta, ativos e configuração declarada.
- F1-T06 — Implementar modelos versionados e snapshots.
