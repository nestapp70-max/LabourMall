// assets/js/dashboard.js
// Simulated data and behaviors: filtering, modal, wallet, whatsapp availability, bidding box

// ------------------------ Demo data ------------------------
const WORKERS = [
  {id:1,name:'Ramesh Patel',role:'Mason',city:'Ahmedabad',pin:'380001',rating:4.7, base:199, skills:['Masonry','Brickwork','Tile'], years:10, gallery:['assets/img/blog-1.jpg','assets/img/blog-2.jpg']},
  {id:2,name:'Suresh Verma',role:'Plumber',city:'Lucknow',pin:'226001',rating:4.9, base:249, skills:['Pipes','Bathroom'], years:5, gallery:['assets/img/blog-2.jpg','assets/img/blog-3.jpg']},
  {id:3,name:'Amit Singh',role:'Carpenter',city:'Jaipur',pin:'302001',rating:4.8, base:299, skills:['Furniture','Doors'], years:12, gallery:['assets/img/blog-3.jpg']},
  {id:4,name:'Vijay Kumar',role:'Electrician',city:'Bengaluru',pin:'560001',rating:4.6, base:249, skills:['Wiring','Lighting'], years:6, gallery:['assets/img/blog-1.jpg']},
  {id:5,name:'Mohammed Rizwan',role:'Painter',city:'Hyderabad',pin:'500001',rating:4.7, base:219, skills:['House Painting','POP'], years:9, gallery:[]},
];

// Sample jobs (customer box)
const JOBS = [
  {id:1,title:'EV Scooter not charging', customer:'Asha R.', pin:'560076', budget:'₹350–500', bids:3},
  {id:2,title:'AC not cooling', customer:'Vikram S.', pin:'400001', budget:'₹600–900', bids:2},
  {id:3,title:'Washing machine noisy', customer:'Neha M.', pin:'500032', budget:'₹450–650', bids:1},
  {id:4,title:'Solar inverter replacement', customer:'Ramesh K.', pin:'560003', budget:'₹700–1000', bids:1},
  {id:5,title:'Fridge gas refill', customer:'Pooja T.', pin:'600055', budget:'₹750–1100', bids:2},
];

// ------------------------ state ------------------------
let state = {
  q: '',
  pin: '',
  city: '',
  category: '',
  wallet: Number(localStorage.getItem('lc_wallet') || 0),
  confirmationModal: null
};

// ------------------------ DOM refs ------------------------
const workersContainer = document.getElementById('workersContainer');
const serviceTrack = document.getElementById('serviceTrack');
const jobsList = document.getElementById('jobsList');
const walletAmt = document.getElementById('walletAmt');

// ------------------------ init ------------------------
document.addEventListener('DOMContentLoaded', ()=>{
  walletAmt.textContent = `₹${state.wallet}`;
  renderServices();
  renderWorkers(WORKERS);
  renderJobs();
  bindFilters();
  bindWalletButtons();
});

// ------------------------ render services (quick slider) ------------------------
function renderServices(){
  const core = ['Mason','Carpenter','Electrician','Plumber','Welder','Painter','Bar Bender','Scaffolder','Heavy machinery'];
  serviceTrack.innerHTML = '';
  core.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'service';
    el.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" style="color:var(--muted)"><path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><small>${s}</small>`;
    el.addEventListener('click', ()=>{ document.getElementById('q').value = s; applyFilters(); });
    serviceTrack.appendChild(el);
  });
}

// ------------------------ render worker list ------------------------
function renderWorkers(list){
  workersContainer.innerHTML = '';
  if(list.length === 0){
    workersContainer.innerHTML = '<div class="small">No technicians found for these filters.</div>';
    return;
  }
  list.forEach(w=>{
    const div = document.createElement('div');
    div.className = 'worker-card';
    div.innerHTML = `
      <div class="worker-avatar">${initials(w.name)}</div>
      <div class="worker-meta">
        <h4>${w.name}</h4>
        <div class="small">${w.role} • ${w.city} • ${w.years} yrs</div>
        <div class="worker-tags">
           <span class="tag">Base ₹${w.base}</span>
           ${w.skills.slice(0,3).map(x=>`<span class="tag">${x}</span>`).join('')}
        </div>
      </div>
      <div class="worker-right">
        <div class="rating-bubble">${w.rating} ★</div>
        <div><button class="whatsapp-btn" data-id="${w.id}">WhatsApp</button></div>
      </div>
    `;
    // click to open profile
    div.addEventListener('click', (e)=>{
      // if whatsapp button clicked, let that handler run
      if(e.target.closest('.whatsapp-btn')) return;
      openProfileModal(w.id);
    });
    // whatsapp button handler (separate)
    div.querySelector('.whatsapp-btn').addEventListener('click', (ev)=>{
      ev.stopPropagation();
      startWhatsAppChat(w.id);
    });
    workersContainer.appendChild(div);
  });
}

// ------------------------ render jobs list ------------------------
function renderJobs(){
  jobsList.innerHTML = '';
  JOBS.forEach(j=>{
    const item = document.createElement('div');
    item.className = 'job-item';
    item.innerHTML = `<div class="job-left">
                        <strong>${j.title}</strong>
                        <div class="small">${j.customer} · PIN ${j.pin}</div>
                      </div>
                      <div style="text-align:right">
                        <div class="badge" style="background:linear-gradient(90deg,#0fb8a0,#07a98f);color:#012">${j.budget}</div>
                        <div style="margin-top:8px"><button class="badge" data-id="${j.id}">${j.bids} Bids</button></div>
                      </div>`;
    jobsList.appendChild(item);
  });
}

// ------------------------ filter binding ------------------------
function bindFilters(){
  document.getElementById('filterBtn').addEventListener('click', applyFilters);
  document.getElementById('q').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') applyFilters(); });
  document.getElementById('pin').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') applyFilters(); });
  document.getElementById('city').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') applyFilters(); });
  document.getElementById('category').addEventListener('change', applyFilters);
}

function applyFilters(){
  const q = document.getElementById('q').value.trim().toLowerCase();
  const pin = document.getElementById('pin').value.trim();
  const city = document.getElementById('city').value.trim().toLowerCase();
  const category = document.getElementById('category').value;

  const filtered = WORKERS.filter(w=>{
    if(q){
      const inName = w.name.toLowerCase().includes(q);
      const inRole = w.role.toLowerCase().includes(q);
      const inSkills = w.skills.join(' ').toLowerCase().includes(q);
      if(!(inName || inRole || inSkills)) return false;
    }
    if(pin && w.pin !== pin) return false;
    if(city && w.city.toLowerCase() !== city) return false;
    // category is not strictly mapped, so ignore or you can add mapping
    return true;
  });
  renderWorkers(filtered);
}

// ------------------------ modal (profile) ------------------------
function openProfileModal(id){
  const worker = WORKERS.find(w=>w.id===id);
  if(!worker) return;
  const root = document.getElementById('profileModalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBack">
      <div class="modal" role="dialog">
        <div class="left">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:72px;height:72px;border-radius:12px;background:linear-gradient(135deg,#05c0a0,#0db5b0);display:flex;align-items:center;justify-content:center;font-weight:800;color:#042;font-size:26px">${initials(worker.name)}</div>
            <div>
              <h3 style="margin:0">${worker.name}</h3>
              <div class="small">${worker.role} • ${worker.city}</div>
              <div class="small">Experience: ${worker.years} yrs</div>
            </div>
          </div>
          <div style="margin-top:12px">
            <strong>Skills</strong>
            <div style="margin-top:8px">${worker.skills.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
          </div>

          <div style="margin-top:12px">
            <strong>Base price</strong>
            <div class="small">₹${worker.base}</div>
          </div>

          <div style="margin-top:12px">
            <button class="whatsapp-btn" id="modalWhatsappBtn">WhatsApp</button>
            <a class="btn" href="javascript:closeModal()" style="margin-left:8px">Close</a>
          </div>
        </div>

        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>Portfolio & Photos</strong><div class="small">Work gallery & certifications</div></div>
            <div class="rating-bubble">${worker.rating} ★</div>
          </div>

          <p style="margin-top:12px">${worker.name} has ${worker.years} years of experience in ${worker.role}. ${worker.skills.join(', ')}.</p>

          <div class="gallery" id="modalGallery"></div>

          <div style="margin-top:14px" id="modalActions"></div>
        </div>
      </div>
    </div>
  `;
  // populate gallery
  const g = document.getElementById('modalGallery');
  g.innerHTML = '';
  (worker.gallery.length? worker.gallery : ['assets/img/blog-1.jpg']).forEach(src=>{
    const img = document.createElement('img'); img.src = src; g.appendChild(img);
  });

  // whatsapp handler
  document.getElementById('modalWhatsappBtn').addEventListener('click', ()=>{
    startWhatsAppChat(worker.id);
  });

  // close on backdrop click
  document.getElementById('modalBack').addEventListener('click', (e)=>{
    if(e.target.id === 'modalBack') closeModal();
  });
}

function closeModal(){
  const root = document.getElementById('profileModalRoot');
  root.innerHTML = '';
}

// ------------------------ whatsapp & wallet logic ------------------------
function startWhatsAppChat(workerId){
  // require minimum wallet balance >= 10
  if(state.wallet < 10){
    showSubscriptionPopup();
    return;
  }
  const worker = WORKERS.find(w=>w.id===workerId);
  // open WhatsApp (simulated) — open wa.me link with prefilled text
  const text = encodeURIComponent(`Hi ${worker.name}, I found your profile on LabourConnect. Are you available?`);
  const url = `https://wa.me/?text=${text}`;
  window.open(url,'_blank');
}

// subscription popup
function showSubscriptionPopup(){
  const root = document.getElementById('profileModalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="subscribeBack">
      <div class="modal" style="width:560px;max-width:95%">
        <div style="flex:1">
          <h3>Wallet balance low</h3>
          <p class="small">To contact technicians via WhatsApp you need a minimum wallet balance of ₹10. Add funds to continue.</p>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn" id="add10Btn">Add ₹10</button>
            <a class="badge" href="contact.html" id="subsHelp">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('add10Btn').addEventListener('click', ()=>{
    changeWallet(state.wallet + 10);
    closeModal();
  });
  document.getElementById('subscribeBack').addEventListener('click',(e)=>{ if(e.target.id==='subscribeBack') closeModal(); });
}

// ------------------------ wallet helpers ------------------------
function changeWallet(v){
  state.wallet = v;
  localStorage.setItem('lc_wallet', v);
  walletAmt.textContent = `₹${state.wallet}`;
}

// bind demo wallet buttons
function bindWalletButtons(){
  document.getElementById('addFundsBtn').addEventListener('click', ()=>{
    changeWallet(state.wallet + 50);
    alert('Added ₹50 to wallet (demo)');
  });
  document.getElementById('clearWalletBtn').addEventListener('click', ()=>{
    changeWallet(0);
    alert('Wallet cleared');
  });
}

// ------------------------ helpers ------------------------
function initials(name){
  return name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
}
window.initials = initials;
