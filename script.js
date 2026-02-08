// ===== Elements =====
const confettiCanvas = document.getElementById("confetti");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const toast = document.getElementById("toast");
const card = document.getElementById("card");

// Intro
const intro = document.getElementById("intro");
const introSingleLine = document.getElementById("introSingleLine");
const rose = document.getElementById("rose");

// YES sequence
const sequence = document.getElementById("sequence");
const seqText = document.getElementById("seqText");
const seqImg = document.getElementById("seqImg");
const seqGtrWrap = document.getElementById("seqGtrWrap");
const seqGtr = document.getElementById("seqGtr");
const photoRing = document.getElementById("photoRing");
const us1 = document.getElementById("us1");
const us2 = document.getElementById("us2");
const us3 = document.getElementById("us3");
const us4 = document.getElementById("us4");

// Final page
const finalPage = document.getElementById("finalPage");
const restartBtn = document.getElementById("restartBtn");

// Final images
const finalStone = document.getElementById("finalStone");
const finalKissCat = document.getElementById("finalKissCat");
const finalFlowerCat = document.getElementById("finalFlowerCat");
const finalGtr = document.getElementById("finalGtr");
const finalUs1 = document.getElementById("finalUs1");
const finalUs2 = document.getElementById("finalUs2");
const finalUs3 = document.getElementById("finalUs3");
const finalUs4 = document.getElementById("finalUs4");

// Audio
const audPop = document.getElementById("audPop");
const audKiss = document.getElementById("audKiss");
const audConfetti = document.getElementById("audConfetti");
const audYuppi = document.getElementById("audYuppi");
const audSong = document.getElementById("audSong");
const audEngine = document.getElementById("audEngine");

// NEW: guitar note for rose entrance
const audGuitar = new Audio("assets/guitar-note.mp3");
audGuitar.preload = "auto";

// ===== State =====
let noClicks = 0;
let yesScale = 1;
let noScale = 1;
let finished = false;

// allow audio after first user gesture
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function safePlay(audioEl, volume = 1, loop = false) {
  if (!userInteracted) return;
  if (!audioEl) return;
  try {
    audioEl.loop = !!loop;
    audioEl.volume = volume;
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

function safePlayLoose(audioEl, volume = 1) {
  // for Audio() objects too
  if (!userInteracted) return;
  if (!audioEl) return;
  try {
    audioEl.volume = volume;
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

function safeStop(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.pause();
    audioEl.currentTime = 0;
  } catch {}
}

// ===== Intro timings =====
async function runIntroOneByOne() {
  const lines = [
    { text: "Hello Wiktoria", holdMs: 2500 },
    { text: "A little birdie told me no one has asked you to be a Valentine yet.", holdMs: 3500 },
    { text: "Well, don’t you worry, beautiful — your Romeo has come.", holdMs: 3500 },
  ];

  async function showLine({ text, holdMs }) {
    introSingleLine.textContent = text;
    introSingleLine.classList.remove("hide", "show");
    await sleep(80);
    introSingleLine.classList.add("show");
    await sleep(holdMs);
    introSingleLine.classList.add("hide");
    await sleep(900);
  }

  for (const line of lines) await showLine(line);

  // Rose entrance + guitar note
  rose.classList.add("flyIn");
  setTimeout(() => {
  if (userInteracted) {
    audGuitar.currentTime = 0;
    audGuitar.volume = 0.8;
    audGuitar.play().catch(() => {});
    console.log("ROSE SOUND FIRED");

  }
}, 220);
  setTimeout(() => safePlayLoose(audGuitar, 0.75), 220);

  await sleep(1200);

  intro.classList.add("fadeOut");
  await sleep(750);

  intro.style.display = "none";
  card.classList.remove("hidden");
  placeNoButtonInitial();
}
runIntroOneByOne();

// ===== NO placement + behavior =====
function placeNoButtonInitial() {
  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();
  noBtn.style.left = `${rect.width * 0.63}px`;
  noBtn.style.top = `${rect.height * 0.20}px`;
}

window.addEventListener("resize", () => {
  if (!card.classList.contains("hidden")) placeNoButtonInitial();
});

function slideNoButtonAway(ev) {
  if (finished) return;

  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();

  const pad = 10;
  const maxX = rect.width - noBtn.offsetWidth - pad;
  const maxY = rect.height - noBtn.offsetHeight - pad;

  const currentLeft = parseFloat(noBtn.style.left || "0");
  const currentTop  = parseFloat(noBtn.style.top  || "0");

  const px = ev.clientX - rect.left;
  const py = ev.clientY - rect.top;

  const bx = currentLeft + noBtn.offsetWidth / 2;
  const by = currentTop  + noBtn.offsetHeight / 2;

  let dx = bx - px;
  let dy = by - py;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    dx = Math.random() - 0.5;
    dy = Math.random() - 0.5;
  }

  const len = Math.hypot(dx, dy) || 1;
  dx /= len; dy /= len;

  const base = 140;
  const extra = Math.min(70, noClicks * 8);
  const dist = base + extra;

  let newLeft = currentLeft + dx * dist;
  let newTop  = currentTop  + dy * dist;

  newLeft = Math.max(pad, Math.min(maxX, newLeft));
  newTop  = Math.max(pad, Math.min(maxY, newTop));

  const moved = Math.hypot(newLeft - currentLeft, newTop - currentTop);
  if (moved < 40) {
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

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (finished) return;

  noClicks++;
  safePlay(audPop, 0.35);

  toast.textContent = noFlow[Math.min(noFlow.length - 1, noClicks - 1)];

  noScale = Math.max(0, 1 - noClicks * 0.12);
  yesScale = Math.min(2.2, 1 + noClicks * 0.10);

  applyButtonScales();

  if (noScale <= 0.08) {
    noBtn.style.opacity = "0";
    noBtn.style.pointerEvents = "none";
    toast.textContent = "NO has left the chat. 🙂";
  } else {
    slideNoButtonAway(e);
  }
});

function applyButtonScales() {
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.fontSize = `${Math.round(16 * yesScale)}px`;
  noBtn.style.transform = `scale(${noScale})`;
  noBtn.style.fontSize = `${Math.round(16 * Math.max(0.8, noScale))}px`;
}

// ===== Confetti engine =====
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

function spawnConfettiBurst({ count, originX, originY, vxBias }) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ox = w * originX;
  const oy = h * originY;

  for (let i = 0; i < count; i++) {
    const spreadX = 60;
    const spreadY = 260;
    particles.push({
      x: ox + (Math.random() - 0.5) * spreadX,
      y: oy + (Math.random() - 0.5) * spreadY,
      vx: vxBias + (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 7,
      size: Math.random() * 7 + 3,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      life: Math.random() * 90 + 140,
      shape: Math.random() < 0.55 ? "rect" : "circle",
    });
  }
  if (!rafId) loop();
}

function startConfettiSides(perSide = 520) {
  spawnConfettiBurst({ count: perSide, originX: 0.06, originY: 0.55, vxBias: +7.0 });
  spawnConfettiBurst({ count: perSide, originX: 0.94, originY: 0.55, vxBias: -7.0 });
}

function loop() {
  rafId = requestAnimationFrame(loop);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.995;
    p.vy *= 0.995;
    p.rot += p.vr;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 200));
    ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 90%, 65%, 1)`;

    if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.75);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }

    ctx.restore();
  }

  if (particles.length === 0) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// ===== Asset helpers =====
function setImg(imgEl, path) {
  if (!imgEl) return;
  imgEl.classList.remove("hidden");
  imgEl.onerror = () => { imgEl.classList.add("hidden"); };
  imgEl.src = path;
}

function showSeqText(text, { big = true } = {}) {
  seqText.textContent = text;
  seqText.classList.remove("hidden", "seqFadeOut", "small");
  if (!big) seqText.classList.add("small");
}

function hideSeqTextFade() {
  seqText.classList.add("seqFadeOut");
}

function hideAllSeqVisuals() {
  seqText.classList.add("hidden");
  seqImg.classList.add("hidden");
  seqGtrWrap.classList.add("hidden");
  photoRing.classList.add("hidden");
  seqImg.removeAttribute("src");
  seqGtr.removeAttribute("src");
  seqText.classList.remove("seqFadeOut", "small");
  seqGtr.classList.remove("shake", "driveOff");
}

// ===== YES CLICK → sequence =====
yesBtn.addEventListener("click", async () => {
  if (finished) return;
  finished = true;

  card.classList.add("hidden");
  sequence.classList.remove("hidden");
  hideAllSeqVisuals();

  safePlay(audPop, 0.65);
  safePlay(audYuppi, 0.75);
  safePlay(audSong, 0.25, true);

  startConfettiSides(650);

  showSeqText("YUPPII!! 💖🎉", { big: true });
  await sleep(1700);
  hideSeqTextFade();
  await sleep(800);

  hideAllSeqVisuals();
  setImg(seqImg, "assets/cat-kiss.gif");
  safePlay(audKiss, 0.60);
  await sleep(2200);

  hideAllSeqVisuals();
  showSeqText("Here are your gifts…", { big: false });
  await sleep(1700);
  hideSeqTextFade();
  await sleep(700);

  hideAllSeqVisuals();
  setImg(seqImg, "assets/love-stone.png");
  await sleep(1800);

  hideAllSeqVisuals();
  setImg(seqImg, "assets/cat-flowers.gif");
  await sleep(2000);

  hideAllSeqVisuals();
  seqGtrWrap.classList.remove("hidden");
  setImg(seqGtr, "assets/gtr.png");

  safePlay(audEngine, 0.65);

  await sleep(250);
  seqGtr.classList.add("shake");
  await sleep(1500);

  seqGtr.classList.remove("shake");
  seqGtr.classList.add("driveOff");
  await sleep(1300);

  safeStop(audEngine);

  hideAllSeqVisuals();
  await sleep(250);

  showSeqText("Thank you for being here.\nI love you. ❤️", { big: false });

  photoRing.classList.remove("hidden");
  setImg(us1, "assets/us-1.jpg");
  setImg(us2, "assets/us-2.jpg");
  setImg(us3, "assets/us-3.jpg");
  setImg(us4, "assets/us-4.jpg");

  await sleep(3500);
  hideSeqTextFade();
  await sleep(900);

  sequence.classList.add("hidden");
  finalPage.classList.remove("hidden");

  setImg(finalStone, "assets/love-stone.png");
  setImg(finalKissCat, "assets/cat-kiss.gif");
  setImg(finalFlowerCat, "assets/cat-flowers.gif");
  setImg(finalGtr, "assets/gtr.png");

  setImg(finalUs1, "assets/us-1.jpg");
  setImg(finalUs2, "assets/us-2.jpg");
  setImg(finalUs3, "assets/us-3.jpg");
  setImg(finalUs4, "assets/us-4.jpg");
});

restartBtn.addEventListener("click", () => {
  safeStop(audSong);
  safeStop(audEngine);

  finished = false;
  noClicks = 0;
  yesScale = 1;
  noScale = 1;
  applyButtonScales();

  noBtn.style.opacity = "1";
  noBtn.style.pointerEvents = "auto";
  toast.textContent = "";

  finalPage.classList.add("hidden");

  intro.style.display = "";
  intro.classList.remove("fadeOut");
  rose.classList.remove("flyIn");
  introSingleLine.classList.remove("show", "hide");

  card.classList.add("hidden");
  runIntroOneByOne();
});
