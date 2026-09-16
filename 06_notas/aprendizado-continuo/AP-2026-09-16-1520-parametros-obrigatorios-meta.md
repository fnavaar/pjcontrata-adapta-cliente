# AP-2026-09-16-1520 — Parâmetros obrigatórios e mínimos da Marketing API v21 (sandbox)

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F2-T04 / SPEC-2-001
- Sinal: criação de campaign na Meta exige `special_ad_categories` (array JSON vazio, obrigatório) e `is_adset_budget_sharing_enabled=false` (erro obscuro "É necessário especificar Verdadeiro ou Falso" sem ele); adset exige `daily_budget >= 1000` centavos na sandbox (abaixo rejeita "orçamento demasiado baixo"); creative/ad exigem `page_id` real — sandbox sem página não permite criá-los (cadeia aplicável = campaign+adset).
- Evidência: baseline F2-T04 — 4 tentativas com erros distintos antes do payload correto; campanha/adset criados e confirmados PAUSED.
- Regra reutilizável: payload mínimo de campaign = {name, objective, status:PAUSED, special_ad_categories:'[]', is_adset_budget_sharing_enabled:'false'}; adset = {campaign_id, daily_budget>=1000, billing_event:IMPRESSIONS, optimization_goal:LINK_CLICKS, bid_strategy:LOWEST_COST_WITHOUT_CAP, targeting:{geo_locations:{countries:['BR']}}, status:PAUSED}.
- Quando aplicar: F2-T05 (reconciliação Meta), F2-T07/T08 (Google terá análogos próprios), qualquer nova integração Meta.
- Quando não aplicar: contas produtivas (limites de orçamento e campos podem diferir).
- Confiança: alta — reproduzido com criação real e confirmação via consulta.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
