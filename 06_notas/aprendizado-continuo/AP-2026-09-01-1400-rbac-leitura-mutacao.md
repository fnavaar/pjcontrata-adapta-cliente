# AP-2026-09-01-1400 — RBAC em produto interno: leitura liberada, alçada nas mutações

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T03 / SPEC-1-001
- Sinal: em produto interno single-tenant (IA Ferramenta), a leitura (list/view) é liberada a qualquer autenticado e a alçada real fica nas mutações (create/update/delete) via RLS + hooks; a negação de leitura por papel só faz sentido com multiempresa. Filtros de listagem usando pb.filter com bind de parâmetros ({:chave}) funcionam sem backend custom.
- Evidência: testes da F1-T03 — list/view por comercial 200 (leitura ok), update por comercial 404, create por comercial 400, admin create 200; filtro plataforma=meta → 3, estado=DRAFT → 2, canal~tráfego → 3.
- Regra reutilizável: ao validar RBAC, testar o caminho de MUTAÇÃO (criação/edição/exclusão) como prova de alçada; leitura por autenticado é aceitável quando não há domínio multiempresa. Usar viewRule/listRule permissivas + createRule/updateRule/deleteRule restritivas.
- Quando aplicar: F1-T04 em diante (auditoria, transições, aprovações) e qualquer superfície nova da Fase 1.
- Quando não aplicar: produto com clientes externos/tenancy (então leitura também precisa de escopo).
- Confiança: alta — comportamento observado diretamente na API.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
