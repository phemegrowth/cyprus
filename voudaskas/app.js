(function(){
  var root=document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body=document.body;

  /* hero entrance: starts on the first frame, never waits for fonts or images */
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ body.classList.add('loaded'); }); });

  /* header shrink */
  var header=document.querySelector('.site-header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY>24); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* mobile menu: closes on link click and on Escape */
  var btn=document.querySelector('.menu-btn'), nav=document.getElementById('nav');
  function setMenu(open){ root.classList.toggle('menu-open',open); btn.setAttribute('aria-expanded',open?'true':'false'); }
  btn.addEventListener('click', function(){ setMenu(!root.classList.contains('menu-open')); });
  nav.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });

  /* language switch placeholder */
  document.querySelectorAll('[aria-disabled="true"]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); }); });

  /* scroll reveals with the above-the-fold guard */
  var items=[].slice.call(document.querySelectorAll('.reveal, .reveal-wrap'));
  if(reduce || !('IntersectionObserver' in window)){ items.forEach(function(el){ el.classList.add('in'); }); }
  else {
    var io=new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(en.isIntersecting){ var el=en.target; setTimeout(function(){ el.classList.add('in'); }, +(el.dataset.d||0)); io.unobserve(el); } }); }, {rootMargin:'0px 0px -8% 0px'});
    var groups=new Map();
    items.forEach(function(el){ var p=el.parentElement; var i=groups.get(p)||0; el.dataset.d=Math.min(i,5)*80; groups.set(p,i+1);
      if(el.getBoundingClientRect().top<window.innerHeight) el.classList.add('in'); else io.observe(el); });
  }

  /* products: tap or hover swaps the photo; on phones the photo moves under the chosen product */
  var pbtn=[].slice.call(document.querySelectorAll('.plist button')), pimg=[].slice.call(document.querySelectorAll('.prod-media img')), pm=document.querySelector('.prod-media'), phead=document.querySelector('.prod-head');
  var mob=window.matchMedia('(max-width:760px)');
  function pick(b, move){ pbtn.forEach(function(x){ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',x===b?'true':'false'); });
    var i=+b.dataset.i; pimg.forEach(function(im,k){ im.classList.toggle('on',k===i); });
    if(move && mob.matches && pm){ b.parentElement.appendChild(pm); } }
  pbtn.forEach(function(b){ b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false');
    b.addEventListener('click', function(){ pick(b,true); });
    b.addEventListener('mouseenter', function(){ if(!mob.matches) pick(b,false); }); });
  if(mob.matches && pm && pbtn[0]) pbtn[0].parentElement.appendChild(pm);
  mob.addEventListener && mob.addEventListener('change', function(e){ if(!e.matches && phead && pm) phead.appendChild(pm); });

  /* frame colour swatches */
  var sws=[].slice.call(document.querySelectorAll('.sw')), swName=document.getElementById('swatch-name'), fbox=document.querySelector('.frame');
  sws.forEach(function(s){ s.addEventListener('click', function(){ sws.forEach(function(x){ x.classList.toggle('on',x===s); x.setAttribute('aria-pressed',x===s?'true':'false'); });
    if(fbox) fbox.style.setProperty('--frame', s.style.getPropertyValue('--c')); if(swName) swName.textContent=s.dataset.name; }); });

  /* count-up of years since 1978 */
  var cnt=document.querySelector('[data-count]');
  if(cnt){ var target=new Date().getFullYear()-1978; cnt.dataset.count=target; cnt.textContent=target;
    if(!reduce && 'IntersectionObserver' in window){ cnt.textContent='0';
      var io4=new IntersectionObserver(function(e){ if(e[0].isIntersecting){ io4.disconnect(); var t0=performance.now();
        var step=function(t){ var k=Math.min(1,(t-t0)/1600); k=1-Math.pow(1-k,3); cnt.textContent=Math.round(target*k); if(k<1) requestAnimationFrame(step); };
        requestAnimationFrame(step); } }, {threshold:.4});
      io4.observe(cnt); } }

  /* process track fills with the scroll */
  var track=document.querySelector('.track span'), proc=document.querySelector('.process');
  if(track && !reduce){ var tf=function(){ var r=proc.getBoundingClientRect(), vh=window.innerHeight; var p=Math.max(0,Math.min(1,(vh-r.top)/(r.height+vh*0.2)));
    track.style.setProperty('--p',p.toFixed(3)); }; window.addEventListener('scroll', tf, {passive:true}); tf(); }

  /* drag to scroll the project strip with a mouse */
  var strip=document.querySelector('.strip');
  if(strip){ var down=false, sx=0, sl=0;
    strip.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse') return; down=true; sx=e.clientX; sl=strip.scrollLeft; strip.classList.add('drag'); });
    window.addEventListener('pointermove', function(e){ if(down) strip.scrollLeft=sl-(e.clientX-sx); });
    window.addEventListener('pointerup', function(){ down=false; strip.classList.remove('drag'); });
  }

  /* magnetic buttons */
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.magnetic').forEach(function(b){
      b.addEventListener('mousemove', function(e){ var r=b.getBoundingClientRect(); var x=(e.clientX-r.left-r.width/2)*.18, y=(e.clientY-r.top-r.height/2)*.28; b.style.transform='translate('+x+'px,'+y+'px)'; });
      b.addEventListener('mouseleave', function(){ b.style.transform=''; });
    });
  }

  /* form validation with inline messages */
  var form=document.querySelector('form.form');
  if(form){
    var msgs={name:'Please write your name.',phone:'Please add a phone number.',email:'Please write a valid email.',project:'Please choose a project type.',message:'Please tell us what you need.'};
    var check=function(f){ var ok=true, v=(f.value||'').trim();
      if(f.required && !v) ok=false;
      if(ok && f.type==='email') ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if(ok && f.type==='tel') ok=v.replace(/\D/g,'').length>=8;
      var wrap=f.closest('.field'); if(wrap){ wrap.classList.toggle('bad',!ok); wrap.querySelector('.err').textContent=ok?'':(msgs[f.name]||'Please fill in this field.'); }
      return ok; };
    var fields=[].slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function(f){ f.addEventListener('blur', function(){ check(f); }); });
    form.addEventListener('submit', function(e){ var bad=fields.filter(function(f){ return !check(f); }); if(bad.length){ e.preventDefault(); bad[0].focus(); } });
  }

  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();
