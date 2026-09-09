# Changelog — IA Ferramenta

## 2026-09-09

- Certificação dos 4 níveis de conta via API (22 testes): encontrados 2 bugs reais — (1) aprovador não conseguia aprovar campanhas de outros usuários (regra RLS de update não inclui o papel aprovador → 404 antes do hook); (2) botão Rejeitar sempre falhava silenciosamente (valor REJECTED não existe no select do campo status). Correção (build v0.0.65/v0.0.66): nova rota server-side `POST /backend/v1/decisao-aprovacao` (autenticada; só aprovador/administrador; valida decisão, comentário obrigatório e transição IN_REVIEW; grava via $app.save com auditoria idêntica ao campaign_guards; rejeição grava status CHANGES_REQUESTED + approval_status 'rejeitado' preservando a decisão real em campaign_approval). Frontend: papel aprovador usa a rota nova; admin/marketing seguem no PATCH auditado. Recertificação final: 15/15 testes ✅ (aprovação/rejeição/devolução por aprovador em campanha de outro usuário, 403 para marketing/comercial, 401 sem token, RLS de edição preservada). Aprendizado AP-2026-09-09-1230.

## 2026-09-04

- 2026-09-04 · [champion: Gustavo] · Task F1-T09 concluída: prévia determinística + prova de não integração. Rota custom `GET /backend/v1/previa/{campaignId}` (autenticada) monta JSON determinístico só com dados internos (campanha, configuração, ativos, pauta, modelo/snapshot, checklist, aprovação) + bloco `fase2_nao_configurados` (todos null/"não configurado") + metadados (gerado_em, fonte "dados internos", integracao_externa "nenhuma"); seção "Prévia determinística" no detalhe da campanha (sem botão de publicar). Evidência: build v0.0.49 QA ok; testes de API 200/401/404; prova de não integração (nenhum fetch externo/credencial nos hooks e migrations; frontend só chama /backend/v1); teste humano aprovado com screenshot (dados reais + Fase 2 não configurado). Aprendizado AP-2026-09-04-1132 (skip_file_patch cirúrgico para arquivos grandes). **Fase 1 100% (9/9).**

## Próximo passo

Fase 1 100% (9/9). Correções pós-fase aplicadas (tradução pt-BR, identidade visual Engaja PJ, dashboard apresentação, certificação RBAC). Fase 1 encerra somente via liberar-fase do consultor.
