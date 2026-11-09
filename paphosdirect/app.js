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

  /* hero photo parallax: moves slower than the page */
  var media=document.querySelector('[data-parallax]');
  if(media && !reduce && window.matchMedia('(min-width:761px)').matches){
    var ticking=false;
    var par=function(){ ticking=false; var y=window.scrollY; if(y<window.innerHeight*1.2) media.style.transform='translate3d(0,'+(y*0.16).toFixed(1)+'px,0)'; };
    window.addEventListener('scroll', function(){ if(!ticking){ ticking=true; requestAnimationFrame(par); } }, {passive:true});
  }

  /* area filter chips with fade and scale */
  var chips=[].slice.call(document.querySelectorAll('.chip')), cards=[].slice.call(document.querySelectorAll('.card'));
  chips.forEach(function(c){ c.addEventListener('click', function(){
    var f=c.dataset.f;
    chips.forEach(function(x){ var on=x===c; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); });
    cards.forEach(function(card){ var show=f==='all'||card.dataset.a===f;
      if(show){ card.classList.remove('gone'); requestAnimationFrame(function(){ card.classList.remove('out'); }); }
      else { card.classList.add('out'); setTimeout(function(){ if(card.classList.contains('out')) card.classList.add('gone'); }, reduce?0:340); }
    });
    var strip=document.querySelector('.cards'); if(strip) strip.scrollLeft=0;
  }); });

  /* drag to scroll the cards strip with a mouse */
  var strip=document.querySelector('.cards');
  if(strip){ var down=false, sx=0, sl=0;
    strip.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse'||strip.scrollWidth<=strip.clientWidth) return; down=true; sx=e.clientX; sl=strip.scrollLeft; });
    window.addEventListener('pointermove', function(e){ if(down) strip.scrollLeft=sl-(e.clientX-sx); });
    window.addEventListener('pointerup', function(){ down=false; });
  }

  /* process line draws with the scroll, steps light up as it passes */
  var steps=document.querySelector('.steps'), stepEls=[].slice.call(document.querySelectorAll('.step'));
  if(steps){
    if(reduce){ steps.style.setProperty('--p',1); stepEls.forEach(function(s){ s.classList.add('lit'); }); }
    else {
      var draw=function(){ var r=steps.getBoundingClientRect(); var vh=window.innerHeight; var p=Math.max(0,Math.min(1,(vh*0.62-r.top)/r.height));
        steps.style.setProperty('--p',p.toFixed(3));
        stepEls.forEach(function(s){ s.classList.toggle('lit', s.getBoundingClientRect().top<vh*0.66); }); };
      window.addEventListener('scroll', draw, {passive:true}); draw();
    }
  }

  /* settle list: hover, focus or tap swaps the photo; cycles on its own while visible */
  var swapItems=[].slice.call(document.querySelectorAll('.swap li')), swapImgs=[].slice.call(document.querySelectorAll('.swap-media img'));
  var cur=0, timer=null, held=false;
  function show(i){ cur=i; swapItems.forEach(function(li,k){ li.classList.toggle('on',k===i); }); swapImgs.forEach(function(im,k){ im.classList.toggle('on',k===i); }); }
  swapItems.forEach(function(li,i){ li.tabIndex=0;
    li.addEventListener('mouseenter', function(){ held=true; show(i); });
    li.addEventListener('mouseleave', function(){ held=false; });
    li.addEventListener('focus', function(){ show(i); });
    li.addEventListener('click', function(){ show(i); });
  });
  if(!reduce && swapItems.length && 'IntersectionObserver' in window){
    var io3=new IntersectionObserver(function(e){ if(e[0].isIntersecting){ if(!timer) timer=setInterval(function(){ if(!held) show((cur+1)%swapItems.length); }, 2600); } else { clearInterval(timer); timer=null; } }, {threshold:.35});
    io3.observe(document.querySelector('.settle'));
  }

  /* area words fill the form's area field */
  var areaSel=document.getElementById('f-area');
  document.querySelectorAll('[data-area]').forEach(function(a){ a.addEventListener('click', function(){ if(areaSel) areaSel.value=a.dataset.area; }); });

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
    var msgs={name:'Please write your name.',phone:'Please add a phone or WhatsApp number.',email:'Please write a valid email.',area:'Please choose an area.',message:'Please tell us a little about what you need.'};
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
