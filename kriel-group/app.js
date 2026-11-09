/* KRIEL Luxury Living: header, menu, reveals, service image swap, count-up, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#' || id === '#top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, staggered; anything already on screen shows at once */
  var items = [].slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or tap swaps the photo */
  var swap = d.querySelector('[data-swap]');
  var pics = d.querySelectorAll('#svc-pic img');
  if (swap && pics.length) {
    var lis = swap.querySelectorAll('.svc__item');
    function show(li) {
      var n = +li.getAttribute('data-img');
      lis.forEach(function (x) { x.classList.toggle('is-active', x === li); });
      pics.forEach(function (img, i) { img.classList.toggle('is-on', i === n); });
    }
    lis.forEach(function (li) {
      li.addEventListener('mouseenter', function () { show(li); });
      li.querySelector('button').addEventListener('click', function () { show(li); });
      li.querySelector('button').addEventListener('focus', function () { show(li); });
    });
  }

  /* Count-up for sourced quantities only */
  var counts = d.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = +el.getAttribute('data-count'), t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counts.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.textContent = '0'; co.observe(el); }
    });
  }

  /* Drag strip (mouse drag; touch and trackpad scroll natively) */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
      strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; strip.classList.remove('is-drag');
    });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* Progress line that draws as the steps scroll through */
  var prog = d.querySelector('[data-progress]');
  if (prog) {
    if (reduce) { prog.style.setProperty('--p', 1); }
    else {
      var ticking = false;
      var upd = function () {
        var r = prog.getBoundingClientRect(), vh = window.innerHeight;
        var k = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        prog.style.setProperty('--p', Math.max(0, Math.min(1, k)).toFixed(3));
        ticking = false;
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      window.addEventListener('resize', upd);
      upd();
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    function check(f) {
      var el = f.querySelector('input, select, textarea');
      if (!el) return true;
      var v = (el.value || '').trim(), ok = v.length > 0;
      if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (ok && el.type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
      f.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var fields = form.querySelectorAll('.field');
    fields.forEach(function (f) {
      var el = f.querySelector('input, select, textarea');
      var err = f.querySelector('.err');
      if (el && err) { err.id = el.id + '-err'; el.setAttribute('aria-describedby', err.id); }
      if (el) el.addEventListener('blur', function () { if (el.value) check(f); });
      if (el) el.addEventListener('input', function () { if (f.classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.querySelector('input, select, textarea').focus(); }
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
    var els = [].slice.call(d.querySelectorAll(".proj__img, .about__img"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* cards tilt toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".proj").forEach(function (c) {
      c.classList.add('px-tilt');
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add('is-tilting'); c.style.transform = 'perspective(900px) rotateX(' + (-y * 3).toFixed(2) + 'deg) rotateY(' + (x * 3).toFixed(2) + 'deg) translateY(-4px)'; });
      c.addEventListener('pointerleave', function () { c.classList.remove('is-tilting'); c.style.transform = ''; });
    });
  })();
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".btn--accent").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
})();
