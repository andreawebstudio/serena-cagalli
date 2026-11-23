/**
 * Form contatti — funzione serverless Vercel (Node.js, nessuna dipendenza).
 * Invio email tramite Resend (https://resend.com).
 *
 * Variabili d'ambiente da impostare su Vercel (Project → Settings → Environment Variables):
 *   RESEND_API_KEY  chiave API di Resend
 *   CONTACT_TO      email di Serena che riceve le richieste
 *   CONTACT_FROM    mittente verificato su Resend, es. "Sito Serena Cagalli <noreply@dominio.it>"
 *
 * Finché non sono impostate la funzione risponde "not_configured"
 * e il sito avvisa che la richiesta NON è stata inviata.
 */

const MIN_MS = 4000;          // tempo minimo di compilazione (antispam)
const MAX_PER_HOUR = 5;       // limite indicativo per IP (per istanza)
const hits = new Map();

const ALLOWED = [
  'Acroyoga',
  'Ginnastica dolce',
  'Yoga posturale',
  'Movimento e pavimento pelvico',
  'Non lo so ancora, vorrei un consiglio'
];

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\r\0]/g, '').trim().slice(0, max);
}

function send(res, code, data) {
  res.status(code).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    return send(res, 503, { ok: false, error: 'not_configured' });
  }

  let body = req.body || {};
  if (typeof body === 'string') body = Object.fromEntries(new URLSearchParams(body));

  // Honeypot: risposta neutra ai bot, nessun invio
  if (body.website) return send(res, 200, { ok: true });

  const ts = Number(body.ts || 0);
  if (!ts || Date.now() - ts < MIN_MS) return send(res, 400, { ok: false, error: 'validation' });

  // Limite di frequenza (best effort, in memoria)
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => t > now - 3600 * 1000);
  if (recent.length >= MAX_PER_HOUR) return send(res, 429, { ok: false, error: 'rate_limit' });

  const nome = clean(body.nome, 80);
  const email = clean(body.email, 120);
  const telefono = clean(body.telefono, 30);
  const attivita = clean(body.attivita, 80);
  const messaggio = clean(body.messaggio, 2000);
  const privacy = body.privacy === '1';

  const valid =
    nome.length >= 2 && !nome.includes('\n') &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) &&
    (telefono === '' || /^[+()0-9\s.\-]{6,30}$/.test(telefono)) &&
    ALLOWED.includes(attivita) &&
    messaggio.length >= 10 &&
    privacy;

  if (!valid) return send(res, 422, { ok: false, error: 'validation' });

  const text =
    'Nuova richiesta dal sito\n\n' +
    `Nome: ${nome}\n` +
    `Email: ${email}\n` +
    `Telefono: ${telefono || '—'}\n` +
    `Attività di interesse: ${attivita}\n\n` +
    `Messaggio:\n${messaggio}\n\n` +
    `Consenso privacy: sì (${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })})\n`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: `Nuova richiesta dal sito — ${attivita}`,
        text
      })
    });
    if (!r.ok) return send(res, 502, { ok: false, error: 'send_failed' });
  } catch (e) {
    return send(res, 502, { ok: false, error: 'send_failed' });
  }

  recent.push(now);
  hits.set(ip, recent);
  return send(res, 200, { ok: true });
};
