/* auth.js - Mock authentication management and session handling
   Replace the mocks with Firebase or custom OTP endpoints in production.
*/

// returns user object or null
function getCurrentUser(){
  return JSON.parse(localStorage.getItem('lc_user') || 'null');
}

function requireAuth(){
  const u = getCurrentUser();
  if(!u){
    alert('Login required.');
    location.href = 'login.html';
    return null;
  }
  return u;
}

function logout(){
  localStorage.removeItem('lc_token');
  localStorage.removeItem('lc_user');
  location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const logoutBtn = document.getElementById('btn-logout');
  if(logoutBtn) logoutBtn.addEventListener('click', logout);
});
