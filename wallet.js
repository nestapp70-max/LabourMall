/* wallet.js - simple wallet logic & subscription gating */
(function(){
  const MIN_CHAT = 10;
  function getUser(){
    return JSON.parse(localStorage.getItem('lc_user') || 'null');
  }
  function saveUser(user){ localStorage.setItem('lc_user', JSON.stringify(user)); }

  function getBalance(){
    const u = getUser();
    return u ? Number(u.balance || 0) : 0;
  }

  window.updateWalletUI = function(){
    const bal = getBalance();
    const el = document.getElementById('walletBalance');
    if(el) el.textContent = lcUtils.formatRupee(bal);
    // WhatsApp chat gating example
    if(bal < MIN_CHAT){
      // disable chat buttons
      document.querySelectorAll('.whatsapp-btn').forEach(b=> b.disabled = true);
    }
  };

  window.showWalletModal = function(){
    document.getElementById('walletModal').classList.remove('hidden');
  };

  // payment simulation
  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'walletPay'){
      const amount = Number(document.getElementById('walletAmount').value || 0);
      if(!amount || amount < 10) return alert('Minimum top-up ₹10');
      // simulate payment success
      const user = getUser() || { balance: 0, name: '' };
      user.balance = (Number(user.balance || 0) + amount);
      saveUser(user);
      alert('Payment successful (demo). ₹' + amount + ' added.');
      updateWalletUI();
      // close modal
      document.getElementById('walletModal').classList.add('hidden');
    }
  });

  // top-level exported functions
  window.wallet = {
    addMoney: function(amount){
      const user = getUser() || {};
      user.balance = (Number(user.balance || 0) + Number(amount));
      saveUser(user);
      updateWalletUI();
    },
    getBalance,
    MIN_CHAT
  };

  // init
  document.addEventListener('DOMContentLoaded', updateWalletUI);
})();
