# Recibo — F2-T03: Prova de autorização e conta Meta de teste

- **Data:** 2026-09-16
- **SPEC:** SPEC-2-001 (Meta — publicação controlada) / pré-condição da SPEC-2-003
- **Build:** v0.0.109 (QA ok)
- **Champion:** Gustavo — Gerente de Marketing
- **Executor da prova:** assistente ETHOS (autorização do owner)

## O que foi providenciado pelo owner (Tarcísio)

1. App Meta **"API oficial CRM"** (App ID 1004482402468681, business `iaferramenta`) com caso de uso **Create & manage ads with Marketing API**.
2. **Sandbox Ad Account** criada: `act_1585807056675719` ("New Sandbox Ad Account").
3. **Token de acesso** gerado via ferramenta oficial (ícone de chave da sandbox), escopo mínimo.

## Prova de acesso (CA-2-001) — executada em 16/09/2026

| Prova | Chamada (read-only) | Resultado |
|---|---|---|
| Identidade do token | `GET /me` | PASS — usuário Tarcisio Miranda (id 4106699642962517) |
| Conta permitida | `GET /act_1585807056675719?fields=id,name,account_status,currency,timezone_name` | PASS — "New Sandbox Ad Account", status 1 (ativa), BRL, America/Sao_Paulo |
| Listagem de campanhas | `GET /act_1585807056675719/campaigns` | PASS — vazio (0 campanhas, como esperado em sandbox nova) |

- **Sem revelar segredo**: nenhuma resposta exibiu o token; nenhuma chamada de escrita foi feita.
- **Iterações**: 1º token (Graph API Explorer) válido mas sem acesso à sandbox (403 — sandbox não atribuída ao usuário); resolvido com token gerado pela chave da própria sandbox, que nasce vinculado ao ativo.

## Segurança

- Token gravado em **secrets do Skip Cloud** (`META_ACCESS_TOKEN`, `META_SANDBOX_ACCOUNT_ID`) — nunca em código, log, changelog ou recibo.
- Conta cadastrada na allowlist da ferramenta: `ad_connection` id `ogzfs36ibb8tzbl` (platform meta, environment **teste**, enabled).
- Contas produtivas continuam bloqueadas por gate (SPEC-2-001).

## Aceite humano

- Pendente no momento da emissão deste recibo.
