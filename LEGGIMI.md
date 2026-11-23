# Sito Serena Cagalli — Il Corpo Sa

One-page statica (HTML + CSS + JS, nessuna libreria) pubblicata su Vercel. Font ospitati in locale, immagini in WebP.

## File
- `index.html` — la pagina (Header → Hero → Chi sono → A chi mi rivolgo → Approccio → Servizi → Come funziona → Dove ricevo → FAQ → Contatti → Footer)
- `assets/css/style.css` — stile. Sfondi sezione alternati `#FFFFFF` / `#ADC1B5` / `#FFCFCF`, accenti e CTA `#003551`
- `assets/js/main.js` — menu mobile, FAQ, animazioni, validazione e invio form
- `api/contatti.js` — funzione serverless Vercel che riceve il form e invia l'email tramite Resend
- `privacy.html` — bozza Privacy + Cookie Policy con campi `[da completare]`

## Attivare il form (obbligatorio)
Su Vercel → Project → Settings → Environment Variables aggiungere:
- `RESEND_API_KEY` — chiave API di [Resend](https://resend.com)
- `CONTACT_TO` — email di Serena che riceve le richieste
- `CONTACT_FROM` — mittente verificato su Resend, es. `Sito Serena Cagalli <noreply@dominio.it>`

Poi rifare il deploy. Finché non sono impostate, il sito dice chiaramente che la richiesta **non** è stata inviata.

## Da completare
1. **Privacy policy**: titolare, contatti, tempi di conservazione; far verificare il testo.
2. **Indirizzo** nella sezione "Dove ricevo" (ora "In arrivo").
3. **Spotify**: link ufficiale del podcast nel footer (segnaposto nei commenti HTML).
4. **Dati fiscali** nel footer e **dominio** (`canonical`/`og:url` nell'head).
5. **Logo**: se esiste il file originale, sostituire la firma tipografica in `.brand`.

## Immagini
- `serena-cagalli.webp` — foto fornita, usata **solo** in "Chi sono".
- Hero e card servizi: foto Unsplash (licenza gratuita), senza volti riconoscibili. Da sostituire con foto autentiche quando disponibili (hero 2000×1200, card 800×600).
