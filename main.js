/* main.js
   Global helpers and small initializations
*/
(function(){
  // expose small util to global
  window.lcUtils = {
    formatRupee: (n)=> (n === undefined ? '0' : Number(n).toLocaleString('en-IN')),
    neonGradient: ()=> `linear-gradient(135deg,#00D98A,#4DA8FF)`,
  };

  // quick user load
  window.currentUser = JSON.parse(localStorage.getItem('lc_user') || 'null');

  // Show profile in header when logged in
  function refreshHeader(){
    const btn = document.getElementById('btn-profile');
    if(!btn) return;
    if(window.currentUser){
      btn.textContent = window.currentUser.name || window.currentUser.phone || 'Profile';
    } else {
      btn.textContent = 'Login';
      btn.addEventListener('click', ()=> location.href='login.html');
    }
  }
  refreshHeader();
})();
