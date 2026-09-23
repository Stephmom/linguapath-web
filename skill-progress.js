function renderSkillProgress(){
  st.correctBySkill={...D.correctBySkill,...st.correctBySkill};
  document.querySelectorAll('.skill-card[data-skill]').forEach(card=>{
    const skill=card.dataset.skill,count=Math.min(100,Number(st.correctBySkill[skill])||0);
    let meter=card.querySelector('.skill-progress');
    if(!meter){
      meter=document.createElement('span');meter.className='skill-progress';
      meter.innerHTML='<span class="skill-progress-meta"><span class="skill-progress-label"></span><span class="skill-progress-value"></span></span><span class="skill-progress-track"><span></span></span>';
      card.append(meter);
    }
    meter.querySelector('.skill-progress-label').textContent=count+' / 100 correct';
    meter.querySelector('.skill-progress-value').textContent=count+'%';
    const track=meter.querySelector('.skill-progress-track');
    track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',count);track.setAttribute('aria-label',skill+': '+count+' of 100 correct exercises');
    track.firstElementChild.style.width=count+'%';
  });
}
const skillProgressRender=render;render=()=>{skillProgressRender();renderSkillProgress()};render();
