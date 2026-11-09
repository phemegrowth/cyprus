(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  var hero = document.querySelector('.hero');
  if (hero) {
    if (reduce) hero.classList.add('is-in');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
  }

  /* Footer year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* Header shrink */
  var hdr = document.getElementById('hdr');
  function onScrollHdr() { if (hdr) hdr.classList.toggle('is-small', window.scrollY > 40); }
  onScrollHdr();

  /* Mobile menu */
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  function closeMenu() {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    mnav.hidden = true;
    if (window.scrollY <= 40 && hdr) hdr.classList.remove('is-small');
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); return; }
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      mnav.hidden = false;
      if (hdr) hdr.classList.add('is-small');
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { closeMenu(); burger.focus(); }
    });
  }

  /* Smooth anchors with header offset */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    var id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); return; }
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var off = hdr ? hdr.offsetHeight : 0;
    var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off + 1;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* Scroll reveals, with the above-the-fold guard */
  var rvs = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var groups = new Map();
  rvs.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--rd', Math.min(i, 5) * 80 + 'ms');
    groups.set(p, i + 1);
  });
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('is-vis'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-vis'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-vis');
      else io.observe(el);
    });
  }

  /* Services: hover or tap swaps the photo */
  var items = Array.prototype.slice.call(document.querySelectorAll('.svc__item'));
  var pics = Array.prototype.slice.call(document.querySelectorAll('.svc__pic img'));
  function setSvc(n) {
    items.forEach(function (it, i) { it.classList.toggle('is-on', i === n); });
    pics.forEach(function (im, i) { im.classList.toggle('is-on', i === n); });
  }
  items.forEach(function (it, i) {
    it.addEventListener('mouseenter', function () { setSvc(i); });
    var b = it.querySelector('.svc__btn');
    if (b) {
      b.addEventListener('click', function () { setSvc(i); });
      b.addEventListener('focus', function () { setSvc(i); });
    }
  });

  /* Work strip: drag to scroll, progress bar */
  var strip = document.getElementById('strip');
  var prog = document.getElementById('stripProg');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    var updProg = function () {
      if (!prog) return;
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      prog.style.transform = 'scaleX(' + Math.min(1, vis + (1 - vis) * p).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', updProg, { passive: true });
    window.addEventListener('resize', updProg);
    updProg();
  }

  /* Process: line draws with scroll */
  var proc = document.getElementById('proc');
  var fill = document.getElementById('procFill');
  function updProc() {
    if (!proc || !fill) return;
    if (reduce) { fill.style.setProperty('--p', 1); return; }
    var r = proc.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    fill.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHdr(); updProc(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', updProc);
  updProc();

  /* Form validation */
  var form = document.getElementById('form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number Christos can call.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'This email does not look right.'; },
      'project-type': function (v) { return v ? '' : 'Please choose the type of job.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A few words about the job, please.'; }
    };
    var check = function (el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var box = el.closest('.f');
      if (box) {
        box.classList.toggle('is-bad', !!msg);
        var err = box.querySelector('.f__err');
        if (err) err.textContent = msg;
      }
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!rules[el.name]) return;
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.f').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (rules[el.name] && !check(el) && !first) first = el;
      });
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
