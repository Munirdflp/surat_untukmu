(()=>{
const $=id=>document.getElementById(id);
// Low-cost, CSS-animated dust particles. Decorative only; no external assets or network calls.
const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function seedParticles(container,count,seedOffset=0){
 if(!container)return;
 const fragment=document.createDocumentFragment();
 for(let i=0;i<count;i++){
  const n=i+seedOffset+1;
  const particle=document.createElement('span');
  particle.className='light-particle';
  const x=(n*37.7+13.3)%100;
  const y=(n*61.9+7.1)%100;
  const size=2.4+((n*11)%7)*.55;
  const duration=7+((n*7)%9);
  const delay=-((n*5)%17);
  const dx=Math.round(((n*23)%61)-30);
  const dy=Math.round(-8-((n*13)%36));
  particle.style.setProperty('--x',x.toFixed(2)+'%');
  particle.style.setProperty('--y',y.toFixed(2)+'%');
  particle.style.setProperty('--size',size.toFixed(1)+'px');
  particle.style.setProperty('--duration',duration+'s');
  particle.style.setProperty('--delay',delay+'s');
  particle.style.setProperty('--dx',dx+'px');
  particle.style.setProperty('--dy',dy+'px');
  fragment.appendChild(particle);
 }
 container.appendChild(fragment);
}
document.querySelectorAll('.light-particles').forEach((el,i)=>seedParticles(el,i===0?38:58,i*19));
// A very small pointer parallax separates foreground stars from the distant nebula on desktop.
if(window.matchMedia&&window.matchMedia('(pointer:fine)').matches){
 let raf=0,lastX=0,lastY=0;
 window.addEventListener('pointermove',event=>{
  lastX=(event.clientX/window.innerWidth-.5)*2;
  lastY=(event.clientY/window.innerHeight-.5)*2;
  if(raf)return;
  raf=window.requestAnimationFrame(()=>{
   document.querySelectorAll('.cosmic-depth:not(.intro-depth) .depth-stars').forEach((layer,i)=>{
    const factor=[1.3,3.2,6.2][i]||2;
    layer.style.translate=`${(-lastX*factor).toFixed(2)}px ${(-lastY*factor).toFixed(2)}px`;
   });
   const nebula=document.querySelector('#cosmicDepth .nebula-field');
   if(nebula)nebula.style.marginLeft=(lastX*2.5).toFixed(2)+'px';
   raf=0;
  });
 },{passive:true});
}
// Interactive hero tilt: makes the CSS-built figures read as a small 3D stage on desktop.
const heroScene=document.querySelector('.scene3d');
if(heroScene&&window.matchMedia&&window.matchMedia('(pointer:fine)').matches){
 heroScene.addEventListener('pointermove',event=>{
  const rect=heroScene.getBoundingClientRect();
  const nx=((event.clientX-rect.left)/rect.width-.5)*2;
  const ny=((event.clientY-rect.top)/rect.height-.5)*2;
  heroScene.style.transform=`rotateX(${(-ny*5).toFixed(2)}deg) rotateY(${(nx*7).toFixed(2)}deg)`;
 });
 heroScene.addEventListener('pointerleave',()=>{heroScene.style.transform='';});
}

const letters=[
{title:'barangkali, kamu adalah rumah',theme:'dark-card',lines:[
'Katanya, nggak semua perjalanan harus tahu ke mana arahnya.',
'Kadang, kita cuma perlu terus berjalan, melewati banyak hal, sampai akhirnya menemukan seseorang yang bikin kita ingin berhenti sebentar.',
'Dan di antara banyaknya orang yang kutemui, aku menemukan kamu.',
'Bukan seseorang yang harus selalu sempurna, tapi seseorang yang bikin aku ingin mengenal lebih banyak tentang dirinya, termasuk hal-hal kecil yang mungkin nggak pernah dia ceritakan ke siapa-siapa.',
'Aku nggak tahu sejauh apa waktu akan membawa kita, tapi kalau suatu hari dunia terasa terlalu berat buat kamu, semoga kamu ingat kalau ada aku yang selalu senang mendengar ceritamu, sekecil apa pun itu.',
'Sebab, dari sekian banyak jalan yang bisa kupilih, aku harap kita tetap memilih jalan yang sama.'
],signature:'— With Love, Pikaa. ♡'},
{title:'kalau saja, kamu peka',theme:'sunset-card',lines:[
'Lucu ya, kadang kita bisa suka sama seseorang tanpa tahu alasannya apa.',
'Aku juga nggak tahu, sejak kapan kamu mulai menarik perhatianku.',
'Awalnya biasa aja, tapi lama-lama ada hal kecil dari kamu yang bikin aku penasaran.',
'Mungkin buat kamu, semuanya biasa aja.',
'Kamu cuma menjalani hari seperti biasanya, sementara aku malah punya cerita kecil tentang kamu di pikiranku.',
'Aku nggak tahu ini bakal jadi apa, tapi untuk sekarang, aku senang bisa mengagumimu, meski cuma dari jauh.'
],signature:'Dan kalau suatu hari kamu menyadarinya… anggap saja ini caraku bilang kalau kamu istimewa. ♡'}];
let active=0,index=0;
let envelopeTimer=0, finaleTimer=0;
const song=$('song');
function setMusicUI(state){
 const btn=$('musicBtn'), status=$('musicStatusText');
 if(state==='playing'){btn.textContent='♫ Jeda Firasat';btn.setAttribute('aria-pressed','true');status.textContent='Firasat · menemani kata-katamu';$('musicStatus').classList.add('is-playing');}
 else if(state==='blocked'){btn.textContent='♫ Putar Firasat';btn.setAttribute('aria-pressed','false');status.textContent='Ketuk untuk memulai musik';$('musicStatus').classList.remove('is-playing');}
 else {btn.textContent='♫ Putar Firasat';btn.setAttribute('aria-pressed','false');status.textContent=state==='paused'?'Firasat · dijeda':'Firasat · siap menemani';$('musicStatus').classList.remove('is-playing');}
}
function formatTime(value){if(!Number.isFinite(value)||value<0)return '--:--';const total=Math.floor(value);return `${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toString().padStart(2,'0')}`;}
function refreshMusicProgress(){const duration=Number.isFinite(song.duration)?song.duration:0;const current=Number.isFinite(song.currentTime)?song.currentTime:0;const percent=duration>0?Math.min(100,(current/duration)*100):0;$('musicTime').textContent=`${formatTime(current)} / ${formatTime(duration)}`;$('musicProgress').style.width=`${percent}%`;$('musicProgress').parentElement.setAttribute('aria-valuenow',String(Math.round(percent)));}
function tryPlay(){
 song.volume=.48;
 const p=song.play();
 if(p&&p.then){p.then(()=>setMusicUI('playing')).catch(()=>setMusicUI('blocked'));}
 else {setMusicUI('playing');}
}
function musicToggle(){if(song.paused){tryPlay();}else{song.pause();setMusicUI('paused');}}
song.addEventListener('play',()=>setMusicUI('playing'));
song.addEventListener('pause',()=>{if(!song.ended)setMusicUI('paused');});
song.addEventListener('timeupdate',refreshMusicProgress);
song.addEventListener('loadedmetadata',refreshMusicProgress);
song.addEventListener('durationchange',refreshMusicProgress);
song.addEventListener('error',()=>{ $('musicStatusText').textContent='File musik tidak ditemukan'; });
function showLine(n){const l=letters[active];index=Math.max(0,Math.min(n,l.lines.length-1));$('lineText').classList.remove('reveal-in');void $('lineText').offsetWidth;$('lineText').textContent=l.lines[index];$('lineText').classList.add('reveal-in');$('lineCount').textContent=`${index+1} / ${l.lines.length}`;$('lineProgress').style.width=((index+1)/l.lines.length*100)+'%';$('prevLine').disabled=index===0;$('nextLine').disabled=false;$('nextLine').textContent=index===l.lines.length-1?(active===0?'Lanjut surat kedua →':'Selesaikan surat ♡'):'Buka kalimat ♡';$('signature').textContent=l.signature;$('signature').classList.toggle('hidden',index!==l.lines.length-1);$('toFinal').classList.toggle('hidden',!(active===1&&index===l.lines.length-1));$('letterCompanions').classList.add('is-reading');}
function selectLetter(n,mode='flip'){
 clearTimeout(envelopeTimer);active=n;index=0;
 const card=$('letterCard'),companions=$('letterCompanions');
 card.className='letter-card '+letters[n].theme;
 companions.classList.remove('is-opening','is-turning');
 $('letterTitle').textContent=letters[n].title;$('lineText').classList.remove('hidden');
 document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',i===n));
 $('journeyStep').textContent=n===0?'BAB 01 · 03':'BAB 02 · 03';
 $('nextLetter').classList.toggle('hidden',n===1);$('toFinal').classList.add('hidden');$('starHint').classList.add('hidden');
 $('lineProgress').style.width='0%';$('lineCount').textContent=`0 / ${letters[n].lines.length}`;$('signature').classList.add('hidden');$('nextLine').disabled=true;
 if(mode==='envelope'){
  card.classList.add('opening-envelope');companions.classList.add('is-opening');$('lineText').textContent='';
  envelopeTimer=setTimeout(()=>{card.classList.remove('opening-envelope');companions.classList.remove('is-opening');showLine(0);},2250);
 }else{
  $('lineText').textContent=letters[n].lines[0];
  if(mode==='flip'){card.classList.add('page-turn');companions.classList.add('is-turning');setTimeout(()=>{card.classList.remove('page-turn');companions.classList.remove('is-turning');},760);}
  showLine(0);
 }
 companions.classList.add('is-reading');
}
function revealEnding(){
 clearTimeout(envelopeTimer);clearTimeout(finaleTimer);
 const room=$('letterRoom'),ending=$('ending');
 room.classList.add('scene-departing');document.body.classList.add('finale-transition');
 finaleTimer=setTimeout(()=>{
  room.classList.add('hidden');room.classList.remove('scene-departing');ending.classList.remove('hidden');ending.classList.remove('is-revealing');void ending.offsetWidth;ending.classList.add('is-revealing');
  $('journeyStep').textContent='BAB 03 · 03';ending.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  finaleTimer=setTimeout(()=>{ending.classList.remove('is-revealing');document.body.classList.remove('finale-transition');document.body.classList.add('finale-complete');},3600);
 },680);
}
$('enterUniverse').addEventListener('click',()=>{const intro=$('cinematicIntro');intro.classList.add('intro-leave');setTimeout(()=>intro.remove(),950);tryPlay();});
$('secretStar').addEventListener('click',()=>{$('starHint').classList.remove('hidden');$('starHint').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('startBtn').addEventListener('click',()=>{tryPlay();$('landing').classList.add('hidden');$('letterRoom').classList.remove('hidden');selectLetter(0,'envelope');$('letterRoom').scrollIntoView({behavior:'smooth'});});
$('musicBtn').addEventListener('click',musicToggle);
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.letter);if(n!==active)selectLetter(n,'flip');}));
$('nextLine').addEventListener('click',()=>{if(index<letters[active].lines.length-1)showLine(index+1);else if(active===0)selectLetter(1,'flip');else revealEnding();});
$('prevLine').addEventListener('click',()=>showLine(index-1));
$('nextLetter').addEventListener('click',()=>selectLetter(1,'flip'));
$('toFinal').addEventListener('click',revealEnding);
$('showSecret').addEventListener('click',()=>{$('secret').classList.remove('hidden');$('showSecret').classList.add('hidden');$('ending').classList.add('secret-opened');});
$('restart').addEventListener('click',()=>{clearTimeout(envelopeTimer);clearTimeout(finaleTimer);document.body.classList.remove('finale-transition','finale-complete');selectLetter(0,'reset');$('ending').classList.add('hidden');$('ending').classList.remove('is-revealing');$('letterRoom').classList.add('hidden');$('landing').classList.remove('hidden');$('secret').classList.add('hidden');$('showSecret').classList.remove('hidden');$('ending').classList.remove('secret-opened');$('journeyStep').textContent='BAB 01 · 03';window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'});if(song.paused)tryPlay();});
window.addEventListener('load',()=>{refreshMusicProgress(); /* Audio begins after the visitor chooses to enter, respecting browser autoplay rules. */ });
})();