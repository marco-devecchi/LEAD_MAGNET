/**
 * Punto di ingresso del Worker.
 *
 * Cloudflare ha creato il progetto come Worker con asset statici, non come
 * Pages. In quella modalita' la cartella "functions/" NON viene eseguita:
 * i file dentro finirebbero pubblicati come testo. Questo file rimette le
 * cose a posto instradando /api/lead alla funzione e lasciando tutto il
 * resto agli asset statici.
 *
 * La logica su Brevo resta in functions/api/lead.js, invariata.
 */
import { onRequestPost, onRequestOptions } from "./functions/api/lead.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") {
      if (request.method === "OPTIONS") return onRequestOptions({ env });
      if (request.method === "POST") return onRequestPost({ request, env });
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST, OPTIONS" },
      });
    }

    // Tutto il resto: file statici (index.html, dataset.json, assets/...)
    return env.ASSETS.fetch(request);
  },
};
