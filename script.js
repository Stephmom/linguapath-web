const skills=[['Listening','◉','Sharpen your ear','listening'],['Reading','▤','Find the evidence','reading'],['Writing','✎','Make ideas clear','writing'],['Speaking','◌','Find your voice','speaking']];
const journey=[['Everyday foundations','Listening · Reading','◉',true],['Clear messages','Writing · Speaking','✎',true],['Review checkpoint','Mixed practice','↻',true],['First treasure','Tip unlocked','🎁',true],['Real-world English','Travel · study · work','▤',false],['Cambridge checkpoint','Timed mixed review','★',false]];
const achievements=[['🌱','First Spark','Complete 1 exercise'],['🧠','Brain Boot','Complete 10 exercises'],['📖','Page Turner','Complete 25 exercises'],['🎧','Ear Opener','Complete 50 exercises'],['✍️','Word Scribbler','Complete 100 exercises'],['🚀','English Wizard','Complete 250 exercises'],['🏆','Lesson Legend','Complete 10 lessons'],['🎯','Bullseye','Complete 20 lessons']];
const skillMarkup=(s)=>`<button class="skill-card ${s[3]}" data-skill="${s[0]}"><span class="skill-icon">${s[1]}</span><strong>${s[0]}</strong><small>${s[2]}</small><span class="card-arrow">↗</span></button>`;
document.querySelector('.skill-grid-large').innerHTML=skills.map(skillMarkup).join('');
document.querySelector('.journey-list').innerHTML=journey.map(j=>`<div class="journey-node ${j[3]?'':'locked'}"><span class="node-icon">${j[2]}</span><div><strong>${j[0]}</strong><small>${j[1]}${j[3]?' · Tap to open reward':''}</small></div></div>`).join('');
document.querySelector('.achievement-grid').innerHTML=achievements.map(a=>`<div class="achievement"><span>${a[0]}</span><strong>${a[1]}</strong><small>${a[2]}</small></div>`).join('');
const toast=document.querySelector('.toast');let timer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2200)}
function go(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.nav===id));window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.nav)));
document.querySelectorAll('[data-skill]').forEach(el=>el.addEventListener('click',()=>notify(`${el.dataset.skill} practice is ready when you are.`)));
document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>notify(el.dataset.action==='edit'?'Profile editing is coming next.':'Your next exercise is queued up.')));
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('linguapath-dark',document.body.classList.contains('dark'))}
if(localStorage.getItem('linguapath-dark')==='true')document.body.classList.add('dark');document.querySelector('#theme-toggle').addEventListener('click',toggleTheme);document.querySelector('#theme-switch').addEventListener('click',toggleTheme);
