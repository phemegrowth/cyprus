(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header shrink */
  var header = document.querySelector('[data-header]');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* language placeholder */
  document.querySelectorAll('.lang a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
  document.querySelectorAll('a[href="#"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var items = document.querySelectorAll('.r, .route');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  }

  /* hero collage: after the fan settles, cards drift slightly with the pointer */
  var fan = document.querySelector('.fan');
  if (fan && !reduce && window.matchMedia('(hover: hover)').matches) {
    setTimeout(function () {
      fan.classList.add('is-live');
      var cards = fan.querySelectorAll('.fan__card');
      fan.closest('.hero').addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        cards.forEach(function (c, i) {
          var d = (i % 2 ? -1 : 1) * (6 + i * 3);
          c.style.transform = 'translate(' + (x * d) + 'px,' + (y * d) + 'px)';
        });
      });
    }, 1600);
  }

  /* hover / tap image swap */
  var swap = document.querySelector('[data-swap]');
  if (swap) {
    var imgs = swap.querySelectorAll('.swap__media img');
    var btns = swap.querySelectorAll('.swap__item');
    function show(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.dataset.key === key); });
      btns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.key === key); });
    }
    btns.forEach(function (b) {
      b.addEventListener('mouseenter', function () { show(b.dataset.key); });
      b.addEventListener('focus', function () { show(b.dataset.key); });
      b.addEventListener('click', function () { show(b.dataset.key); });
    });
  }

  /* drag strip */
  var strip = document.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* process line draws with scroll */
  var steps = document.querySelector('[data-steps]');
  if (steps && !reduce) {
    var line = steps.querySelector('.steps__line span');
    var tick = false;
    function draw() {
      var r = steps.getBoundingClientRect();
      var p = (window.innerHeight * 0.7 - r.top) / r.height;
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      tick = false;
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(draw); } }, { passive: true });
    draw();
  } else if (steps) {
    steps.querySelector('.steps__line span').style.setProperty('--p', 1);
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    function check(f) {
      var el = f.querySelector('input, textarea'); if (!el) return true;
      var msg = '';
      if (el.hasAttribute('required') && !el.value.trim()) msg = 'Please fill this in.';
      else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = 'Please check the email address.';
      else if (el.type === 'tel' && el.value && el.value.replace(/\D/g, '').length < 8) msg = 'Please check the phone number.';
      f.classList.toggle('has-err', !!msg);
      var s = f.querySelector('.err'); if (s) s.textContent = msg;
      return !msg;
    }
    var fields = form.querySelectorAll('.field');
    fields.forEach(function (f) {
      var el = f.querySelector('input, textarea');
      if (el) el.addEventListener('blur', function () { check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f.querySelector('input, textarea'); } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* year */
  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
