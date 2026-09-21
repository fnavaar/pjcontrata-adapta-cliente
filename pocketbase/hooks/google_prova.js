// google_prova.js — F2-T06 (SPEC-2-002) — prova de acesso Google Ads (CA-2-006)
// Rota server-side READ-ONLY: POST /backend/v1/google/prova-acesso
//   - sem credenciais nos secrets → BLOCKED_ACCESS com lista do que falta
//     (zero falso acesso — plano B da SPEC)
//   - com credenciais → troca refresh token por access token, chama
//     customers:listAccessibleCustomers, cruza com a allowlist (ad_connection
//     platform=google) e classifica Test/produção; NENHUMA mutação.
// Nota (set/2026): developer tokens foram sunset em 09/09/2026 — o header
// developer-token é opcional/ignorado; o nível de acesso vem do projeto Cloud.
// Enviamos o header se o secret existir (inofensivo, compatível com a SPEC).
// Segredos NUNCA em código/log/resposta (RN-226 — sanitizar como [TOKEN_REMOVIDO]).
// NOTA JSVM: helpers INLINE no callback (top-level não é visível — F1-T06).

routerAdd(
  'POST',
  '/backend/v1/google/prova-acesso',
  (e) => {
    const sanitizar = function (texto) {
      let s = String(texto || '')
      s = s.replace(/ya29\.[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(/1\/\/[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(
        /(token|secret|senha|password|access_token|refresh_token|client_secret)\s*[:=]\s*\S+/gi,
        '$1: [REMOVIDO]',
      )
      return s.substring(0, 500)
    }
    const mascararCustomer = function (id) {
      const s = String(id || '').replace(/-/g, '')
      if (s.length < 6) return '***'
      return s.substring(0, 3) + '-' + s.substring(3, 6) + '-***'
    }
    const auth = e.requestInfo().auth
    if (!auth) return e.unauthorizedError('Autenticação necessária')
    const role = String(auth.get('role') || '')
    if (role !== 'administrador' && role !== 'marketing') {
      return e.forbiddenError('Apenas administrador/marketing podem executar a prova de acesso')
    }

    // 1. Credenciais necessárias (todas de secrets — nunca de código/UI)
    const obrigatorios = {
      GOOGLE_CLIENT_ID: $secrets.get('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: $secrets.get('GOOGLE_CLIENT_SECRET'),
      GOOGLE_REFRESH_TOKEN: $secrets.get('GOOGLE_REFRESH_TOKEN'),
    }
    const opcionais = {
      GOOGLE_TEST_CUSTOMER_ID: $secrets.get('GOOGLE_TEST_CUSTOMER_ID'),
      GOOGLE_TEST_LOGIN_CUSTOMER_ID: $secrets.get('GOOGLE_TEST_LOGIN_CUSTOMER_ID'),
      GOOGLE_DEVELOPER_TOKEN: $secrets.get('GOOGLE_DEVELOPER_TOKEN'),
    }
    const faltando = []
    for (const k in obrigatorios) {
      if (!obrigatorios[k]) faltando.push(k)
    }
    if (faltando.length > 0) {
      // CA-2-006 / plano B da SPEC: sem credenciais → BLOCKED_ACCESS, sem falso acesso
      return e.json(200, {
        ok: true,
        estado: 'BLOCKED_ACCESS',
        faltando: faltando,
        mensagem:
          'Credenciais Google Ads ausentes no servidor — forneça-as para executar a prova de acesso (nenhuma chamada externa foi feita)',
      })
    }

    // 2. Trocar refresh token por access token (OAuth server-side)
    let rToken
    try {
      rToken = $http.send({
        url: 'https://oauth2.googleapis.com/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: obrigatorios.GOOGLE_CLIENT_ID,
          client_secret: obrigatorios.GOOGLE_CLIENT_SECRET,
          refresh_token: obrigatorios.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
        timeout: 30,
      })
    } catch (errToken) {
      return e.json(200, {
        ok: true,
        estado: 'BLOCKED_ACCESS',
        faltando: [],
        erro: sanitizar('Falha de transporte ao renovar credencial: ' + errToken),
        mensagem: 'Não foi possível renovar a credencial — tentar novamente',
      })
    }
    if (rToken.statusCode !== 200 || !rToken.json || !rToken.json.access_token) {
      // credencial expirada/inválida → BLOCKED_ACCESS, sem fallback fictício
      return e.json(200, {
        ok: true,
        estado: 'BLOCKED_ACCESS',
        faltando: [],
        erro: sanitizar(
          'Credencial Google expirada ou inválida (HTTP ' +
            rToken.statusCode +
            '): ' +
            (rToken.json && rToken.json.error_description
              ? rToken.json.error_description
              : rToken.json && rToken.json.error
                ? rToken.json.error
                : ''),
        ),
        mensagem: 'Renovar o refresh token fora do log e repetir a prova',
      })
    }
    const accessToken = rToken.json.access_token

    // 3. Listar customers acessíveis (read-only)
    const headers = {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    }
    if (opcionais.GOOGLE_DEVELOPER_TOKEN) {
      headers['developer-token'] = opcionais.GOOGLE_DEVELOPER_TOKEN
    }
    let rLista
    try {
      rLista = $http.send({
        url: 'https://googleads.googleapis.com/v25/customers:listAccessibleCustomers',
        method: 'GET',
        headers: headers,
        timeout: 30,
      })
    } catch (errLista) {
      return e.json(200, {
        ok: true,
        estado: 'BLOCKED_ACCESS',
        faltando: [],
        erro: sanitizar('Falha de transporte ao listar customers: ' + errLista),
        mensagem: 'Tentar novamente',
      })
    }
    if (rLista.statusCode !== 200 || !rLista.json || !rLista.json.resourceNames) {
      return e.json(200, {
        ok: true,
        estado: 'BLOCKED_ACCESS',
        faltando: [],
        erro: sanitizar(
          'ListAccessibleCustomers rejeitou (HTTP ' +
            rLista.statusCode +
            '): ' +
            (rLista.json && rLista.json.error && rLista.json.error.message
              ? rLista.json.error.message
              : ''),
        ),
        mensagem: 'Verificar acesso/nível do projeto Cloud fora do log',
      })
    }

    // 4. Cruzar com a allowlist (ad_connection platform=google) e classificar
    const allowlist = {}
    try {
      const conns = $app.findRecordsByFilter(
        'ad_connection',
        "platform = 'google'",
        'created',
        50,
        0,
      )
      for (let i = 0; i < conns.length; i++) {
        const ref = String(conns[i].get('account_ref') || '').replace(/-/g, '')
        const revokedAt = String(conns[i].get('revoked_at') || '')
        const revogada =
          revokedAt !== '' &&
          revokedAt.indexOf('0001-01-01') === -1 &&
          revokedAt.indexOf('1970-01-01') === -1
        allowlist[ref] = {
          environment: String(conns[i].get('environment') || 'desconhecido'),
          enabled: Boolean(conns[i].get('enabled')) && !revogada,
        }
      }
    } catch (_) {}

    const customers = []
    const nomes = rLista.json.resourceNames || []
    for (let j = 0; j < nomes.length; j++) {
      const id = String(nomes[j] || '')
        .replace('customers/', '')
        .replace(/-/g, '')
      const naAllowlist = allowlist[id]
      customers.push({
        id_mascarado: mascararCustomer(id),
        allowlist: Boolean(naAllowlist),
        environment: naAllowlist ? naAllowlist.environment : 'fora_da_allowlist',
        habilitada: naAllowlist ? naAllowlist.enabled : false,
      })
    }

    // 5. Consultar o customer de teste (opcional; tolerante a falha)
    let testeCustomer = null
    if (opcionais.GOOGLE_TEST_CUSTOMER_ID) {
      const idTeste = String(opcionais.GOOGLE_TEST_CUSTOMER_ID).replace(/-/g, '')
      const headersConsulta = {}
      for (const h in headers) headersConsulta[h] = headers[h]
      if (opcionais.GOOGLE_TEST_LOGIN_CUSTOMER_ID) {
        headersConsulta['login-customer-id'] = String(
          opcionais.GOOGLE_TEST_LOGIN_CUSTOMER_ID,
        ).replace(/-/g, '')
      }
      let rCliente
      try {
        rCliente = $http.send({
          url: 'https://googleads.googleapis.com/v25/customers/' + idTeste,
          method: 'GET',
          headers: headersConsulta,
          timeout: 30,
        })
      } catch (errCliente) {
        rCliente = { statusCode: 0, json: {} }
      }
      if (rCliente.statusCode === 200 && rCliente.json && rCliente.json.id) {
        testeCustomer = {
          id_mascarado: mascararCustomer(rCliente.json.id),
          nome: String(rCliente.json.descriptiveName || ''),
          moeda: String(rCliente.json.currencyCode || ''),
          fuso: String(rCliente.json.timeZone || ''),
          status: String(rCliente.json.status || ''),
        }
      } else {
        testeCustomer = {
          id_mascarado: mascararCustomer(idTeste),
          erro: sanitizar(
            'Consulta ao customer de teste falhou (HTTP ' +
              rCliente.statusCode +
              '): ' +
              (rCliente.json && rCliente.json.error && rCliente.json.error.message
                ? rCliente.json.error.message
                : ''),
          ),
        }
      }
    }

    // 6. Prova OK — nada foi mutado (rota read-only)
    return e.json(200, {
      ok: true,
      estado: 'PROVA_OK',
      total_acessiveis: customers.length,
      customers: customers,
      teste_customer: testeCustomer,
      developer_token_enviado: Boolean(opcionais.GOOGLE_DEVELOPER_TOKEN),
      mensagem:
        'Prova de acesso executada (read-only): customers listados e classificados contra a allowlist; nenhuma mutação foi feita',
    })
  },
  $apis.requireAuth(),
)
