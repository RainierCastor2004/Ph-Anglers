// Simple SPA logic for PH Anglers (localStorage-backed)
const STORAGE_KEY = 'ph_anglers_state_v1';
let state = {profile:{name:'Guest Angler',bio:'Happy angler',avatarText:'PH',likedPosts:[]},posts:[],users:[],currentUser:null};
let viewingUser = null; // when set, profile view shows this user's public profile

function sampleData(){
  return [
    {id:genId(),author:'Juan D.',avatar:'JD',text:'Caught a nice mangrove snapper today in Palawan! #madness',location:'Palawan',time:Date.now()-1000*60*60,likes:5,comments:[{author:'Ate M',text:'Lovely catch!'}]},
    {id:genId(),author:'Maya R.',avatar:'MR',text:'Best lure for shallow reefs?',location:'Cebu',time:Date.now()-1000*60*60*5,likes:3,comments:[]}
  ];
}

function genId(){return Math.random().toString(36).slice(2,9)}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) state = JSON.parse(raw);
    else { state.posts = sampleData(); saveState(); }
  }catch(e){console.error(e)}
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}

function q(id){return document.getElementById(id)}

function formatTime(ts){const diff=(Date.now()-ts)/1000; if(diff<60) return `${Math.floor(diff)}s`; if(diff<3600) return `${Math.floor(diff/60)}m`; if(diff<86400) return `${Math.floor(diff/3600)}h`; return `${Math.floor(diff/86400)}d`}

function renderProfile(){q('profile-name').textContent = state.profile.name; q('profile-bio').textContent = state.profile.bio; q('avatar').textContent = state.profile.avatarText}

function updateAuthUI(){
  const loginBtn = q('login-btn');
  const logoutBtn = q('logout-btn');
  if(state.currentUser){ if(loginBtn) loginBtn.classList.add('hidden'); if(logoutBtn) logoutBtn.classList.remove('hidden'); } else { if(loginBtn) loginBtn.classList.remove('hidden'); if(logoutBtn) logoutBtn.classList.add('hidden'); } }

function openAuthModal(tab='login'){
  const m = q('auth-modal'); if(!m) return; m.classList.remove('hidden'); m.setAttribute('aria-hidden','false'); if(tab==='signup'){ q('auth-tab-login').classList.remove('active'); q('auth-tab-signup').classList.add('active'); q('login-form').style.display='none'; q('signup-form').style.display='block'; } else { q('auth-tab-signup').classList.remove('active'); q('auth-tab-login').classList.add('active'); q('login-form').style.display='block'; q('signup-form').style.display='none'; } }
function closeAuthModal(){ const m = q('auth-modal'); if(!m) return; m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }

function hashPw(p){ try{return btoa(p);}catch(e){return p} }

function getUser(username){ return (state.users||[]).find(u=>u.username.toLowerCase()===username.toLowerCase()) }

function doSignup(){ const username = q('signup-username').value.trim(); const pw = q('signup-password').value; const name = q('signup-name').value.trim(); const bio = q('signup-bio').value.trim(); if(!username||!pw||!name) return alert('Please fill username, password and name.'); if(getUser(username)) return alert('Username already taken'); const user = {username, passwordHash:hashPw(pw), name, bio, avatarText: name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}; state.users = state.users||[]; state.users.push(user); state.currentUser = username; // set profile
  state.profile = {name:user.name,bio:user.bio,avatarText:user.avatarText,likedPosts:[]}; saveState(); closeAuthModal(); renderProfile(); updateAuthUI(); renderFeed(); renderTrending(); alert('Account created and logged in'); }

function doLogin(){ const username = q('login-username').value.trim(); const pw = q('login-password').value; if(!username||!pw) return alert('Please enter username and password'); const user = getUser(username); if(!user) return alert('No such user'); if(user.passwordHash !== hashPw(pw)) return alert('Incorrect password'); state.currentUser = user.username; state.profile = {name:user.name,bio:user.bio,avatarText:user.avatarText,likedPosts:state.profile.likedPosts||[]}; saveState(); closeAuthModal(); renderProfile(); updateAuthUI(); renderFeed(); renderTrending(); alert('Logged in as '+user.name); }

function logout(){ state.currentUser = null; state.profile = {name:'Guest Angler',bio:'Welcome to PH Anglers — join and share!',avatarText:'PH',likedPosts:[]}; saveState(); renderProfile(); updateAuthUI(); renderFeed(); renderTrending(); }

function renderTrending(){const list = q('trending-list'); list.innerHTML=''; const spots = {}; state.posts.forEach(p=>{ if(p.location) spots[p.location]=(spots[p.location]||0)+1 }); const sorted = Object.entries(spots).sort((a,b)=>b[1]-a[1]).slice(0,5); if(sorted.length===0){list.innerHTML='<li>No spots yet</li>';return} sorted.forEach(([loc,c])=>{ const li=document.createElement('li'); li.textContent = `${loc} — ${c} post${c>1?'s':''}`; list.appendChild(li) })}

function renderExplore(){
  const el = q('explore');
  el.innerHTML = '';
  // Group posts by location
  const groups = {};
  state.posts.forEach(p=>{ const k = p.location||'Unknown'; (groups[k]||(groups[k]=[])).push(p) });
  const keys = Object.keys(groups).sort((a,b)=>groups[b].length-groups[a].length);
  if(keys.length===0){ el.innerHTML = '<div class="card">No posts yet</div>'; return }
  keys.forEach(k=>{
    const section = document.createElement('section'); section.className='card';
    const title = document.createElement('h4'); title.textContent = `${k} — ${groups[k].length} post${groups[k].length>1?'s':''}`;
    section.appendChild(title);
    groups[k].slice(0,5).forEach(p=>{
      const pdiv = document.createElement('div'); pdiv.className='post compact';
      pdiv.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="avatar">${p.avatar||p.author[0]||'P'}</div><div><strong>${p.author}</strong><div class="meta">${formatTime(p.time)}</div><div class="content">${escapeHTML(p.text)}</div></div></div>`;
      section.appendChild(pdiv);
    })
    el.appendChild(section);
  })
}

function renderProfileView(){
  const el = q('profile-view');
  el.innerHTML = '';
  const userToShow = viewingUser ? viewingUser : (state.currentUser ? getUser(state.currentUser) : null);
  const profileData = userToShow ? {name:userToShow.name,bio:userToShow.bio,avatarText:userToShow.avatarText} : state.profile;

  const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center';
  const editButtonHtml = (!viewingUser || (state.currentUser && viewingUser && viewingUser.username===state.currentUser)) ? `<button id="profile-edit-top" class="btn small">Edit Profile</button>` : '';
  header.innerHTML = `<div><strong>${escapeHTML(profileData.name)}</strong><div class="meta">${escapeHTML(profileData.bio||'')}</div></div><div>${editButtonHtml}</div>`;
  el.appendChild(header);

  const myPosts = state.posts.filter(p=>p.author===profileData.name);
  const stats = document.createElement('div'); stats.style.marginTop='12px';
  stats.innerHTML = `<div class="meta">Posts: ${myPosts.length} • Likes received: ${ myPosts.reduce((s,p)=>s+(p.likes||0),0) }</div>`;
  el.appendChild(stats);

  const list = document.createElement('div'); list.style.marginTop='12px';
  if(myPosts.length===0) list.innerHTML = '<div class="meta">No posts yet.</div>';
  myPosts.slice().sort((a,b)=>b.time-a.time).forEach(p=>{
    const article = document.createElement('article'); article.className='card post';
    article.innerHTML = `<div class="post-header"><div class="avatar">${p.avatar||p.author[0]||'P'}</div><div style="flex:1"><div><strong>${p.author}</strong><div class="meta">${p.location? p.location+' • ' : ''}${formatTime(p.time)}</div></div><div class="content">${escapeHTML(p.text)}</div></div></div><div class="actions"><span class="action">❤️ ${p.likes||0}</span><span class="action">💬 ${p.comments? p.comments.length:0}</span></div>`;
    list.appendChild(article);
  })
  el.appendChild(list);
  const topEdit = q('profile-edit-top'); if(topEdit) topEdit.onclick = openModal;
}

function searchUsers(query){
  const container = q('search-results'); if(!container) return;
  container.innerHTML = '';
  if(!query || query.trim().length===0){ container.classList.add('hidden'); return }
  const ql = query.toLowerCase();
  const candidates = (state.users||[]).filter(u=>u.username.toLowerCase().includes(ql) || u.name.toLowerCase().includes(ql)).slice(0,10);
  if(candidates.length===0){ container.innerHTML = `<div class="item"><div class="meta">No users found</div></div>`; container.classList.remove('hidden'); return }
  candidates.forEach(u=>{
    const div = document.createElement('div'); div.className='item'; div.setAttribute('role','option');
    div.innerHTML = `<div class="avatar" style="width:36px;height:36px;border-radius:8px;font-size:14px">${escapeHTML(u.avatarText||u.name[0]||'U')}</div><div><div style="font-weight:700">${escapeHTML(u.name)}</div><div class="meta">@${escapeHTML(u.username)}</div></div>`;
    div.onclick = ()=>{ viewUserProfile(u.username); container.classList.add('hidden'); }
    container.appendChild(div);
  })
  container.classList.remove('hidden');
}

function viewUserProfile(username){ const user = getUser(username); if(!user) return alert('User not found'); viewingUser = user; setActiveNav('profile'); }

// hide search results when clicking outside
document.addEventListener('click', (e)=>{
  const sr = q('search-results'); const s = q('search'); if(!sr || !s) return;
  if(e.target===s || s.contains(e.target) || sr.contains(e.target)) return; sr.classList.add('hidden');
});

function renderFeed(filter=''){
  const feed = q('feed'); feed.innerHTML='';
  const posts = state.posts.slice().sort((a,b)=>b.time-a.time).filter(p=>{
    if(!filter) return true;
    return p.text.toLowerCase().includes(filter)||p.author.toLowerCase().includes(filter)|| (p.location||'').toLowerCase().includes(filter)
  });

  posts.forEach(p=>{
    const liked = state.profile.likedPosts && state.profile.likedPosts.includes(p.id);
    const el = document.createElement('article'); el.className='card post';
    el.innerHTML = `
      <div class="post-header">
        <div class="avatar">${p.avatar||p.author[0]||'P'}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>${p.author}</strong> <div class="meta">${p.location? p.location+' • ' : ''}${formatTime(p.time)}</div></div>
          </div>
          <div class="content">${escapeHTML(p.text)}</div>
        </div>
      </div>
      <div class="actions">
        <button class="action like-btn" data-id="${p.id}" aria-pressed="${liked}">${liked? '💚':'🤍'} <span class="count">${p.likes||0}</span></button>
        <button class="action comment-toggle" data-id="${p.id}">💬 ${p.comments? p.comments.length:0}</button>
      </div>

      <div class="comments" data-id="${p.id}">
        <div class="comments-list">
          ${ (p.comments||[]).map(c=>`<div class="comment"><strong>${escapeHTML(c.author)}</strong> <span class="meta">${escapeHTML(c.text)}</span></div>`).join('') }
        </div>
        <div class="comment-composer" style="margin-top:8px;display:flex;gap:8px">
          <input class="comment-input" data-id="${p.id}" placeholder="Write a comment..." />
          <button class="btn comment-submit" data-id="${p.id}">Reply</button>
        </div>
      </div>
    `;
    feed.appendChild(el);
  });

  // attach handlers
  document.querySelectorAll('.like-btn').forEach(btn=>{ btn.onclick = ()=>{ toggleLike(btn.dataset.id); } });
  document.querySelectorAll('.comment-submit').forEach(btn=>{ btn.onclick = (e)=>{ const id = btn.dataset.id; const input = document.querySelector(`.comment-input[data-id="${id}"]`); const text = input.value.trim(); if(!text) return; addComment(id,text); input.value=''; } });
  document.querySelectorAll('.comment-toggle').forEach(btn=>{ btn.onclick = (e)=>{ const id = btn.dataset.id; const el = document.querySelector(`.comments[data-id="${id}"]`); if(!el) return; el.style.display = el.style.display==='none' ? 'block' : 'none'; } });
}

function escapeHTML(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}

function toggleLike(id){ const p = state.posts.find(x=>x.id===id); if(!p) return; state.profile.likedPosts = state.profile.likedPosts||[]; const idx = state.profile.likedPosts.indexOf(id); if(idx===-1){ state.profile.likedPosts.push(id); p.likes = (p.likes||0)+1; } else { state.profile.likedPosts.splice(idx,1); p.likes = Math.max(0,(p.likes||0)-1); } saveState(); renderFeed(q('search').value.trim().toLowerCase()); renderTrending(); }

function addComment(id,text){ const p = state.posts.find(x=>x.id===id); if(!p) return; p.comments = p.comments||[]; p.comments.push({author:state.profile.name,text}); saveState(); renderFeed(q('search').value.trim().toLowerCase()); }

function postComposer(){ const text = q('post-text').value.trim(); if(!text) return alert('Write something first'); const loc = q('post-location').value.trim(); const post = {id:genId(),author:state.profile.name,avatar:state.profile.avatarText,text,location:loc,time:Date.now(),likes:0,comments:[]}; state.posts.push(post); saveState(); q('post-text').value=''; q('post-location').value=''; renderFeed(); renderTrending(); }

function openModal(){ q('modal').classList.remove('hidden'); q('modal-name').value = state.profile.name; q('modal-bio').value = state.profile.bio }
function closeModal(){ q('modal').classList.add('hidden') }
function saveModal(){ state.profile.name = q('modal-name').value.trim()||state.profile.name; state.profile.bio = q('modal-bio').value.trim()||state.profile.bio; state.profile.avatarText = state.profile.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase(); saveState(); renderProfile(); closeModal(); }

function bind(){
  q('post-btn').onclick = postComposer;
  q('edit-profile').onclick = openModal;
  q('modal-cancel').onclick = closeModal;
  q('modal-save').onclick = saveModal;
  const searchInput = q('search');
  if(searchInput){
    searchInput.oninput = (e)=>{ const v = e.target.value.trim().toLowerCase(); renderFeed(v); searchUsers(v); }
    searchInput.onkeydown = (e)=>{ if(e.key==='Enter'){ const container = q('search-results'); if(container && !container.classList.contains('hidden') && container.firstChild){ const first = container.querySelector('.item'); if(first){ first.click(); e.preventDefault(); return; } } const v = e.target.value.trim().toLowerCase(); renderFeed(v); } }
  }
  q('nav-feed').onclick = ()=>{ setActiveNav('feed') }
  q('nav-explore').onclick = ()=>{ setActiveNav('explore') }
  q('nav-profile').onclick = ()=>{ setActiveNav('profile') }
  // auth
  const loginBtn = q('login-btn'); if(loginBtn) loginBtn.onclick = ()=> openAuthModal('login');
  const logoutBtn = q('logout-btn'); if(logoutBtn) logoutBtn.onclick = ()=> logout();
  const authLogin = q('login-submit'); if(authLogin) authLogin.onclick = doLogin;
  const authSignup = q('signup-submit'); if(authSignup) authSignup.onclick = doSignup;
  const authClose = q('auth-close'); if(authClose) authClose.onclick = closeAuthModal; const authClose2 = q('auth-close-2'); if(authClose2) authClose2.onclick = closeAuthModal;
  const tabLogin = q('auth-tab-login'); if(tabLogin) tabLogin.onclick = ()=> openAuthModal('login'); const tabSignup = q('auth-tab-signup'); if(tabSignup) tabSignup.onclick = ()=> openAuthModal('signup');
}

function setActiveNav(key){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const composer = document.querySelector('.composer');
  const feedEl = q('feed');
  const exploreEl = q('explore');
  const profileView = q('profile-view');
  const headerSearch = document.querySelector('.header-actions');

  // hide all views by default
  if(composer) composer.classList.remove('hidden');
  if(feedEl) feedEl.classList.add('hidden');
  if(exploreEl) exploreEl.classList.add('hidden');
  if(profileView) profileView.classList.add('hidden');

  if(key==='feed'){
    q('nav-feed').classList.add('active');
    if(feedEl) feedEl.classList.remove('hidden');
    if(composer) composer.classList.remove('hidden');
    if(headerSearch) headerSearch.style.display = '';
    viewingUser = null;
    renderFeed(q('search').value.trim().toLowerCase());
  } else if(key==='explore'){
    q('nav-explore').classList.add('active');
    if(exploreEl) exploreEl.classList.remove('hidden');
    if(composer) composer.classList.add('hidden');
    if(headerSearch) headerSearch.style.display = '';
    viewingUser = null;
    renderExplore();
  } else {
    q('nav-profile').classList.add('active');
    if(profileView) profileView.classList.remove('hidden');
    if(composer) composer.classList.add('hidden');
    if(headerSearch) headerSearch.style.display = 'none';
    renderProfileView();
  }
}

window.addEventListener('load',()=>{ loadState(); bind(); renderProfile(); renderFeed(); renderTrending(); q('year').textContent = new Date().getFullYear(); });
// ensure auth UI reflects state on load
window.addEventListener('load',()=>{ updateAuthUI(); });
