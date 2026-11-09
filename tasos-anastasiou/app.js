/* Tasos Anastasiou: header, menu, curtain hero, reveals, accordion swap, drag strip, step line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Hero entrance starts on the first frame, never waits for fonts or images */
  requestAnimationFrame(function () { d.documentElement.classList.add('go'); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (a.getAttribute('aria-disabled') !== 'true') setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Language switch is a visible no-op until the Greek version exists */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - h - 8, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Scroll reveals with the above-the-fold guard; siblings stagger 80ms */
  function watch(sel, cls, opts) {
    var els = d.querySelectorAll(sel);
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (el) { el.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add(cls); io.unobserve(en.target); } });
    }, opts || { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add(cls); else io.observe(el);
    });
  }
  d.querySelectorAll('.r').forEach(function (el) {
    var p = el.parentElement;
    if (!p.__k) p.__k = 0;
    el.style.setProperty('--rd', Math.min(p.__k * 0.08, 0.4) + 's');
    p.__k += 1;
  });
  watch('.r', 'is-in');
  watch('[data-steps]', 'is-in', { threshold: 0.2 });
  watch('.clip', 'is-in', { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  /* Count-up for sourced quantities only */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = (end * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = d.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) counters.forEach(countUp);
    else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { co.observe(c); });
    }
  }

  /* Magnetic buttons */
  if (finePointer && !reduce) {
    d.querySelectorAll('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Horizontal drag strip */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, sx = 0, sl = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = sl - dx; });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Accordion with height animation */
  d.querySelectorAll('[data-acc] .acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var open = !item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.acc__item').forEach(function (it) {
        it.classList.remove('is-open'); it.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
      });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* Hover image swap */
  d.querySelectorAll('[data-swap]').forEach(function (wrap) {
    var imgs = wrap.querySelectorAll('[data-key]');
    var items = wrap.querySelectorAll('[data-img]');
    function show(k) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === k); });
      items.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-img') === k); });
    }
    items.forEach(function (it) {
      var k = it.getAttribute('data-img');
      it.addEventListener('mouseenter', function () { show(k); });
      it.addEventListener('focusin', function () { show(k); });
      it.addEventListener('click', function () { show(k); });
    });
    if (items.length) show(items[0].getAttribute('data-img'));
  });

  /* Cursor-following highlight on a grid */
  d.querySelectorAll('[data-spot]').forEach(function (g) {
    if (!finePointer || reduce) return;
    g.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.tile'); if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      t.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* Slow parallax for elements with data-par (transform only) */
  var pars = d.querySelectorAll('[data-par]');
  if (pars.length && !reduce) {
    var ticking = false;
    function par() {
      pars.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        el.style.transform = 'translate3d(0,' + (r.top * -parseFloat(el.getAttribute('data-par'))).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
    par();
  }

  /* Scroll progress (a thin bar under the header) */
  var prog = d.querySelector('.progress');
  if (prog) {
    var pt = false;
    window.addEventListener('scroll', function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        var h = d.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
        pt = false;
      });
    }, { passive: true });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please add your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please add a valid email.'; },
      type: function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A few words on what you need, please.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      if (field) {
        field.classList.toggle('is-bad', !!msg);
        var m = field.querySelector('.field__msg');
        if (m) m.textContent = msg;
      }
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (i) {
      i.addEventListener('blur', function () { check(i); });
      i.addEventListener('input', function () { var f = i.closest('.field'); if (f && f.classList.contains('is-bad')) check(i); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      form.querySelectorAll('input, select, textarea').forEach(function (i) { if (!check(i)) { ok = false; if (!first) first = i; } });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
