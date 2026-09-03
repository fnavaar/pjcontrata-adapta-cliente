# AP-2026-09-03-0934 — JSONField no JSVM do Skip Cloud chega como bytes/string

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T06 (SPEC-1-002)
- Sinal: ao ler `valores_predefinidos` (JSONField) de campaign_template dentro de routerAdd, o `record.get()` retornou um array de números (byte codes ASCII da string JSON) — o loop `for key in valores` iterava índices e produzia snapshot corrompido ({'100':100,...}). O mesmo campo, lido num endpoint de debug, retornava objeto normal — o formato varia por contexto/carga no JSVM.
- Evidência: debug na resposta da rota mostrou `campos_raw: "[91,34,112,...]"` e `valores_raw: "{}"`; após normalização (bytes→String.fromCharCode→JSON.parse), aplicar-modelo passou a gravar valores corretos (público, orçamento 1000, BRL, URL, pixel) e status completude `completo` (build v0.0.32/v0.0.34).
- Regra reutilizável: ao ler JSONField em hooks/rotas do Skip Cloud, normalizar: se string → JSON.parse; se array de números → String.fromCharCode de cada byte + JSON.parse; se objeto → JSON.parse(JSON.stringify). Nunca iterar o retorno cru de `record.get()` de JSONField assumindo que é objeto.
- Quando aplicar: qualquer leitura de campo JSON (valores predefinidos, snapshot, config) em hooks/rotas do Skip Cloud.
- Quando não aplicar: quando o valor já for garantidamente string/objeto simples (ex.: campos text).
- Confiança: alta — observado e corrigido diretamente na rota aplicar-modelo.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
