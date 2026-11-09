/* MERUJ: header, menu, cinematic hero, reveals, count-up, accordion, drag strip, step line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  /* Hero entrance starts on the first frame, never waits for fonts or images */
  requestAnimationFrame(function () { d.documentElement.classList.add('is-ready'); });

  /* Header shrink and scroll progress */
  var header = d.querySelector('.header');
  var bar = d.querySelector('[data-progress]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (bar) {
      var h = d.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
    d.querySelectorAll('[data-parallax]').forEach(function (el) {
      if (reduce) return;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.transform = 'translate3d(0,' + (-r.top * k).toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
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
      var top = target.getBoundingClientRect().top + window.scrollY - h - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* One-shot observer helper with the above-the-fold guard */
  function whenSeen(els, fn, margin) {
    els = Array.prototype.slice.call(els);
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); } });
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) fn(el);
      else io.observe(el);
    });
  }

  /* Scroll reveals, siblings staggered 80ms */
  var items = d.querySelectorAll('.r');
  items.forEach(function (el) {
    var p = el.parentElement;
    if (!p.__k) p.__k = 0;
    el.style.setProperty('--rd', Math.min(p.__k * 0.08, 0.4) + 's');
    p.__k += 1;
  });
  whenSeen(items, function (el) { el.classList.add('is-in'); });

  /* Anything with data-draw gets is-in when seen (progress lines, frames, wipes) */
  whenSeen(d.querySelectorAll('[data-draw]'), function (el) { el.classList.add('is-in'); }, '0px 0px -15% 0px');

  /* Count-up for sourced quantities only */
  whenSeen(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    var t0 = null, dur = parseInt(el.getAttribute('data-dur') || '1400', 10);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* Hover or focus swaps the photo in a list */
  d.querySelectorAll('[data-swap]').forEach(function (wrap) {
    var imgs = wrap.querySelectorAll('[data-key]');
    var lis = wrap.querySelectorAll('[data-img]');
    function show(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
      lis.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-img') === key); });
    }
    lis.forEach(function (li) {
      var key = li.getAttribute('data-img');
      li.addEventListener('mouseenter', function () { show(key); });
      li.addEventListener('focusin', function () { show(key); });
      li.addEventListener('click', function () { show(key); });
    });
    if (lis.length) show(lis[0].getAttribute('data-img'));
  });

  /* Tabs */
  d.querySelectorAll('[data-tabs]').forEach(function (wrap) {
    var tabs = wrap.querySelectorAll('[role="tab"]');
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = d.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; if (on) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); } }
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); select(n); }
      });
    });
  });

  /* Accordion with height animation */
  d.querySelectorAll('[data-acc] .acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });

  /* Horizontal drag strip (mouse drag, touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
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
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Cursor-following highlight on tiles */
  if (!reduce && canHover) {
    d.querySelectorAll('[data-spot]').forEach(function (spot) {
      spot.addEventListener('pointermove', function (e) {
        var tile = e.target.closest('.tile');
        if (!tile) return;
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        tile.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
    /* Magnetic buttons */
    d.querySelectorAll('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.25;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
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
      form.querySelectorAll('input, select, textarea').forEach(function (i) {
        if (!check(i)) { ok = false; if (!first) first = i; }
      });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
