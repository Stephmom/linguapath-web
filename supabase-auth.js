const SUPABASE_URL='https://hkqjmbitooohvzjrpqwl.supabase.co';
const SUPABASE_KEY='sb_publishable_pPQjL-x6W5jMPmZomRNSGg_bdpcex76';
const cloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
window.lpCloud=cloud;

async function loadCloudUser(user){
  window.__lpCloudUser=user;
  const {data}=await cloud.from('student_progress').select('state').eq('user_id',user.id).maybeSingle();
  if(data?.state){st={...D,...data.state};st.profile={...D.profile,...st.profile};st.correctByTier=Array.isArray(st.correctByTier)?[...st.correctByTier]:[0,0,0];st.correct=st.correctByTier.reduce((a,b)=>a+b,0)}
  session=user.id;localStorage.setItem(SESSION_KEY,session);authScreen.classList.add('hidden');document.body.classList.add('authenticated');render();
}

authForm.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const email=document.querySelector('#auth-username').value.trim().toLowerCase(),password=document.querySelector('#auth-password').value;
  document.querySelector('#auth-error').textContent='';
  const result=loginMode?await cloud.auth.signInWithPassword({email,password}):await cloud.auth.signUp({email,password});
  if(result.error){document.querySelector('#auth-error').textContent=result.error.message;return}
  if(result.data.session) await loadCloudUser(result.data.user);
  else document.querySelector('#auth-error').textContent='Account created. Check your email to confirm, then log in.';
},true);

document.querySelector('#logout-button').addEventListener('click',async e=>{
  e.preventDefault();e.stopImmediatePropagation();await cloud.auth.signOut();window.__lpCloudUser=null;session=null;localStorage.removeItem(SESSION_KEY);authScreen.classList.remove('hidden');document.body.classList.remove('authenticated');authForm.reset();setAuthMode(false);
},true);

(async()=>{const {data}=await cloud.auth.getSession();if(data.session)await loadCloudUser(data.session.user)})();
