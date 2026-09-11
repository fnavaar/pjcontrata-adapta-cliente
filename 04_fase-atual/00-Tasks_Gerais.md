# Tasks Gerais — Fase 2 | Digitoel / Engaja PJ

**Regra:** executar somente uma task por vez; cada conclusão exige provas da SPEC e teste humano. Nenhuma task autoriza conta produtiva, ativação ou gasto.

| ID | Task | Dono | SPEC | Critérios | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| F2-T01 | Implementar contrato transversal de conexão, tentativa e máquina de estados com adaptador fake | Executor | SPEC-2-003 | CA-2-011, CA-2-016 | validação server-side; feature flag/revogação; estados válidos | testes RED/GREEN, inventário de superfícies e recibo sem segredo | F1 selada; sem credencial externa | ELEGÍVEL |
| F2-T02 | Implementar idempotência, log append-only sanitizado e recibo por task | Executor | SPEC-2-003 | CA-2-012, CA-2-013, CA-2-017 | duplo envio; reconstrução por eventos; recibo versionado | suíte de concorrência/replay, scan de segredos e recibo | F2-T01 concluída e autorizada | BLOQUEADA por F2-T01 |
| F2-T03 | Provar autorização e conta Meta de teste/autorizada sem mutação produtiva | Gustavo + Executor | SPEC-2-001 | CA-2-001 | identidade da conexão, contas permitidas e segredo server-side | resposta sanitizada, conta mascarada e teste de negação | app/permissão/token e conta fornecidos pelo champion; autorização da task | BLOQUEADA por acesso Meta |
| F2-T04 | Implementar publicação Meta pausada com gates server-side e idempotência | Executor | SPEC-2-001 | CA-2-002, CA-2-003, CA-2-004 | negar pré-condições; criar PAUSED; confirmar por leitura | IDs mascarados, payload hash, consulta e captura | F2-T02 e F2-T03 concluídas e autorizadas; mapeamento provado | BLOQUEADA por F2-T02/F2-T03 |
| F2-T05 | Implementar falha parcial, timeout e reconciliação Meta | Executor | SPEC-2-001 | CA-2-005 | token expirado, timeout pós-envio e parcial | tentativa sem falso sucesso, IDs preservados e recuperação demonstrada | F2-T04 concluída e autorizada | BLOQUEADA por F2-T04 |
| F2-T06 | Provar OAuth, developer token, access level e customer Google de teste | Gustavo + Executor | SPEC-2-002 | CA-2-006 | listar customers permitidos e classificar Test/produção | resposta sanitizada, customer mascarado e teste Test→produção negado | OAuth/developer token/test account fornecidos; autorização da task | BLOQUEADA por acesso Google |
| F2-T07 | Implementar publicação Google pausada com gates server-side e idempotência | Executor | SPEC-2-002 | CA-2-007, CA-2-008, CA-2-009 | negar pré-condições; mutate PAUSED; confirmar e repetir chave | resource names mascarados, payload hash, consulta e captura | F2-T02 e F2-T06 concluídas e autorizadas; mapeamento provado | BLOQUEADA por F2-T02/F2-T06 |
| F2-T08 | Implementar partial failure, timeout e reconciliação Google | Executor | SPEC-2-002 | CA-2-010 | credencial inválida, partial failure e timeout | recursos discriminados, estado recuperável e ausência de falso sucesso | F2-T07 concluída e autorizada | BLOQUEADA por F2-T07 |
| F2-T09 | Implementar painel transversal de reconciliação e recuperação assistida | Executor | SPEC-2-003 | CA-2-014, CA-2-015 | parcial/incerto; pausa/compensação suportada; falha visível | painel, eventos, adaptadores fake + um conector real de teste e regressão F1 | F2-T05 ou F2-T08 concluída; ao menos um conector de teste disponível | BLOQUEADA por integração de teste |

## Levas

- **Leva 1:** F2-T01.
- **Leva 2:** F2-T02.
- **Leva 3:** F2-T03 ou F2-T06, uma por vez, conforme o primeiro acesso disponível.
- **Leva 4:** F2-T04/F2-T07, uma por vez.
- **Leva 5:** F2-T05/F2-T08, uma por vez.
- **Leva 6:** F2-T09.

## Ponto de parada transversal

Ao fim de cada task: registrar build, testes, IDs mascarados, scan de segredo, estado final e aceite humano. Não iniciar a seguinte sem autorização explícita.
