const SUPABASE_URL='https://hkqjmbitooohvzjrpqwl.supabase.co';
const SUPABASE_KEY='sb_publishable_pPQjL-x6W5jMPmZomRNSGg_bdpcex76';
const CLOUD_SESSION_KEY='linguapath-cloud-session';
let cloudSession=JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY)||'null');
const authHeaders=token=>({apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})});
const authRequest=(path,options={})=>fetch(SUPABASE_URL+'/auth/v1/'+path,{...options,headers:{...authHeaders(),...(options.headers||{})}});

async function refreshCloudSession(){
  if(cloudSession?.expires_at>Date.now()/1000+60)return true;
  if(!cloudSession?.refresh_token)return false;
  const response=await authRequest('token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:cloudSession.refresh_token})});
  const next=await response.json();
  if(!response.ok)return false;
  cloudSession={...next,expires_at:next.expires_at||Math.floor(Date.now()/1000)+next.expires_in};
  localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(cloudSession));
  return true;
}

async function loadCloudUser(user){
  if(!await refreshCloudSession()){
    cloudSession=null;window.__lpCloudUser=null;session=null;localStorage.removeItem(CLOUD_SESSION_KEY);localStorage.removeItem(SESSION_KEY);setAuthMode(true);
    document.querySelector('#auth-error').textContent='Your session expired. Please log in again; your saved progress is still in your account.';return;
  }
  let response;
  try{response=await fetch(SUPABASE_URL+'/rest/v1/student_progress?select=state&user_id=eq.'+encodeURIComponent(user.id),{headers:authHeaders(cloudSession.access_token)})}
  catch{document.querySelector('#auth-error').textContent='Could not connect to load saved progress. Check your connection and try again.';return}
  if(!response.ok){document.querySelector('#auth-error').textContent='Could not load saved progress. Check your connection and try again; your account data was not changed.';return}
  const rows=await response.json();
  window.__lpCloudUser=user;
  if(rows[0]?.state){st={...D,...rows[0].state};st.profile={...D.profile,...st.profile};st.correctByTier=Array.isArray(st.correctByTier)?[...st.correctByTier]:[0,0,0];st.correct=st.correctByTier.reduce((a,b)=>a+b,0);if(st.dayKey!==todayKey()){st.today=0;st.dayKey=todayKey()}}else st={...D,dayKey:todayKey(),profile:{...D.profile,name:user.email?.split('@')[0]||'Learner'}};
  session=user.id;localStorage.setItem(SESSION_KEY,session);authScreen.classList.add('hidden');document.body.classList.add('authenticated');render();window.lpResumePractice?.();
}

let cloudSaveQueue=Promise.resolve();
window.lpSaveProgress=state=>{
  if(!cloudSession?.access_token||!window.__lpCloudUser)return Promise.resolve(false);
  const snapshot=JSON.parse(JSON.stringify(state));
  cloudSaveQueue=cloudSaveQueue.then(async()=>{
    if(!await refreshCloudSession())throw new Error('Your session expired. Log in again to sync progress.');
    const response=await fetch(SUPABASE_URL+'/rest/v1/student_progress?on_conflict=user_id',{method:'POST',keepalive:true,headers:{...authHeaders(cloudSession.access_token),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:window.__lpCloudUser.id,state:snapshot,updated_at:new Date().toISOString()})});
    if(!response.ok)throw new Error('Supabase returned '+response.status);
    return true;
  }).catch(error=>{console.error('Progress sync failed:',error);note('Progress could not sync. Check your connection and log in again if needed.');return false});
  return cloudSaveQueue;
};

authForm.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const email=document.querySelector('#auth-username').value.trim().toLowerCase(),password=document.querySelector('#auth-password').value;document.querySelector('#auth-error').textContent='';
  const response=loginMode?await authRequest('token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}):await authRequest('signup',{method:'POST',body:JSON.stringify({email,password})});
  const result=await response.json();
  if(!response.ok){document.querySelector('#auth-error').textContent=result.error_description||result.msg||result.message||'Unable to access your account.';return}
  if(result.access_token){cloudSession={...result,expires_at:result.expires_at||Math.floor(Date.now()/1000)+result.expires_in};localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(cloudSession));await loadCloudUser(result.user)}else document.querySelector('#auth-error').textContent='Account created. Check your email to confirm, then log in.';
},true);

document.querySelector('#logout-button').addEventListener('click',async e=>{e.preventDefault();e.stopImmediatePropagation();document.querySelector('#reset-progress-button').style.display='none';if(window.lpCloudPending)await window.lpCloudPending;if(cloudSession?.access_token)await authRequest('logout',{method:'POST',headers:{Authorization:'Bearer '+cloudSession.access_token}});cloudSession=null;window.__lpCloudUser=null;localStorage.removeItem(CLOUD_SESSION_KEY);session=null;localStorage.removeItem(SESSION_KEY);authScreen.classList.remove('hidden');document.body.classList.remove('authenticated');authForm.reset();setAuthMode(false)},true);

(async()=>{if(cloudSession?.user&&cloudSession?.access_token)await loadCloudUser(cloudSession.user);else{window.__lpCloudUser=null;session=null;localStorage.removeItem(SESSION_KEY);authScreen.classList.remove('hidden');document.body.classList.remove('authenticated');setAuthMode(false)}})();
