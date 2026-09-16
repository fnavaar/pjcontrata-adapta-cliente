# AP-2026-09-16-1425 — Token de sandbox Meta: gerar pela chave da conta, não pelo Graph API Explorer

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F2-T03 / SPEC-2-001
- Sinal: token gerado no Graph API Explorer (mesmo com ads_management+ads_read e usuário admin do app) NÃO acessa a Sandbox Ad Account (403 "Ad account owner has NOT granted") — a sandbox não é atribuída ao usuário e não aparece no Business Settings. O token gerado pelo ícone de chave da própria sandbox (Sandbox Ad Account Management) nasce vinculado ao ativo como token de sistema ("Sandbox Ad Account Owner") e funciona imediatamente.
- Evidência: prova read-only F2-T03 — 403 com token do Explorer; /act_... e /campaigns respondem com o token da chave da sandbox.
- Regra reutilizável: para acessar Sandbox Ad Account da Meta, gerar o token pelo ícone de chave da própria sandbox na tela Sandbox Ad Account Management — nunca depender do Graph API Explorer nem de atribuição no Business Settings.
- Quando aplicar: F2-T04/T05 (adaptador Meta real), qualquer integração que use sandbox Meta.
- Quando não aplicar: contas de anúncios reais/produção (seguem o fluxo normal de atribuição no Business Manager).
- Confiança: alta — reproduzido nas duas direções (403 com um, sucesso com outro).
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
