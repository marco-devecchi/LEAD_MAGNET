/**
 * Netlify Function — Salva la lead su Brevo (ex Sendinblue)
 *
 * VARIABILI D'AMBIENTE da configurare in Netlify (Site settings → Environment variables):
 *   BREVO_API_KEY     - API key v3 di Brevo (https://app.brevo.com/settings/keys/api)
 *   BREVO_LIST_ID     - ID numerico della lista dove inserire i contatti
 *   ALLOWED_ORIGIN    - (opzionale) dominio del sito per CORS, es. "https://check.marco-devecchi.com"
 *                       Default: "*"  (utile per testing, da restringere in produzione)
 *
 * BODY atteso (POST JSON):
 *   { name, email, company, role, score_total, cat_scores, answers, ts }
 */

exports.handler = async (event) => {
  const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
  const cors = {
    'Access-Control-Allow-Origin':  ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: cors, body: 'Invalid JSON' }; }

  const { name, email, company, role, sector, score_total, cat_scores, answers, ts } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: cors, body: 'Invalid email' };
  }

  const apiKey  = process.env.BREVO_API_KEY;
  const listId  = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null;
  if (!apiKey) {
    console.error('Missing BREVO_API_KEY');
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: false, reason: 'missing_api_key' }) };
  }

  // Split nome / cognome (Brevo IT usa NOME e COGNOME)
  const parts = (name || '').trim().split(/\s+/);
  const firstName = parts.shift() || '';
  const lastName  = parts.join(' ');

  const payload = {
    email,
    attributes: {
      NOME:       firstName,
      COGNOME:    lastName,
      AZIENDA:    company || '',
      RUOLO:      role || '',
      SETTORE:    sector || '',
      SCORE:      typeof score_total === 'number' ? score_total : null,
      SCORE_DIR:  cat_scores?.Direzione  ?? null,
      SCORE_EXE:  cat_scores?.Execution  ?? null,
      SCORE_TECH: cat_scores?.Technology ?? null,
      SCORE_PEP:  cat_scores?.Persone    ?? null,
      ANSWER_JSON: JSON.stringify(answers || {}),
      ASSESSMENT_TS: ts || new Date().toISOString(),
    },
    listIds: listId ? [listId] : undefined,
    updateEnabled: true,
  };

  try {
    const resp = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Brevo error:', resp.status, err);
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: false, status: resp.status }) };
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('Lead handler exception:', e);
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: false, reason: 'exception' }) };
  }
};
