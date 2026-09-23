if(matchMedia('(pointer:fine)').matches){
  let frame;
  window.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      document.body.style.setProperty('--pointer-x',event.clientX+'px');
      document.body.style.setProperty('--pointer-y',event.clientY+'px');
      document.body.classList.add('pointer-active');
    });
  },{passive:true});
  window.addEventListener('pointerout',event=>{if(!event.relatedTarget)document.body.classList.remove('pointer-active')},{passive:true});
}
