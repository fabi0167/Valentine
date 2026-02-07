// --- Elements
const confettiCanvas = document.getElementById("confetti");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const toast = document.getElementById("toast");
const card = document.getElementById("card");
const gifts = document.getElementById("gifts");
const againBtn = document.getElementById("againBtn");

const soundGate = document.getElementById("soundGate");
const enableSoundBtn = document.getElementById("enableSoundBtn");
const skipSoundBtn = document.getElementById("skipSoundBtn");

const audKiss = document.getElementById("audKiss");
const audPop = document.getElementById("audPop");
const audConfetti = document.getElementById("audConfetti");

// Gift images (optional)
const stoneImg = document.getElementById("stoneImg");
const kissImg  = document.getElementById("kissImg");
const spinImg  = document.getElementById("spinImg");

// --- State
let noClicks = 0;
let yesScale = 1;
let noScale = 1;
let soundEnabled = false;
let finished = false;

// Messages for NO clicks (your confirm/error vibe)
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
  if (!soundEnabled) return;
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.volume = volume;
    const p = audioEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch { /* ignore */ }
}

// --- Sound gate (helps on phones)
enableSoundBtn.addEventListener("click", () => {
  soundEnabled = true;
  // "Unlock" audio by playing silently once
  safePlay(audPop, 0.001);
  soundGate.style.display = "none";
});
skipSoundBtn.addEventListener("click", () => {
  soundEnabled = false;
  soundGate.style.display = "none";
});

// --- Initial NO placement
function placeNoButtonInitial() {
  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();

  // Start roughly to the right side
  const x = rect.width * 0.63;
  const y = rect.height * 0.20;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}
placeNoButtonInitial();
window.addEventListener("resize", placeNoButtonInitial);

// --- Make NO run away (desktop hover + mobile touch/pointer)
function moveNoButtonAway(fromEvent) {
  if (finished) return;

  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();

  // Keep within bounds
  const pad = 10;

  // Bigger jumps as NO gets smaller (feels more chaotic)
  const chaos = Math.min(1.6, 1 + noClicks * 0.08);

  const maxX = rect.width - noBtn.offsetWidth - pad;
  const maxY = rect.height - noBtn.offsetHeight - pad;

  let newX = Math.random() * maxX;
  let newY = Math.random() * maxY;

  // If we know pointer location, try to move away from it
  const e = fromEvent;
  if (e && typeof e.clientX === "number") {
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    // Move to opposite side-ish
    newX = (localX < rect.width / 2) ? (rect.width * 0.62) : (rect.width * 0.18);
    newY = (localY < rect.height / 2) ? (rect.height * 0.58) : (rect.height * 0.18);

    // Add randomness
    newX += (Math.random() - 0.5) * 140 * chaos;
    newY += (Math.random() - 0.5) * 90  * chaos;

    newX = Math.max(pad, Math.min(maxX, newX));
    newY = Math.max(pad, Math.min(maxY, newY));
  }

  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;
}

noBtn.addEventListener("mouseover", moveNoButtonAway);
noBtn.addEventListener("pointerdown", moveNoButtonAway);
noBtn.addEventListener("touchstart", moveNoButtonAway, { passive: true });

// --- NO clicked: confirm/error flow + scaling
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (finished) return;

  noClicks++;
  safePlay(audPop, 0.35);

  const msg = noFlow[Math.min(noFlow.length - 1, noClicks - 1)];
  toast.textContent = msg;

  // Shrink NO, grow YES
  noScale = Math.max(0, 1 - noClicks * 0.12);
  yesScale = Math.min(2.2, 1 + noClicks * 0.10);

  applyButtonScales();

  // After enough clicks, NO disappears completely
  if (noScale <= 0.08) {
    noBtn.style.opacity = "0";
    noBtn.style.pointerEvents = "none";
    toast.textContent = "NO has left the chat. 🙂";
  } else {
    // Also make it run away after click
    moveNoButtonAway(e);
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

  // Lock buttons
  yesBtn.disabled = true;
  noBtn.disabled = true;
  noBtn.style.pointerEvents = "none";

  // Confetti burst
  startConfettiBurst(160);

  // Reveal gifts after a short dramatic pause
  setTimeout(() => {
    card.classList.add("hidden");
    gifts.classList.remove("hidden");
    revealGiftSequence();
  }, 650);
});

againBtn.addEventListener("click", () => {
  // Simple reset
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

  // Hide gift imgs (they will re-reveal)
  [stoneImg, kissImg, spinImg].forEach(img => {
    img.classList.add("hidden");
    img.src = "";
  });

  placeNoButtonInitial();
});

// --- Gift sequence (swap in your assets later)
function setOptionalImage(imgEl, path) {
  // If asset exists in repo, it loads. If not, we just keep fallback emoji.
  imgEl.onload = () => imgEl.classList.remove("hidden");
  imgEl.onerror = () => { /* keep fallback */ };
  imgEl.src = path;
}

async function revealGiftSequence() {
  // 1) LOVE stone
  setOptionalImage(stoneImg, "assets/love-stone.png");
  startConfettiBurst(80);
  await sleep(800);

  // 2) Cat kissing camera (with kiss sound)
  setOptionalImage(kissImg, "assets/cat-kiss.gif");
  safePlay(audKiss, 0.55);
  startConfettiBurst(60);
  await sleep(1000);

  // 3) Spinning cat with bouquet
  setOptionalImage(spinImg, "assets/cat-spin.gif");
  startConfettiBurst(70);
}

// --- Helpers
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== Confetti (simple canvas particles) =====
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
    p.vy += 0.12; // gravity
    p.rot += p.vr;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));

    // No fixed colors by request? Here it's random each draw but not specified as fixed palette.
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
