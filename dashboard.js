/* dashboard.js — interactions specific to dashboard page
   Handles equal-height, real-time status mock, and more
*/
document.addEventListener('DOMContentLoaded', function(){
  // create initial job demo if none
  if(!(localStorage.getItem('lc_jobs'))){
    const sampleJob = {
      id: 'job_' + Date.now(),
      title: 'Fix wiring in 2BHK',
      description: 'Replace switchboard and wiring for a 2BHK apartment.',
      category: 'Electrician',
      budget_from: 1200, budget_to: 3000,
      pincode: '400001',
      city: 'Mumbai',
      created_at: Date.now(),
      bids: []
    };
    localStorage.setItem('lc_jobs', JSON.stringify([sampleJob]));
  }

  // ensure technicians seeded (jobs.js does this)
  // equalize heights after render
  setTimeout(equalizePanels, 500);
  window.addEventListener('resize', equalizePanels);

  // simulate online notifications
  simulateOnlineNotifications();
});

function equalizePanels(){
  const left = document.querySelector('.left-panel');
  const right = document.querySelector('.right-panel');
  if(!left || !right) return;
  const maxh = Math.max(left.offsetHeight, right.offsetHeight);
  left.style.minHeight = maxh + 'px';
  right.style.minHeight = maxh + 'px';
}

/* simulate technicians online statuses */
function simulateOnlineNotifications(){
  const names = ['Vijay Kumar','Ravi Sharma','Suresh Patel','Aparna Das','Manoj Singh'];
  setInterval(()=>{
    const name = names[Math.floor(Math.random()*names.length)];
    showToast(`${name} is now online (available)`);
  }, 6000);
}

/* simple toast */
function showToast(msg){
  const t = document.createElement('div');
  t.className = 'glass-card fade-in';
  t.style.position = 'fixed';
  t.style.right = '18px';
  t.style.bottom = '18px';
  t.style.padding = '12px 16px';
  t.style.borderRadius = '12px';
  t.style.zIndex = 9999;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 3500);
  setTimeout(()=> t.remove(), 4500);
}

/* open tech modal from list by id */
function openTechnicianFromList(id){
  const techs = JSON.parse(localStorage.getItem('lc_techs') || '[]');
  const found = techs.find(t => t.id === id);
  if(found) openTechnicianModal(found);
}
