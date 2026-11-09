(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero entrance: start on the first animation frame, no waiting for fonts or images.
  var hero = document.querySelector('.hero');
  if (hero) {
    if (reduce) { hero.classList.add('is-in'); }
    else { requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); }); }
  }

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // Sticky header shrink
  var header = document.querySelector('.site-header');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 24); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // Mobile menu: opens, closes on link click and Escape
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  function closeMenu() { if (!menu) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      menu.hidden = open; btn.setAttribute('aria-expanded', String(!open));
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); btn.focus(); } });
  }

  // Language switch is a visible no-op for now
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // Scroll reveals with an above-the-fold guard
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.transitionDelay = (i++ * 80) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  // Services: hover or focus swaps the photo
  var swapItems = document.querySelectorAll('.swap-item');
  var swapImgs = document.querySelectorAll('.swap-img');
  function activate(idx) {
    swapItems.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-img') === String(idx)); });
    swapImgs.forEach(function (im, i) { im.classList.toggle('is-active', i === idx); });
  }
  swapItems.forEach(function (li) {
    var idx = parseInt(li.getAttribute('data-img'), 10);
    li.addEventListener('mouseenter', function () { activate(idx); });
    li.addEventListener('focusin', function () { activate(idx); });
  });

  // Work strip: drag with the mouse, progress bar follows
  var strip = document.getElementById('strip');
  var fill = document.getElementById('stripFill');
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-dragging'); }
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      setTimeout(function () { strip.classList.remove('is-dragging'); }, 0);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    var updateFill = function () {
      if (!fill) return;
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      fill.style.transform = 'scaleX(' + Math.min(1, vis + (1 - vis) * p).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', updateFill, { passive: true });
    window.addEventListener('resize', updateFill);
    updateFill();
  }

  // Process line draws as the steps scroll past
  var steps = document.getElementById('steps');
  var stepsFill = document.getElementById('stepsFill');
  if (steps && stepsFill) {
    if (reduce) { stepsFill.style.transform = 'scaleY(1)'; }
    else {
      var ticking = false;
      var drawLine = function () {
        ticking = false;
        var r = steps.getBoundingClientRect();
        var start = window.innerHeight * 0.75;
        var p = (start - r.top) / r.height;
        p = Math.max(0, Math.min(1, p));
        stepsFill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drawLine); } }, { passive: true });
      drawLine();
    }
  }

  // Form validation with inline messages
  var form = document.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+0-9 ()]{8,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email.'; },
      'project-type': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A few words about the project, please.'; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      field.classList.toggle('has-error', !!msg);
      field.querySelector('.err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('has-error')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; if (!first) first = el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }
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
    var els = [].slice.call(d.querySelectorAll(".about-photo"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".btn-solid").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
  /* highlight that follows the cursor over the work grid */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll("#strip").forEach(function (g) {
      g.classList.add('px-spot');
      g.addEventListener('pointermove', function (e) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left + g.scrollLeft) + 'px'); g.style.setProperty('--my', (e.clientY - r.top + g.scrollTop) + 'px'); g.classList.add('is-spot'); });
      g.addEventListener('pointerleave', function () { g.classList.remove('is-spot'); });
    });
  })();
})();
