// main.js - simple client-side helpers for static multi-page site
document.addEventListener('DOMContentLoaded', function(){
  // add active class to nav links
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('a[data-link]').forEach(a=>{
    if(a.getAttribute('href').endsWith(path)) a.classList.add('active');
  });

  // login form simulation - store "user" in localStorage when login succeeds
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const email = document.getElementById('email').value;
      // naive "auth"
      if(email){
        localStorage.setItem('lc_user', JSON.stringify({email: email, name: email.split('@')[0]}));
        alert('Login successful — redirecting to dashboard');
        location.href = 'dashboard.html';
      } else {
        alert('Enter email to login');
      }
    });
  }

  // protect dashboard
  if(location.pathname.endsWith('dashboard.html')){
    const user = localStorage.getItem('lc_user');
    if(!user){
      alert('Please login first');
      location.href = 'login.html';
    } else {
      const u = JSON.parse(user);
      const el = document.getElementById('dashboard-user');
      if(el) el.textContent = u.name;
      // load some demo worker list
      const list = document.getElementById('workers-list');
      if(list){
        const workers = [
          {id:1,name:'Ramesh Kumar',role:'Plumber',city:'Delhi'},
          {id:2,name:'Sita Devi',role:'Electrician',city:'Mumbai'},
          {id:3,name:'Arjun Singh',role:'Carpenter',city:'Bengaluru'}
        ];
        workers.forEach(w=>{
          const li = document.createElement('div');
          li.className='card';
          li.innerHTML = `<div class="profile"><div class="avatar">${w.name.split(' ')[0][0]}</div>
            <div><strong>${w.name}</strong><div class="small">${w.role} — ${w.city}</div></div></div>
            <div style="margin-top:8px"><a class="button" href="worker.html?id=${w.id}">View profile</a></div>`;
          list.appendChild(li);
        });
      }
    }
  }

  // on worker.html, show data according to query param
  if(location.pathname.endsWith('worker.html')){
    const qp = new URLSearchParams(location.search);
    const id = qp.get('id') || '1';
    const profiles = {
      '1': {name:'Ramesh Kumar', role:'Plumber', city:'Delhi', about:'10 years experience in residential plumbing, pipelines, fittings.'},
      '2': {name:'Sita Devi', role:'Electrician', city:'Mumbai', about:'Skilled in domestic wiring and commercial lighting.'},
      '3': {name:'Arjun Singh', role:'Carpenter', city:'Bengaluru', about:'Expert in furniture making and repairs.'}
    };
    const p = profiles[id] || profiles['1'];
    document.getElementById('w-name').textContent = p.name;
    document.getElementById('w-role').textContent = p.role;
    document.getElementById('w-city').textContent = p.city;
    document.getElementById('w-about').textContent = p.about;
  }

  // blog list load
  if(location.pathname.endsWith('blog.html')){
    fetch('assets/data/blog.json').then(r=>r.json()).then(data=>{
      const out = document.getElementById('blog-list');
      data.forEach(b=>{
        const div = document.createElement('div');
        div.className='card list-item';
        div.innerHTML = `<img src="assets/img/blog-${b.id}.jpg" alt=""><div><strong>${b.title}</strong><div class="small">${b.excerpt}</div><div style="margin-top:8px"><a class="button" href="blog-post.html?id=${b.id}">Read</a></div></div>`;
        out.appendChild(div);
      });
    });
  }

});