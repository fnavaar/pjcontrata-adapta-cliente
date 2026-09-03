# AP-2026-09-03-1040 — Request hook: e.record mergeado; persistir em coleção relacionada exige save próprio

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T08 (SPEC-1-003 § Aprovação)
- Sinal: ao invalidar aprovação por mudança material, o hook usava `e.record.get(campo)` para comparar antes/depois — mas em request hooks o `e.record` JÁ reflete o body proposto (merge), então a comparação nunca detectava mudança (atual === novo). Também tentava `e.record.set('approval_status', 'invalidade')` num request hook de campaign_configuration — mas approval_status vive em campaigns (coleção diferente), e setar em e.record da config não persiste na campanha.
- Evidência: antes da correção, alterar orçamento após aprovação deixava aprovação `vigente` e campanha `aprovado`; após ler o registro persistido (`$app.findRecordById`) e salvar explicitamente na campanha (`$app.save(campaign)`), aprovação virou `invalida` com motivo `config.orcamento_declarado` e campanha `approval_status=invalidade` (build v0.0.47/v0.0.48).
- Regra reutilizável: (1) em request hooks, para comparar antes/depois, ler o registro persistido via `$app.findRecordById` (nunca usar `e.record` como "antes"); (2) para persistir um campo em coleção relacionada a partir de update de outra coleção, buscar e salvar o registro da coleção alvo explicitamente — `e.record` só persiste campos da própria coleção do hook.
- Quando aplicar: qualquer hook que precise invalidar/atualizar estado de outra entidade reagindo a mudanças em outra coleção.
- Quando não aplicar: quando o campo a alterar é da MESMA coleção do hook (aí setar e.record funciona).
- Confiança: alta — observado diretamente (duas correções em sequência resolvendo o fluxo).
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
