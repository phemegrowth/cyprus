/* Buy Rent Realty: header, menu, hero switch, reveals, strip, filters, lightbox, forms. No dependencies. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header shrink */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-shrunk', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (toggle && menu) {
    menu.hidden = true;
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  }

  /* Current page in nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    var target = a.getAttribute('href').split('?')[0].split('#')[0];
    if (target === './' + here && !a.getAttribute('href').includes('?')) a.setAttribute('aria-current', 'page');
  });

  /* Scroll reveals */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : i;
      el.style.setProperty('--d', Math.min(group, 5) * 80 + 'ms');
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero Buy / Rent switch */
  var AREAS = {
    buy: [
      { slug: 'agios-athanasios', name: 'Agios Athanasios' },
      { slug: 'germasogeia', name: 'Germasogeia' },
      { slug: 'agios-tychonas', name: 'Agios Tychonas' }
    ],
    rent: [
      { slug: 'city-centre', name: 'City centre' },
      { slug: 'mesa-geitonia', name: 'Mesa Geitonia' },
      { slug: 'petrou-kai-pavlou', name: 'Petrou kai Pavlou' }
    ]
  };
  var heroSwitch = document.getElementById('hero-switch');
  if (heroSwitch) {
    var chips = document.getElementById('hero-chips');
    var cta = document.getElementById('hero-cta');
    var note = document.getElementById('hero-note');
    function setMode(mode) {
      heroSwitch.querySelectorAll('button').forEach(function (b) {
        var on = b.dataset.mode === mode;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (chips) {
        chips.innerHTML = '';
        AREAS[mode].forEach(function (a) {
          var li = document.createElement('li');
          var link = document.createElement('a');
          link.href = './listings.html?mode=' + mode + '&area=' + a.slug;
          link.textContent = a.name;
          li.appendChild(link); chips.appendChild(li);
        });
      }
      if (cta) {
        cta.href = './listings.html?mode=' + mode;
        cta.textContent = mode === 'buy' ? 'See homes for sale' : 'See homes to rent';
      }
      if (note) note.textContent = mode === 'buy' ? 'Popular areas to buy' : 'Popular areas to rent';
      try { localStorage.setItem('brr-mode', mode); } catch (e) {}
    }
    heroSwitch.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]'); if (b) setMode(b.dataset.mode);
    });
    heroSwitch.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var btns = Array.prototype.slice.call(heroSwitch.querySelectorAll('button'));
        var i = btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
        var next = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
        setMode(next.dataset.mode); next.focus(); e.preventDefault();
      }
    });
    var saved = null;
    try { saved = localStorage.getItem('brr-mode'); } catch (e) {}
    setMode(saved === 'rent' ? 'rent' : 'buy');
  }

  /* Sliding thumb behind the selected Buy / Rent / All button */
  document.querySelectorAll('.switch').forEach(function (sw) {
    if (reduce) return;
    var thumb = document.createElement('span'); thumb.className = 'thumb'; thumb.setAttribute('aria-hidden', 'true');
    sw.insertBefore(thumb, sw.firstChild);
    sw.classList.add('has-thumb');
    function place() {
      var on = sw.querySelector('button[aria-selected="true"]'); if (!on) return;
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + on.offsetLeft + 'px)';
    }
    place();
    if ('MutationObserver' in window) new MutationObserver(place).observe(sw, { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  });

  /* Mouse drag on the listings strip (touch already scrolls natively) */
  document.querySelectorAll('.strip').forEach(function (strip) {
    strip.classList.add('is-draggable');
    var down = false, moved = false, x0 = 0, s0 = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-dragging'); }
      if (moved) strip.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      setTimeout(function () { strip.classList.remove('is-dragging'); }, 0);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* Horizontal strip arrows */
  document.querySelectorAll('.strip-nav').forEach(function (nav) {
    var strip = document.getElementById(nav.dataset.for);
    if (!strip) return;
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var card = strip.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 16 : 320;
      strip.scrollBy({ left: b.dataset.dir === 'prev' ? -step : step, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Listings filter (listings.html) */
  var grid = document.getElementById('listing-grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var modeSwitch = document.getElementById('mode-switch');
    var typeSel = document.getElementById('f-type');
    var areaSel = document.getElementById('f-area');
    var count = document.getElementById('f-count');
    var empty = document.getElementById('empty');
    var reset = document.getElementById('f-reset');
    var state = { mode: 'buy', type: '', area: '' };

    function readURL() {
      var p = new URLSearchParams(location.search);
      var m = p.get('mode'); state.mode = m === 'rent' ? 'rent' : (m === 'all' ? 'all' : 'buy');
      state.type = p.get('type') || '';
      state.area = p.get('area') || '';
    }
    function writeURL() {
      var p = new URLSearchParams();
      p.set('mode', state.mode);
      if (state.type) p.set('type', state.type);
      if (state.area) p.set('area', state.area);
      history.replaceState(null, '', location.pathname + '?' + p.toString());
    }
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (state.mode === 'all' || c.dataset.mode === state.mode) &&
                 (!state.type || c.dataset.type === state.type) &&
                 (!state.area || c.dataset.area === state.area);
        c.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' example listing' : ' example listings') + (state.mode === 'all' ? '' : state.mode === 'buy' ? ' for sale' : ' to rent');
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (modeSwitch) modeSwitch.querySelectorAll('button').forEach(function (b) {
        var on = b.dataset.mode === state.mode;
        b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      });
      if (typeSel) typeSel.value = state.type;
      if (areaSel) areaSel.value = state.area;
      var h = document.getElementById('list-title');
      if (h) h.textContent = state.mode === 'rent' ? 'Homes to rent in Limassol.' : state.mode === 'all' ? 'All properties in Limassol.' : 'Property for sale in Limassol.';
      writeURL();
    }
    if (modeSwitch) modeSwitch.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]'); if (b) { state.mode = b.dataset.mode; apply(); }
    });
    if (typeSel) typeSel.addEventListener('change', function () { state.type = typeSel.value; apply(); });
    if (areaSel) areaSel.addEventListener('change', function () { state.area = areaSel.value; apply(); });
    if (reset) reset.addEventListener('click', function () { state.type = ''; state.area = ''; apply(); });
    readURL(); apply();
    window.addEventListener('popstate', function () { readURL(); apply(); });
  }

  /* Lightbox (listing.html) */
  var gallery = document.getElementById('gallery');
  var lb = document.getElementById('lightbox');
  if (gallery && lb) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('button'));
    var srcs = items.map(function (b) { return { src: b.dataset.full || b.querySelector('img').src, alt: b.querySelector('img').alt }; });
    var img = lb.querySelector('img');
    var counter = lb.querySelector('.lb-count');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + srcs.length) % srcs.length;
      img.src = srcs[idx].src; img.alt = srcs[idx].alt;
      if (counter) counter.textContent = (idx + 1) + ' / ' + srcs.length;
    }
    function open(i) { lastFocus = document.activeElement; show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Forms: inline validation */
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    var fields = form.querySelectorAll('[required]');
    function check(el) {
      var wrap = el.closest('.field'); var msg = wrap ? wrap.querySelector('.msg') : null; var err = '';
      var v = el.value.trim();
      if (!v) err = 'Please fill in this field.';
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Please enter a valid email address.';
      else if (el.type === 'tel' && v.replace(/[^\d]/g, '').length < 8) err = 'Please enter a phone number with at least 8 digits.';
      if (wrap) wrap.classList.toggle('is-invalid', !!err);
      if (msg) msg.textContent = err;
      el.setAttribute('aria-invalid', err ? 'true' : 'false');
      return !err;
    }
    fields.forEach(function (el) { el.addEventListener('blur', function () { check(el); }); el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-invalid')) check(el); }); });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      fields.forEach(function (el) { if (!check(el) && !firstBad) { firstBad = el; ok = false; } });
      if (!ok) { e.preventDefault(); firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var hash = a.getAttribute('href').split('#')[1]; if (!hash) return;
      var target = document.getElementById(hash); if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.pushState(null, '', '#' + hash);
    });
  });
})();
