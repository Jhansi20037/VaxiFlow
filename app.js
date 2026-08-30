const validPages = ["home","project","objectives","deliverables","team","contact"];
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const nav = document.getElementById("nav");
const menuButton = document.getElementById("menuButton");
const toast = document.getElementById("toast");

function showToast(message){
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"),2600);
}

function showPage(name){
  const page = validPages.includes(name) ? name : "home";
  pages.forEach(section=>section.classList.toggle("active",section.id===page));
  navLinks.forEach(link=>link.classList.toggle("active",link.dataset.page===page));
  nav?.classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  history.replaceState(null,"","#"+page);
  document.dispatchEvent(new CustomEvent("vaxiflow:page",{detail:{page}}));
}

document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>showPage(el.dataset.page)));
menuButton?.addEventListener("click",()=>nav?.classList.toggle("open"));

// Deliverable attachment demo: keeps the selected filename in the UI.
window.attachFile = function(input,title){
  if(!input.files?.[0]) return;
  const file=input.files[0];
  const row=input.closest(".deliverable-row");
  const status=row?.querySelector(".status");
  const button=input.closest(".file-button");
  if(status){status.textContent="File selected";status.className="status complete";}
  if(button) button.firstChild.textContent="✓ "+file.name+" ";
  showToast(title+" · "+file.name+" selected");
};

// Command palette
const palette=document.getElementById("commandPalette");
const paletteInput=document.getElementById("paletteInput");
function openPalette(){palette?.classList.add("open");palette?.setAttribute("aria-hidden","false");setTimeout(()=>paletteInput?.focus(),40);}
function closePalette(){palette?.classList.remove("open");palette?.setAttribute("aria-hidden","true");}
document.getElementById("commandButton")?.addEventListener("click",openPalette);
document.querySelectorAll("[data-close-palette]").forEach(x=>x.addEventListener("click",closePalette));
paletteInput?.addEventListener("input",()=>{
  const q=paletteInput.value.toLowerCase().trim();
  document.querySelectorAll(".palette-list button").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"flex":"none");
});

// Temperature simulator
const tempSlider=document.getElementById("tempSlider");
const tempValue=document.getElementById("tempValue");
const tempState=document.getElementById("tempState");
const tempBar=document.getElementById("tempBar");
function updateTemp(v){
  if(!tempValue||!tempState) return;
  tempValue.textContent=(v>=0?"+":"")+v.toFixed(1)+"°C";
  tempState.className="temp-state";
  if(v>=2&&v<=8){tempState.classList.add("safe");tempState.textContent="SAFE RANGE · DEMO";}
  else if(v>=0&&v<12){tempState.classList.add("warn");tempState.textContent="CHECK CONDITIONS · DEMO";}
  else{tempState.classList.add("danger");tempState.textContent="EXCURSION · DEMO";}
  if(tempBar) tempBar.style.width=Math.max(4,Math.min(100,((v+5)/20)*100))+"%";
}
tempSlider?.addEventListener("input",()=>updateTemp(Number(tempSlider.value)));
updateTemp(Number(tempSlider?.value||4));

// CS control room
let eventCount=0;
const labStatus=document.getElementById("labStatus");
const dataPacket=document.getElementById("dataPacket");
const labImage=document.getElementById("labImage");
const tempMetric=document.getElementById("tempMetric");
const networkMetric=document.getElementById("networkMetric");
const eventMetric=document.getElementById("eventMetric");
function lab(mode){
  document.querySelectorAll("[data-lab]").forEach(b=>b.classList.toggle("active",b.dataset.lab===mode));
  if(mode==="flow"){
    labImage.src="assets/control-room.svg";dataPacket?.classList.add("run");
    networkMetric.textContent="ONLINE";tempMetric.textContent="+4.2°C";
    labStatus.innerHTML='<span class="live-dot"></span><strong>Data flow running</strong><small>Sensor → edge → local rules → sync → dashboard</small>';
    showToast("Packet flow started ✓");
  } else if(mode==="offline"){
    labImage.src="assets/offline-mode.svg";dataPacket?.classList.remove("run");
    networkMetric.textContent="OFFLINE";tempMetric.textContent="+4.2°C";
    labStatus.innerHTML='<span class="live-dot"></span><strong>Offline-first mode</strong><small>Essential monitoring remains available locally.</small>';
    showToast("No signal? No drama. Offline mode activated.");
  } else {
    labImage.src="assets/monitoring.svg";dataPacket?.classList.remove("run");
    networkMetric.textContent="ONLINE";eventCount++;eventMetric.textContent=eventCount;tempMetric.textContent="+9.8°C";
    labStatus.innerHTML='<span class="live-dot danger-dot"></span><strong>Temperature event detected</strong><small>Demo only · review exposure history before any real decision.</small>';
    showToast("⚠ Excursion detected — context matters.");
  }
}
document.querySelectorAll("[data-lab]").forEach(b=>b.addEventListener("click",()=>lab(b.dataset.lab)));
document.querySelectorAll("[data-toast]").forEach(b=>b.addEventListener("click",()=>showToast(b.dataset.toast)));

// Animated journey timeline / counters
const counters=document.querySelectorAll("[data-count]");
const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el){
  const target=Number(el.dataset.count);let start=0;const duration=900;const t0=performance.now();
  function frame(t){const p=Math.min(1,(t-t0)/duration);el.textContent=Math.round(start+(target-start)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
if(!reduceMotion){
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){countUp(e.target);io.unobserve(e.target);}}),{threshold:.5});
  counters.forEach(c=>io.observe(c));
}

// Reveal animations
if(!reduceMotion){
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("revealed");reveal.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll(".reveal-on-scroll").forEach(x=>reveal.observe(x));
}

// Tiny interactive 3D cards
if(!reduceMotion){
  document.querySelectorAll(".holo-card").forEach(card=>{
    card.addEventListener("pointermove",e=>{
      const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-5px)`;
    });
    card.addEventListener("pointerleave",()=>card.style.transform="");
  });
}

// Keyboard shortcuts + command palette
const shortcutMap={h:"home",p:"project",o:"objectives",d:"deliverables",t:"team",c:"contact"};
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette();return;}
  if(e.key==="Escape")closePalette();
  if(e.target.matches("input,textarea,select")) return;
  const page=shortcutMap[e.key.toLowerCase()];if(page)showPage(page);
});

// A playful CS Easter egg: type FLOW in sequence.
let secret="";
document.addEventListener("keydown",e=>{
  if(e.key.length===1){secret=(secret+e.key.toUpperCase()).slice(-4);if(secret==="FLOW"){showToast("🧪 FLOW protocol unlocked. Nice debugging.");document.body.classList.add("flow-unlocked");setTimeout(()=>document.body.classList.remove("flow-unlocked"),1200);}}}
);

showPage(location.hash.replace("#","")||"home");
