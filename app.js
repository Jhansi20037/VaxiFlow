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
/* =========================================================
   VAXIFLOW — ADVANCED INTERACTION LAYER
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------------------------------
     1. Scroll reveal
     ------------------------------------------------------- */

  const revealElements = document.querySelectorAll(
    ".card, .feature-card, .info-card, .stat-card, " +
    ".team-card, .deliverable-card, section"
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }

      });

    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });


  /* -------------------------------------------------------
     2. Floating background particles
     ------------------------------------------------------- */

  const particleCount = window.innerWidth < 768 ? 12 : 25;

  for (let i = 0; i < particleCount; i++) {

    const particle = document.createElement("span");

    particle.className = "vf-particle";

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.animationDuration =
      (6 + Math.random() * 8) + "s";

    particle.style.animationDelay =
      (-Math.random() * 10) + "s";

    particle.style.opacity =
      0.25 + Math.random() * 0.5;

    document.body.appendChild(particle);
  }


  /* -------------------------------------------------------
     3. Interactive card tilt
     ------------------------------------------------------- */

  const cards = document.querySelectorAll(
    ".card, .feature-card, .team-card, .deliverable-card"
  );

  cards.forEach((card) => {

    card.addEventListener("mousemove", (event) => {

      if (window.innerWidth < 768) return;

      const rect = card.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;

      const rotateX =
        ((y / rect.height) - 0.5) * -5;

      const rotateY =
        ((x / rect.width) - 0.5) * 5;

      card.style.transform =
        `perspective(800px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {

      card.style.transform = "";

    });

  });


  /* -------------------------------------------------------
     4. Magnetic buttons
     ------------------------------------------------------- */

  const buttons = document.querySelectorAll(
    ".cta, .btn, .hero-button, button"
  );

  buttons.forEach((button) => {

    button.addEventListener("mousemove", (event) => {

      if (window.innerWidth < 768) return;

      const rect = button.getBoundingClientRect();

      const x =
        event.clientX - rect.left - rect.width / 2;

      const y =
        event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    button.addEventListener("mouseleave", () => {

      button.style.transform = "";

    });

  });


  /* -------------------------------------------------------
     5. Animated counters
     ------------------------------------------------------- */

  const counters =
    document.querySelectorAll("[data-count]");

  const animateCounter = (element) => {

    const target =
      Number(element.dataset.count);

    const duration = 1200;

    const startTime = performance.now();

    const update = (currentTime) => {

      const progress =
        Math.min(
          (currentTime - startTime) / duration,
          1
        );

      const eased =
        1 - Math.pow(1 - progress, 3);

      element.textContent =
        Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }

    };

    requestAnimationFrame(update);
  };


  if (counters.length) {

    const counterObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              animateCounter(entry.target);

              observer.unobserve(entry.target);

            }

          });

        },
        {
          threshold: 0.7
        }
      );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }


  /* -------------------------------------------------------
     6. Click ripple effect
     ------------------------------------------------------- */

  document.addEventListener("click", (event) => {

    const button =
      event.target.closest(
        "button, .btn, .cta, .hero-button"
      );

    if (!button) return;

    const ripple =
      document.createElement("span");

    ripple.style.position = "absolute";
    ripple.style.width = "10px";
    ripple.style.height = "10px";
    ripple.style.borderRadius = "50%";
    ripple.style.background =
      "rgba(255,255,255,.35)";
    ripple.style.pointerEvents = "none";

    const rect =
      button.getBoundingClientRect();

    ripple.style.left =
      (event.clientX - rect.left) + "px";

    ripple.style.top =
      (event.clientY - rect.top) + "px";

    ripple.style.transform =
      "translate(-50%, -50%) scale(1)";

    ripple.style.transition =
      "transform .6s ease, opacity .6s ease";

    button.appendChild(ripple);

    requestAnimationFrame(() => {

      ripple.style.transform =
        "translate(-50%, -50%) scale(18)";

      ripple.style.opacity = "0";

    });

    setTimeout(() => {
      ripple.remove();
    }, 650);

  });


  /* -------------------------------------------------------
     7. Keyboard shortcut
     ------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "/" &&
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {

      event.preventDefault();

      const search =
        document.querySelector(
          "#paletteInput, #searchInput, " +
          "[data-search], input[type='search']"
        );

      if (search) {
        search.focus();
      }

    }

  });


  /* -------------------------------------------------------
     8. Smooth internal navigation
     ------------------------------------------------------- */

  document.querySelectorAll(
    'a[href^="#"]'
  ).forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetId =
        link.getAttribute("href");

      if (
        !targetId ||
        targetId === "#"
      ) return;

      const target =
        document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });

});
