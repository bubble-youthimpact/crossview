(function () {
  'use strict';
  var EMAIL = 'crossview.sp@gmail.com';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- mobile menu */
  var menu = $('#mobile-menu'), opener = $('[data-menu-open]');
  function openMenu() {
    menu.hidden = false; document.body.classList.add('menu-open');
    opener.setAttribute('aria-expanded', 'true'); $('[data-menu-close]').focus();
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true; document.body.classList.remove('menu-open');
    opener.setAttribute('aria-expanded', 'false');
  }
  if (menu) {
    opener.addEventListener('click', openMenu);
    $('[data-menu-close]').addEventListener('click', function () { closeMenu(); opener.focus(); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    // show the menu button only once the full link row would no longer fit
    var hdr = $('.site-header'), row = $('.header-row');
    function fitNav() {
      hdr.classList.remove('nav-compact');
      var nav = $('.main-nav'), need = 0;
      if (nav && getComputedStyle(nav).display !== 'none') {
        Array.prototype.forEach.call(row.children, function (el) { if (getComputedStyle(el).display !== 'none') need += el.scrollWidth; });
        need += 24 * (row.children.length - 1) + parseFloat(getComputedStyle(row).paddingLeft) * 2 + 16;
      }
      var compact = need > row.clientWidth;
      hdr.classList.toggle('nav-compact', compact);
      if (!compact && window.innerWidth > 760) closeMenu();
    }
    fitNav();
    window.addEventListener('resize', fitNav);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  }

  /* ---------- active nav (static site) */
  function setActiveNav(group) {
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-nav') === group); });
  }
  if (!window.CV_PREVIEW) {
    var p = location.pathname.replace(/\/+$/, '');
    var map = { '/about': 'about', '/youth-correspondents': 'yc', '/articles': 'yc', '/policy-lens': 'lens', '/policy-lab': 'lab',
      '/education-hub': 'hub', '/cross-view': 'cv', '/outreach': 'outreach', '/observatory': 'observatory', '/contributors': 'contrib', '/login': 'login', '/profile': 'login', '/onboarding': 'login', '/admin': 'login' };
    var g = p === '' ? 'home' : null;
    Object.keys(map).forEach(function (k) { if (p === k || p.indexOf(k + '/') === 0) g = map[k]; });
    setActiveNav(g);
  }

  /* ---------- smooth in-page scroll */
  function scrollToId(id) {
    var scope = window.CV_PREVIEW ? $('.route:not([hidden])') : document;
    var el = scope && scope.querySelector('#' + CSS.escape(id));
    if (!el) return false;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 76;
    window.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-scroll]');
    if (!a) return;
    var id = (a.getAttribute('href') || '').replace('#', '');
    if (id && scrollToId(id)) e.preventDefault();
  });

  /* ---------- filters (chips + search) */
  $$('[data-filter-group]').forEach(function (bar) {
    var name = bar.getAttribute('data-filter-group');
    var target = $('[data-filter-target="' + name + '"]');
    if (!target) return;
    var search = $('[data-search]', bar);
    var empty = target.parentNode.querySelector('[data-empty]');
    var current = 'all';
    function run() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      Array.prototype.forEach.call(target.children, function (item) {
        var vals = (item.getAttribute('data-cats') || item.getAttribute('data-cat') || item.getAttribute('data-kind-group') || '').split('|');
        var ok = current === 'all' || vals.indexOf(current) > -1;
        if (ok && q) ok = item.textContent.toLowerCase().indexOf(q) > -1;
        item.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    $$('[data-filter]', bar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute('data-filter');
        $$('[data-filter]', bar).forEach(function (b) { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
        run();
      });
    });
    if (search) search.addEventListener('input', run);
  });
  /* ---------- education hub: category cards swap the materials area */
  $$('[data-hub]').forEach(function (hub) {
    var scope = hub.closest('.route') || document;
    var cards = $$('.cat-card[data-hub-tab]', scope), panels = $$('[data-hub-panel]', hub);
    function set(k) {
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-hub-panel') !== k; });
      cards.forEach(function (c) { var on = c.getAttribute('data-hub-tab') === k; c.classList.toggle('is-active', on); c.setAttribute('aria-selected', on); });
      // keep the category cards in view with the swapped content right below them
      var row = cards[0] && cards[0].parentNode, rt = row ? row.getBoundingClientRect().top : 0;
      if (row && (rt < 70 || hub.getBoundingClientRect().top > window.innerHeight * 0.75))
        window.scrollTo({ top: window.pageYOffset + rt - 80, behavior: 'smooth' });
    }
    $$('[data-hub-tab]', scope).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-hub-tab');
        set(t.classList.contains('is-active') ? 'materials' : k);
      });
    });
  });

  /* ---------- policy lens accordion */
  function setBrief(brief, open) {
    var btn = $('[data-brief-toggle]', brief), body = $('.brief-body', brief);
    brief.classList.toggle('open', open); body.hidden = !open; btn.setAttribute('aria-expanded', open);
  }
  $$('.brief').forEach(function (brief) {
    $('[data-brief-toggle]', brief).addEventListener('click', function () { setBrief(brief, !brief.classList.contains('open')); });
    $('[data-brief-collapse]', brief).addEventListener('click', function () {
      setBrief(brief, false);
      var y = brief.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y });
    });
  });
  $$('.brief').forEach(function (brief) {
    var tabs = $$('[data-btab]', brief), panels = $$('[data-bpanel]', brief), bar = $('.brief-tabs', brief);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-btab');
        tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        panels.forEach(function (p) { p.hidden = p.getAttribute('data-bpanel') !== k; });
        // jump back to the start of the section if we were scrolled deep into the previous one
        var top = bar.parentNode.getBoundingClientRect().top;
        if (top < 0) window.scrollTo({ top: window.pageYOffset + top - 70 });
      });
    });
  });
  if (!window.CV_PREVIEW && location.hash) {
    var b = document.getElementById(location.hash.slice(1));
    if (b && b.classList.contains('brief')) { setBrief(b, true); setTimeout(function () { scrollToId(b.id); }, 60); }
  }

  /* ---------- modals */
  var lastFocus = null;
  function openModal(m) {
    lastFocus = document.activeElement; m.hidden = false; document.body.classList.add('menu-open');
    var f = $('.modal-panel button, .modal-panel input, .modal-panel a', m); if (f) f.focus();
  }
  function closeModal(m) {
    m.hidden = true; document.body.classList.remove('menu-open');
    var fr = $('iframe', m); if (fr) fr.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { var m = document.getElementById(o.getAttribute('data-open')); if (m) openModal(m); return; }
    var c = e.target.closest('[data-modal-close]');
    if (c) closeModal(c.closest('.modal'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = $$('.modal').filter(function (x) { return !x.hidden; })[0];
    if (m) closeModal(m); else closeMenu();
  });

  /* ---------- material viewer popup */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-material]');
    if (!t) return;
    var scope = t.closest('.route') || document;
    var m = scope.querySelector('#material-modal') || $('#material-modal');
    if (!m) return;
    var id = t.getAttribute('data-id');
    $('[data-mat-title]', m).textContent = t.getAttribute('data-title');
    $('[data-mat-kind]', m).textContent = t.getAttribute('data-kind');
    $('[data-mat-open]', m).href = 'https://drive.google.com/file/d/' + id + '/view';
    $('[data-mat-download]', m).href = 'https://drive.google.com/uc?export=download&id=' + id;
    $('[data-mat-frame]', m).src = 'https://drive.google.com/file/d/' + id + '/preview';
    var sh = $('[data-mat-share]', m); sh.setAttribute('data-id', id); sh.setAttribute('data-title', t.getAttribute('data-title'));
    openModal(m);
  });
  // deep link: /education-hub?material=<id> opens that material
  if (!window.CV_PREVIEW) {
    var mid = new URLSearchParams(location.search).get('material');
    var trig = mid && $('[data-material][data-id="' + CSS.escape(mid) + '"]');
    if (trig) {
      var panel = trig.closest('[data-hub-panel]');
      if (panel && panel.hidden) { var tab = $('.cat-card[data-hub-tab="' + panel.getAttribute('data-hub-panel') + '"]'); if (tab) tab.click(); }
      setTimeout(function () { trig.click(); }, 50);
    }
  }

  /* ---------- share */
  var toastEl = $('.toast'), toastTimer;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html; toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); setTimeout(function () { toastEl.hidden = true; }, 250); }, 3200);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-share]');
    if (!b) return;
    var id = b.getAttribute('data-id'), title = b.getAttribute('data-title') + ' — CrossView';
    var url = window.CV_PREVIEW ? 'https://drive.google.com/file/d/' + id + '/view'
      : location.origin + '/education-hub?material=' + encodeURIComponent(id);
    function copy() {
      var done = function () { toast('Link copied'); };
      var fail = function () { toast('Copy this link: <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>'); };
      try { navigator.clipboard.writeText(url).then(done, fail); } catch (err) { fail(); }
    }
    if (navigator.share && !window.CV_PREVIEW) {
      navigator.share({ title: title, url: url }).catch(function (err) { if (err && err.name !== 'AbortError') copy(); });
    } else copy();
  });

  /* ---------- methodology carousel (drag / swipe / steps / arrows) */
  $$('[data-mc]').forEach(function (wrap) {
    var vp = $('[data-mc-viewport]', wrap), track = $('[data-mc-track]', wrap);
    var cards = $$('.mc-card', wrap), dots = $$('.mc-dot', wrap), nodes = $$('.mc-node', wrap);
    var fill = $('[data-mc-fill]', wrap), prev = $('[data-mc-prev]', wrap), next = $('[data-mc-next]', wrap);
    var n = cards.length, current = 0, startX = 0, startTx = 0, delta = 0, dragging = false, moved = false;
    function tx() { var m = getComputedStyle(track).transform; return m && m !== 'none' ? new DOMMatrix(m).m41 : 0; }
    function offset(i) { var c = cards[i]; return vp.offsetWidth / 2 - (c.offsetLeft + c.offsetWidth / 2); }
    function go(i, animate) {
      current = Math.max(0, Math.min(n - 1, i));
      if (animate === false) track.classList.add('no-t');
      track.style.transform = 'translateX(' + offset(current) + 'px)';
      if (animate === false) { void track.offsetWidth; track.classList.remove('no-t'); }
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === current); c.setAttribute('aria-hidden', k !== current); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === current); });
      nodes.forEach(function (d, k) { d.classList.toggle('is-active', k === current); d.classList.toggle('is-done', k < current); d.setAttribute('aria-current', k === current ? 'step' : 'false'); });
      if (fill) fill.style.width = (n > 1 ? current / (n - 1) * 100 : 0) + '%';
      prev.disabled = current === 0; next.disabled = current === n - 1;
    }
    function start(x) { dragging = true; moved = false; startX = x; startTx = tx(); delta = 0; track.classList.add('no-t'); vp.classList.add('dragging'); }
    function move(x) { if (!dragging) return; delta = x - startX; if (Math.abs(delta) > 5) moved = true; track.style.transform = 'translateX(' + (startTx + delta) + 'px)'; }
    function end() {
      if (!dragging) return;
      dragging = false; track.classList.remove('no-t'); vp.classList.remove('dragging');
      go(Math.abs(delta) > 40 ? (delta < 0 ? current + 1 : current - 1) : current);
      delta = 0;
    }
    vp.addEventListener('mousedown', function (e) { e.preventDefault(); start(e.clientX); });
    window.addEventListener('mousemove', function (e) { move(e.clientX); });
    window.addEventListener('mouseup', end);
    vp.addEventListener('touchstart', function (e) { start(e.touches[0].clientX); }, { passive: true });
    vp.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    vp.addEventListener('touchend', end);
    cards.forEach(function (c, k) { c.addEventListener('click', function () { if (!moved) go(k); }); });
    dots.concat(nodes).forEach(function (d) { d.addEventListener('click', function () { go(+d.getAttribute('data-i')); }); });
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    window.addEventListener('resize', function () { go(current, false); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (vp.offsetWidth) go(current, false); }).observe(vp);
    go(0, false);
  });

  /* ---------- testimonial slider (slides sideways; wraps from last to first) */
  $$('[data-tslider]').forEach(function (w) {
    var vp = $('.tslides-vp', w), track = $('.tslides', w), slides = $$('.tslide', w), dots = $$('[data-t-dot]', w);
    var n = slides.length, i = 0, timer, startX = null, delta = 0;
    function place(animate) {
      if (animate === false) track.classList.add('no-t');
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      if (animate === false) { void track.offsetWidth; track.classList.remove('no-t'); }
    }
    function go(k) {
      i = (k + n) % n; place();
      slides.forEach(function (s, x) { s.classList.toggle('is-active', x === i); s.setAttribute('aria-hidden', x !== i); });
      dots.forEach(function (d, x) { d.classList.toggle('is-active', x === i); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { if (!document.hidden && w.offsetParent && startX === null) go(i + 1); }, 6000); }
    $('[data-t-prev]', w).addEventListener('click', function () { go(i - 1); restart(); });
    $('[data-t-next]', w).addEventListener('click', function () { go(i + 1); restart(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); restart(); }); });
    function start(x) { startX = x; delta = 0; track.classList.add('no-t'); vp.classList.add('dragging'); }
    function move(x) { if (startX === null) return; delta = x - startX; track.style.transform = 'translateX(calc(' + (-i * 100) + '% + ' + delta + 'px))'; }
    function end() {
      if (startX === null) return;
      startX = null; track.classList.remove('no-t'); vp.classList.remove('dragging');
      if (Math.abs(delta) > 50) go(i + (delta < 0 ? 1 : -1)); else place();
      restart();
    }
    vp.addEventListener('mousedown', function (e) { e.preventDefault(); start(e.clientX); });
    window.addEventListener('mousemove', function (e) { move(e.clientX); });
    window.addEventListener('mouseup', end);
    vp.addEventListener('touchstart', function (e) { start(e.touches[0].clientX); }, { passive: true });
    vp.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    vp.addEventListener('touchend', end);
    place(false); restart();
  });

  /* ---------- expanding step cards (observatory) */
  $$('[data-xsteps]').forEach(function (w) {
    var steps = $$('.xstep', w), dots = $$('.xs-dots .mc-dot', w), i = 0;
    function go(k) {
      i = (k + steps.length) % steps.length;
      steps.forEach(function (s, x) { s.classList.toggle('is-active', x === i); s.setAttribute('aria-pressed', x === i); });
      dots.forEach(function (d, x) { d.classList.toggle('is-active', x === i); });
    }
    var timer;
    function restart() { clearInterval(timer); timer = setInterval(function () { if (!document.hidden && w.offsetParent && !w.matches(':hover')) go(i + 1); }, 5000); }
    steps.forEach(function (s, k) { s.addEventListener('click', function () { go(k); restart(); }); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); restart(); }); });
    restart();
  });

  /* ---------- contributors: swap list <-> profile under the hero */
  var croot = $('[data-contrib-root]');
  if (croot) {
    var clist = $('[data-contrib-list]', croot);
    var showContrib = function (slug, push) {
      var found = false;
      $$('[data-contrib-detail]', croot).forEach(function (d) {
        var on = d.getAttribute('data-contrib-detail') === slug; d.hidden = !on; if (on) found = true;
      });
      clist.hidden = found;
      if (push && !window.CV_PREVIEW) {
        try { history.pushState({ contrib: slug || '' }, '', slug ? '/contributors/' + slug : '/contributors'); } catch (e) {}
      }
      var top = croot.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.pageYOffset + top - 70 });
    };
    croot.addEventListener('click', function (e) {
      var card = e.target.closest('[data-contrib]');
      var back = e.target.closest('[data-contrib-back]');
      if (!card && !back) return;
      e.preventDefault(); e.stopPropagation();
      showContrib(card ? card.getAttribute('data-contrib') : '', true);
    });
    window.addEventListener('popstate', function () {
      var m = location.pathname.match(/^\/contributors\/?([^/]*)/);
      if (m) showContrib(m[1], false);
    });
  }

  /* ---------- forms (no backend yet: compose an email) */
  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    return ok;
  }
  function status(form, msg, cls) { var s = $('.form-status', form); s.className = 'form-status ' + (cls || ''); s.innerHTML = msg; }
  /* contact + proposal forms are saved as messages for the editors (admin page → Messages) */
  function send(form, msg, okMsg) {
    if (form.elements._honey && form.elements._honey.value) return; // bot
    if (!window.CV_SEND) return status(form, 'Still connecting… try again in a moment.', 'err');
    var btn = $('button[type=submit]', form); btn.disabled = true;
    status(form, 'Sending…');
    window.CV_SEND(msg).then(function () { btn.disabled = false; form.reset(); status(form, okMsg, 'ok'); },
      function () { btn.disabled = false; status(form, 'Your message couldn’t be sent. Please try again, or email us at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.', 'err'); });
  }
  function clip(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }
  $$('[data-contact-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return status(form, 'Please fill in every field with a valid email.', 'err');
      var d = new FormData(form);
      send(form, { type: 'contact', name: clip(d.get('name'), 200), email: clip(d.get('email'), 200), subject: clip(d.get('subject'), 300),
                   body: clip(d.get('message'), 8000) }, 'Thanks! Your message has been sent. We’ll get back to you soon.');
    });
  });
  $$('[data-proposal-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return status(form, 'Please complete the required fields.', 'err');
      var d = new FormData(form);
      var body = 'Target region: ' + d.get('region') + '\n\nObjective:\n' + d.get('objective') + '\n\nProposed action:\n' + d.get('action') +
        '\n\nExpected impact:\n' + d.get('impact') + '\n\nTrade-offs:\n' + d.get('tradeoffs');
      send(form, { type: 'proposal', name: clip(d.get('author'), 200), email: clip(d.get('email'), 200), subject: clip('Policy proposal: ' + d.get('title'), 300),
                   body: clip(body, 8000) }, 'Thanks! Your proposal has been sent to the CrossView team.');
    });
  });
  /* ---------- login / sign-up
     Firebase later: define window.CV_AUTH = { google(), signIn(email, password), signUp(name, email, password) }
     each returning a Promise; this page calls them when present. */
  $$('[data-auth-tab]').forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.getAttribute('data-auth-tab'), root = t.closest('.auth-main');
      $$('[data-auth-tab]', root).forEach(function (x) { var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      $$('[data-auth-panel]', root).forEach(function (p) { p.hidden = p.getAttribute('data-auth-panel') !== k; });
    });
  });
  $$('[data-pw-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = b.parentNode.querySelector('input'), show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      b.classList.toggle('is-on', show);
    });
  });
  /* ---------- correspondent accounts
     One interface, two backends:
       · window.CV_FB (src/firebase.js) on the live site: Firebase Auth + Firestore
       · LocalStore below in the claude.ai preview (or with ?local): this browser's storage */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var STEPS = ['intro', 'choosing', 'people', 'writing', 'practice'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var P = !!window.CV_PREVIEW;
  var HREF = { dash: P ? '#profile' : '/profile', ob: P ? '#onboarding' : '/onboarding', login: P ? '#login' : '/login',
               admin: P ? '#admin' : '/admin', home: P ? '#home' : '/' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function go(href) {
    if (P) { var a = document.createElement('a'); a.href = href; document.body.appendChild(a); a.click(); a.remove(); }
    else window.location.href = href;
  }
  function slugify(s) { return String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, ''); }
  function hash(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode('cv:' + str)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Promise.resolve('h' + h);
  }

  var LocalStore = {
    kind: 'local', _cbs: [],
    _accounts: function () { return LS.get('cv-accounts', {}); },
    _articles: function () { return LS.get('cv-articles', []); },
    _migrate: function () { // older preview builds kept articles inside the account
      var all = this._accounts(), arts = this._articles(), changed = false;
      Object.keys(all).forEach(function (k) {
        var a = all[k];
        if (a.articles && a.articles.length) {
          a.articles.forEach(function (x) { x.uid = a.email; x.authorName = a.name; x.authorCountry = a.country; arts.push(x); });
          changed = true;
        }
        delete a.articles;
      });
      if (changed) { LS.set('cv-articles', arts); LS.set('cv-accounts', all); }
    },
    current: function () {
      var s = LS.get('cv-session', null), a = s && this._accounts()[s];
      if (!a) return null;
      return { uid: a.email, email: a.email, name: a.name, country: a.country || '', joined: a.joined, progress: a.progress || [],
               role: a.role || 'member', provider: 'password', articles: this._articles().filter(function (x) { return x.uid === a.email; }) };
    },
    onChange: function (cb) { this._cbs.push(cb); var self = this; setTimeout(function () { cb(self.current()); }, 0); },
    _emit: function () { var c = this.current(); this._cbs.forEach(function (cb) { cb(c); }); return c; },
    _put: function (acc) { var all = this._accounts(); all[acc.email] = acc; return LS.set('cv-accounts', all); },
    signUp: function (name, email, pw, country) {
      var self = this;
      return hash(pw).then(function (h) {
        if (self._accounts()[email]) throw new Error('An account with this email already exists. Sign in instead.');
        if (!self._put({ name: name, email: email, country: country, pw: h, joined: new Date().toISOString(), progress: [] }))
          throw new Error('This browser is blocking storage, so your account can’t be saved here.');
        LS.set('cv-session', email); return self._emit();
      });
    },
    signIn: function (email, pw) {
      var self = this;
      return hash(pw).then(function (h) {
        var a = self._accounts()[email];
        if (!a || a.pw !== h) throw new Error('That email and password don’t match an account on this device.');
        LS.set('cv-session', email); return self._emit();
      });
    },
    google: function () { return Promise.reject(new Error('Google sign-in works on the live site. In this preview, use email and password.')); },
    resetPassword: function () { return Promise.reject(new Error('Password reset emails are sent from the live site.')); },
    signOut: function () { try { localStorage.removeItem('cv-session'); } catch (e) {} this._emit(); return Promise.resolve(); },
    saveProgress: function (list) { var all = this._accounts(), s = LS.get('cv-session'); if (all[s]) { all[s].progress = list; LS.set('cv-accounts', all); } this._emit(); return Promise.resolve(); },
    saveProfile: function (patch) { var all = this._accounts(), s = LS.get('cv-session'); if (all[s]) { Object.assign(all[s], patch); LS.set('cv-accounts', all); } this._emit(); return Promise.resolve(); },
    saveArticle: function (art) {
      var cur = this.current(); if (!cur) return Promise.reject(new Error('Please sign in again.'));
      var arts = this._articles(), id = art.id || ('a' + Date.now().toString(36));
      var saved = Object.assign({}, art, { id: id, uid: cur.uid, authorName: cur.name, authorCountry: cur.country, updated: new Date().toISOString() });
      LS.set('cv-articles', arts.filter(function (x) { return x.id !== id; }).concat(saved));
      this._emit(); return Promise.resolve(saved);
    },
    changePassword: function (oldPw, newPw) {
      var self = this, s = LS.get('cv-session');
      return Promise.all([hash(oldPw), hash(newPw)]).then(function (h) {
        var all = self._accounts();
        if (!all[s] || all[s].pw !== h[0]) throw new Error('Your current password isn’t right.');
        all[s].pw = h[1]; LS.set('cv-accounts', all);
      });
    },
    deleteAccount: function (pw) {
      var self = this, s = LS.get('cv-session');
      return hash(pw || '').then(function (h) {
        var all = self._accounts();
        if (!all[s] || all[s].pw !== h) throw new Error('Your password isn’t right.');
        delete all[s]; LS.set('cv-accounts', all);
        LS.set('cv-articles', self._articles().filter(function (x) { return x.uid !== s || x.status === 'Published'; }));
        try { localStorage.removeItem('cv-session'); } catch (e) {}
        self._emit();
      });
    },
    listForReview: function () { return Promise.resolve(this._articles().filter(function (x) { return x.status !== 'Draft'; })); },
    review: function (id, patch) {
      var arts = this._articles().map(function (x) { return x.id === id ? Object.assign({}, x, patch, { reviewedAt: new Date().toISOString() }) : x; });
      LS.set('cv-articles', arts); this._emit(); return Promise.resolve();
    },
    sendMessage: function (m) {
      var list = LS.get('cv-messages', []); list.push(Object.assign({}, m, { id: 'm' + Date.now().toString(36), read: false, createdAt: new Date().toISOString() }));
      LS.set('cv-messages', list); return Promise.resolve();
    },
    listMessages: function () { return Promise.resolve(LS.get('cv-messages', [])); },
    markMessage: function (id, read) { LS.set('cv-messages', LS.get('cv-messages', []).map(function (m) { return m.id === id ? Object.assign({}, m, { read: read }) : m; })); return Promise.resolve(); },
    deleteMessage: function (id) { LS.set('cv-messages', LS.get('cv-messages', []).filter(function (m) { return m.id !== id; })); return Promise.resolve(); },
    listPublished: function () { return Promise.resolve(this._articles().filter(function (x) { return x.status === 'Published'; })); },
    getPublished: function (slug) { return Promise.resolve(this._articles().filter(function (x) { return x.status === 'Published' && (x.slug === slug || x.id === slug); })[0] || null); }
  };

  /* pick the backend */
  var STORE = null, ACC; // ACC: undefined = still loading, null = signed out
  var useLocal = P;
  function attach(s) { STORE = s; window.CV_SEND = function (m) { return s.sendMessage(m); }; s.onChange(function (acc) { ACC = acc; renderMember(); }); }
  if (useLocal) attach(LocalStore);
  else if (window.CV_FB) attach(window.CV_FB);
  else {
    window.addEventListener('cv-firebase-ready', function () { if (!STORE) attach(window.CV_FB); });
    setTimeout(function () { if (!STORE) { ACC = null; renderMember('Couldn’t reach the account service. Check your connection and refresh the page.'); } }, 10000);
  }
  function ready(form) { if (STORE) return true; status(form, 'Still connecting… try again in a moment.', 'err'); return false; }

  /* ---------- sign in / sign up / Google / reset */
  $$('[data-auth-google]').forEach(function (b) {
    b.addEventListener('click', function () {
      var form = b.parentNode.querySelector('form'); if (!ready(form)) return;
      status(form, 'Opening Google…');
      STORE.google().then(function () { go(HREF.dash); }, function (err) { status(form, esc(err.message), 'err'); });
    });
  });
  $$('[data-auth-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return status(form, 'Please fill in every field.', 'err');
      if (!ready(form)) return;
      var d = new FormData(form), mode = form.getAttribute('data-auth-form');
      var email = String(d.get('email')).trim().toLowerCase(), pw = String(d.get('password'));
      if (mode === 'signup' && pw.length < 8) return status(form, 'Use at least 8 characters for your password.', 'err');
      var btn = $('button[type=submit]', form); btn.disabled = true; status(form, mode === 'signup' ? 'Creating your account…' : 'Signing in…');
      var call = mode === 'signup' ? STORE.signUp(String(d.get('name')).trim(), email, pw, String(d.get('country')).trim()) : STORE.signIn(email, pw);
      call.then(function () { form.reset(); status(form, ''); btn.disabled = false; go(mode === 'signup' ? HREF.ob : HREF.dash); },
                function (err) { btn.disabled = false; status(form, esc(err.message), 'err'); });
    });
  });
  $$('[data-forgot]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var form = a.closest('form'), email = form.elements.email.value.trim();
      if (!email) return status(form, 'Type your email above first, then click “Forgot password?”.', 'err');
      if (!ready(form)) return;
      STORE.resetPassword(email).then(function () { status(form, 'Check your inbox for a link to reset your password.', 'ok'); },
                                      function (err) { status(form, esc(err.message), 'err'); });
    });
  });

  /* ---------- header + mobile menu account area */
  function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function hint() { return LS.get('cv-hint', null); }
  function saveHint(acc) {
    try {
      if (acc) localStorage.setItem('cv-hint', JSON.stringify({ name: acc.name, email: acc.email, role: acc.role }));
      else if (acc === null) localStorage.removeItem('cv-hint');
    } catch (e) {}
  }
  function renderAccountChrome() {
    var acc = ACC === undefined ? hint() : ACC;
    if (ACC !== undefined) saveHint(ACC);
    document.documentElement.classList.toggle('cv-in', !!acc);
    $$('.login-btn').forEach(function (b) { b.setAttribute('href', acc ? HREF.dash : HREF.login); });
    $$('[data-mm-account]').forEach(function (box) {
      box.innerHTML = acc
        ? '<p class="mm-acc-label">Your account</p><div class="mm-user"><span class="mm-av">' + esc(initials(acc.name)) + '</span><span><strong>' + esc(acc.name) + '</strong><em>' + esc(acc.email) + '</em></span></div>' +
          '<a class="mm-btn mm-btn-primary" href="' + HREF.dash + '">My Dashboard</a>' +
          (acc.role === 'admin' ? '<a class="mm-btn" href="' + HREF.admin + '">Editor dashboard</a>' : '') +
          '<button type="button" class="mm-btn" data-sign-out>Sign out</button>'
        : '<a class="mm-btn mm-btn-primary" href="' + HREF.login + '">Sign in</a>' +
          '<a class="mm-btn" href="' + HREF.login + '" data-then="signup">Create an account</a>';
    });
  }
  renderAccountChrome();
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-then="signup"]');
    if (t) setTimeout(function () { var b = $('.route:not([hidden]) [data-auth-tab="signup"]') || $('[data-auth-tab="signup"]'); if (b) b.click(); }, 40);
  });
  if (!P && /[?&]signup\b/.test(location.search)) { var st = $('[data-auth-tab="signup"]'); if (st) st.click(); }

  /* ---------- member pages (dashboard, onboarding, admin) */
  function statusClass(s) { return s === 'Published' || s === 'Approved' ? 's-pub' : s === 'In Review' ? 's-review' : s === 'Changes requested' ? 's-changes' : 's-draft'; }
  function renderMember(errorMsg) {
    var acc = ACC;
    renderAccountChrome();
    $$('[data-loading]').forEach(function (l) { l.hidden = acc !== undefined || !!errorMsg; });
    if (!P && acc && /^\/login\/?$/.test(location.pathname)) { go(HREF.dash); return; }
    $$('[data-gate]').forEach(function (g) {
      g.hidden = acc !== null && !errorMsg;
      var m = $('[data-gate-msg]', g); if (m) m.textContent = errorMsg || m.getAttribute('data-default');
    });
    $$('[data-member]').forEach(function (m) { m.hidden = !acc; });
    $$('[data-admin-only]').forEach(function (m) { m.hidden = !(acc && acc.role === 'admin'); });
    $$('[data-not-admin]').forEach(function (m) { m.hidden = !(acc && acc.role !== 'admin'); });
    if (!acc) return;
    var done = STEPS.filter(function (k) { return acc.progress.indexOf(k) > -1; }).length, n = STEPS.length, j = new Date(acc.joined);
    $$('[data-initials]').forEach(function (e) { e.textContent = initials(acc.name); });
    $$('[data-first-name]').forEach(function (e) { e.textContent = acc.name.split(' ')[0] || acc.name; });
    $$('[data-subline]').forEach(function (e) { e.textContent = (acc.role === 'admin' ? 'Editor' : 'Youth Correspondent') + (acc.country ? ' · ' + acc.country : '') + ' · Joined ' + MONTHS[j.getMonth()] + ' ' + j.getFullYear(); });
    $$('[data-progress-label]').forEach(function (e) { e.textContent = done + ' of ' + n + ' done'; });
    $$('[data-progress-chip]').forEach(function (e) { e.textContent = done === n ? 'COMPLETE' : done + ' OF ' + n + ' DONE'; });
    $$('[data-progress-bar]').forEach(function (e) { e.style.width = (done / n * 100) + '%'; });
    $$('[data-continue]').forEach(function (e) { e.firstChild.textContent = done === 0 ? 'Start your path' : done === n ? 'Review your training' : 'Continue your path'; });
    $$('[data-step-key]').forEach(function (b) { b.classList.toggle('is-done', acc.progress.indexOf(b.getAttribute('data-step-key')) > -1); });
    $$('[data-complete]').forEach(function (b) {
      var isDone = acc.progress.indexOf(b.getAttribute('data-complete')) > -1;
      b.classList.toggle('is-done', isDone);
      $('[data-complete-label]', b).textContent = isDone ? 'Completed' : 'Mark as complete';
    });
    var practice = acc.articles.filter(function (a) { return a.type === 'practice'; })[0];
    $$('[data-practice-status]').forEach(function (e) {
      e.textContent = !practice ? '' : practice.status === 'Draft' ? 'You have a draft saved. Open it to keep writing.'
        : practice.status === 'Changes requested' ? 'Your editor sent notes. Open it to revise and resubmit.'
        : practice.status === 'Approved' ? 'Approved by your editor. You can now submit full articles.'
        : 'Submitted ' + new Date(practice.updated).toLocaleDateString() + '. An editor will send notes.';
    });
    $$('[data-new-article="practice"]').forEach(function (b) {
      b.lastChild.textContent = !practice ? 'Start writing' : /Draft|Changes/.test(practice.status) ? 'Continue writing' : 'View submission';
      b.setAttribute('data-edit-id', practice ? practice.id : '');
    });
    $$('[data-articles]').forEach(function (t) {
      var rows = acc.articles.slice().sort(function (a, b) { return String(b.updated).localeCompare(String(a.updated)); });
      if (!rows.length) { t.innerHTML = '<div class="empty-state"><p><strong>No articles yet.</strong></p><p class="muted">Finish onboarding, then submit your first piece. Drafts you save will appear here.</p></div>'; return; }
      t.innerHTML = '<div class="tr th"><span>Title</span><span>Topic</span><span>Status</span><span>Feedback</span></div>' + rows.map(function (a) {
        return '<button type="button" class="tr tr-btn" data-edit-id="' + esc(a.id) + '"><strong>' + esc(a.title || '(Untitled draft)') + (a.type === 'practice' ? ' <span class="chip tone-blue">Practice</span>' : '') +
          '</strong><span data-l="Topic">' + esc(a.topic || '—') + '</span><span data-l="Status"><span class="status ' + statusClass(a.status) + '">' + esc(a.status) + '</span></span>' +
          '<span data-l="Feedback" class="fb-cell">' + esc(a.feedback ? (a.feedback.length > 40 ? a.feedback.slice(0, 40) + '…' : a.feedback) : '—') + '</span></button>';
      }).join('');
    });
    if (acc.role === 'admin') { loadReviewQueue(); loadMessages(); }
    $$('[data-provider-only]').forEach(function (x) { x.hidden = x.getAttribute('data-provider-only') !== (acc.provider || 'password'); });
    $$('[data-set-name]').forEach(function (x) { x.textContent = acc.name || ''; });
    $$('[data-set-country]').forEach(function (x) { x.textContent = acc.country || 'Country not set'; });
    $$('[data-set-email]').forEach(function (x) { x.textContent = acc.email || ''; });
    $$('[data-profile-form]').forEach(function (f) {
      if (f.getAttribute('data-dirty')) return;
      f.elements.name.value = acc.name || ''; f.elements.country.value = acc.country || ''; f.elements.email.value = acc.email || '';
      f.removeAttribute('data-dirty');
    });
  }

  /* ---------- account settings */
  document.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('[data-profile-form]'); if (f) f.setAttribute('data-dirty', '1'); });
  $$('[data-profile-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(f)) return status(f, 'Please fill in your name and country.', 'err');
      var btn = $('button[type=submit]', f); btn.disabled = true; status(f, 'Saving…');
      STORE.saveProfile({ name: f.elements.name.value.trim(), country: f.elements.country.value.trim() })
        .then(function () { btn.disabled = false; f.removeAttribute('data-dirty'); status(f, ''); closeModal(f.closest('.modal')); toast('Profile updated'); },
              function (err) { btn.disabled = false; status(f, esc(err.message), 'err'); });
    });
  });
  $$('[data-password-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var cur = f.elements.current.value, nx = f.elements.next.value, cf = f.elements.confirm.value;
      if (!cur || !nx || !cf) return status(f, 'Fill in all three fields.', 'err');
      if (nx.length < 8) return status(f, 'Use at least 8 characters for your new password.', 'err');
      if (nx !== cf) return status(f, 'The new passwords don’t match.', 'err');
      var btn = $('button[type=submit]', f); btn.disabled = true; status(f, 'Updating…');
      STORE.changePassword(cur, nx).then(function () { btn.disabled = false; f.reset(); status(f, ''); closeModal(f.closest('.modal')); toast('Password updated'); },
                                         function (err) { btn.disabled = false; status(f, esc(err.message), 'err'); });
    });
    $('[data-send-reset]', f).addEventListener('click', function () {
      if (!ACC) return;
      STORE.resetPassword(ACC.email).then(function () { status(f, 'We sent a reset link to ' + esc(ACC.email) + '.', 'ok'); },
                                          function (err) { status(f, esc(err.message), 'err'); });
    });
  });
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (!o) return;
    var m = (o.closest('.route') || document).querySelector('#' + o.getAttribute('data-open')), f = $('form', m);
    f.removeAttribute('data-dirty'); if (f.hasAttribute('data-password-form')) f.reset(); status(f, '');
    if (ACC && f.hasAttribute('data-profile-form')) { f.elements.name.value = ACC.name || ''; f.elements.country.value = ACC.country || ''; }
    openModal(m);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-delete-open]'); if (!b) return;
    var m = (b.closest('.route') || document).querySelector('#delete-modal'), f = $('form', m);
    f.reset(); status(f, ''); openModal(m);
  });
  $$('[data-delete-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.elements.confirm.value.trim().toUpperCase() !== 'DELETE') return status(f, 'Type DELETE to confirm.', 'err');
      if (ACC && ACC.provider !== 'google' && !f.elements.password.value) return status(f, 'Enter your password to confirm.', 'err');
      var btn = $('button[type=submit]', f); btn.disabled = true; status(f, 'Deleting your account…');
      STORE.deleteAccount(f.elements.password.value).then(function () {
        btn.disabled = false; closeModal(f.closest('.modal')); toast('Your account has been deleted'); go(HREF.home);
      }, function (err) { btn.disabled = false; status(f, esc(err.message), 'err'); });
    });
  });

  /* ---------- onboarding */
  function showStep(root, i) {
    var panels = $$('[data-step-panel]', root);
    i = Math.max(0, Math.min(panels.length - 1, i));
    panels.forEach(function (p, k) { p.hidden = k !== i; if (k !== i) { var v = $('video', p); if (v) v.pause(); } });
    $$('.ob-step', root).forEach(function (b, k) { b.classList.toggle('is-active', k === i); });
  }
  function markStep(key, on) {
    if (!ACC) return Promise.resolve();
    var list = ACC.progress.filter(function (k) { return k !== key; });
    if (on) list.push(key);
    return STORE.saveProgress(list);
  }
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto-step]');
    if (g) {
      var root = g.closest('[data-member]');
      showStep(root, +g.getAttribute('data-goto-step'));
      var top = $('.ob-main', root).getBoundingClientRect().top;
      if (top < 70) window.scrollTo({ top: window.pageYOffset + top - 90, behavior: 'smooth' });
      return;
    }
    var c = e.target.closest('[data-complete]');
    if (c) {
      var k = c.getAttribute('data-complete'), was = ACC && ACC.progress.indexOf(k) > -1, r = c.closest('[data-member]');
      markStep(k, !was).then(function () { if (!was) setTimeout(function () { showStep(r, STEPS.indexOf(k) + 1); }, 300); });
      return;
    }
    if (e.target.closest('[data-sign-out]')) { closeMenu(); STORE.signOut().then(function () { go(HREF.home); }); return; }
    var p = e.target.closest('[data-pdf]');
    if (p) {
      var scope = p.closest('.route') || document, m = scope.querySelector('#pdf-modal');
      $('[data-pdf-title]', m).textContent = p.getAttribute('data-title');
      $('[data-pdf-frame]', m).src = p.getAttribute('data-pdf');
      $('[data-pdf-open]', m).href = p.getAttribute('data-pdf');
      openModal(m);
    }
  });
  $$('[data-step-video]').forEach(function (v) {
    v.addEventListener('ended', function () {
      var key = STEPS[+v.closest('[data-step-panel]').getAttribute('data-step-panel')];
      if (ACC && ACC.progress.indexOf(key) === -1) markStep(key, true);
    });
  });

  /* ---------- article editor (correspondents) */
  function articleModal(from) { var scope = from.closest('.route') || document; return $('[data-article-form]', scope).closest('.modal'); }
  function words(t) { var m = String(t || '').trim().match(/\S+/g); return m ? m.length : 0; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-new-article],[data-edit-id]');
    if (!b || !ACC) return;
    var id = b.getAttribute('data-edit-id'), art = id ? ACC.articles.filter(function (a) { return a.id === id; })[0] : null;
    if (!b.hasAttribute('data-new-article') && !art) return;
    var type = art ? art.type : b.getAttribute('data-new-article');
    var m = articleModal(b), f = $('[data-article-form]', m);
    f.reset(); status(f, '');
    $$('.invalid', f).forEach(function (x) { x.classList.remove('invalid'); });
    f.elements.id.value = art ? art.id : ''; f.elements.type.value = type;
    if (art) ['title', 'topic', 'region', 'body', 'ai'].forEach(function (k) { f.elements[k].value = art[k] || ''; });
    else f.elements.region.value = ACC.country || '';
    if (art && art.checks) art.checks.forEach(function (k) { if (f.elements[k]) f.elements[k].checked = true; });
    var locked = !!art && !/Draft|Changes requested/.test(art.status);
    $$('input,select,textarea,button[type=submit],[data-save-draft]', f).forEach(function (x) { if (x.type !== 'hidden') x.disabled = locked; });
    var note = $('[data-am-locked]', f);
    note.hidden = !(locked || (art && art.feedback));
    note.innerHTML = art && art.feedback ? '<strong>Editor notes:</strong> ' + esc(art.feedback)
      : art && art.status === 'Published' ? 'This article is published on the Youth Correspondents page.'
      : 'This piece has been submitted. Your editor will reply with notes here.';
    $('[data-am-kind]', m).textContent = type === 'practice' ? 'Practice piece · about 300 words' : 'Article · usually 600–1,000 words';
    $('[data-am-heading]', m).textContent = art ? (locked ? (art.title || 'Submitted piece') : 'Edit your piece') : (type === 'practice' ? 'Write your practice piece' : 'Submit a new article');
    $('[data-wc]', f).textContent = words(f.elements.body.value) + ' words';
    openModal(m);
  });
  document.addEventListener('input', function (e) {
    if (e.target.name === 'body' && e.target.closest('[data-article-form]')) $('[data-wc]', e.target.closest('form')).textContent = words(e.target.value) + ' words';
  });
  function saveArticle(f, submit) {
    if (!ACC) return;
    var d = new FormData(f), checks = ['c1', 'c2', 'c3', 'c4'].filter(function (k) { return f.elements[k].checked; });
    if (submit) {
      if (!validate(f)) return status(f, 'Add a title, topic, location and your article before submitting.', 'err');
      if (checks.length < 4) return status(f, 'Please confirm all four checks before submitting.', 'err');
    } else if (!String(d.get('title')).trim() && !String(d.get('body')).trim()) return status(f, 'Write something before saving a draft.', 'err');
    var prev = d.get('id') ? ACC.articles.filter(function (a) { return a.id === d.get('id'); })[0] : null;
    var art = { id: d.get('id') || '', type: d.get('type') || 'article', title: String(d.get('title')).trim(), topic: d.get('topic') || '',
                region: d.get('region') || '', body: d.get('body') || '', ai: d.get('ai') || '', checks: checks,
                status: submit ? 'In Review' : 'Draft', feedback: prev && prev.feedback ? prev.feedback : '' };
    if (submit) art.submittedAt = new Date().toISOString();
    $$('button', f).forEach(function (x) { x.disabled = true; });
    status(f, submit ? 'Submitting…' : 'Saving…');
    STORE.saveArticle(art).then(function () {
      $$('button', f).forEach(function (x) { x.disabled = false; });
      if (submit && art.type === 'practice') markStep('practice', true);
      closeModal(f.closest('.modal'));
      toast(submit ? 'Submitted for review' : 'Draft saved');
    }, function (err) { $$('button', f).forEach(function (x) { x.disabled = false; }); status(f, esc(err.message), 'err'); });
  }
  $$('[data-article-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); saveArticle(f, true); });
    $('[data-save-draft]', f).addEventListener('click', function () { saveArticle(f, false); });
  });

  /* ---------- admin review */
  var QUEUE = [], qTab = 'In Review';
  function loadReviewQueue() {
    var box = $('[data-review-list]'); if (!box || !STORE) return;
    STORE.listForReview().then(function (list) { QUEUE = list; drawQueue(); }, function (err) { box.innerHTML = '<p class="form-status err">' + esc(err.message) + '</p>'; });
  }
  function drawQueue() {
    $$('[data-review-list]').forEach(function (box) {
      var counts = {}; QUEUE.forEach(function (a) { counts[a.status] = (counts[a.status] || 0) + 1; });
      $$('[data-q-count]').forEach(function (c) { c.textContent = counts[c.getAttribute('data-q-count')] || 0; });
      var rows = QUEUE.filter(function (a) { return a.status === qTab || (qTab === 'Published' && a.status === 'Approved'); })
        .sort(function (a, b) { return String(b.submittedAt || b.updated).localeCompare(String(a.submittedAt || a.updated)); });
      box.innerHTML = rows.length ? rows.map(function (a) {
        return '<article class="rv-card"><div class="rv-main"><div class="rv-meta"><span class="status ' + statusClass(a.status) + '">' + esc(a.status) + '</span>' +
          (a.type === 'practice' ? '<span class="chip tone-blue">Practice</span>' : '') + '<span>' + esc(a.topic || '—') + '</span><span>' + words(a.body) + ' words</span></div>' +
          '<h3>' + esc(a.title || '(Untitled)') + '</h3><p class="muted">By ' + esc(a.authorName || 'Unknown') + (a.authorCountry ? ' · ' + esc(a.authorCountry) : '') +
          ' · ' + new Date(a.submittedAt || a.updated).toLocaleDateString() + '</p></div>' +
          '<button type="button" class="btn btn-primary btn-sm" data-review="' + esc(a.id) + '">' + (a.status === 'In Review' ? 'Review' : 'Open') + '</button></article>';
      }).join('') : '<div class="empty-state"><p><strong>Nothing here.</strong></p><p class="muted">' +
        (qTab === 'In Review' ? 'New submissions from correspondents will appear here.' : 'No articles in this list yet.') + '</p></div>';
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-q-tab]');
    if (t) { qTab = t.getAttribute('data-q-tab'); $$('[data-q-tab]').forEach(function (x) { x.classList.toggle('is-active', x === t); }); drawQueue(); return; }
    var r = e.target.closest('[data-review]');
    if (r) {
      var a = QUEUE.filter(function (x) { return x.id === r.getAttribute('data-review'); })[0]; if (!a) return;
      var m = (r.closest('.route') || document).querySelector('#review-modal'), f = $('form', m);
      f.elements.id.value = a.id; f.elements.feedback.value = a.feedback || ''; status(f, '');
      $('[data-rv-title]', m).textContent = a.title || '(Untitled)';
      $('[data-rv-by]', m).textContent = 'By ' + (a.authorName || 'Unknown') + [a.authorCountry, a.region !== a.authorCountry ? a.region : '', a.topic].filter(Boolean).map(function (x) { return ' · ' + x; }).join('');
      $('[data-rv-body]', m).innerHTML = String(a.body || '').split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
      $('[data-rv-ai]', m).textContent = a.ai || 'Not stated';
      $('[data-rv-checks]', m).textContent = (a.checks || []).length + ' of 4 confirmed';
      $('[data-rv-wc]', m).textContent = words(a.body) + ' words';
      var practice = a.type === 'practice';
      $('[data-rv-publish]', m).hidden = practice || a.status === 'Published';
      $('[data-rv-approve]', m).hidden = !practice || a.status === 'Approved';
      $('[data-rv-unpublish]', m).hidden = a.status !== 'Published';
      openModal(m);
      return;
    }
    var act = e.target.closest('[data-rv-action]');
    if (act) {
      var form = act.closest('form'), id = form.elements.id.value, fb = form.elements.feedback.value.trim(), what = act.getAttribute('data-rv-action');
      var art = QUEUE.filter(function (x) { return x.id === id; })[0];
      var patch = { feedback: fb };
      if (what === 'publish') { patch.status = 'Published'; patch.publishedAt = new Date().toISOString(); patch.slug = slugify(art.title || 'article') + '-' + id.slice(-5).toLowerCase(); }
      if (what === 'approve') patch.status = 'Approved';
      if (what === 'changes') { if (!fb) return status(form, 'Write a note so the correspondent knows what to change.', 'err'); patch.status = 'Changes requested'; }
      if (what === 'unpublish') patch.status = 'Changes requested';
      status(form, 'Saving…');
      STORE.review(id, patch).then(function () {
        closeModal(form.closest('.modal'));
        toast(what === 'publish' ? 'Published to Youth Correspondents' : what === 'approve' ? 'Practice piece approved' : what === 'unpublish' ? 'Unpublished' : 'Sent back with notes');
        loadReviewQueue();
      }, function (err) { status(form, esc(err.message), 'err'); });
    }
  });

  /* ---------- admin: messages from the contact + proposal forms */
  var MSGS = [];
  function fmtDate(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function loadMessages() {
    if (!STORE || !$('[data-msg-list]')) return;
    STORE.listMessages().then(function (l) { MSGS = l; drawMessages(); }, function (err) { $$('[data-msg-list]').forEach(function (b) { b.innerHTML = '<p class="form-status err">' + esc(err.message) + '</p>'; }); });
  }
  function drawMessages() {
    var unread = MSGS.filter(function (m) { return !m.read; }).length;
    $$('[data-msg-count]').forEach(function (c) { c.textContent = unread; c.hidden = !unread; });
    $$('[data-msg-list]').forEach(function (box) {
      var rows = MSGS.slice().sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
      box.innerHTML = rows.length ? rows.map(function (m) {
        var reply = 'mailto:' + encodeURIComponent(m.email || '') + '?subject=' + encodeURIComponent('Re: ' + (m.subject || 'CrossView'));
        return '<details class="msg-card' + (m.read ? '' : ' is-unread') + '" data-msg="' + esc(m.id) + '"><summary>' +
          '<span class="msg-dot" aria-hidden="true"></span><span class="msg-main"><span class="msg-top"><strong>' + esc(m.name || 'Anonymous') + '</strong>' +
          (m.type === 'proposal' ? '<span class="chip tone-blue">Policy proposal</span>' : '') + '<em>' + esc(fmtDate(m.createdAt)) + '</em></span>' +
          '<span class="msg-subj">' + esc(m.subject || '(No subject)') + '</span></span>' + ic_chev + '</summary>' +
          '<div class="msg-body"><p class="muted small">' + esc(m.email || '') + '</p><div class="msg-text">' + esc(m.body || '').replace(/\n/g, '<br>') + '</div>' +
          '<div class="msg-actions">' + (m.email ? '<a class="btn btn-primary btn-sm" href="' + reply + '">Reply by email</a>' : '') +
          '<button type="button" class="btn btn-ghost-dark btn-sm" data-msg-read>' + (m.read ? 'Mark as unread' : 'Mark as read') + '</button>' +
          '<button type="button" class="btn btn-ghost-dark btn-sm msg-del" data-msg-del>Delete</button></div></div></details>';
      }).join('') : '<div class="empty-state"><p><strong>No messages yet.</strong></p><p class="muted">Messages sent through the Contact Us form and policy proposals will appear here.</p></div>';
    });
  }
  var ic_chev = '<svg class="ic msg-chev" viewBox="0 0 512 512" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M112 184l144 144 144-144"/></svg>';
  document.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.matches || !d.matches('details[data-msg]') || !d.open) return;
    var m = MSGS.filter(function (x) { return x.id === d.getAttribute('data-msg'); })[0];
    if (m && !m.read) { m.read = true; d.classList.remove('is-unread'); $('[data-msg-read]', d).textContent = 'Mark as unread'; STORE.markMessage(m.id, true); var u = MSGS.filter(function (x) { return !x.read; }).length; $$('[data-msg-count]').forEach(function (c) { c.textContent = u; c.hidden = !u; }); }
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-admin-view]');
    if (t) {
      var v = t.getAttribute('data-admin-view');
      $$('[data-admin-view]').forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
      $$('[data-admin-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-admin-panel') !== v; });
      if (v === 'messages') loadMessages();
      return;
    }
    var card = e.target.closest('[data-msg]'); if (!card) return;
    var id = card.getAttribute('data-msg'), m = MSGS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (e.target.closest('[data-msg-read]')) { STORE.markMessage(id, !m.read).then(loadMessages); }
    if (e.target.closest('[data-msg-del]')) {
      if (!window.confirm('Delete this message? This can’t be undone.')) return;
      STORE.deleteMessage(id).then(function () { toast('Message deleted'); loadMessages(); });
    }
  });

  /* ---------- published correspondent articles (Youth Correspondents page + article view) */
  function storyHref(a) { return P ? '#story' : '/articles/' + a.slug; }
  function excerpt(body) { var t = String(body || '').trim().split(/\n\s*\n/)[0] || ''; return t.length > 220 ? t.slice(0, 220) + '…' : t; }
  function loadPublished() {
    var grid = $('[data-filter-target="articles"]'); if (!grid || !STORE) return;
    var gen = ++loadPublished.gen;
    STORE.listPublished().then(function (list) {
      if (gen !== loadPublished.gen) return; // a newer load is on its way
      $$('.art-card.is-live', grid).forEach(function (x) { x.remove(); });
      list.sort(function (a, b) { return String(b.publishedAt).localeCompare(String(a.publishedAt)); }).reverse().forEach(function (a) { // oldest first, each inserted at top → newest ends up first
        var el = document.createElement('article');
        el.className = 'art-card is-live'; el.setAttribute('data-cats', a.topic || '');
        el.innerHTML = '<div class="art-cats"><span class="chip tone-green">New</span>' + (a.topic ? '<span class="chip tone-blue">' + esc(a.topic) + '</span>' : '') + '</div>' +
          '<h3><a class="stretched" href="' + storyHref(a) + '" data-story-id="' + esc(a.id) + '">' + esc(a.title) + '</a></h3><p class="clamp-3">' + esc(excerpt(a.body)) + '</p>' +
          '<div class="art-foot"><span class="muted small">By ' + esc(a.authorName || 'a correspondent') + (a.authorCountry ? ' · ' + esc(a.authorCountry) : '') + '</span><span class="read-more">Read more</span></div>';
        grid.insertBefore(el, grid.firstChild);
      });
    }, function () {});
  }
  loadPublished.gen = 0;
  var STORY_ID = null;
  document.addEventListener('click', function (e) { var s = e.target.closest('[data-story-id]'); if (s) STORY_ID = s.getAttribute('data-story-id'); });
  function renderStory(a) {
    $$('[data-story]').forEach(function (box) {
      if (!a) { box.hidden = true; return; }
      box.hidden = false;
      $('[data-story-title]', box).textContent = a.title;
      $('[data-story-meta]', box).innerHTML = '<span class="hero-tag">Article</span>' + (a.topic ? '<span class="hero-chip">' + esc(a.topic) + '</span>' : '');
      $('[data-story-by]', box).textContent = 'By ' + (a.authorName || 'a correspondent') + (a.region ? ' · ' + a.region : a.authorCountry ? ' · ' + a.authorCountry : '') + ' · ' + new Date(a.publishedAt || a.updated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      $('[data-story-body]', box).innerHTML = String(a.body || '').split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>'; }).join('');
      document.title = a.title + ' — CrossView';
    });
  }
  function routeStory() {
    if (!STORE) return;
    if (P) {
      if (!STORY_ID) return;
      STORE.listPublished().then(function (list) { renderStory(list.filter(function (x) { return x.id === STORY_ID; })[0] || null); });
      return;
    }
    var m = location.pathname.match(/^\/articles\/([^/]+)\/?$/);
    if (!m || !$('[data-story]')) return;
    STORE.getPublished(decodeURIComponent(m[1])).then(function (a) {
      if (!a) return;
      $$('[data-notfound]').forEach(function (x) { x.hidden = true; });
      renderStory(a);
    }, function () {});
  }

  /* re-render after each backend change, and when the preview switches page */
  var _rm = renderMember;
  renderMember = function (msg) { _rm(msg); if (STORE) { loadPublished(); routeStory(); } };
  window.CV_RENDER_MEMBER = function () { _rm(); loadPublished(); routeStory(); };

  if (STORE === LocalStore) LocalStore._migrate();

  /* ---------- preview: hash router across all pages */
  if (window.CV_PREVIEW) {
    var routes = $$('.route');
    function show() {
      var h = location.hash.slice(1) || 'home';
      var r = routes.filter(function (x) { return x.getAttribute('data-route') === h; })[0];
      if (!r) {
        var cur = routes.filter(function (x) { return !x.hidden; })[0];
        if (cur && cur.querySelector('#' + CSS.escape(h))) { scrollToId(h); return; }
        r = routes.filter(function (x) { return x.getAttribute('data-route') === '404'; })[0];
      }
      routes.forEach(function (x) { x.hidden = x !== r; });
      setActiveNav(r.getAttribute('data-nav-group'));
      document.body.classList.toggle('no-footer', /^(login|profile|onboarding|admin)$/.test(r.getAttribute('data-route')));
      document.title = r.getAttribute('data-title');
      window.scrollTo(0, 0);
    }
    function render(h) {
      var r = routes.filter(function (x) { return x.getAttribute('data-route') === h; })[0];
      if (!r) return false;
      routes.forEach(function (x) { x.hidden = x !== r; });
      setActiveNav(r.getAttribute('data-nav-group'));
      document.body.classList.toggle('no-footer', /^(login|profile|onboarding|admin)$/.test(h));
      if (window.CV_RENDER_MEMBER) window.CV_RENDER_MEMBER();
      document.title = r.getAttribute('data-title');
      window.scrollTo(0, 0);
      return true;
    }
    // Navigate on click ourselves: the viewer's sandbox may not deliver hash changes.
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var h = a.getAttribute('href').slice(1) || 'home';
      if (!render(h)) {
        if (scrollToId(h)) e.preventDefault();
        return;
      }
      e.preventDefault();
      closeMenu();
      try { if (location.hash.slice(1) !== h) history.pushState(null, '', '#' + h); } catch (err) {}
      var then = a.getAttribute('data-then');
      if (then) setTimeout(function () { scrollToId(then); }, 30);
    });
    window.addEventListener('hashchange', show);
    window.addEventListener('popstate', show);
    try { show(); } catch (err) { render('home'); }
  }
})();
