/* jobs.js - job posting, bids and real-time simulation
   Storage: uses localStorage 'lc_jobs' array and 'lc_techs' list for demo.
*/

(function(){
  const STORAGE_JOBS = 'lc_jobs';
  const STORAGE_TECHS = 'lc_techs';

  // sample categories
  window.CATEGORIES = ['Mason','Carpenter','Electrician','Plumber','Welder','Tile','Painter','Bar','Scaffolder','Heavy','Construction'];

  // create demo techs if not present
  function seedTechs(){
    if(localStorage.getItem(STORAGE_TECHS)) return;
    const demo = [
      { id:'t1', name:'Vijay Kumar', title:'Electrician', city:'Mumbai', pincode:'400001', experience:6, base_price:500, skills:['Wiring','Switches'], rating:4.8, phone:'+919900000001', gallery:['Job A','Job B'] },
      { id:'t2', name:'Ravi Sharma', title:'Plumber', city:'Mumbai', pincode:'400002', experience:8, base_price:700, skills:['Leak fixing','Pipes'], rating:4.6, phone:'+919900000002', gallery:['P1','P2'] },
      { id:'t3', name:'Suresh Patel', title:'Carpenter', city:'Ahmedabad', pincode:'380001', experience:10, base_price:900, skills:['Doors','Furniture'], rating:4.9, phone:'+919900000003', gallery:['C1'] },
      // more demo items
    ];
    localStorage.setItem(STORAGE_TECHS, JSON.stringify(demo));
  }

  function getTechs(){
    return JSON.parse(localStorage.getItem(STORAGE_TECHS) || '[]');
  }

  function getJobs(){
    return JSON.parse(localStorage.getItem(STORAGE_JOBS) || '[]');
  }
  function saveJobs(jobs){ localStorage.setItem(STORAGE_JOBS, JSON.stringify(jobs)); }

  window.populateCategorySelect = function(selectEl){
    if(!selectEl) return;
    selectEl.innerHTML = '<option value="">Select</option>' + window.CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');
  };

  // add a job
  window.addJob = function(job){
    const jobs = getJobs();
    jobs.unshift(job);
    saveJobs(jobs);
    // mock: broadcast a random bid within 3-10 seconds
    setTimeout(()=> mockBid(job.id), 2000 + Math.random()*4000);
  };

  // mock a bid
  function mockBid(jobId){
    const jobs = getJobs();
    const job = jobs.find(j=>j.id === jobId);
    if(!job) return;
    const techs = getTechs();
    const tech = techs[Math.floor(Math.random()*techs.length)];
    const amount = Math.max(job.budget_from || job.budget_to*0.6 || 200, Math.round((tech.base_price || 400) * (0.9 + Math.random()*0.6)));
    const bid = { id:'b_' + Date.now(), tech_id: tech.id, tech_name: tech.name, amount, created_at: Date.now() };
    job.bids = job.bids || [];
    job.bids.push(bid);
    saveJobs(jobs);
    // dispatch a custom event for real-time UI
    window.dispatchEvent(new CustomEvent('lc:job:updated', { detail: job }));
    console.info('Mock bid added', bid);
  }

  // accept bid
  window.acceptBid = function(jobId,bidId){
    const jobs = getJobs();
    const job = jobs.find(j=>j.id === jobId);
    if(!job) return alert('Job not found');
    const bid = (job.bids || []).find(b=>b.id===bidId);
    if(!bid) return alert('Bid not found');
    // In real: create order, charge wallet, send notifications
    alert('Bid accepted: ' + bid.tech_name + ' — ₹' + bid.amount);
    // mark job as assigned
    job.assigned = { bidId, tech: bid.tech_name, at: Date.now() };
    saveJobs(jobs);
    window.dispatchEvent(new CustomEvent('lc:job:accepted', { detail: { job, bid } }));
  };

  // public getters for other modules
  window.jobsAPI = {
    getJobs,
    addJob,
    mockBid,
    acceptBid
  };

  // seed
  seedTechs();

})();
