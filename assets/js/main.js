/* Serena Cagalli — script essenziale, senza librerie */
(function () {
  'use strict';

  /* Endpoint del form: funzione serverless Vercel in /api/contatti.js */
  var FORM_ENDPOINT = '/api/contatti';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno nel footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onHeaderScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---------- Menu burger (solo mobile) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var mq = window.matchMedia('(max-width: 1099px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) mobileNav.removeAttribute('inert'); else mobileNav.setAttribute('inert', '');
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) {
      var first = mobileNav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  function onViewportChange() { if (!mq.matches) setMenu(false); }
  if (mq.addEventListener) mq.addEventListener('change', onViewportChange); else mq.addListener(onViewportChange);

  /* ---------- Voce di menu attiva ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) sectionObserver.observe(s);
    });
  }

  /* ---------- Comparsa morbida ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Come funziona: linea che si riempie e passi che si attivano ---------- */
  var journey = document.getElementById('journey');
  if (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll('.journey-step'));
    if (reduceMotion) {
      journey.style.setProperty('--progress', 1);
      steps.forEach(function (s) { s.classList.add('is-active'); });
    } else {
      var ticking = false;
      var updateJourney = function () {
        ticking = false;
        var r = journey.getBoundingClientRect();
        var vh = window.innerHeight;
        // la linea avanza man mano che il percorso supera il 70% dell'altezza dello schermo
        var p = (vh * 0.7 - r.top) / Math.max(r.height * 0.8, 1);
        p = Math.max(0, Math.min(1, p));
        journey.style.setProperty('--progress', p.toFixed(3));
        var n = steps.length;
        steps.forEach(function (s, i) {
          s.classList.toggle('is-active', p >= (n === 1 ? 0 : i / (n - 1)) - 0.001 && p > 0);
        });
      };
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(updateJourney); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      updateJourney();
    }
  }

  /* ---------- FAQ accordion (tutte chiuse all'avvio) ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (reduceMotion) { panel.hidden = open; return; }
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        panel.classList.add('is-animating');
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        panel.addEventListener('transitionend', function done() {
          panel.hidden = true;
          panel.classList.remove('is-animating');
          panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      } else {
        panel.hidden = false;
        var h = panel.scrollHeight;
        panel.style.height = '0px';
        panel.classList.add('is-animating');
        requestAnimationFrame(function () { panel.style.height = h + 'px'; });
        panel.addEventListener('transitionend', function done() {
          panel.classList.remove('is-animating');
          panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      }
    });
  });

  /* ---------- Form contatti ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusBox = document.getElementById('form-status');
  var ts = document.getElementById('f-ts');
  ts.value = String(Date.now());

  var rules = {
    nome: function (v) {
      if (!v.trim()) return 'Inserisci il tuo nome.';
      if (v.trim().length < 2) return 'Il nome sembra troppo corto.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Inserisci il tuo indirizzo email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Controlla l\'indirizzo email: sembra non essere valido.';
      return '';
    },
    telefono: function (v) {
      if (v.trim() && !/^[+()0-9\s.\-]{6,30}$/.test(v.trim())) return 'Il numero può contenere solo cifre, spazi e il prefisso +.';
      return '';
    },
    attivita: function (v) { return v ? '' : 'Seleziona l\'attività che ti interessa.'; },
    messaggio: function (v) {
      if (!v.trim()) return 'Scrivi un breve messaggio.';
      if (v.trim().length < 10) return 'Il messaggio è un po\' breve: raccontami qualcosa in più.';
      return '';
    },
    privacy: function (_, el) { return el.checked ? '' : 'Per inviare la richiesta è necessario accettare l\'informativa privacy.'; }
  };

  function validateField(el) {
    var rule = rules[el.name];
    if (!rule) return true;
    var msg = rule(el.value, el);
    var err = document.getElementById(el.id + '-err');
    if (err) err.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener('blur', function () { if (el.value || el.hasAttribute('aria-invalid')) validateField(el); });
    el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) validateField(el); });
    el.addEventListener('change', function () { if (el.type === 'checkbox' || el.tagName === 'SELECT') validateField(el); });
  });

  function showStatus(type, html) {
    statusBox.className = 'form-status ' + (type === 'ok' ? 'is-success' : 'is-error');
    statusBox.innerHTML = html;
    statusBox.focus();
  }

  var FALLBACK = 'Nel frattempo puoi scrivermi su <a href="https://t.me/ilcorposa" target="_blank" rel="noopener">Telegram</a>.';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.textContent = '';
    statusBox.className = 'form-status';

    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (!validateField(el) && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Invio in corso…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new URLSearchParams(new FormData(form)),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: false, error: 'server' }; });
      })
      .then(function (data) {
        if (data.ok) {
          form.reset();
          ts.value = String(Date.now());
          showStatus('ok', '<strong>Grazie, la tua richiesta è stata inviata.</strong><br>Ti risponderò il prima possibile.');
        } else if (data.error === 'not_configured') {
          showStatus('err', 'Il modulo di contatto non è ancora attivo e la richiesta <strong>non è stata inviata</strong>. ' + FALLBACK);
        } else if (data.error === 'validation') {
          showStatus('err', 'Alcuni campi non sono corretti: controllali e riprova.');
        } else if (data.error === 'rate_limit') {
          showStatus('err', 'Hai già inviato diverse richieste a breve distanza. Riprova tra qualche minuto.');
        } else {
          showStatus('err', 'Non è stato possibile inviare la richiesta. Riprova più tardi. ' + FALLBACK);
        }
      })
      .catch(function () {
        showStatus('err', 'Non è stato possibile inviare la richiesta: verifica la connessione e riprova. ' + FALLBACK);
      })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
