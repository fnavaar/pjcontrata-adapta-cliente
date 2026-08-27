# Instruções operacionais — IA Ferramenta

## Missão da Fase 1

Construir no GoSkip a base interna para organizar campanhas de aquisição da própria IA Ferramenta: autenticação/RBAC, campanhas, ativos, modelos, checklist, aprovação e prévia. Persistência, autenticação e RBAC usam SkipCloud.

## Fronteira obrigatória

- A IA Ferramenta é uma prestadora de serviços contábeis/BPO; o sistema estrutura a aquisição de clientes da própria empresa.
- Não criar operação de campanhas para clientes, tenancy/multiempresa ou `client_id`.
- Não conectar Meta Ads, Google Ads, Google Drive, CRM ou WhatsApp nesta Fase 1.
- Não criar segredos, publicar campanha, iniciar gasto de mídia, criar repositório, fazer commit ou push sem autorização explícita.

## Execução

- Leia `04_fase-atual/fase.md` e a SPEC vinculada antes de começar uma task.
- Execute apenas uma task elegível por vez, começando por F1-T01.
- Após cada task, produza preview GoSkip, evidência no SkipCloud quando aplicável e solicite teste humano. Não avance por silêncio.
- Comandos automatizados ainda não foram definidos; não alegue testes automatizados inexistentes.
- Se uma SPEC exigir regra, dado, integração ou aceite não definido, pare e reporte a lacuna.

## Evidência

Registre URL do preview, passos executados, resultado observável, evidência de persistência/RBAC e resultado do teste humano. Mantenha STATUS e changelog coerentes com o estado real.
