/**
 * Cloudflare Pages Function: salva la lead su Brevo.
 *
 * POSIZIONE NEL REPO (obbligatoria, il percorso definisce l'URL):
 *   functions/api/lead.js   ->   risponde su   /api/lead
 *
 * VARIABILI D'AMBIENTE da impostare nel pannello Cloudflare
 * (Workers & Pages > il progetto > Settings > Variables and Secrets):
 *   BREVO_API_KEY    chiave API v3 di Brevo, da salvare come Secret
 *   BREVO_LIST_ID    id numerico della lista
 *   ALLOWED_ORIGIN   opzionale: https://check.marco-devecchi.com
 *                    Se non lo imposti resta "*", cioe' chiunque puo'
 *                    scrivere nella tua lista. Impostalo.
 *
 * BODY atteso (POST JSON):
 *   { name, email, company, role, sector, privacy, score_total,
 *     cat_scores, answers, ts }
 */

const intestazioni = (origine) => ({
  "Access-Control-Allow-Origin": origine,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
});

// Richiesta preliminare del browser prima del POST
export function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: intestazioni(env.ALLOWED_ORIGIN || "*"),
  });
}

export async function onRequestPost({ request, env }) {
  const origine = env.ALLOWED_ORIGIN || "*";
  const testa = intestazioni(origine);
  const rispondi = (corpo, stato = 200) =>
    new Response(JSON.stringify(corpo), { status: stato, headers: testa });

  let body;
  try {
    body = await request.json();
  } catch {
    return rispondi({ ok: false, reason: "invalid_json" }, 400);
  }

  const {
    name, email, company, role, sector, privacy,
    score_total, cat_scores, answers, ts,
  } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return rispondi({ ok: false, reason: "invalid_email" }, 400);
  }

  const apiKey = env.BREVO_API_KEY;
  const listId = env.BREVO_LIST_ID ? Number(env.BREVO_LIST_ID) : null;
  if (!apiKey) {
    console.error("Manca BREVO_API_KEY");
    return rispondi({ ok: false, reason: "missing_api_key" });
  }

  // Brevo in italiano usa NOME e COGNOME separati
  const parti = String(name || "").trim().split(/\s+/);
  const nome = parti.shift() || "";
  const cognome = parti.join(" ");
  const quando = ts || new Date().toISOString();

  const payload = {
    email,
    attributes: {
      NOME: nome,
      COGNOME: cognome,
      AZIENDA: company || "",
      RUOLO: role || "",
      SETTORE: sector || "",
      SCORE: typeof score_total === "number" ? score_total : null,
      SCORE_DIR: cat_scores?.Direzione ?? null,
      SCORE_EXE: cat_scores?.Execution ?? null,
      SCORE_TECH: cat_scores?.Technology ?? null,
      SCORE_PEP: cat_scores?.Persone ?? null,
      ANSWER_JSON: JSON.stringify(answers || {}),
      ASSESSMENT_TS: quando,
      // Prova del consenso: senza questi due campi non e' dimostrabile.
      // Entrambi come TESTO: un attributo di testo su Brevo accetta
      // qualsiasi valore senza conversioni, mentre il tipo booleano
      // si e' rivelato inaffidabile via API.
      PRIVACY_OK: privacy === true ? "true" : "false",
      PRIVACY_TS: privacy === true ? quando : "",
    },
    listIds: listId ? [listId] : undefined,
    updateEnabled: true,
  };

  try {
    const resp = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      console.error("Errore Brevo:", resp.status, await resp.text());
      return rispondi({ ok: false, status: resp.status });
    }

    return rispondi({ ok: true });
  } catch (e) {
    console.error("Eccezione nel salvataggio della lead:", e);
    return rispondi({ ok: false, reason: "exception" });
  }
}
