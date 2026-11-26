/* Alumetal site: entrance, header, menus, reel drift, reveals, accordion, systems list, drawing cycle,
   gallery filter and lightbox, process line, count-up, map on request, enquiry form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var STR = {};
  try { STR = JSON.parse(d.getElementById('strings').textContent); } catch (e) {}
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* Header shrink, reel drift, process line, progress bar */
  var header = $('[data-header]'), reel = $('[data-reel]'), hero = $('[data-hero]');
  var steps = $('[data-steps]'), line = $('[data-line]');
  var bar = d.createElement('div');
  bar.className = 'pg-progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
  var ticking = false;
  function frame() {
    ticking = false;
    var sy = window.scrollY;
    if (header) header.classList.toggle('is-small', sy > 40);
    if (reel && hero && !reduce && sy < hero.offsetHeight * 1.2) {
      reel.style.transform = 'translate3d(' + (-sy * (window.innerWidth < 760 ? 0.5 : 0.42)).toFixed(1) + 'px,0,0)';
    }
    if (steps && line) {
      if (reduce) line.style.transform = 'none';
      else {
        var r = steps.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
        line.style.transform = (window.innerWidth <= 760 ? 'scaleY(' : 'scaleX(') + p.toFixed(3) + ')';
      }
    }
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, sy / max) : 0) + ')';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();

  /* Mobile menu */
  var burger = $('.burger'), menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? STR.menuClose : STR.menuOpen);
    if (open) { var a = $('a', menu); if (a) a.focus(); } else if (focusBack) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Systems dropdown in the header: hover, focus and click */
  $$('[data-drop]').forEach(function (drop) {
    var btn = $('button', drop);
    function set(o) { drop.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(!drop.classList.contains('is-open')); });
    drop.addEventListener('mouseenter', function () { set(true); });
    drop.addEventListener('mouseleave', function () { set(false); });
    drop.addEventListener('focusout', function (e) { if (!drop.contains(e.relatedTarget)) set(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });

  /* Scroll reveals, staggered among siblings */
  var items = $$('.r');
  items.forEach(function (el) {
    var sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('r'); });
    el.style.setProperty('--d', (Math.min(sib.indexOf(el), 6) * 0.08).toFixed(2) + 's');
  });
  var io = null;
  if ('IntersectionObserver' in window && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Accordion with height animation */
  $$('[data-acc] .acc__btn').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    if (btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (reduce) { panel.hidden = open; return; }
      function done() { panel.style.height = ''; if (btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true; panel.removeEventListener('transitionend', done); }
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
      } else {
        panel.hidden = false; panel.style.height = '0px';
        requestAnimationFrame(function () { panel.style.height = panel.scrollHeight + 'px'; });
      }
      panel.addEventListener('transitionend', done);
    });
  });

  /* Home systems list: the photo and the drawing follow the row under the cursor */
  var sys = $('[data-sys]');
  if (sys) {
    var rows = $$('.sys__row', sys), views = $$('.sys__view', sys);
    var pick = function (i) {
      rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
      views.forEach(function (v, k) { v.classList.toggle('is-on', k === i); });
    };
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { pick(i); });
      r.addEventListener('focus', function () { pick(i); });
    });
  }

  /* Drawing that cycles through piece types (home band) */
  var cyc = $('[data-cycle]');
  if (cyc && window.AluDraw) {
    var set = JSON.parse(cyc.getAttribute('data-cycle')), ci = 0, cap = $('[data-cycle-cap]');
    var show = function () {
      var o = set[ci % set.length];
      cyc.classList.remove('is-in');
      cyc.innerHTML = window.AluDraw(o);
      if (cap) cap.textContent = o.cap;
      void cyc.offsetWidth;
      cyc.classList.add('is-in');
      ci++;
    };
    show();
    if (!reduce) setInterval(function () { if (!d.hidden) show(); }, 3600);
  }
  /* Drawings fade in piece by piece when they reach the screen */
  $$('[data-draw]').forEach(function (b) {
    if (!io) { b.classList.add('is-in'); return; }
    var o2 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { b.classList.add('is-in'); o2.disconnect(); } }, { threshold: 0.25 });
    o2.observe(b);
  });

  /* Work grid glow */
  var grid = $('[data-grid]'), glow = grid && $('.grid__glow', grid);
  if (grid && glow && !reduce && fine) {
    grid.addEventListener('pointerenter', function () { grid.classList.add('is-hover'); });
    grid.addEventListener('pointerleave', function () { grid.classList.remove('is-hover'); });
    grid.addEventListener('pointermove', function (e) {
      var r = grid.getBoundingClientRect();
      glow.style.transform = 'translate3d(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px,0)';
    });
  }

  /* Gallery: filter chips and a lightbox with keyboard and swipe */
  var gal = $('[data-gallery]');
  if (gal) {
    var shots = $$('.shot', gal), chips = $$('[data-filter]'), count = $('[data-count-shown]');
    var visible = function () { return shots.filter(function (s) { return !s.hidden; }); };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter');
        chips.forEach(function (k) { k.setAttribute('aria-pressed', k === c ? 'true' : 'false'); });
        shots.forEach(function (s) { s.hidden = !(f === 'all' || s.getAttribute('data-cat') === f); s.classList.remove('is-pop'); });
        void gal.offsetWidth;
        visible().forEach(function (s, i) { s.style.setProperty('--d', (i * 0.04) + 's'); s.classList.add('is-pop'); });
        if (count) count.textContent = visible().length;
      });
    });
    var lb = d.getElementById('lightbox'), lbImg = $('img', lb), lbCap = $('[data-lb-cap]', lb), lbN = $('[data-lb-n]', lb), cur = 0, last = null;
    var open = function (i) {
      var v = visible(); cur = (i + v.length) % v.length;
      var s = v[cur], im = $('img', s);
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
      var fc = $('figcaption', s);
      lbCap.textContent = fc.lastChild ? fc.lastChild.textContent.trim() : '';
      lbN.textContent = (cur + 1) + ' / ' + v.length;
      if (!lb.classList.contains('is-open')) { last = d.activeElement; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); d.body.classList.add('lb-open'); $('[data-lb-close]', lb).focus(); }
    };
    var close = function () { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); d.body.classList.remove('lb-open'); if (last) last.focus(); };
    shots.forEach(function (s) {
      var b = $('button', s);
      b.addEventListener('click', function () { open(visible().indexOf(s)); });
    });
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { open(cur - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { open(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'ArrowRight') open(cur + 1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) open(cur + (dx < 0 ? 1 : -1));
    });
  }

  /* Count-up of the registry year */
  $$('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10), from = parseInt(el.getAttribute('data-from') || '0', 10);
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = to; return; }
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* Map loads only when asked, so Google sets nothing before that */
  $$('[data-map]').forEach(function (box) {
    var b = $('[data-map-load]', box);
    if (!b) return;
    b.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = box.getAttribute('data-map'); f.title = box.getAttribute('data-map-title');
      f.loading = 'lazy'; f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      box.appendChild(f); box.classList.add('is-live');
    });
  });

  /* Magnetic accent buttons */
  if (!reduce && fine) {
    $$('.btn--accent').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* Enquiry form: inline validation, the frame list from the builder, then the confirmation page */
  var form = $('[data-form]');
  if (form) {
    var listText = store('alu-list-text');
    var note = $('[data-list-note]');
    if (listText && form.elements.message) {
      if (!form.elements.message.value) form.elements.message.value = listText;
      if (note) note.hidden = false;
      if (form.elements['project-type'] && !form.elements['project-type'].value) form.elements['project-type'].selectedIndex = 1;
    }
    var want = (location.search.match(/[?&]job=(\d)/) || [])[1];
    if (want && form.elements['project-type']) form.elements['project-type'].selectedIndex = parseInt(want, 10);
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : STR.eName; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : STR.ePhone; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : STR.eEmail; },
      'project-type': function (v) { return v ? '' : STR.eType; },
      message: function (v) { return v.trim().length >= 10 ? '' : STR.eMessage; }
    };
    var errIds = { name: 'e-name', phone: 'e-phone', email: 'e-email', 'project-type': 'e-type', message: 'e-message' };
    var check = function (field) {
      var msg = rules[field.name](field.value), box = d.getElementById(errIds[field.name]);
      if (box) { box.textContent = msg; field.setAttribute('aria-describedby', box.id); }
      field.closest('.field').classList.toggle('is-bad', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(rules).forEach(function (n) { var f = form.elements[n]; if (f && !check(f) && !first) first = f; });
      if (first) { first.focus(); return; }
      if (form.elements['bot-field'] && form.elements['bot-field'].value) return;
      var data = {};
      Object.keys(rules).forEach(function (n) { data[n] = form.elements[n].value.trim(); });
      store('alu-enquiry', JSON.stringify(data));
      location.href = form.getAttribute('action');
    });
  }

  /* Confirmation page: shows what was written and offers the two ways to send it right now */
  var sum = $('[data-summary]');
  if (sum) {
    var raw = store('alu-enquiry'), q = null;
    try { q = JSON.parse(raw); } catch (e2) {}
    if (q && q.name) {
      var rowsHtml = '';
      [['name', STR.fName], ['phone', STR.fPhone], ['email', STR.fEmail], ['project-type', STR.fType], ['message', STR.fMessage]].forEach(function (p) {
        var dt = d.createElement('dt'), dd = d.createElement('dd'), wrap = d.createElement('div');
        dt.textContent = p[1]; dd.textContent = q[p[0]]; wrap.appendChild(dt); wrap.appendChild(dd);
        rowsHtml += wrap.outerHTML;
      });
      $('dl', sum).innerHTML = rowsHtml;
      var body = STR.fName + ': ' + q.name + '\n' + STR.fPhone + ': ' + q.phone + '\n' + STR.fEmail + ': ' + q.email + '\n' + STR.fType + ': ' + q['project-type'] + '\n\n' + q.message;
      var m = $('[data-send-mail]'), w = $('[data-send-wa]');
      if (m) m.href = 'mailto:info@alumetal.com.cy?subject=' + encodeURIComponent(STR.mailSubject + ' ' + q.name) + '&body=' + encodeURIComponent(body);
      if (w) w.href = 'https://wa.me/35722329947?text=' + encodeURIComponent(body);
      sum.hidden = false;
    }
  }
})();
