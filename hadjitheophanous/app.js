/* Andreas Hadjitheophanous & Sons: hero entrance, parallax, header, menu, reveals,
   service accordion with image swap, drag strip, process line, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Hero entrance: starts on the first frame, done in about 1.3s */
  var hero = d.querySelector('.hero');
  if (hero) {
    hero.querySelectorAll('.line__in').forEach(function (el, i) { el.style.setProperty('--i', i); });
    if (reduce) { hero.classList.add('is-go'); }
    else { raf(function () { raf(function () { hero.classList.add('is-go'); }); }); }
  }

  /* Header shrink + hero parallax (photo moves slower than the page) */
  var header = d.querySelector('.header');
  var par = d.querySelector('.hero__par');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-small', y > 40);
    if (par && !reduce && y < window.innerHeight * 1.2) {
      par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
    }
    progress();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; raf(onScroll); }
  }, { passive: true });

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    if (open) { menu.hidden = false; raf(function () { menu.classList.add('is-open'); }); }
    else { menu.classList.remove('is-open'); setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 300); }
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') { if (id === '#') e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 8;
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, with a guard for what is already on screen */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement; var n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms'); groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: accordion with height animation + image swap */
  var svc = d.querySelector('[data-swap]');
  var fig = d.querySelector('.build__img');
  var swapT;
  function swapTo(li) {
    if (!fig || !li) return;
    var src = li.getAttribute('data-img');
    if (fig.getAttribute('src') === src) return;
    clearTimeout(swapT);
    if (reduce) { fig.src = src; fig.alt = li.getAttribute('data-alt'); return; }
    fig.classList.add('is-swapping');
    swapT = setTimeout(function () {
      fig.src = src; fig.alt = li.getAttribute('data-alt');
      fig.classList.remove('is-swapping');
    }, 300);
  }
  if (svc) {
    var lis = svc.querySelectorAll('.svc__item');
    lis.forEach(function (li) {
      var img = new Image(); img.src = li.getAttribute('data-img');
      var btn = li.querySelector('.svc__btn');
      btn.addEventListener('click', function () {
        var open = !li.classList.contains('is-active');
        lis.forEach(function (o) { o.classList.remove('is-active'); o.querySelector('.svc__btn').setAttribute('aria-expanded', 'false'); });
        if (open) { li.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true'); swapTo(li); }
      });
      li.addEventListener('mouseenter', function () { swapTo(li); });
    });
  }

  /* Work strip: drag, buttons, progress bar */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var bar = d.querySelector('.strip__bar span');
    var down = false, sx = 0, sl = 0, moved = false;
    function upd() {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (bar) bar.style.transform = 'translateX(' + (p * (1 / vis - 1) * 100).toFixed(1) + '%) scaleX(1)';
      if (bar) bar.style.width = (vis * 100).toFixed(1) + '%';
    }
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('scroll', function () { raf(upd); }, { passive: true });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    var prev = d.querySelector('[data-prev]'), next = d.querySelector('[data-next]');
    var step = function () { return Math.max(280, strip.clientWidth * 0.7); };
    if (prev) prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    window.addEventListener('resize', upd);
    upd();
  });

  /* Process: line draws with scroll, steps light up */
  var steps = d.querySelector('[data-progress]');
  var line = steps ? steps.querySelector('.steps__line span') : null;
  var stepEls = steps ? steps.querySelectorAll('.step') : [];
  function progress() {
    if (!steps || !line) return;
    if (reduce) { line.style.transform = 'none'; stepEls.forEach(function (s) { s.classList.add('is-lit'); }); return; }
    var r = steps.getBoundingClientRect();
    var mid = window.innerHeight * 0.6;
    var p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    line.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    stepEls.forEach(function (s) {
      var sr = s.getBoundingClientRect();
      s.classList.toggle('is-lit', sr.top + 22 < mid);
    });
  }
  onScroll();
  window.addEventListener('resize', progress);

  /* Form validation with inline messages */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose a project type.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the project, please.'; }
    };
    function check(el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value);
      var f = el.closest('.field');
      f.classList.toggle('is-bad', !!msg);
      f.querySelector('.field__err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n]; if (!el) return;
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n]; if (el && !check(el)) { ok = false; first = first || el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Polish pass (2 Nov 2026): first-impression upgrades. Transform, opacity and clip-path only.
   Reduced motion: none of this runs, everything stays as built. No JS: nothing here applies. */
(function (cfg) {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return s ? Array.prototype.slice.call((c || document).querySelectorAll(s)) : []; };
  var inView = function (el) { var r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
  function watch(els, fn, margin) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }
  if (RM) return;
  root.classList.add('pz');

  /* Scroll progress line under the header */
  if (cfg.progress) {
    var bar = document.createElement('div'); bar.className = 'pz-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var tick = false;
    var upd = function () { tick = false; var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ')'; };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Hero image: clip-path entrance on load */
  $$(cfg.heroClip).forEach(function (el) {
    el.classList.add('pz-hero-clip');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('pz-on'); }); });
  });

  /* Image clip-path reveals on scroll */
  var clips = $$(cfg.clip).filter(function (el) { return !inView(el); });
  clips.forEach(function (el, i) { el.classList.add('pz-clip'); el.style.setProperty('--pz-d', ((i % 4) * 90) + 'ms'); });
  watch(clips, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-clip', 'pz-on'); }, 2000); });

  /* Scale-in reveals (whole blocks) */
  var scales = $$(cfg.scale).filter(function (el) { return !inView(el); });
  scales.forEach(function (el) { el.classList.add('pz-scale'); });
  watch(scales, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-scale', 'pz-on'); }, 1600); });

  /* Line that draws across a row of steps when it comes into view */
  $$(cfg.draw).forEach(function (el) {
    var line = document.createElement('span'); line.className = 'pz-draw'; line.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-draw-host'); el.appendChild(line);
    watch([el], function () { el.classList.add('pz-on'); }, '0px 0px -20% 0px');
  });

  /* Count up numbers that are already on the page (final text is the original text) */
  $$(cfg.count).forEach(function (el) {
    var txt = el.textContent, m = txt.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length;
    if (end < 2 || (end > 1900 && end < 2100 && !dec)) return;  /* skip years and tiny numbers */
    var run = function () {
      var t0 = null, dur = 1300;
      var step = function (t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + (end * e).toFixed(dec) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      };
      requestAnimationFrame(step);
    };
    if (inView(el)) { run(); } else { el.textContent = m[1] + (0).toFixed(dec) + m[3]; watch([el], run); }
  });

  if (!FINE) return;

  /* Cards that tilt slightly toward the cursor */
  $$(cfg.tilt).forEach(function (el) {
    el.classList.add('pz-tilt');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Buttons that pull a little toward the cursor */
  $$(cfg.magnet).forEach(function (el) {
    el.classList.add('pz-magnet');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Soft light that follows the cursor across the work grid */
  $$(cfg.spot).forEach(function (el) {
    var s = document.createElement('span'); s.className = 'pz-spot'; s.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-spot-host'); el.appendChild(s);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left - 220) + 'px,' + (e.clientY - r.top - 220) + 'px)';
    });
    el.addEventListener('pointerenter', function () { s.style.opacity = '1'; });
    el.addEventListener('pointerleave', function () { s.style.opacity = '0'; });
  });
})({"progress": true, "clip": ".work .tile figure, .build__fig", "spot": ".strip__track", "magnet": ".hero .btn"});
