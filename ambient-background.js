if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const field=document.createElement('div');field.className='ambient-particles';field.setAttribute('aria-hidden','true');
  const particles=Array.from({length:7},(_,index)=>{
    const dot=document.createElement('span'),angle=Math.PI*2*index/7,radius=16+(index%3)*9;
    dot.className='ambient-particle';dot.style.setProperty('--size',(3+index%3*1.2)+'px');dot.style.setProperty('--particle-opacity',.55+(index%3)*.15);
    dot.dataset.dx=Math.cos(angle)*radius;dot.dataset.dy=Math.sin(angle)*radius;dot.style.transitionDelay=index*18+'ms';field.append(dot);return dot;
  });
  document.body.append(field);
  let frame;
  window.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      document.body.style.setProperty('--pointer-x',event.clientX+'px');
      document.body.style.setProperty('--pointer-y',event.clientY+'px');
      document.body.classList.add('pointer-active');
      field.classList.add('active');
      particles.forEach(dot=>{dot.style.left=(event.clientX+Number(dot.dataset.dx))+'px';dot.style.top=(event.clientY+Number(dot.dataset.dy))+'px'});
    });
  },{passive:true});
  window.addEventListener('pointerout',event=>{if(!event.relatedTarget){document.body.classList.remove('pointer-active');field.classList.remove('active')}},{passive:true});
}
