const achievementGoals=[
  {kind:'exercise',target:1},{kind:'exercise',target:10},{kind:'exercise',target:25},{kind:'exercise',target:50},
  {kind:'exercise',target:100},{kind:'exercise',target:250},{kind:'exercise',target:350},{kind:'exercise',target:1200}
];
function renderAchievements(){
  const legacyTotal=(Number(st.correct)||0)+(Array.isArray(st.mistakes)?st.mistakes.length:0);
  const answered=Math.max(Number(st.exercisesCompleted)||0,legacyTotal);
  if(st.exercisesCompleted!==answered){st.exercisesCompleted=answered;if(session||window.__lpCloudUser)save()}
  let unlocked=0;
  document.querySelector('.achievement-grid').innerHTML=achievements.map((achievement,index)=>{
    const goal=achievementGoals[index],current=goal.kind==='exercise'?answered:(Number(st.lessons)||0),complete=current>=goal.target;
    const percent=Math.min(100,Math.round(current/goal.target*100));if(complete)unlocked++;
    const unit=goal.kind==='exercise'?'exercise':'lesson',label=goal.target+' '+unit+(goal.target===1?'':'s');
    const description=complete?'Unlocked':Math.max(0,goal.target-current)+' '+unit+(goal.target-current===1?'':'s')+' to go';
    return '<article class="achievement '+(complete?'unlocked':'locked')+'" aria-label="'+achievement[1]+': '+(complete?'unlocked':current+' of '+goal.target+' '+unit+'s')+'"><span class="achievement-icon">'+achievement[0]+'</span><strong>'+achievement[1]+'</strong><small>'+description+'</small><span class="achievement-progress-meta"><span>'+current+' / '+label+'</span><b>'+percent+'%</b></span><span class="achievement-progress-track" role="progressbar" aria-label="'+achievement[1]+' progress" aria-valuemin="0" aria-valuemax="'+goal.target+'" aria-valuenow="'+Math.min(current,goal.target)+'"><span style="width:'+percent+'%"></span></span></article>';
  }).join('');
  document.querySelector('.achievement-head .pill').textContent=unlocked+' of '+achievements.length+' unlocked';
}
const achievementRender=render;render=()=>{achievementRender();renderAchievements()};render();
