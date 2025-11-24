/* assets/js/dashboard.js
   PRO Dashboard logic: rendering, filtering, modal, realtime
*/

/* ==== Demo dataset (replace with API calls in production) ==== */
const TECHS = [
  {id:1, init:'RP', name:'Ramesh Patel', role:'Electrician', city:'Bengaluru', exp:'8 yrs', rating:4.7, base:249, phone:'919900112233', skills:['Wiring','Lighting']},
  {id:2, init:'SV', name:'Suresh Verma', role:'Plumber', city:'Lucknow', exp:'5 yrs', rating:4.9, base:219, phone:'919900334455', skills:['Pipes','Bathroom']},
  {id:3, init:'AS', name:'Amit Singh', role:'Carpenter', city:'Jaipur', exp:'12 yrs', rating:4.8, base:299, phone:'919900556677', skills:['Furniture','Doors']},
  {id:4, init:'VK', name:'Vijay Kumar', role:'Painter', city:'Hyderabad', exp:'6 yrs', rating:4.6, base:229, phone:'919900778899', skills:['Painting','POP']},
  {id:5, init:'MR', name:'Mohammed Rizwan', role:'Mason', city:'Ahmedabad', exp:'10 yrs', rating:4.7, base:199, phone:'919901112233', skills:['Brickwork','Plaster']}
];

let JOBS = [
  {id:101, title:'EV Scooter not charging', customer:'Asha R.', pin:'560076', range:'₹350–500', bidders:[{tech:'Ramesh Patel',price:430},{tech:'Suresh Verma',price:420}]},
  {id:102, title:'AC not cooling', customer:'Vikram S.', pin:'400001', range:'₹600–900', bidders:[{tech:'Amit Singh',price:700}]},
  {id:103, title:'Washing machine noisy', customer:'Neha M.', pin:'500032', range:'₹450–650', bidders:[]},
];

/* state */
const state = {
  wallet: Number(localStorage.getItem('lc_wallet') || 0)
};

/* helpers */
function $(sel){ return document.querySelector(sel) }
function $all(sel){ return Array.from(document.querySelectorAll(sel)) }

/* render service carousel */
const services = ['Mason','Carpenter','Electrician','Plumber','Welder','Painter','Bar Bender','Scaffolder','Heavy machinery','Construction'];
function renderServices(){
  const track = $('#serviceTrack');
  track.innerHTML = '';
  services.forEach(s=>{
    const b = document.createElement('button');
    b.className = 'service-btn';
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted)"/></svg><small>${s}</small>`;
    b.addEventListener('click', ()=> { $('#q').value = s; applyFilters(); });
    track.appendChild(b);
  });
}

/* render technicians into live panel and full list */
function renderTechRow(t){
  const row = document.createElement('div');
  row.className = 'tech-row';
  row.setAttribute('data-id', t.id);
  row.innerHTML = `
    <div class="tech-avatar">${t.init}</div>
    <div class="tech-main">
      <div class="tech-name">${t.name}</div>
      <div class="tech-sub">${t.role} • ${t.city} • ${t.exp}</div>
      <div class="tech-tags">${t.skills.map(k=>`<span class="tag">${k}</span>`).join('')}</div>
    </div>
    <div class="tech-right">
      <div class="rating-pill">${t.rating}★</div>
      <button class="btn whatsapp" data-id="${t.id}" title="WhatsApp ${t.name}">WhatsApp</button>
    </div>`;
  // click to open profile
  row.addEventListener('click', (e)=> {
    if(e.target.closest('.btn.whatsapp')) return;
    openProfile(t.id);
  });
  // whatsapp click
  row.querySelector('.btn.whatsapp').addEventListener('click', (ev) => {
    ev.stopPropagation();
    startWhatsApp(t.id);
  });
  return row;
}
function renderTechList(list = TECHS){
  const liveBox = $('#liveTechBox');
  const fullList = $('#techList');
  liveBox.innerHTML = '';
  fullList.innerHTML = '';
  list.forEach(t => {
    liveBox.appendChild(renderTechRow(t));
    fullList.appendChild(renderTechRow(t).cloneNode(true));
  });
}

/* render featured */
function renderFeatured(){
  const f = $('#featured');
  f.innerHTML = '';
  const picks = TECHS.slice(0,3);
  picks.forEach(t=>{
    const card = document.createElement('div'); card.className = 'featured-card';
    card.innerHTML = `<strong>${t.role}</strong><div class="muted">${t.rating} • ${t.exp}</div>`;
    f.appendChild(card);
  });
}

/* render jobs (live & full list) */
function buildJobCard(j){
  const node = document.createElement('div'); node.className = 'job-row';
  node.innerHTML = `
    <div class="job-left">
      <div class="job-title">${j.title}</div>
      <div class="job-meta muted">${j.customer} • ${j.pin}</div>
    </div>
    <div class="job-right">
      <div class="price-badge">${j.range}</div>
      <button class="bids-btn" data-id="${j.id}">${j.bidders.length} Bids</button>
    </div>
  `;
  // attach handler to toggle bidders
  node.querySelector('.bids-btn').addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleBidders(j.id, node);
  });
  return node;
}
function renderJobLists(){
  const liveJobBox = $('#liveJobBox');
  const jobList = $('#jobList');
  liveJobBox.innerHTML = '';
  jobList.innerHTML = '';
  JOBS.forEach(j=>{
    liveJobBox.appendChild(buildJobCard(j));
    jobList.appendChild(buildJobCard(j).cloneNode(true));
    // add expanded bidders area under jobList
    const biddersArea = document.createElement('div'); biddersArea.className = 'bidders-list'; biddersArea.id = 'bidders-' + j.id;
    biddersArea.innerHTML = j.bidders.map(b => `<div class="bid-row"><div>${b.tech}</div><div class="muted">₹${b.price} <button class="btn-ghost accept-btn" data-job="${j.id}" data-tech="${b.tech}" data-price="${b.price}">Accept</button></div></div>`).join('') || '<div class="muted">No bids yet</div>';
    jobList.appendChild(biddersArea);
  });
  // attach accept handlers
  $all('.accept-btn').forEach(b => b.addEventListener('click', (e) => {
    const jid = b.getAttribute('data-job'), tech = b.getAttribute('data-tech'), price = b.getAttribute('data-price');
    acceptBid(jid, tech, price);
  }));
}

/* toggle bidders area */
function toggleBidders(id, jobNode){
  const area = document.getElementById('bidders-'+id);
  if(!area) return;
  const open = area.style.display === 'block';
  // close others
  $all('.bidders-list').forEach(a=> a.style.display = 'none');
  area.style.display = open ? 'none' : 'block';
  // smooth scroll into view
  if(!open) area.scrollIntoView({behavior:'smooth', block:'center'});
}

/* accept bid demo */
function acceptBid(jobId, tech, price){
  if(!confirm(`Accept ${tech} for job ${jobId} at ₹${price}?`)) return;
  alert(`Accepted ${tech} for job ${jobId} (demo).`);
  // real implementation: call backend and update UI
}

/* profile modal open */
function openProfile(id){
  const t = TECHS.find(x => x.id === Number(id));
  if(!t) return;
  $('#modalAvatar').textContent = t.init;
  $('#modalName').textContent = t.name;
  $('#modalRole').textContent = `${t.role} • ${t.city}`;
  $('#modalExp').textContent = t.exp;
  $('#modalBase').textContent = '₹' + t.base;
  $('#modalRating').textContent = t.rating + '★';
  $('#modalSkills').textContent = t.skills.join(' • ');
  $('#modalBio').textContent = `${t.name} — experienced ${t.role} with skills in ${t.skills.join(', ')}. Verified on LabourConnect.`;
  // gallery (placeholder)
  $('#modalGallery').innerHTML = '';
  for(let i=0;i<3;i++){
    const img = document.createElement('img'); img.src = `https://picsum.photos/seed/${t.init}${i}/300/180`; $('#modalGallery').appendChild(img);
  }
  // modal whatsapp binding
  $('#modalWhatsapp').onclick = () => startWhatsApp(t.id);
  // show modal
  $('#profileModal').style.display = 'flex';
  $('#profileModal').setAttribute('aria-hidden','false');
}
$('#modalClose').addEventListener('click', ()=> {
  $('#profileModal').style.display = 'none';
  $('#profileModal').setAttribute('aria-hidden','true');
});

/* wallet + whatsapp gating */
function changeWallet(amount){
  state.wallet = amount;
  localStorage.setItem('lc_wallet', String(state.wallet));
  $('#walletAmt').textContent = '₹' + state.wallet;
}
$('#add50Btn').addEventListener('click', ()=> { changeWallet(state.wallet + 50); alert('Added ₹50 (demo)'); });
$('#addFundsBtn').addEventListener('click', ()=> { changeWallet(state.wallet + 100); alert('Added ₹100 (demo)'); });
$('#clearWalletBtn').addEventListener('click', ()=> { changeWallet(0); alert('Wallet cleared'); });

function startWhatsApp(id){
  const t = TECHS.find(x => x.id === Number(id));
  if(!t) return;
  if(state.wallet < 10){
    if(confirm('Contact requires minimum ₹10 wallet balance. Add ₹50 now?')){
      changeWallet(state.wallet + 50);
      window.open(`https://wa.me/${t.phone}?text=${encodeURIComponent('Hi '+t.name+', I found your profile on LabourConnect and need service.')}`, '_blank');
    }
    return;
  }
  // open whatsapp link
  window.open(`https://wa.me/${t.phone}?text=${encodeURIComponent('Hi '+t.name+', I found your profile on LabourConnect and need service.')}`, '_blank');
}

/* filters */
function applyFilters(){
  const q = $('#q').value.trim().toLowerCase();
  const pin = $('#pin').value.trim();
  const city = $('#city').value.trim().toLowerCase();
  const cat = $('#category').value.trim().toLowerCase();
  let filtered = TECHS.slice();
  if(q) filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.skills.join(' ').toLowerCase().includes(q));
  if(city) filtered = filtered.filter(t => t.city.toLowerCase() === city);
  // pin & category demo: no mapping -> ignored
  renderTechList(filtered);
}
$('#filterBtn').addEventListener('click', applyFilters);
$('#resetBtn').addEventListener('click', ()=> { $('#q').value=''; $('#pin').value=''; $('#city').value=''; $('#category').value=''; renderTechList(TECHS); });

/* realtime simulation: events and feed */
function simulateRealtime(){
  const chance = Math.random();
  if(chance < 0.6){
    // new bid on a random job
    const j = JOBS[Math.floor(Math.random()*JOBS.length)];
    const t = TECHS[Math.floor(Math.random()*TECHS.length)];
    const price = 300 + Math.floor(Math.random()*600);
    j.bidders.push({tech: t.name, price});
    $('#liveJobStatus').textContent = `${t.name} placed a bid ₹${price} on "${j.title}"`;
    renderJobLists();
  } else {
    const t = TECHS[Math.floor(Math.random()*TECHS.length)];
    $('#liveTechStatus').textContent = `${t.name} is now online (available)`;
    // small pulse on tech item
    const node = $all('.tech-row').find(n=> n.textContent.includes(t.name));
    if(node){ node.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'}], {duration:400, direction:'alternate'}); }
  }
}

/* init */
function init(){
  changeWallet(state.wallet);
  renderServices();
  renderTechList(TECHS);
  renderFeatured();
  renderJobLists();
  // live panels initial render
  renderTechList(TECHS);
  renderJobLists();
  // simulate realtime every 7-10s
  setInterval(simulateRealtime, 7000 + Math.floor(Math.random()*3000));
}
function renderServices(){ renderServices = () => {}; } // placeholder to avoid lint
init();
