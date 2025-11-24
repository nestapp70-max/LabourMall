/* modal.js - reusable modal utilities (simple, accessible)
   Use showModal('id') and closeModal('id').
*/
function showModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
  // Focus first input
  setTimeout(()=> {
    const input = el.querySelector('input,button,textarea,select');
    if(input) input.focus();
  }, 120);
}

function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
}

document.addEventListener('click', function(e){
  // close buttons
  if(e.target.matches('[data-close]') || e.target.closest('[data-close]')){
    const modal = e.target.closest('.modal-backdrop');
    if(modal) modal.classList.add('hidden');
  }
  // click outside modal to close
  if(e.target.classList && e.target.classList.contains('modal-backdrop') && !e.target.classList.contains('hidden')){
    e.target.classList.add('hidden');
  }
});

// esc to close any open modal-backdrop
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m=> m.classList.add('hidden'));
  }
});

// modal root used for dynamic modals (profile)
const modalRoot = document.getElementById ? document.getElementById('modal-root') : null;

function openTechnicianModal(tech){
  // create modal markup
  const id = 'modal-tech-' + (tech.id || Math.random().toString(36).slice(2));
  const modalHtml = `
  <div class="modal-backdrop" id="${id}">
    <div class="modal-card glass-card slide-up" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <button class="modal-close" data-close>✕</button>
      <div style="display:flex;gap:16px;align-items:center">
        <div class="avatar-lg neon-ring">${initials(tech.name)}</div>
        <div>
          <h3 id="${id}-title">${tech.name}</h3>
          <div class="muted">${tech.title} • ${tech.experience} yrs • ${tech.city}</div>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:12px;align-items:center">
        <button class="btn whatsapp-btn" onclick="openWhatsApp('${tech.phone || ''}')">WhatsApp</button>
        <button class="btn primary" onclick="hireTech('${tech.id}')">Hire Now</button>
      </div>

      <hr style="margin:14px 0;border:none;border-top:1px solid rgba(255,255,255,0.03)">
      <h4>Gallery</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(tech.gallery || []).map(i=> `<div style="width:120px;height:80px;border-radius:8px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));display:flex;align-items:center;justify-content:center">${i}</div>`).join('')}
      </div>

      <h4 style="margin-top:12px">Services</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(tech.skills||[]).map(s=>`<div class="tag">${s}</div>`).join('')}</div>
      <div style="margin-top:12px"><button class="btn ghost" data-close>Close</button></div>
    </div>
  </div>
  `;
  // append
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  document.body.appendChild(temp.firstElementChild);
}

function initials(name){
  if(!name) return 'NA';
  return name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
}

function openWhatsApp(phone){
  if(!phone) return alert('Phone not available for demo.');
  window.open('https://wa.me/' + phone.replace(/\D/g,''), '_blank');
}

function hireTech(id){
  alert('Hire flow: create order and transfer to onboarding (demo) => ' + id);
  // close all modals
  document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.add('hidden'));
}
