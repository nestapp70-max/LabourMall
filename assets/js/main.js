// assets/js/main.js
document.addEventListener('DOMContentLoaded', function(){
  // Nav active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('a').forEach(a=>{
    if(a.getAttribute('href') && a.getAttribute('href').endsWith(path)){
      a.classList.add('active');
    }
  });

  // Populate services track (icons + titles) - using inline SVGs for lightweight icons
  const services = [
    "Mason (Rajmistri)","Carpenter","Electrician","Plumber","Welder / Fabricator","Tile / Marble Worker",
    "Painter / POP Technician","Bar Bender / Steel Fixer","Scaffolder","Heavy machinery operator",
    "Surveyor helper","Helper / Construction helper","Site cleaner","Material handler","Demolition labour",
    "Concrete mixer helper","Road construction labour","Paver block worker","Machine operator","Packaging worker",
    "Loading/unloading labour","Quality check helper","Production line worker","Warehouse picker/packer",
    "Forklift operator","Assembly worker","Sowing labour","Harvesting labour","Irrigation worker",
    "Fertilizer & pesticide sprayer","Tractor driver","Housemaid","Cook","Babysitter","Elderly caretaker",
    "Driver","Gardner / Mali","Watchman / Security guard","Loaders / unloaders","Event setup labour",
    "Catering workers","Waiters / serving staff","Store helpers","Merchandising helpers","Garbage collection workers",
    "Sweepers","AC technician","CCTV technician","RO technician","Elevator maintenance worker","Solar panel installer",
    "House repair workers","Plastering labour","Pest control workers","Stone quarry workers","Drillers"
  ];

  const track = document.querySelector('.service-track');
  if(track){
    services.forEach((s,i)=>{
      const div = document.createElement('div');
      div.className='service';
      div.innerHTML = svgIcon(i) + `<small>${s}</small>`;
      track.appendChild(div);
    });
  }

  // populate demo workers on dashboard page
  if(document.getElementById('workers-list')){
    const workers = [
      {id:1,name:'Ramesh Patel',role:'Mason',city:'Ahmedabad',rating:4.7},
      {id:2,name:'Suresh Verma',role:'Plumber',city:'Lucknow',rating:4.9},
      {id:3,name:'Amit Singh',role:'Carpenter',city:'Jaipur',rating:4.8},
      {id:4,name:'Vijay Kumar',role:'Electrician',city:'Bengaluru',rating:4.6},
      {id:5,name:'Mohammed Rizwan',role:'Painter',city:'Hyderabad',rating:4.7}
    ];
    const out = document.getElementById('workers-list');
    workers.forEach(w=>{
      const el = document.createElement('div');
      el.className='list-item';
      el.innerHTML = `<div class="avatar">${initials(w.name)}</div>
        <div style="flex:1">
          <strong>${w.name}</strong>
          <div class="info"><small>${w.role} • ${w.city}</small></div>
        </div>
        <div style="text-align:right">
          <div class="badge">${w.rating} ★</div><div style="margin-top:8px"><a class="btn" href="worker.html?id=${w.id}">View</a></div>
        </div>`;
      out.appendChild(el);
    });
  }

  // blog list load if present
  if(document.getElementById('blog-list')){
    fetch('assets/data/blog.json').then(r=>r.json()).then(data=>{
      const out = document.getElementById('blog-list');
      data.forEach(b=>{
        const c = document.createElement('div');
        c.className='card';
        c.style.display='flex'; c.style.gap='12px'; c.style.alignItems='center';
        c.innerHTML = `<div style="width:120px;height:80px;background:#071616;border-radius:8px;flex:0 0 120px"></div>
          <div style="flex:1">
            <strong>${b.title}</strong>
            <div class="small" style="color:var(--muted)">${b.excerpt}</div>
            <div style="margin-top:8px"><a class="btn" href="blog-post.html?id=${b.id}">Read</a></div>
          </div>`;
        out.appendChild(c);
      });
    }).catch(err=>{
      // fallback - static posts if JSON missing
      const out = document.getElementById('blog-list');
      if(out){
        const def = [{id:1,title:'How to hire skilled labour safely',excerpt:'Checklist and red flags'},{id:2,title:'Top skills in demand 2025',excerpt:'Which trades are growing'}];
        def.forEach(b=>{
          const c = document.createElement('div');
          c.className='card';
          c.innerHTML = `<strong>${b.title}</strong><div class="small">${b.excerpt}</div><div style="margin-top:8px"><a class="btn" href="blog-post.html?id=${b.id}">Read</a></div>`;
          out.appendChild(c);
        });
      }
    });
  }

  // worker profile load
  if(document.getElementById('w-name')){
    const qp = new URLSearchParams(location.search);
    const id = qp.get('id') || '1';
    const profiles = {
      '1': {name:'Ramesh Patel', role:'Mason', city:'Ahmedabad', about:'10+ years of experience in residential construction and brickwork.'},
      '2': {name:'Suresh Verma', role:'Plumber', city:'Lucknow', about:'Specialized in piping, leak repairs and bathroom installations.'},
      '3': {name:'Amit Singh', role:'Carpenter', city:'Jaipur', about:'Custom furniture, doors and wood finishing expert.'}
    };
    const p = profiles[id] || profiles['1'];
    document.getElementById('w-name').textContent = p.name;
    document.getElementById('w-role').textContent = p.role;
    document.getElementById('w-city').textContent = p.city;
    document.getElementById('w-about').textContent = p.about;
    document.querySelector('.avatar') && (document.querySelector('.avatar').textContent = p.name.split(' ')[0][0]);
  }

  // login simulation (email or phone)
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const input = document.getElementById('login-input').value.trim();
      if(!input){ alert('Enter email or phone'); return; }
      // store demo user
      const user = {id: Date.now(), name: input.split('@')[0] || input, contact: input};
      localStorage.setItem('lc_user', JSON.stringify(user));
      location.href = 'dashboard.html';
    });
  }

  // simple helper functions
  function initials(name){ return name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase(); }
  window.initials = initials;

  function svgIcon(i){
    // rotate a few icon shapes to appear varied; simple generic symbol using paths
    const icons = [
      `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.4"/><path d="M7 12h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c1-4 6-6 7-6s6 2 7 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
    ];
    return icons[i % icons.length];
  }
});
