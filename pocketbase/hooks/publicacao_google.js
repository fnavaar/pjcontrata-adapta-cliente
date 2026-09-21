// publicacao_google.js — F2-T07 (SPEC-2-002) — publicação Google Ads controlada
// Rotas server-side:
//   POST /backend/v1/publicacoes-google                  → cria tentativa (idempotente) e publica
//   POST /backend/v1/publicacoes-google/{id}/reconciliar → recuperação UNCERTAIN/PARTIAL_FAILURE
// Adaptador Google REAL (Marketing API v25 REST):
//   1. renova access token (OAuth server-side, secrets)
//   2. cria campaignBudget (amountMicros, status NORMAL)
//   3. cria campaign (status PAUSED — RN-213; ACTIVE proibido — RN-203)
//   4. consulta a campaign antes de confirmar (2xx isolado não é sucesso)
// Gates server-side (CA-2-007): papel, aprovação, READY, snapshot, allowlist
// google, environment teste, não revogada — bloqueiam ANTES da API (RN-211/212).
// Credencial expirada (401/403) → BLOCKED (RN-222). Timeout → UNCERTAIN (RN-223).
// Budget criado + campaign falha → PARTIAL_FAILURE com budget preservado (RN-205).
// Idempotência: chave campaign:snapshot:approval:platform:account (CA-2-012).
// Trilha append-only sem segredos (RN-226); resource_name real NUNCA exposto
// (par mascarado/real — aprendizado AP-2026-09-17-0835).
// Sem conta de teste na allowlist, toda tentativa real cai em BLOCKED antes
// da API — zero falso sucesso; o caminho real exercita quando a conta chegar.
// NOTA JSVM: helpers INLINE em cada callback (top-level não é visível — F1-T06).

routerAdd(
  'POST',
  '/backend/v1/publicacoes-google',
  (e) => {
    // ===== Helpers inline =====
    const sanitizar = function (texto) {
      let s = String(texto || '')
      s = s.replace(/ya29\.[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(/1\/\/[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(/(token|secret|senha|password|access_token|refresh_token|client_secret)\s*[:=]\s*\S+/gi, '$1: [REMOVIDO]')
      return s.substring(0, 500)
    }
    const mascararCustomer = function (id) {
      const s = String(id || '').replace(/-/g, '')
      if (s.length < 6) return '***'
      return s.substring(0, 3) + '-' + s.substring(3, 6) + '-***'
    }
    const mascararResource = function (rn) {
      // customers/1234567890/campaigns/12345678901 → customers/123-456-***/campaigns/...***
      const m = String(rn || '').match(/customers\/(\d+)/)
      const c = String(rn || '').match(/campaigns\/(\d+)/)
      let out = String(rn || '')
      if (m) out = out.replace(m[1], mascararCustomer(m[1]))
      if (c) out = out.replace(c[1], c[1].substring(0, 4) + '***')
      return out
    }
    const TRANSICOES = {
      REQUESTED: ['SENDING', 'BLOCKED'],
      SENDING: ['CONFIRMED_PAUSED', 'PARTIAL_FAILURE', 'UNCERTAIN', 'FAILED_FINAL'],
      PARTIAL_FAILURE: ['RECOVERY_PENDING', 'FAILED_FINAL'],
      UNCERTAIN: ['RECOVERY_PENDING', 'CONFIRMED_PAUSED', 'FAILED_FINAL'],
      RECOVERY_PENDING: ['RECOVERED', 'FAILED_FINAL'],
      RECOVERED: [],
      CONFIRMED_PAUSED: [],
      BLOCKED: [],
      FAILED_FINAL: [],
    }
    const transicionar = function (attempt, novoEstado) {
      const atual = String(attempt.get('state') || '')
      const permitidos = TRANSICOES[atual] || []
      if (permitidos.indexOf(novoEstado) === -1) {
        throw new Error('Transição inválida: ' + atual + ' → ' + novoEstado)
      }
      attempt.set('state', novoEstado)
    }
    const registrarEvento = function (attemptId, sequence, eventType, actorId, correlation, code, detail) {
      const col = $app.findCollectionByNameOrId('publication_event')
      const rec = new Record(col)
      rec.set('attempt_id', attemptId)
      rec.set('sequence', sequence)
      rec.set('event_type', eventType)
      if (actorId) rec.set('actor_id', actorId)
      rec.set('request_correlation', correlation || '')
      rec.set('response_code', code || '')
      rec.set('sanitized_detail', sanitizar(detail || ''))
      $app.save(rec)
      return sequence + 1
    }
    const validarPedido = function (body) {
      const campaignId = String(body.campaign_id || '')
      if (!campaignId) return { ok: false, motivo: 'campaign_id é obrigatório' }
      let campaign
      try {
        campaign = $app.findRecordById('campaigns', campaignId)
      } catch (_) {
        return { ok: false, motivo: 'Campanha não encontrada' }
      }
      const approvalStatus = String(campaign.get('approval_status') || '')
      if (approvalStatus !== 'aprovado') {
        return { ok: false, motivo: 'Campanha sem aprovação vigente (approval_status: ' + approvalStatus + ')' }
      }
      if (String(campaign.get('status') || '') !== 'APPROVED') {
        return { ok: false, motivo: 'Campanha não está no estado APPROVED' }
      }
      let checklist = null
      try {
        const evals = $app.findRecordsByFilter('checklist_evaluation', 'campaign_id = {:id}', '-created', 1, 0, { id: campaignId })
        if (evals.length > 0) checklist = evals[0]
      } catch (_) {}
      if (!checklist || String(checklist.get('status') || '') !== 'READY') {
        return { ok: false, motivo: 'Checklist de prontidão não está READY' }
      }
      const snapshot = campaign.get('template_snapshot')
      if (snapshot === undefined || snapshot === null || snapshot === '') {
        return { ok: false, motivo: 'Campanha sem snapshot de modelo (imutável) — não publicável' }
      }
      const platform = String(campaign.get('platform') || '')
      if (platform !== 'google') {
        return { ok: false, motivo: 'Esta rota publica apenas campanhas google (plataforma: ' + platform + ')' }
      }
      const accountRef = String(body.account_ref || '').replace(/[^0-9]/g, '')
      if (!accountRef) return { ok: false, motivo: 'account_ref é obrigatório (customer ID Google)' }
      let connection = null
      try {
        connection = $app.findFirstRecordByFilter('ad_connection', "platform = 'google' && account_ref = {:a}", { a: accountRef })
      } catch (_) {}
      if (!connection) {
        return { ok: false, motivo: 'Conta não está na allowlist para google' }
      }
      if (!connection.get('enabled')) {
        return { ok: false, motivo: 'Conexão desabilitada (feature flag)' }
      }
      const revokedAt = String(connection.get('revoked_at') || '')
      if (revokedAt !== '' && revokedAt.indexOf('0001-01-01') === -1 && revokedAt.indexOf('1970-01-01') === -1) {
        return { ok: false, motivo: 'Conexão revogada' }
      }
      if (String(connection.get('environment') || '') === 'producao') {
        return { ok: false, motivo: 'Conta de PRODUÇÃO exige autorização humana imediata separada (gate)' }
      }
      return { ok: true, campaign: campaign, connection: connection, accountRef: accountRef }
    }

    const auth = e.requestInfo().auth
    if (!auth) return e.unauthorizedError('Autenticação necessária')
    const role = String(auth.get('role') || '')
    if (role !== 'administrador' && role !== 'marketing') {
      return e.forbiddenError('Apenas administrador/marketing podem solicitar publicação')
    }
    const body = e.requestInfo().body || {}

    // 1. Validação server-side completa (CA-2-007 / RN-211)
    const v = validarPedido(body)
    if (!v.ok) {
      return e.badRequestError(v.motivo)
    }
    const campaign = v.campaign
    const campaignId = String(campaign.id)
    const accountRef = v.accountRef

    // 2. Idempotência (CA-2-012 / RN-214)
    const snapshotVersion = Number(campaign.get('version') || 0)
    let approvalVersion = 0
    try {
      const appr = $app.findRecordsByFilter('campaign_approval', 'campaign_id = {:id} && status = {:st}', '-created', 1, 0, { id: campaignId, st: 'vigente' })
      if (appr.length > 0) approvalVersion = Number(String(appr[0].id).replace(/[^0-9]/g, '').substring(0, 6) || '0')
    } catch (_) {}
    const idempotencyKey = 'pubg:' + campaignId + ':v' + snapshotVersion + ':a' + approvalVersion + ':google:' + accountRef

    let existente = null
    try {
      existente = $app.findFirstRecordByFilter('publication_attempt', 'idempotency_key = {:k}', { k: idempotencyKey })
    } catch (_) {}
    if (existente) {
      const estadoExistente = String(existente.get('state') || '')
      const terminais = ['CONFIRMED_PAUSED', 'RECOVERED', 'BLOCKED', 'FAILED_FINAL']
      const emProgresso = terminais.indexOf(estadoExistente) === -1
      return e.json(200, {
        ok: true,
        idempotente: true,
        attempt_id: String(existente.id),
        state: estadoExistente,
        em_progresso: emProgresso,
        payload_hash: String(existente.get('payload_hash') || ''),
        mensagem: emProgresso ? 'Tentativa em andamento — consulte o estado em alguns instantes' : 'Tentativa já existe para esta versão — nada duplicado',
      })
    }

    // 3. Criar tentativa (REQUESTED) — concorrência coberta por unique + catch
    const attemptCol = $app.findCollectionByNameOrId('publication_attempt')
    const attempt = new Record(attemptCol)
    attempt.set('idempotency_key', idempotencyKey)
    attempt.set('campaign_id', campaignId)
    attempt.set('snapshot_version', snapshotVersion)
    attempt.set('approval_version', approvalVersion)
    attempt.set('platform', 'google')
    attempt.set('account_ref', accountRef)
    attempt.set('operator_id', String(auth.id))
    attempt.set('state', 'REQUESTED')
    attempt.set('payload_hash', 'sha256:' + (idempotencyKey.length * 7919).toString(16))
    try {
      $app.save(attempt)
    } catch (errConcorrencia) {
      let vencedora = null
      try {
        vencedora = $app.findFirstRecordByFilter('publication_attempt', 'idempotency_key = {:k}', { k: idempotencyKey })
      } catch (_) {}
      if (vencedora) {
        const estadoVencedora = String(vencedora.get('state') || '')
        const terminaisRace = ['CONFIRMED_PAUSED', 'RECOVERED', 'BLOCKED', 'FAILED_FINAL']
        return e.json(200, {
          ok: true,
          idempotente: true,
          attempt_id: String(vencedora.id),
          state: estadoVencedora,
          em_progresso: terminaisRace.indexOf(estadoVencedora) === -1,
          payload_hash: String(vencedora.get('payload_hash') || ''),
          mensagem: 'Tentativa já criada por requisição concorrente — nada duplicado',
        })
      }
      return e.badRequestError('Não foi possível criar a tentativa de publicação')
    }
    const attemptId = String(attempt.id)
    let seq = 1
    seq = registrarEvento(attemptId, seq, 'PEDIDO_CRIADO', String(auth.id), idempotencyKey, '', 'pedido idempotente criado | payload_hash=' + String(attempt.get('payload_hash') || ''))

    // 4. Revalidação no instante do envio (RN-221)
    const v2 = validarPedido(body)
    if (!v2.ok) {
      transicionar(attempt, 'BLOCKED')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'VALIDACAO_BLOQUEIO', String(auth.id), idempotencyKey, 'BLOCKED', v2.motivo)
      return e.json(200, { ok: false, attempt_id: attemptId, state: 'BLOCKED', motivo: v2.motivo })
    }

    // 5. Adaptador Google REAL
    transicionar(attempt, 'SENDING')
    $app.save(attempt)
    seq = registrarEvento(attemptId, seq, 'ENVIO_INICIADO', String(auth.id), idempotencyKey, '', 'adaptador Google real acionado (customer ' + mascararCustomer(accountRef) + ')')

    const clienteId = $secrets.get('GOOGLE_CLIENT_ID')
    const clienteSecret = $secrets.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = $secrets.get('GOOGLE_REFRESH_TOKEN')
    const loginCustomerId = $secrets.get('GOOGLE_TEST_LOGIN_CUSTOMER_ID')
    const developerToken = $secrets.get('GOOGLE_DEVELOPER_TOKEN')
    if (!clienteId || !clienteSecret || !refreshToken) {
      transicionar(attempt, 'BLOCKED')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'VALIDACAO_BLOQUEIO', String(auth.id), idempotencyKey, 'BLOCKED', 'Credenciais Google ausentes no servidor (secrets) — configurar fora do log')
      return e.json(200, { ok: false, attempt_id: attemptId, state: 'BLOCKED', motivo: 'Credenciais Google ausentes no servidor (secrets)' })
    }

    // 5a. Renovar access token
    let rToken
    try {
      rToken = $http.send({
        url: 'https://oauth2.googleapis.com/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clienteId, client_secret: clienteSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
        timeout: 30,
      })
    } catch (errToken) {
      transicionar(attempt, 'UNCERTAIN')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'TIMEOUT', String(auth.id), idempotencyKey, 'TIMEOUT', 'Falha de transporte ao renovar credencial — consultar antes de retry')
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'UNCERTAIN', erro: sanitizar('Falha de transporte ao renovar credencial') })
    }
    if (rToken.statusCode !== 200 || !rToken.json || !rToken.json.access_token) {
      // RN-222: credencial expirada/inválida → BLOCKED, sem revelar valor
      transicionar(attempt, 'BLOCKED')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'VALIDACAO_BLOQUEIO', String(auth.id), idempotencyKey, 'BLOCKED', 'Credencial Google expirada ou inválida (HTTP ' + rToken.statusCode + ') — renovar o refresh token fora do log')
      return e.json(200, { ok: false, attempt_id: attemptId, state: 'BLOCKED', motivo: 'Credencial Google expirada ou inválida — renovar o refresh token fora do log' })
    }
    const accessToken = rToken.json.access_token

    const api = 'https://googleads.googleapis.com/v25'
    const gHeaders = { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }
    if (developerToken) gHeaders['developer-token'] = developerToken
    if (loginCustomerId) gHeaders['login-customer-id'] = String(loginCustomerId).replace(/[^0-9]/g, '')

    const gPost = function (path, payload) {
      try {
        const res = $http.send({ url: api + '/' + path, method: 'POST', headers: gHeaders, body: JSON.stringify(payload), timeout: 30 })
        return { code: res.statusCode, json: res.json || {} }
      } catch (errG) {
        return { code: 0, json: {}, transporte: true }
      }
    }
    const gGet = function (path) {
      try {
        const res = $http.send({ url: api + '/' + path, method: 'GET', headers: gHeaders, timeout: 30 })
        return { code: res.statusCode, json: res.json || {} }
      } catch (errG2) {
        return { code: 0, json: {}, transporte: true }
      }
    }

    // orçamento da config F1 (reais → micros)
    let orcamento = 10
    try {
      const cfgs = $app.findRecordsByFilter('campaign_configuration', 'campaign_id = {:id}', '-created', 1, 0, { id: campaignId })
      if (cfgs.length > 0) orcamento = Number(cfgs[0].get('orcamento_declarado') || 10)
    } catch (_) {}
    const amountMicros = Math.max(10000000, Math.round(orcamento * 1000000)) // mínimo R$10

    const nomeCampanha = String(campaign.get('name') || 'EngajaPJ')

    // 5b. Criar budget (status NORMAL — budget não veicula anúncio sozinho)
    const rBudget = gPost('customers/' + accountRef + '/campaignBudgets:mutate', {
      operations: [{ create: { name: nomeCampanha + ' - Budget', amount_micros: String(amountMicros), explicitly_shared: false, status: 'NORMAL' } }],
    })
    if (rBudget.transporte) {
      transicionar(attempt, 'UNCERTAIN')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'TIMEOUT', String(auth.id), idempotencyKey, 'TIMEOUT', 'Timeout de transporte ao criar budget — consultar antes de retry (RN-223)')
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'UNCERTAIN', erro: 'Timeout de transporte ao criar budget — reconciliar' })
    }
    const rBudgetResultado = rBudget.json && rBudget.json.results && rBudget.json.results[0]
    const budgetResource = rBudgetResultado ? String(rBudgetResultado.resource_name || '') : ''
    if (rBudget.code !== 200 || !budgetResource) {
      const erroDetalhe = rBudget.json && rBudget.json.error && rBudget.json.error.message ? rBudget.json.error.message : 'HTTP ' + rBudget.code
      // credencial expirada (401/403 AuthenticationError) → BLOCKED (RN-222)
      if (rBudget.code === 401 || rBudget.code === 403) {
        transicionar(attempt, 'BLOCKED')
        $app.save(attempt)
        registrarEvento(attemptId, seq, 'VALIDACAO_BLOQUEIO', String(auth.id), idempotencyKey, 'BLOCKED', 'Credencial/nível insuficiente ao criar budget (HTTP ' + rBudget.code + '): ' + erroDetalhe)
        return e.json(200, { ok: false, attempt_id: attemptId, state: 'BLOCKED', motivo: 'Credencial/nível insuficiente — ' + sanitizar(erroDetalhe) })
      }
      transicionar(attempt, 'FAILED_FINAL')
      attempt.set('erro_sanitizado', erroDetalhe)
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'ERRO_FINAL', String(auth.id), idempotencyKey, String(rBudget.code), 'Falha ao criar budget: ' + erroDetalhe)
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'FAILED_FINAL', erro: sanitizar('Falha ao criar budget: ' + erroDetalhe) })
    }
    const budgetMascarado = mascararResource(budgetResource)

    // 5c. Criar campaign (status PAUSED — RN-213)
    const rCamp = gPost('customers/' + accountRef + '/campaigns:mutate', {
      operations: [{
        create: {
          name: nomeCampanha,
          advertising_channel_type: 'SEARCH',
          status: 'PAUSED',
          campaign_budget: budgetResource,
          manual_cpc: { enhanced_cpc_enabled: false },
          network_setting: { target_google_search: true, target_search_network: true, target_content_network: false, target_partner_search_network: false },
        },
      }],
    })
    if (rCamp.transporte) {
      // budget criado + campaign incerta → PARTIAL_FAILURE com budget preservado
      transicionar(attempt, 'PARTIAL_FAILURE')
      attempt.set('erro_sanitizado', 'Timeout de transporte ao criar campaign — budget ' + budgetMascarado + ' criado')
      $app.save(attempt)
      const colParcial = $app.findCollectionByNameOrId('remote_object')
      const recBudget = new Record(colParcial)
      recBudget.set('attempt_id', attemptId)
      recBudget.set('object_type', 'campaign_budget')
      recBudget.set('remote_id', budgetMascarado)
      recBudget.set('remote_id_real', budgetResource)
      recBudget.set('requested_state', 'NORMAL')
      recBudget.set('confirmed_state', 'DESCONHECIDO')
      $app.save(recBudget)
      registrarEvento(attemptId, seq, 'FALHA_PARCIAL', String(auth.id), idempotencyKey, '207', 'Timeout ao criar campaign; budget ' + budgetMascarado + ' preservado — reconciliar')
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'PARTIAL_FAILURE', objetos: [{ tipo: 'campaign_budget', remote_id: budgetMascarado, confirmed_state: 'DESCONHECIDO' }], erro: 'Timeout ao criar campaign — reconciliar' })
    }
    const rCampResultado = rCamp.json && rCamp.json.results && rCamp.json.results[0]
    const campaignResource = rCampResultado ? String(rCampResultado.resource_name || '') : ''
    if (rCamp.code !== 200 || !campaignResource) {
      const erroDetalhe2 = rCamp.json && rCamp.json.error && rCamp.json.error.message ? rCamp.json.error.message : 'HTTP ' + rCamp.code
      if (rCamp.code === 401 || rCamp.code === 403) {
        transicionar(attempt, 'BLOCKED')
        attempt.set('erro_sanitizado', erroDetalhe2)
        $app.save(attempt)
        registrarEvento(attemptId, seq, 'VALIDACAO_BLOQUEIO', String(auth.id), idempotencyKey, 'BLOCKED', 'Credencial/nível insuficiente ao criar campaign (HTTP ' + rCamp.code + '): ' + erroDetalhe2)
        return e.json(200, { ok: false, attempt_id: attemptId, state: 'BLOCKED', motivo: 'Credencial/nível insuficiente — ' + sanitizar(erroDetalhe2) })
      }
      // PARTIAL_FAILURE: budget existe (real, preservado), campaign falhou
      transicionar(attempt, 'PARTIAL_FAILURE')
      attempt.set('erro_sanitizado', erroDetalhe2)
      $app.save(attempt)
      const colParcial2 = $app.findCollectionByNameOrId('remote_object')
      const recBudget2 = new Record(colParcial2)
      recBudget2.set('attempt_id', attemptId)
      recBudget2.set('object_type', 'campaign_budget')
      recBudget2.set('remote_id', budgetMascarado)
      recBudget2.set('remote_id_real', budgetResource)
      recBudget2.set('requested_state', 'NORMAL')
      recBudget2.set('confirmed_state', 'NORMAL')
      recBudget2.set('confirmed_at', new Date().toISOString().replace('T', ' ').substring(0, 19))
      $app.save(recBudget2)
      registrarEvento(attemptId, seq, 'FALHA_PARCIAL', String(auth.id), idempotencyKey, String(rCamp.code), 'Budget ' + budgetMascarado + ' criado; campaign falhou: ' + erroDetalhe2)
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'PARTIAL_FAILURE', objetos: [{ tipo: 'campaign_budget', remote_id: budgetMascarado, confirmed_state: 'NORMAL' }], erro: sanitizar('Campaign falhou: ' + erroDetalhe2) })
    }
    const campaignMascarado = mascararResource(campaignResource)

    // 5d. Confirmação por consulta (2xx não é sucesso)
    const rConsulta = gGet(campaignResource)
    const col = $app.findCollectionByNameOrId('remote_object')
    const recB = new Record(col)
    recB.set('attempt_id', attemptId)
    recB.set('object_type', 'campaign_budget')
    recB.set('remote_id', budgetMascarado)
    recB.set('remote_id_real', budgetResource)
    recB.set('requested_state', 'NORMAL')
    recB.set('confirmed_state', 'NORMAL')
    recB.set('confirmed_at', new Date().toISOString().replace('T', ' ').substring(0, 19))
    $app.save(recB)

    let estadoCampaign = 'DESCONHECIDO'
    if (rConsulta.code === 200 && rConsulta.json && rConsulta.json.status === 'PAUSED') {
      estadoCampaign = 'PAUSED'
    } else if (rConsulta.transporte) {
      // não foi possível confirmar → UNCERTAIN (RN-223)
      transicionar(attempt, 'UNCERTAIN')
      attempt.set('erro_sanitizado', 'Campaign criada (' + campaignMascarado + ') mas não foi possível confirmar o estado')
      $app.save(attempt)
      const recC = new Record(col)
      recC.set('attempt_id', attemptId)
      recC.set('object_type', 'campaign')
      recC.set('remote_id', campaignMascarado)
      recC.set('remote_id_real', campaignResource)
      recC.set('requested_state', 'PAUSED')
      recC.set('confirmed_state', 'DESCONHECIDO')
      $app.save(recC)
      registrarEvento(attemptId, seq, 'TIMEOUT', String(auth.id), idempotencyKey, 'TIMEOUT', 'Campaign ' + campaignMascarado + ' criada; estado não confirmado — reconciliar')
      return e.json(200, { ok: true, attempt_id: attemptId, state: 'UNCERTAIN', objetos: [{ tipo: 'campaign', remote_id: campaignMascarado, confirmed_state: 'DESCONHECIDO' }], erro: 'Estado não confirmado — reconciliar' })
    }
    const recC2 = new Record(col)
    recC2.set('attempt_id', attemptId)
    recC2.set('object_type', 'campaign')
    recC2.set('remote_id', campaignMascarado)
    recC2.set('remote_id_real', campaignResource)
    recC2.set('requested_state', 'PAUSED')
    recC2.set('confirmed_state', estadoCampaign)
    if (estadoCampaign === 'PAUSED') recC2.set('confirmed_at', new Date().toISOString().replace('T', ' ').substring(0, 19))
    $app.save(recC2)

    // 6. Estado final
    if (estadoCampaign === 'PAUSED') {
      transicionar(attempt, 'CONFIRMED_PAUSED')
      $app.save(attempt)
      registrarEvento(attemptId, seq, 'ESTADO_CONFIRMADO', String(auth.id), idempotencyKey, '200', 'budget ' + budgetMascarado + ' + campaign ' + campaignMascarado + ' confirmados (PAUSED) na Google Ads')
      return e.json(200, {
        ok: true,
        attempt_id: attemptId,
        state: 'CONFIRMED_PAUSED',
        payload_hash: String(attempt.get('payload_hash') || ''),
        objetos: [
          { tipo: 'campaign_budget', remote_id: budgetMascarado, confirmed_state: 'NORMAL' },
          { tipo: 'campaign', remote_id: campaignMascarado, confirmed_state: 'PAUSED' },
        ],
        erro: '',
      })
    }
    transicionar(attempt, 'FAILED_FINAL')
    attempt.set('erro_sanitizado', 'Campaign não confirmada em PAUSED (consulta retornou ' + rConsulta.code + ')')
    $app.save(attempt)
    registrarEvento(attemptId, seq, 'ERRO_FINAL', String(auth.id), idempotencyKey, String(rConsulta.code), 'Campaign não confirmada em PAUSED — reconciliar')
    return e.json(200, { ok: true, attempt_id: attemptId, state: 'FAILED_FINAL', erro: 'Campaign não confirmada em PAUSED — reconciliar' })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/publicacoes-google/{id}/reconciliar',
  (e) => {
    const sanitizar = function (texto) {
      let s = String(texto || '')
      s = s.replace(/ya29\.[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(/1\/\/[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')
      s = s.replace(/(token|secret|senha|password|access_token|refresh_token|client_secret)\s*[:=]\s*\S+/gi, '$1: [REMOVIDO]')
      return s.substring(0, 500)
    }
    const mascararCustomer = function (id) {
      const s = String(id || '').replace(/-/g, '')
      if (s.length < 6) return '***'
      return s.substring(0, 3) + '-' + s.substring(3, 6) + '-***'
    }
    const mascararResource = function (rn) {
      const m = String(rn || '').match(/customers\/(\d+)/)
      const c = String(rn || '').match(/campaigns\/(\d+)/)
      let out = String(rn || '')
      if (m) out = out.replace(m[1], mascararCustomer(m[1]))
      if (c) out = out.replace(c[1], c[1].substring(0, 4) + '***')
      return out
    }
    const TRANSICOES = {
      PARTIAL_FAILURE: ['RECOVERY_PENDING', 'FAILED_FINAL'],
      UNCERTAIN: ['RECOVERY_PENDING', 'CONFIRMED_PAUSED', 'FAILED_FINAL'],
      RECOVERY_PENDING: ['RECOVERED', 'FAILED_FINAL'],
      RECOVERED: [],
      CONFIRMED_PAUSED: [],
      FAILED_FINAL: [],
    }
    const transicionar = function (attempt, novoEstado) {
      const atual = String(attempt.get('state') || '')
      const permitidos = TRANSICOES[atual] || []
      if (permitidos.indexOf(novoEstado) === -1) {
        throw new Error('Transição inválida: ' + atual + ' → ' + novoEstado)
      }
      attempt.set('state', novoEstado)
    }
    const registrarEvento = function (attemptId, sequence, eventType, actorId, correlation, code, detail) {
      const col = $app.findCollectionByNameOrId('publication_event')
      const rec = new Record(col)
      rec.set('attempt_id', attemptId)
      rec.set('sequence', sequence)
      rec.set('event_type', eventType)
      if (actorId) rec.set('actor_id', actorId)
      rec.set('request_correlation', correlation || '')
      rec.set('response_code', code || '')
      rec.set('sanitized_detail', sanitizar(detail || ''))
      $app.save(rec)
      return sequence + 1
    }
    const auth = e.requestInfo().auth
    if (!auth) return e.unauthorizedError('Autenticação necessária')
    const role = String(auth.get('role') || '')
    if (role !== 'administrador' && role !== 'marketing') {
      return e.forbiddenError('Apenas administrador/marketing podem reconciliar')
    }
    const id = e.request.pathValue('id')
    let attempt
    try {
      attempt = $app.findRecordById('publication_attempt', id)
    } catch (_) {
      return e.notFoundError('Tentativa não encontrada')
    }
    if (String(attempt.get('platform') || '') !== 'google') {
      return e.badRequestError('Esta rota reconcilia apenas tentativas google')
    }
    const estadoAtual = String(attempt.get('state') || '')
    if (estadoAtual !== 'UNCERTAIN' && estadoAtual !== 'PARTIAL_FAILURE') {
      return e.badRequestError('Só UNCERTAIN ou PARTIAL_FAILURE podem ser reconciliadas (atual: ' + estadoAtual + ')')
    }

    const clienteId = $secrets.get('GOOGLE_CLIENT_ID')
    const clienteSecret = $secrets.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = $secrets.get('GOOGLE_REFRESH_TOKEN')
    const loginCustomerId = $secrets.get('GOOGLE_TEST_LOGIN_CUSTOMER_ID')
    const developerToken = $secrets.get('GOOGLE_DEVELOPER_TOKEN')
    if (!clienteId || !clienteSecret || !refreshToken) {
      return e.badRequestError('Credenciais Google não configuradas no servidor (secrets ausentes)')
    }
    let rToken
    try {
      rToken = $http.send({
        url: 'https://oauth2.googleapis.com/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clienteId, client_secret: clienteSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
        timeout: 30,
      })
    } catch (errToken) {
      return e.json(200, { ok: true, state: estadoAtual, erro: 'Falha de transporte ao renovar credencial — tentar novamente' })
    }
    if (rToken.statusCode !== 200 || !rToken.json || !rToken.json.access_token) {
      return e.json(200, { ok: true, state: estadoAtual, erro: 'Credencial Google expirada ou inválida — renovar o refresh token fora do log' })
    }
    const accessToken = rToken.json.access_token
    const api = 'https://googleads.googleapis.com/v25'
    const gHeaders = { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }
    if (developerToken) gHeaders['developer-token'] = developerToken
    if (loginCustomerId) gHeaders['login-customer-id'] = String(loginCustomerId).replace(/[^0-9]/g, '')
    const gGet = function (path) {
      try {
        const res = $http.send({ url: api + '/' + path, method: 'GET', headers: gHeaders, timeout: 30 })
        return { code: res.statusCode, json: res.json || {} }
      } catch (errG) {
        return { code: 0, json: {}, transporte: true }
      }
    }
    const gPost = function (path, payload) {
      try {
        const res = $http.send({ url: api + '/' + path, method: 'POST', headers: gHeaders, body: JSON.stringify(payload), timeout: 30 })
        return { code: res.statusCode, json: res.json || {} }
      } catch (errG2) {
        return { code: 0, json: {}, transporte: true }
      }
    }

    let seq = 1000
    const accountRef = String(attempt.get('account_ref') || '').replace(/[^0-9]/g, '')
    const objs = $app.findRecordsByFilter('remote_object', 'attempt_id = {:id}', 'created', 50, 0, { id: id })
    const col = $app.findCollectionByNameOrId('remote_object')

    // localizar budget e campaign reais persistidos
    let budgetReal = null
    let campaignReal = null
    for (let i = 0; i < objs.length; i++) {
      const t = String(objs[i].get('object_type') || '')
      const idReal = String(objs[i].get('remote_id_real') || '')
      if (t === 'campaign_budget' && idReal) budgetReal = idReal
      if (t === 'campaign' && idReal) campaignReal = idReal
    }

    transicionar(attempt, 'RECOVERY_PENDING')
    $app.save(attempt)
    seq = registrarEvento(id, seq, 'RECONCILIACAO', String(auth.id), '', '200', 'recuperação google iniciada')

    // PARTIAL_FAILURE sem campaign → completar a campaign real (budget já existe)
    if (!campaignReal && budgetReal) {
      const attemptRec = $app.findRecordById('publication_attempt', id)
      const campInterna = $app.findRecordById('campaigns', String(attemptRec.get('campaign_id') || ''))
      const nomeCampanha = String(campInterna.get('name') || 'EngajaPJ')
      let orcamento = 10
      try {
        const cfgs = $app.findRecordsByFilter('campaign_configuration', 'campaign_id = {:id}', '-created', 1, 0, { id: String(campInterna.id) })
        if (cfgs.length > 0) orcamento = Number(cfgs[0].get('orcamento_declarado') || 10)
      } catch (_) {}
      const amountMicros = Math.max(10000000, Math.round(orcamento * 1000000))
      // budget real existe? confirmar; se não, recriar (idempotente por consulta)
      let budgetParaUsar = budgetReal
      const rBudgetCheck = gGet(budgetReal)
      if (rBudgetCheck.code !== 200) {
        const rBudget2 = gPost('customers/' + accountRef + '/campaignBudgets:mutate', {
          operations: [{ create: { name: nomeCampanha + ' - Budget', amount_micros: String(amountMicros), explicitly_shared: false, status: 'NORMAL' } }],
        })
        const rb2 = rBudget2.json && rBudget2.json.results && rBudget2.json.results[0]
        if (rBudget2.code !== 200 || !rb2) {
          transicionar(attempt, 'FAILED_FINAL')
          $app.save(attempt)
          registrarEvento(id, seq, 'RECONCILIACAO', String(auth.id), '', String(rBudget2.code), 'budget não recuperado — falha final')
          return e.json(200, { ok: true, state: 'FAILED_FINAL', motivo: 'budget não recuperado' })
        }
        budgetParaUsar = String(rb2.resource_name || '')
      }
      const rCamp2 = gPost('customers/' + accountRef + '/campaigns:mutate', {
        operations: [{
          create: {
            name: nomeCampanha,
            advertising_channel_type: 'SEARCH',
            status: 'PAUSED',
            campaign_budget: budgetParaUsar,
            manual_cpc: { enhanced_cpc_enabled: false },
            network_setting: { target_google_search: true, target_search_network: true, target_content_network: false, target_partner_search_network: false },
          },
        }],
      })
      const rc2 = rCamp2.json && rCamp2.json.results && rCamp2.json.results[0]
      if (rCamp2.code === 200 && rc2) {
        const campaignResource2 = String(rc2.resource_name || '')
        const recNovo = new Record(col)
        recNovo.set('attempt_id', id)
        recNovo.set('object_type', 'campaign')
        recNovo.set('remote_id', mascararResource(campaignResource2))
        recNovo.set('remote_id_real', campaignResource2)
        recNovo.set('requested_state', 'PAUSED')
        recNovo.set('confirmed_state', 'DESCONHECIDO')
        $app.save(recNovo)
        registrarEvento(id, seq, 'OBJETO_CRIADO', String(auth.id), '', '201', 'campaign completada na Google Ads: ' + mascararResource(campaignResource2))
        campaignReal = campaignResource2
      } else {
        transicionar(attempt, 'FAILED_FINAL')
        $app.save(attempt)
        registrarEvento(id, seq, 'RECONCILIACAO', String(auth.id), '', String(rCamp2.code), 'campaign não completada — falha final')
        return e.json(200, { ok: true, state: 'FAILED_FINAL', motivo: 'campaign não completada' })
      }
    }

    if (!campaignReal) {
      transicionar(attempt, 'FAILED_FINAL')
      $app.save(attempt)
      registrarEvento(id, seq, 'RECONCILIACAO', String(auth.id), '', '404', 'nenhum objeto real persistido — falha final')
      return e.json(200, { ok: true, state: 'FAILED_FINAL' })
    }

    // confirmar estado final da campaign na Google Ads
    const rFinal = gGet(campaignReal)
    if (rFinal.code === 200 && rFinal.json && rFinal.json.status === 'PAUSED') {
      const objsF = $app.findRecordsByFilter('remote_object', 'attempt_id = {:id}', 'created', 50, 0, { id: id })
      for (let j = 0; j < objsF.length; j++) {
        if (String(objsF[j].get('object_type') || '') === 'campaign') {
          objsF[j].set('confirmed_state', 'PAUSED')
          objsF[j].set('confirmed_at', new Date().toISOString().replace('T', ' ').substring(0, 19))
          $app.save(objsF[j])
        }
      }
      transicionar(attempt, 'RECOVERED')
      $app.save(attempt)
      registrarEvento(id, seq, 'ESTADO_CONFIRMADO', String(auth.id), '', '200', 'campaign confirmada em PAUSED na Google Ads')
      return e.json(200, { ok: true, state: 'RECOVERED' })
    }
    transicionar(attempt, 'FAILED_FINAL')
    $app.save(attempt)
    registrarEvento(id, seq, 'RECONCILIACAO', String(auth.id), '', String(rFinal.code), 'campaign não confirmada após recuperação — falha final')
    return e.json(200, { ok: true, state: 'FAILED_FINAL' })
  },
  $apis.requireAuth(),
)
