(function(){
  var root=document.documentElement;
  var tb=document.getElementById('theme-toggle');
  if(tb)tb.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('brb-theme',next);}catch(e){}
  });
  var mb=document.getElementById('menu-btn'),sheet=document.getElementById('sheet');
  if(mb&&sheet)mb.addEventListener('click',function(){
    var open=sheet.classList.toggle('open');
    document.body.classList.toggle('menu-open',open);
    mb.setAttribute('aria-expanded',open?'true':'false');
  });
  var h=document.querySelector('.header');
  function onScroll(){if(h)h.classList.toggle('scrolled',window.scrollY>8);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    root.classList.add('js-rv');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(function(el){el.classList.add('in');});}
})();
