const SUPABASE_URL='https://hkqjmbitooohvzjrpqwl.supabase.co';
const SUPABASE_KEY='sb_publishable_pPQjL-x6W5jMPmZomRNSGg_bdpcex76';
const CLOUD_SESSION_KEY='linguapath-cloud-session';
let cloudSession=JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY)||'null');
const authHeaders=token=>({apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})});
const authRequest=(path,options={})=>fetch(SUPABASE_URL+'/auth/v1/'+path,{...options,headers:{...authHeaders(),...(options.headers||{})}});

async function loadCloudUser(user){
  window.__lpCloudUser=user;
  const response=await fetch(SUPABASE_URL+'/rest/v1/student_progress?select=state&user_id=eq.'+encodeURIComponent(user.id),{headers:authHeaders(cloudSession.access_token)});
  const rows=response.ok?await response.json():[];
  if(rows[0]?.state){st={...D,...rows[0].state};st.profile={...D.profile,...st.profile};st.correctByTier=Array.isArray(st.correctByTier)?[...st.correctByTier]:[0,0,0];st.correct=st.correctByTier.reduce((a,b)=>a+b,0);if(st.dayKey!==todayKey()){st.today=0;st.dayKey=todayKey()}}
  session=user.id;localStorage.setItem(SESSION_KEY,session);authScreen.classList.add('hidden');document.body.classList.add('authenticated');render();
}

window.lpSaveProgress=async state=>{if(!cloudSession?.access_token||!window.__lpCloudUser)return;await fetch(SUPABASE_URL+'/rest/v1/student_progress?on_conflict=user_id',{method:'POST',headers:{...authHeaders(cloudSession.access_token),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:window.__lpCloudUser.id,state,updated_at:new Date().toISOString()})})};

authForm.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const email=document.querySelector('#auth-username').value.trim().toLowerCase(),password=document.querySelector('#auth-password').value;document.querySelector('#auth-error').textContent='';
  const response=loginMode?await authRequest('token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}):await authRequest('signup',{method:'POST',body:JSON.stringify({email,password})});
  const result=await response.json();
  if(!response.ok){document.querySelector('#auth-error').textContent=result.error_description||result.msg||result.message||'Unable to access your account.';return}
  if(result.access_token){cloudSession=result;localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(result));await loadCloudUser(result.user)}else document.querySelector('#auth-error').textContent='Account created. Check your email to confirm, then log in.';
},true);

document.querySelector('#logout-button').addEventListener('click',async e=>{e.preventDefault();e.stopImmediatePropagation();if(cloudSession?.access_token)await authRequest('logout',{method:'POST',headers:{Authorization:'Bearer '+cloudSession.access_token}});cloudSession=null;window.__lpCloudUser=null;localStorage.removeItem(CLOUD_SESSION_KEY);session=null;localStorage.removeItem(SESSION_KEY);authScreen.classList.remove('hidden');document.body.classList.remove('authenticated');authForm.reset();setAuthMode(false)},true);

(async()=>{if(cloudSession?.user&&cloudSession?.access_token)await loadCloudUser(cloudSession.user)})();
