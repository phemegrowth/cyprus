/* Alumetal drawing engine: builds an elevation drawing (SVG) of an aluminium piece from its sizes.
   Used by the frame builder and by every drawing on the site. No dependencies.
   AluDraw({type, w, h, n, rows, finish, glass, fig, dims}) returns an SVG string. Sizes in mm. */
(function () {
  'use strict';

  var FIN = {
    anthracite: { hex: '#3A4045', line: '#15191C' },
    black:      { hex: '#16181A', line: '#6C757C' },
    white:      { hex: '#F2F2EE', line: '#15191C' },
    silver:     { hex: '#B9BEC3', line: '#15191C' },
    bronze:     { hex: '#6A5645', line: '#15191C' }
  };
  var GLASS = {
    clear:   'rgba(126,176,196,0.26)',
    grey:    'rgba(44,54,62,0.46)',
    frosted: 'rgba(236,241,243,0.92)',
    bars:    'none',
    none:    'none'
  };

  /* Limits per type, shared with the builder */
  var TYPES = {
    hinged:  { w: [400, 3600, 1200], h: [400, 2600, 1400], n: [1, 4, 2] },
    sliding: { w: [1200, 6000, 2400], h: [1000, 2800, 2200], n: [2, 4, 2] },
    folding: { w: [1600, 6000, 3200], h: [1800, 2800, 2200], n: [2, 6, 4] },
    fixed:   { w: [300, 4000, 1600], h: [300, 3000, 1800], n: [1, 4, 1] },
    facade:  { w: [2000, 12000, 6000], h: [2400, 9000, 4200], n: [2, 10, 5], rows: [1, 6, 3] },
    railing: { w: [800, 12000, 4000], h: [900, 1200, 1100], n: [1, 10, 4] },
    pergola: { w: [2000, 9000, 4500], h: [2200, 3200, 2600], n: [1, 4, 2] }
  };

  function r1(v) { return Math.round(v * 10) / 10; }

  function draw(o) {
    var t = TYPES[o.type] ? o.type : 'hinged';
    var W = o.w, H = o.h, n = Math.max(1, o.n || 1), rows = Math.max(1, o.rows || 1);
    var fin = FIN[o.finish] || FIN.anthracite;
    var glass = GLASS[o.glass] != null ? GLASS[o.glass] : GLASS.clear;
    var showFig = o.fig !== false, showDims = o.dims !== false;

    var VW = 640, VH = 460;
    var padL = showDims ? 44 : 16, padR = showDims ? 70 : 16, padT = 24, padB = showDims ? 64 : 20;
    var figMM = showFig ? 900 : 0;
    var totalW = W + figMM, totalH = Math.max(H, showFig ? 1900 : H);
    var s = Math.min((VW - padL - padR) / totalW, (VH - padT - padB) / totalH);
    var gy = VH - padB;
    var x0 = padL + ((VW - padL - padR) - totalW * s) / 2 + figMM * s;
    var w = W * s, h = H * s, y0 = gy - h;
    var out = [], idx = 0;

    function el(str) { out.push(str.replace('<', '<').replace(/^<(\w+)/, '<$1 style="--i:' + (idx++) + '"')); }
    function ring(x, y, ww, hh, th, cls) {
      th = Math.min(th, ww / 2.2, hh / 2.2);
      el('<path class="dw-el dw-frame ' + (cls || '') + '" fill-rule="evenodd" fill="' + fin.hex + '" stroke="' + fin.line + '" stroke-width="0.8" d="M' + r1(x) + ' ' + r1(y) + 'h' + r1(ww) + 'v' + r1(hh) + 'h' + r1(-ww) + 'z M' + r1(x + th) + ' ' + r1(y + th) + 'v' + r1(hh - 2 * th) + 'h' + r1(ww - 2 * th) + 'v' + r1(-(hh - 2 * th)) + 'z"/>');
    }
    function bar(x, y, ww, hh) {
      el('<rect class="dw-el dw-frame" x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(ww) + '" height="' + r1(hh) + '" fill="' + fin.hex + '" stroke="' + fin.line + '" stroke-width="0.8"/>');
    }
    function pane(x, y, ww, hh) {
      if (glass === 'none' || ww <= 0 || hh <= 0) return;
      var g = '<g class="dw-el dw-glass"><rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(ww) + '" height="' + r1(hh) + '" fill="' + glass + '"/>';
      if (o.glass !== 'frosted') {
        var k = Math.min(ww, hh) * 0.36;
        g += '<path d="M' + r1(x + ww * 0.14) + ' ' + r1(y + hh * 0.14 + k) + 'l' + r1(k) + ' ' + r1(-k) + ' M' + r1(x + ww * 0.14 + k * 0.5) + ' ' + r1(y + hh * 0.14 + k) + 'l' + r1(k * 0.6) + ' ' + r1(-k * 0.6) + '" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" fill="none"/>';
      }
      el(g + '</g>');
    }
    function sym(d) { el('<path class="dw-el dw-sym" d="' + d + '" fill="none" stroke-width="1" stroke-dasharray="5 4"/>'); }
    function tri(x, y, ww, hh, hingeLeft) {
      /* opening triangle: the point sits on the hinge side */
      var hx = hingeLeft ? x : x + ww, ox = hingeLeft ? x + ww : x;
      sym('M' + r1(ox) + ' ' + r1(y) + 'L' + r1(hx) + ' ' + r1(y + hh / 2) + 'L' + r1(ox) + ' ' + r1(y + hh));
      var px = hingeLeft ? x + ww - 5 : x + 2;
      el('<rect class="dw-el dw-handle" x="' + r1(px) + '" y="' + r1(y + hh / 2 - 9) + '" width="3" height="18"/>');
    }
    function arrow(cx, cy, len, dir) {
      var a = cx - (len / 2) * dir, b = cx + (len / 2) * dir;
      el('<path class="dw-el dw-arrow" fill="none" stroke-width="1.4" d="M' + r1(a) + ' ' + r1(cy) + 'H' + r1(b) + ' M' + r1(b - 7 * dir) + ' ' + r1(cy - 5) + 'L' + r1(b) + ' ' + r1(cy) + 'L' + r1(b - 7 * dir) + ' ' + r1(cy + 5) + '"/>');
    }

    var f = Math.max(3.5, 70 * s), sh = Math.max(3, 58 * s);

    /* ground line and scale figure */
    out.push('<path class="dw-ground" d="M' + r1(8) + ' ' + r1(gy) + 'H' + r1(VW - 8) + '" fill="none" stroke-width="1"/>');
    if (showFig) {
      var fh = 1750 * s, fx = x0 - 480 * s, hr = 0.065 * fh;
      out.push('<g class="dw-fig"><circle cx="' + r1(fx) + '" cy="' + r1(gy - fh + hr) + '" r="' + r1(hr) + '"/><path d="M' + r1(fx - 0.11 * fh) + ' ' + r1(gy - fh + 2.5 * hr) + 'q' + r1(0.11 * fh) + ' ' + r1(-0.04 * fh) + ' ' + r1(0.22 * fh) + ' 0l' + r1(-0.035 * fh) + ' ' + r1(0.4 * fh) + 'l' + r1(-0.01 * fh) + ' ' + r1(fh - 2.5 * hr - 0.4 * fh) + 'h' + r1(-0.055 * fh) + 'l' + r1(-0.01 * fh) + ' ' + r1(-0.36 * fh) + 'l' + r1(-0.01 * fh) + ' ' + r1(0.36 * fh) + 'h' + r1(-0.055 * fh) + 'l' + r1(-0.01 * fh) + ' ' + r1(-(fh - 2.5 * hr - 0.4 * fh)) + 'z"/></g>');
    }

    var i, lw, ix, iy, iw, ih;
    if (t === 'hinged' || t === 'folding' || t === 'fixed') {
      ring(x0, y0, w, h, f);
      ix = x0 + f; iy = y0 + f; iw = w - 2 * f; ih = h - 2 * f; lw = iw / n;
      for (i = 0; i < n; i++) {
        var lx = ix + i * lw;
        if (t === 'fixed') {
          pane(lx, iy, lw, ih);
          if (i > 0) bar(lx - f / 2, iy, f, ih);
        } else {
          ring(lx, iy, lw, ih, sh, 'dw-sash');
          pane(lx + sh, iy + sh, lw - 2 * sh, ih - 2 * sh);
          var hingeLeft = t === 'folding' ? (i % 2 === 0) : (n === 1 ? true : (i % 2 === 0));
          if (t === 'hinged' && n > 1) hingeLeft = i < n / 2 ? (i % 2 === 0) : ((n - 1 - i) % 2 !== 0);
          tri(lx + sh, iy + sh, lw - 2 * sh, ih - 2 * sh, hingeLeft);
        }
      }
      if (t === 'fixed') { for (i = 0; i < n; i++) sym('M' + r1(ix + i * lw + lw * 0.3) + ' ' + r1(iy + ih * 0.5) + 'h' + r1(lw * 0.4)); }
    } else if (t === 'sliding') {
      ring(x0, y0, w, h, f);
      ix = x0 + f; iy = y0 + f; iw = w - 2 * f; ih = h - 2 * f; lw = iw / n;
      var ov = Math.min(sh, lw * 0.12);
      for (i = 0; i < n; i++) {
        var sx = ix + i * lw - (i > 0 ? ov / 2 : 0), sw = lw + (i > 0 && i < n - 1 ? ov : ov / 2);
        ring(sx, iy, Math.min(sw, ix + iw - sx), ih, sh, 'dw-sash');
        pane(sx + sh, iy + sh, Math.min(sw, ix + iw - sx) - 2 * sh, ih - 2 * sh);
        arrow(ix + i * lw + lw / 2, iy + ih / 2, Math.min(lw * 0.42, 70), i < n / 2 ? 1 : -1);
      }
    } else if (t === 'facade') {
      var m = Math.max(3, 60 * s);
      var cw = (w - m) / n, rh = (h - m) / rows, c, rr;
      for (c = 0; c < n; c++) for (rr = 0; rr < rows; rr++) pane(x0 + m + c * cw, y0 + m + rr * rh, cw - m, rh - m);
      for (rr = 0; rr <= rows; rr++) bar(x0, y0 + rr * rh, w, m);
      for (c = 0; c <= n; c++) bar(x0 + c * cw, y0, m, h);
    } else if (t === 'railing') {
      var p = Math.max(3, 50 * s), rail = Math.max(3, 45 * s), bw = (w - p) / n;
      for (i = 0; i < n; i++) {
        var bx = x0 + p + i * bw, bwid = bw - p, by = y0 + rail + 3, bh = h - rail - 3 - Math.max(6, 90 * s);
        if (o.glass === 'bars') {
          var cnt = Math.max(2, Math.min(40, Math.round((bwid / s) / 110))), gap = bwid / cnt, j;
          var d = '';
          for (j = 1; j < cnt; j++) d += 'M' + r1(bx + j * gap) + ' ' + r1(by) + 'v' + r1(bh);
          el('<path class="dw-el dw-bars" d="' + d + '" fill="none" stroke="' + fin.hex + '" stroke-width="' + r1(Math.max(1.2, 16 * s)) + '"/>');
          bar(bx, by + bh, bwid, Math.max(2, 30 * s));
        } else {
          pane(bx + 2, by, bwid - 4, bh);
        }
      }
      for (i = 0; i <= n; i++) bar(x0 + i * bw, y0, p, h);
      bar(x0, y0, w, rail);
    } else if (t === 'pergola') {
      var post = Math.max(4, 120 * s), beam = Math.max(5, 200 * s), bay = (w - post) / n;
      var blades = Math.max(6, Math.min(60, Math.round(W / 220))), bg = (w - 2 * post) / blades, dd = '';
      for (i = 0; i < blades; i++) dd += 'M' + r1(x0 + post + i * bg + bg * 0.15) + ' ' + r1(y0 + beam * 0.78) + 'l' + r1(bg * 0.6) + ' ' + r1(-beam * 0.56);
      for (i = 0; i <= n; i++) bar(x0 + i * bay, y0 + beam, post, h - beam);
      ring(x0, y0, w, beam, Math.max(2, beam * 0.16));
      el('<path class="dw-el dw-bars" d="' + dd + '" fill="none" stroke="' + fin.hex + '" stroke-width="' + r1(Math.max(1.4, 30 * s)) + '" stroke-linecap="round"/>');
    }

    if (showDims) {
      var dy = gy + 26, dx = x0 + w + 26;
      out.push('<g class="dw-dim"><path fill="none" stroke-width="1" d="M' + r1(x0) + ' ' + r1(dy) + 'H' + r1(x0 + w) + ' M' + r1(x0) + ' ' + r1(dy - 6) + 'v12 M' + r1(x0 + w) + ' ' + r1(dy - 6) + 'v12 M' + r1(dx) + ' ' + r1(y0) + 'V' + r1(gy) + ' M' + r1(dx - 6) + ' ' + r1(y0) + 'h12 M' + r1(dx - 6) + ' ' + r1(gy) + 'h12"/>' +
        '<text x="' + r1(x0 + w / 2) + '" y="' + r1(dy + 22) + '" text-anchor="middle">' + W + '</text>' +
        '<text x="' + r1(dx + 20) + '" y="' + r1(y0 + h / 2) + '" text-anchor="middle" transform="rotate(-90 ' + r1(dx + 20) + ' ' + r1(y0 + h / 2) + ')">' + H + '</text></g>');
    }
    return '<svg class="dw" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="' + (o.label || '') + '" xmlns="http://www.w3.org/2000/svg">' + out.join('') + '</svg>';
  }

  window.AluDraw = draw;
  window.AluDraw.TYPES = TYPES;
  window.AluDraw.FIN = FIN;

  /* Static drawings: <div data-draw='{"type":"sliding","w":2400,"h":2200,"n":2}'></div> */
  function mount() {
    var list = document.querySelectorAll('[data-draw]');
    Array.prototype.forEach.call(list, function (box) {
      try {
        var o = JSON.parse(box.getAttribute('data-draw'));
        o.label = box.getAttribute('data-label') || '';
        box.innerHTML = draw(o);
      } catch (e) { /* leave the box empty */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
