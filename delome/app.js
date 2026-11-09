/* Delome homepage: header, menu, marquee, accordion + image swap, drag strip, progress line, reveals, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (refocus) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : off - 1);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Hero entrance: start on the first frame (timeout as a fallback if frames are throttled) */
  var hero = d.querySelector('.hero');
  var go = function () { if (hero) hero.classList.add('is-go'); };
  requestAnimationFrame(go); setTimeout(go, 80);
  /* Safety net: if frames are throttled (background tab, slow device), snap to the final state */
  setTimeout(function () { if (hero) hero.classList.add('is-done'); var done = d.querySelectorAll('.r.is-in');
    done.forEach(function (el) { el.classList.add('is-done'); });
    setTimeout(function () { done.forEach(function (el) { el.classList.remove('r', 'is-done'); }); }, 600);
  }, 1700);

  /* Marquee: duplicate the list so the loop is seamless */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    if (reduce) return;
    var track = m.querySelector('.marquee__track');
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    });
    m.classList.add('is-on');
  });

  /* Services: accordion with height animation + image swap on hover/focus */
  var swap = d.querySelector('.swap');
  var imgs = swap ? swap.querySelectorAll('.swap__img') : [];
  var items = d.querySelectorAll('.svc__item');
  function showImg(i) { imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); }); }
  function openItem(item) {
    items.forEach(function (it) {
      var on = it === item;
      it.classList.toggle('is-active', on);
      it.querySelector('.svc__btn').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    showImg(+item.getAttribute('data-img'));
  }
  items.forEach(function (it) {
    var btn = it.querySelector('.svc__btn');
    btn.addEventListener('click', function () { openItem(it); });
    it.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) openItem(it); });
  });

  /* Horizontal drag strip */
  d.querySelectorAll('[data-drag]').forEach(function (el) {
    var down = false, sx = 0, sl = 0, moved = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = el.scrollLeft; el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      if (moved > 4) el.classList.add('is-dragging');
      el.scrollLeft = sl - dx;
    });
    var up = function () { down = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { el.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* Progress line that draws on scroll */
  var prog = d.querySelector('[data-progress]');
  if (prog) {
    if (reduce) { prog.style.setProperty('--p', 1); }
    else {
      var ticking = false;
      var upd = function () {
        ticking = false;
        var r = prog.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        prog.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      window.addEventListener('resize', upd);
      upd();
    }
  }

  /* Scroll reveals: anything already on screen shows at once */
  var rs = d.querySelectorAll('.r');
  var groups = new Map();
  rs.forEach(function (el) {
    var p = el.parentElement; var n = groups.get(p) || 0;
    el.style.setProperty('--rd', Math.min(n, 5) * 80 + 'ms'); groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    rs.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Form validation */
  var form = d.querySelector('.form');
  if (form) {
    var msgs = {
      'looking-for': 'Choose what you want to do.',
      name: 'Please write your name.',
      phone: 'Please add a phone number we can call.',
      email: 'Please add a valid email address.',
      message: 'A line or two helps us reply properly.'
    };
    var check = function (f) {
      var wrap = f.closest('.field'); if (!wrap) return true;
      var v = f.value.trim(), ok = v.length > 0;
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/[^\d]/g, '').length >= 8;
      wrap.classList.toggle('is-bad', !ok);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      wrap.querySelector('.err').textContent = ok ? '' : (msgs[f.name] || 'Please fill this in.');
      return ok;
    };
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* Polish pass, 2 Nov 2026: extra motion. Only transform, opacity and clip-path.
   Everything is visible without JS, and reduced motion switches it all off. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in w;
  function onView(els, fn, th) {
    if (!els.length) return;
    if (reduce || !io) { els.forEach(fn); return; }
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } });
    }, { threshold: th || 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { o.observe(el); });
  }
  var $$ = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };

  /* Scroll progress line */
  var bar = d.querySelector('[data-scrollbar]');
  if (bar && !reduce) {
    var tick = false;
    var upd = function () {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, w.scrollY / h) : 0) + ')';
      tick = false;
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Clip-path image reveals and line draws */
  /* (observe the parent: a fully clipped element can read as not visible) */
  $$('[data-clip], [data-draw]').forEach(function (el) {
    var host = el.parentElement || el;
    onView([host], function () { el.classList.add('is-shown'); }, 0.1);
  });

  /* Count up (only numbers already printed on the page) */
  onView($$('[data-countup]'), function (el) {
    var to = parseFloat(el.getAttribute('data-countup'));
    var from = parseFloat(el.getAttribute('data-countup-from') || '0');
    if (reduce || isNaN(to)) { el.textContent = el.getAttribute('data-countup-text') || to; return; }
    var t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute('data-countup-text') || to;
    };
    requestAnimationFrame(step);
  }, 0.5);

  if (reduce || !fine) return;

  /* Buttons that pull toward the cursor */
  $$('[data-magnet]').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* Cards that tilt on hover */
  $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* Highlight that follows the cursor over a grid */
  $$('[data-spot]').forEach(function (g) {
    var s = d.createElement('span'); s.className = 'cursor-spot'; s.setAttribute('aria-hidden', 'true'); g.appendChild(s);
    g.addEventListener('mousemove', function (e) {
      var r = g.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px) translate(-50%,-50%)';
      s.style.opacity = '1';
    });
    g.addEventListener('mouseleave', function () { s.style.opacity = '0'; });
  });
})();
