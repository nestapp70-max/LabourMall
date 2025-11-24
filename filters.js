/* filters.js - filtering and UI interactions for dashboard */
document.addEventListener('DOMContentLoaded', function(){
  // fill categories
  populateCategorySelect(document.getElementById('jobCategorySelect'));
  populateCategorySelect(document.getElementById('pageCategory'));

  // render category slider
  const track = document.getElementById('categoryTrack');
  const categories = window.CATEGORIES || [];
  categories.forEach(cat=>{
    const el = document.createElement('button');
    el.className = 'pill';
    el.textContent = cat;
    el.addEventListener('click', ()=> filterByCategory(cat));
    track.appendChild(el);
  });

  document.getElementById('catPrev').addEventListener('click', ()=> track.scrollBy({left:-220,behavior:'smooth'}));
  document.getElementById('catNext').addEventListener('click', ()=> track.scrollBy({left:220,behavior:'smooth'}));

  // city filter
  const techs = JSON.parse(localStorage.getItem('lc_techs') || '[]');
  const cities = Array.from(new Set(techs.map(t=>t.city))).filter(Boolean);
  const cityEl = document.getElementById('filterCity');
  if(cityEl){
    cities.forEach(c=> cityEl.appendChild(new Option(c,c)));
    cityEl.addEventListener('change', ()=> renderTechs());
  }

  // search
  const search = document.getElementById('searchTech');
  if(search) search.addEventListener('input', ()=> renderTechs());

  // listen to job updates (real-time simulation)
  window.addEventListener('lc:job:updated', function(e){
    renderJobs();
  });
  window.addEventListener('lc:job:accepted', function(e){
    renderJobs();
  });

  // initial render
  renderTechs();
  renderJobs();
  renderFeatured();
});

// filter functions
function filterByCategory(cat){
  // quick visual highlight — future: filter techs by tags
  alert('Filtering by category: ' + cat + ' (demo).');
}

/* render technicians list */
function renderTechs(){
  const list = document.getElementById('techList');
  if(!list) return;
  const techs = JSON.parse(localStorage.getItem('lc_techs') || '[]');
  const q = document.getElementById('searchTech').value.toLowerCase();
  const city = document.getElementById('filterCity').value;
  const filtered = techs.filter(t=>{
    if(city && t.city !== city) return false;
    if(!q) return true;
    return (t.name + ' ' + t.title + ' ' + (t.skills||[]).join(' ')).toLowerCase().includes(q);
  });

  list.innerHTML = '';
  filtered.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'tech-card-item';
    card.innerHTML = `
      <div class="avatar-sm" style="background:${getGradientFor(t.name)}">${initials(t.name)}</div>
      <div class="info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">${t.name}</div>
            <div class="muted">${t.title} • ${t.city}</div>
          </div>
          <div class="rating-bubble">${t.rating} ★</div>
        </div>
        <div class="tech-meta" style="margin-top:8px">
          <div class="tag">₹${t.base_price}</div>
          ${(t.skills||[]).slice(0,3).map(s=>`<div class="tag">${s}</div>`).join('')}
          <button class="btn whatsapp-btn" onclick='openTechnicianFromList("${t.id}")'>WhatsApp</button>
        </div>
      </div>
    `;
    card.addEventListener('click', function(e){
      // open modal
      e.stopPropagation();
      const techs = JSON.parse(localStorage.getItem('lc_techs') || '[]');
      const matched = techs.find(x=>x.id === t.id);
      openTechnicianModal(matched);
    });
    list.appendChild(card);
  });
  document.getElementById('techCount').textContent = filtered.length;
}

/* render jobs */
function renderJobs(){
  const jobList = document.getElementById('jobList');
  if(!jobList) return;
  const jobs = JSON.parse(localStorage.getItem('lc_jobs') || '[]');
  jobList.innerHTML = '';
  jobs.forEach(job=>{
    const jcard = document.createElement('div');
    jcard.className = 'job-card';
    jcard.innerHTML = `
      <div class="job-header">
        <div>
          <div style="font-weight:700">${job.title}</div>
          <div class="muted">${job.city || ''} • PIN ${job.pincode || ''}</div>
        </div>
        <div class="job-pills">
          <div class="pill">Budget ₹${job.budget_to || job.budget_from || '—'}</div>
          <div class="pill"><button class="btn outline" onclick="toggleBids('${job.id}', event)">${(job.bids||[]).length} bids</button></div>
        </div>
      </div>
      <div class="job-desc muted" style="margin-top:8px">${job.description || ''}</div>
      <div class="bids hidden" id="bids-${job.id}" style="margin-top:10px">
        ${ (job.bids || []).map(b => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,0.01)">
            <div><strong>${b.tech_name}</strong><div class="muted">${new Date(b.created_at).toLocaleString()}</div></div>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="tag">₹${b.amount}</div>
              <button class="btn primary" onclick="acceptBidConfirmed('${job.id}','${b.id}', event)">Accept</button>
            </div>
          </div>`).join('') }
      </div>
    `;
    jobList.appendChild(jcard);
  });
}

function toggleBids(jobId, ev){
  ev && ev.stopPropagation();
  const el = document.getElementById('bids-' + jobId);
  if(!el) return;
  el.classList.toggle('hidden');
}

function acceptBidConfirmed(jobId,bidId, ev){
  ev && ev.stopPropagation();
  if(confirm('Accept this bid?')) jobsAPI.acceptBid(jobId,bidId);
}

/* featured carousel */
function renderFeatured(){
  const wrap = document.getElementById('featuredCarousel');
  if(!wrap) return;
  wrap.innerHTML = '';
  const techs = JSON.parse(localStorage.getItem('lc_techs') || '[]');
  techs.slice(0,6).forEach((t,i)=>{
    const card = document.createElement('div');
    card.className = 'featured-item';
    if(i===0) card.classList.add('active');
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <div class="avatar-sm" style="background:${getGradientFor(t.name)}">${initials(t.name)}</div>
        <div>
          <div style="font-weight:700">${t.name}</div>
          <div class="muted">${t.title} • ${t.city}</div>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });

  // auto-slide
  let idx=0;
  setInterval(()=> {
    const items = document.querySelectorAll('.featured-item');
    if(!items.length) return;
    items.forEach(it=> it.classList.remove('active'));
    idx = (idx + 1) % items.length;
    items[idx].classList.add('active');
  }, 4200);
}

/* small helpers */
function getGradientFor(seed){
  const colors = ['#00D98A','#FFB14A','#4DA8FF','#FF6B6B'];
  const n = seed.split('').reduce((a,c)=> a + c.charCodeAt(0),0);
  return `linear-gradient(135deg, ${colors[n % colors.length]}, rgba(255,255,255,0.03))`;
}
