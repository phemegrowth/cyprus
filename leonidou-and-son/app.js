/* A. Leonidou & Son: hero entrance, header, menu, reveals, service photo swap,
   drag reel, process line, form validation, anchor scroll. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first animation frame, no waiting for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) { hero.classList.add('is-in'); }
    else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hero.classList.add('is-in'); });
      });
    }
  }

  /* Header shrink */
  var header = d.getElementById('header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (refocus) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Language switch is a visible no-op for now */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Scroll reveals with stagger; anything already on screen shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.setProperty('--d', (n * 0.08) + 's');
          n++;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var sItems = d.querySelectorAll('.slist__item');
  var sImgs = d.querySelectorAll('.sw');
  function swap(id) {
    sItems.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-for') === id); });
    sImgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-sw') === id); });
  }
  sItems.forEach(function (li) {
    var id = li.getAttribute('data-for');
    li.addEventListener('mouseenter', function () { swap(id); });
    li.addEventListener('focusin', function () { swap(id); });
    li.addEventListener('click', function () { swap(id); });
  });

  /* Work reel: drag with the mouse, buttons, keyboard arrows */
  var reel = d.querySelector('[data-reel]');
  if (reel) {
    var down = false, moved = false, startX = 0, startLeft = 0;
    reel.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = reel.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; reel.classList.add('is-drag'); }
      reel.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { reel.classList.remove('is-drag'); }, 0);
    });
    reel.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    function step(dir) {
      var card = reel.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      reel.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    reel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  /* Process: line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var lineFill = steps ? steps.querySelector('.steps__line span') : null;
  if (steps && lineFill && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      lineFill.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.value.trim() === '' && field.required) ok = false;
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value.trim())) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.type === 'hidden' || f.name === 'bot-field') return;
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') return;
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 64;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* ===== Polish pass, 2 Nov 2026 ===== */
(function () {
  var d = document, RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function inView(el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
  function onEnter(els, fn, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }); }, opts || { threshold: 0.15 });
    els.forEach(function (el) { if (inView(el)) fn(el); else io.observe(el); });
  }
  /* back-to-top ring with scroll progress */
  (function () {
    var b = d.createElement('button'); b.type = 'button'; b.className = 'px-top'; b.setAttribute('aria-label', 'Back to top');
    b.innerHTML = '<svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true"><circle class="px-top__bg" cx="26" cy="26" r="23"/><circle class="px-top__fg" cx="26" cy="26" r="23" stroke-dasharray="144.5" stroke-dashoffset="144.5"/></svg><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="position:static;transform:none"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    d.body.appendChild(b); var fg = b.querySelector('.px-top__fg'), t = false;
    function u() { t = false; var h = d.documentElement.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0; fg.setAttribute('stroke-dashoffset', (144.5 * (1 - p)).toFixed(1)); b.classList.toggle('is-on', scrollY > innerHeight * 0.8); }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(u); } }, { passive: true }); u();
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
  })();
  /* clip-path image reveals */
  (function () {
    var els = [].slice.call(d.querySelectorAll(".about__photo img"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* cards tilt toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".reel .card").forEach(function (c) {
      c.classList.add('px-tilt');
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add('is-tilting'); c.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 4).toFixed(2) + 'deg) translateY(-4px)'; });
      c.addEventListener('pointerleave', function () { c.classList.remove('is-tilting'); c.style.transform = ''; });
    });
  })();
  /* line drawings draw on when seen */
  (function () {
    if (RM) return;
    var ps = [].slice.call(d.querySelectorAll(".about__mark path"));
    ps.forEach(function (p, i) { var L = 0; try { L = p.getTotalLength(); } catch (e) {} if (!L) return; p.style.setProperty('--len', Math.ceil(L)); p.style.setProperty('--dl', (i % 8) * 0.12 + 's'); p.classList.add('px-draw'); });
    var groups = []; ps.forEach(function (p) { var s = p.ownerSVGElement || p; if (groups.indexOf(s) < 0) groups.push(s); });
    onEnter(groups, function (s) { requestAnimationFrame(function () { requestAnimationFrame(function () { s.querySelectorAll('.px-draw').forEach(function (p) { p.classList.add('px-in'); }); }); }); }, { threshold: 0.3 });
  })();
  (function () { var m = d.querySelector('.about__mark'); if (!m) return; if (RM) { m.classList.add('px-on'); return; } onEnter([m], function () { m.classList.add('px-on'); }, { threshold: 0.3 }); })();
})();
