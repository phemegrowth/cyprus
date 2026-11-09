/* Limassol Gardeners. Vanilla JS, no libraries. Everything reads without it. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* hero entrance: starts on the first frame, done well under 1.6s */
  var hero = $('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* sticky header shrinks */
  var header = $('.header');
  var onScroll = function () { if (header) header.classList.toggle('is-small', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && menu) { var first = $('a', menu); if (first) first.focus({ preventScroll: true }); }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); if (burger) burger.focus(); }
  });

  /* no-op language switch */
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
  $$('.lang a[aria-current="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* scroll reveals: show at once what is already on screen */
  var rv = $$('.rv, .checks li');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('in'); else io.observe(el);
    });
  }

  /* count-up (quantities only) */
  $$('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(end * e));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* progress line on the quote steps, and parallax on band photos */
  var steps = $('[data-steps]'), line = steps && $('.steps__line i', steps);
  var par = reduce ? [] : $$('[data-parallax]');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (line) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      line.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, p)).toFixed(3));
    }
    par.forEach(function (img) {
      var b = img.parentNode.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) return;
      var k = (b.top + b.height / 2 - vh / 2) / vh;
      img.style.transform = 'translate3d(0,' + (-7 + k * 12).toFixed(2) + '%,0)';
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (line || par.length) { frame(); window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req); }

  /* services list: swap the photo on hover or focus */
  var frameBox = $('.svc__frame');
  if (frameBox) {
    var imgs = $$('img', frameBox), items = $$('.svc__item');
    var show = function (id) {
      imgs.forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-svc') === id); });
      items.forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-svc') === id); });
    };
    items.forEach(function (it) {
      var id = it.getAttribute('data-svc');
      it.addEventListener('mouseenter', function () { show(id); });
      it.addEventListener('focusin', function () { show(id); });
    });
  }

  /* drag strip: mouse drag plus buttons; touch scrolls natively */
  $$('.reel').forEach(function (reel) {
    var down = false, sx = 0, sl = 0, moved = false;
    reel.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = reel.scrollLeft; reel.classList.add('is-drag'); e.preventDefault(); });
    window.addEventListener('mouseup', function () { if (down) { down = false; reel.classList.remove('is-drag'); } });
    reel.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; reel.scrollLeft = sl - dx; });
    reel.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    var section = reel.closest('section');
    $$('[data-reel]', section).forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.season', reel), step = card ? card.getBoundingClientRect().width + 24 : 320;
        reel.scrollBy({ left: step * parseInt(b.getAttribute('data-reel'), 10), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    reel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { reel.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { reel.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* services filter */
  var cardsBox = $('[data-cards]');
  if (cardsBox) {
    var cards = $$('.card', cardsBox), chips = $$('[data-filter]'), empty = $('[data-empty]'), out = $('[data-count-out]');
    var apply = function (f) {
      var n = 0;
      cards.forEach(function (c) { var on = f === 'all' || c.getAttribute('data-cat') === f; c.classList.toggle('is-hidden', !on); if (on) { n++; c.classList.add('in'); } });
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.getAttribute('data-filter') === f)); });
      if (empty) empty.classList.toggle('is-on', n === 0);
      if (out) out.textContent = f === 'all' ? 'Showing all ' + n + ' services.' : 'Showing ' + n + ' of ' + cards.length + ' services.';
    };
    chips.forEach(function (ch) { ch.addEventListener('click', function () { apply(ch.getAttribute('data-filter')); }); });
  }

  /* lightbox */
  var lb = $('[data-lightbox]');
  if (lb) {
    var shots = $$('[data-lb]'), big = $('img', lb), cap = $('[data-lb-cap]', lb), cur = 0, last = null;
    var open = function (i) {
      cur = (i + shots.length) % shots.length;
      var src = $('img', shots[cur]);
      big.src = src.getAttribute('src'); big.alt = src.alt; cap.textContent = src.alt + '  (' + (cur + 1) + ' / ' + shots.length + ')';
      if (!lb.classList.contains('is-open')) { last = document.activeElement; lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; $('[data-lb-close]', lb).focus(); }
    };
    var close = function () { lb.classList.remove('is-open'); document.body.style.overflow = ''; if (last) last.focus(); };
    shots.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { open(cur - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { open(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') open(cur + 1);
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'Tab') { var f = $$('button', lb), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); } }
    });
  }

  /* form validation with inline messages */
  $$('form.form').forEach(function (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8; },
      email: function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      service: function (v) { return v !== ''; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var ok = fn(el.value), field = el.closest('.field');
      if (field) field.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    $$('input, select', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.field'); if (f && f.classList.contains('is-bad')) check(el); });
      el.addEventListener('change', function () { check(el); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      $$('input, select', form).forEach(function (el) { if (!check(el) && !bad) bad = el; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  });
})();
