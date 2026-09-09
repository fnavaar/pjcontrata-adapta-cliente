# AP-2026-09-09-1230 — select de status sem REJECTED: rejeição via rota dedicada

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: correção pós-certificação RBAC (Fase 1)
- Sinal: o campo status da coleção campaigns (select) NÃO inclui REJECTED — o botão "Rejeitar" do frontend (PATCH status=REJECTED) sempre falhava silenciosamente (400 do banco). A certificação com os 4 papéis via API revelou o bug: aprovador não conseguia aprovar (404 RLS) e rejeitar gravava 500.
- Evidência: bateria 22 testes (15 ✅ / 7 ❌) → correção (rota /backend/v1/decisao-aprovacao) → bateria final 15/15 ✅; erro do banco: "Invalid value REJECTED".
- Regra reutilizável: antes de aceitar um valor de transição no frontend/hook, confirmar que o valor existe no select do schema do PocketBase; transições para valores fora do select falham com 400/500 silencioso. Para alçadas que não passam na regra RLS de update, criar rota server-side dedicada com validação de papel + $app.save.
- Quando aplicar: qualquer fluxo de transição de status no Skip Cloud/PocketBase; qualquer papel com permissão parcial (decidir sem editar).
- Quando não aplicar: papéis que já passam na regra RLS (admin/marketing podem continuar usando PATCH auditado).
- Confiança: alta — reproduzido, corrigido e revalidado com bateria automatizada (15/15).
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
