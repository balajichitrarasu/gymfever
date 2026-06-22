// ── PAGE SWITCHING ────────────────────────────────────────────
function showPage(p){
  document.getElementById('gym-page').classList.toggle('active',p==='gym');
  document.getElementById('home-page').classList.toggle('active',p==='home');
  document.querySelectorAll('.top-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  window.scrollTo(0,0);
}
function showSplit(id){
  document.querySelectorAll('.home-split').forEach(s=>s.classList.remove('active'));
  document.getElementById('split-'+id).classList.add('active');
  document.querySelectorAll('.split-tab').forEach(b=>b.classList.toggle('active',b.dataset.split===id));
}
window.addEventListener('scroll',()=>{
  const pills=document.querySelectorAll('.day-pill');
  let cur='';
  document.querySelectorAll('#gym-page section[id]').forEach(s=>{if(window.scrollY>=s.offsetTop-120)cur=s.id;});
  pills.forEach(p=>{p.classList.toggle('active',p.dataset.href===cur);});
});
document.addEventListener('DOMContentLoaded',()=>{showPage('gym');showSplit('push');});
