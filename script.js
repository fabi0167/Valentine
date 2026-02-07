// --- Elements
const confettiCanvas = document.getElementById("confetti");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const toast = document.getElementById("toast");
const card = document.getElementById("card");
const gifts = document.getElementById("gifts");
const againBtn = document.getElementById("againBtn");

// Optional audio
const audKiss = document.getElementById("audKiss");
const audPop = document.getElementById("audPop");
const audConfetti = document.getElementById("audConfetti");

// Gift images (optional)
const stoneImg = document.getElementById("stoneImg");
const kissImg  = document.getElementById("kissImg");
const spinImg  = document.getElementById("spinImg");

// Intro elements (one-line)
const intro = document.getElementById("intro");
const introSingleLine = document.getElementById("introSingleLine");
const rose = document.getElementById("rose");

// --- State
let noClicks = 0;
let yesScale = 1;
let noScale = 1;
let finished = false;

// Allow audio after first user interaction (PC ok)
let userInteracted = false;
window.addEventListener("pointerdown", () => { userInteracted = true; }, { once: true });

const noFlow = [
  "Are you sure? 😏",
  "Confirm…",
  "Error ❌ (try again)",
  "Confirm again…",
  "Still no? Interesting…",
  "System: refusing your refusal 😈",
  "No is getting… suspiciously small…",
];

function safePlay(audioEl, volume = 1) {
  if (!userInteracted) return;
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.volume = volume;
    const p = audioEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch { /* ignore */ }
}

// --- Intro: white bg, black text, one at a time (with different read times)
async function runIntroOneByOne() {
  const lines = [
    { text: "Hello Wiktoria", holdMs: 1400 }, // shorter
    { text: "A little birdie told me no one has asked you to be a Valentine yet.", holdMs: 3200 }, // longer
    { text: "Well, don’t you worry, beautiful — your Romeo has come.", holdMs: 3200 }, // longer
  ];

  async function showLine({ text, holdMs }) {
    introSingleLine.textContent = text;

    introSingleLine.classList.remove("hide");
    introSingleLine.classList.remove("show");

    await sleep(80);
    introSingleLine.classList.add("show");

    await sleep(holdMs);
    introSingleLine.classList.add("hide");

    await sleep(900); // fade-out time
  }

  for (const line of lines) {
    await showLine(line);
  }

  // Rose spin-in
  rose.classList.add("flyIn");
  await sleep(1200);

  // Fade out intro, show main card
  intro.classList.add("fadeOut");
  await sleep(750);

  intro.style.display = "none";
  card.classList.remove("hidden");
  placeNoButtonInitial();
}

runIntroOneByOne();

// --- Initial NO placement
function placeNoButtonInitial() {
  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();

  const x = rect.width * 0.63;
  const y = rect.height * 0.20;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

window.addEventListener("resize", () => {
  if (!card.classList.contains("hidden")) placeNoButtonInitial();
});

// --- NO slides away from cursor (stays visible, no teleport)
function slideNoButtonAway(ev) {
  if (finished) return;

  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();

  const pad = 10;
  const maxX = rect.width - noBtn.offsetWidth - pad;
  const maxY = rect.height - noBtn.offsetHeight - pad;

  // Current NO position (relative to buttons area)
  const currentLeft = parseFloat(noBtn.style.left || "0");
  const currentTop  = parseFloat(noBtn.style.top  || "0");

  // Pointer position (relative)
  const px = ev.clientX - rect.left;
  const py = ev.clientY - rect.top;

  // Button center
  const bx = currentLeft + noBtn.offsetWidth / 2;
  const by = currentTop  + noBtn.offsetHeight / 2;

  // Vector from pointer -> button
  let dx = bx - px;
  let dy = by - py;

  // If pointer is exactly on center, pick a random direction
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    dx = Math.random() - 0.5;
    dy = Math.random() - 0.5;
  }

  // Normalize direction
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  // Distance to slide away
  const base = 140;
  const extra = Math.min(70, noClicks * 8); // slightly more “panic” after clicks
  const dist = base + extra;

  let newLeft = currentLeft + dx * dist;
  let newTop  = currentTop  + dy * dist;

  // Clamp within bounds
  newLeft = Math.max(pad, Math.min(maxX, newLeft));
  newTop  = Math.max(pad, Math.min(maxY, newTop));

  // If clamped so hard it barely moved, try a sideways dodge
  const moved = Math.hypot(newLeft - currentLeft, newTop - currentTop);
  if (moved < 40) {
    // rotate direction 90 degrees
    const sx = -dy;
    const sy = dx;
    newLeft = Math.max(pad, Math.min(maxX, currentLeft + sx * dist));
    newTop  = Math.max(pad, Math.min(maxY, currentTop  + sy * dist));
  }

  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top  = `${newTop}px`;
}

noBtn.addEventListener("mousemove", slideNoButtonAway);
noBtn.addEventListener("mouseover", slideNoButtonAway);

// --- NO clicked: confirm/error flow + scaling
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (finished) return;

  noClicks++;
  safePlay(audPop, 0.35);

  const msg = noFlow[Math.min(noFlow.length - 1, noClicks - 1)];
  toast.textContent = msg;

  noScale = Math.max(0, 1 - noClicks * 0.12);
  yesScale = Math.min(2.2, 1 + noClicks * 0.10);

  applyButtonScales();

  if (noScale <= 0.08) {
    noBtn.style.opacity = "0";
    noBtn.style.pointerEvents = "none";
    toast.textContent = "NO has left the chat. 🙂";
  } else {
    // After clicking no, also slide away a bit so it stays annoying
    slideNoButtonAway(e);
  }
});

function applyButtonScales() {
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.fontSize = `${Math.round(16 * yesScale)}px`;

  noBtn.style.transform = `scale(${noScale})`;
  noBtn.style.fontSize = `${Math.round(16 * Math.max(0.8, noScale))}px`;
}

// --- YES clicked: confetti + gifts + cute sequence
yesBtn.addEventListener("click", async () => {
  if (finished) return;
  finished = true;

  safePlay(audConfetti, 0.45);
  toast.textContent = "YUPPII!! 💖🎉";

  yesBtn.disabled = true;
  noBtn.disabled = true;
  noBtn.style.pointerEvents = "none";

  startConfettiBurst(180);

  setTimeout(() => {
    card.classList.add("hidden");
    gifts.classList.remove("hidden");
    revealGiftSequence();
  }, 650);
});

againBtn.addEventListener("click", () => {
  finished = false;
  noClicks = 0;
  yesScale = 1;
  noScale = 1;
  applyButtonScales();

  toast.textContent = "";
  yesBtn.disabled = false;
  noBtn.disabled = false;
  noBtn.style.opacity = "1";
  noBtn.style.pointerEvents = "auto";

  gifts.classList.add("hidden");
  card.classList.remove("hidden");

  [stoneImg, kissImg, spinImg].forEach(img => {
    img.classList.add("hidden");
    img.src = "";
  });

  placeNoButtonInitial();
});

// --- Gift sequence (swap in assets later)
function setOptionalImage(imgEl, path) {
  imgEl.onload = () => imgEl.classList.remove("hidden");
  imgEl.onerror = () => { /* keep fallback */ };
  imgEl.src = path;
}

async function revealGiftSequence() {
  setOptionalImage(stoneImg, "assets/love-stone.png");
  startConfettiBurst(80);
  await sleep(800);

  setOptionalImage(kissImg, "assets/cat-kiss.gif");
  safePlay(audKiss, 0.55);
  startConfettiBurst(60);
  await sleep(1000);

  setOptionalImage(spinImg, "assets/cat-spin.gif");
  startConfettiBurst(70);
}

// --- Helpers
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== Confetti =====
const ctx = confettiCanvas.getContext("2d");
let particles = [];
let rafId = null;

function resizeCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = "100%";
  confettiCanvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function startConfettiBurst(count = 120) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w * 0.5 + (Math.random() - 0.5) * 120,
      y: h * 0.25 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 5 + 2,
      size: Math.random() * 6 + 3,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      life: Math.random() * 60 + 60,
      shape: Math.random() < 0.5 ? "rect" : "circle",
    });
  }

  if (!rafId) loop();
}

function loop() {
  rafId = requestAnimationFrame(loop);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.rot += p.vr;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));

    ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 90%, 65%, 1)`;

    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (particles.length === 0) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
