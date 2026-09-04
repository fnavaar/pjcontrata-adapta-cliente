# AP-2026-09-04-1132 — skip_file_patch cirúrgico para editar arquivos grandes no Skip Cloud

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: F1-T09 / SPEC-1-003
- Sinal: editar um arquivo grande (CampanhaDetalhe.tsx, ~45KB) via skip_file_write com conteúdo inteiro corrompeu a transmissão (retorno de erro de argumentos, nada gravado). O mesmo arquivo foi editado com skip_file_patch (blocos SEARCH/REPLACE) e aplicou 3/3 blocos exatos, sem duplicar nem corromper.
- Evidência: write corrompido retornou "invalid arguments... missing required property projectId" e o read seguinte mostrou o arquivo original intacto (46724 chars, sem prévia). O patch aplicou com `blocksApplied: 3` e o read pós-patch confirmou 55490 chars com exatamente 1 card de prévia e balanceamento JSX correto.
- Regra reutilizável: para alterar arquivo grande no Skip Cloud, prefira skip_file_patch (SEARCH/REPLACE cirúrgico, all-or-nothing) em vez de reenviar o conteúdo inteiro com skip_file_write. É mais seguro, idempotente por bloco e evita corromper arquivos grandes.
- Quando aplicar: edição de arquivos grandes (frontend/páginas, hooks extensos) no Skip Cloud; mudanças localizadas.
- Quando não aplicar: criação de arquivo novo (aí skip_file_write é o certo); reescrita total intencional.
- Confiança: média — observado em 1 caso (F1-T09), mas coerente com o padrão já registrado de "write corrompido não grava" (AP F1-T09 anterior em 04/set) e com a lição F1-T06 de JSONField-bytes.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
