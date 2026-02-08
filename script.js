// ===== Elements =====
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");

const confettiCanvas = document.getElementById("confetti");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const toast = document.getElementById("toast");
const card = document.getElementById("card");
const globalFade = document.getElementById("globalFade");


// Intro
const intro = document.getElementById("intro");
const introSingleLine = document.getElementById("introSingleLine");
const rose = document.getElementById("rose");

// YES sequence
const sequence = document.getElementById("sequence");
const seqText = document.getElementById("seqText");
const seqImg = document.getElementById("seqImg");
const seqVid = document.getElementById("seqVid");
const seqGtrWrap = document.getElementById("seqGtrWrap");
const seqGtr = document.getElementById("seqGtr");
const seqFade = document.getElementById("seqFade");
const photoRing = document.getElementById("photoRing");
const thankWrap = document.getElementById("thankWrap");
const thankText = document.getElementById("thankText");


const us1 = document.getElementById("us1");
const us2 = document.getElementById("us2");
const us3 = document.getElementById("us3");
const us4 = document.getElementById("us4");
const us5 = document.getElementById("us5");
const us6 = document.getElementById("us6");
const us7 = document.getElementById("us7");
const us8 = document.getElementById("us8");


// Final page
const finalPage = document.getElementById("finalPage");
const restartBtn = document.getElementById("restartBtn");

// Final images
const finalStone = document.getElementById("finalStone");
const finalFlowerCat = document.getElementById("finalFlowerCat");
const finalGtr = document.getElementById("finalGtr");
const finalUs1 = document.getElementById("finalUs1");
const finalUs2 = document.getElementById("finalUs2");
const finalUs3 = document.getElementById("finalUs3");
const finalUs4 = document.getElementById("finalUs4");
const finalUs5 = document.getElementById("finalUs5");
const finalUs6 = document.getElementById("finalUs6");
const finalUs7 = document.getElementById("finalUs7");
const finalUs8 = document.getElementById("finalUs8");


// Audio
const audPop = document.getElementById("audPop");
const audKiss = document.getElementById("audKiss");
const audConfetti = document.getElementById("audConfetti");
const audYuppi = document.getElementById("audYuppi");
const audSong = document.getElementById("audSong");
const audEngine = document.getElementById("audEngine");
const audTension = document.getElementById("audTension");
const audStoneGift = document.getElementById("audStoneGift");
const audFlowersGift = document.getElementById("audFlowersGift");
const audGtrGift = document.getElementById("audGtrGift");
const audThankYou = document.getElementById("audThankYou");


// Guitar note (your file: assets/guitar-note.mp3)
const audGuitar = new Audio("assets/guitar-note.mp3");
audGuitar.preload = "auto";

// ===== State =====
let noClicks = 0;
let yesScale = 1;
let noScale = 1;
let finished = false;

// ✅ Start aligned (inline), but dodging activates on FIRST HOVER
let noIsAbsolute = false;

// allow audio after first user gesture (browser rule)
let userInteracted = false;
["click", "mousemove", "keydown", "touchstart"].forEach(evt => {
  window.addEventListener(evt, () => { userInteracted = true; }, { once: true });
});

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

// ===== Guitar timing synced to animation start =====
const GUITAR_DELAY_MS = 20;

rose.addEventListener("animationstart", (e) => {
  if (e.animationName !== "roseSpin") return;
  setTimeout(() => safePlayLoose(audGuitar, 0.8), GUITAR_DELAY_MS);
});

async function playSeqVideo(path, { maxMs = 6000 } = {}) {
  if (!seqVid) return;

  hideAllSeqVisuals();

  // Prepare + show
  seqVid.classList.remove("hidden");
  seqVid.classList.remove("showFade"); // start invisible
  seqVid.src = path;

  // important for autoplay + audio
  seqVid.muted = false;
  seqVid.volume = 1.0;
  seqVid.autoplay = true;
  seqVid.controls = false;

  try { seqVid.load(); } catch {}

  // Fade in (next frame)
  await sleep(50);
  seqVid.classList.add("showFade");

  // Play + wait until ended (or timeout)
  await new Promise((resolve) => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve();
    };

    const cleanup = () => {
      seqVid.removeEventListener("ended", finish);
      seqVid.removeEventListener("error", finish);
    };

    seqVid.addEventListener("ended", finish);
    seqVid.addEventListener("error", finish);

    const p = seqVid.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => finish()); // autoplay blocked -> continue flow
    }

    setTimeout(finish, maxMs);
  });

  // Fade out
  seqVid.classList.remove("showFade");
  await sleep(600);

  // Cleanup
  try { seqVid.pause(); } catch {}
  seqVid.classList.add("hidden");
  seqVid.removeAttribute("src");
  try { seqVid.load(); } catch {}
}


async function fadeOutAudio(audioEl, durationMs = 1200) {
  if (!audioEl) return;
  const steps = 24;
  const stepTime = durationMs / steps;
  const startVol = audioEl.volume ?? 1;

  for (let i = steps; i >= 0; i--) {
    audioEl.volume = startVol * (i / steps);
    await sleep(stepTime);
  }
  safeStop(audioEl);
  audioEl.volume = startVol; // reset for next time
}

async function fadeInAudio(audioEl, targetVol = 0.35, durationMs = 900, loop = true) {
  if (!audioEl || !userInteracted) return;
  audioEl.volume = 0;
  safePlay(audioEl, 0, loop);
  const steps = 20;
  const stepTime = durationMs / steps;

  for (let i = 1; i <= steps; i++) {
    audioEl.volume = targetVol * (i / steps);
    await sleep(stepTime);
  }
}

async function fadeBetween(ms = 360) {
  if (!globalFade) return;
  globalFade.classList.add("on");
  await sleep(ms);
  globalFade.classList.remove("on");
  await sleep(120);
}





async function showImageSmooth(path, holdMs, audioEl = null, volume = 0.7) {
  hideAllSeqVisuals();

  // show image
  seqImg.classList.remove("hidden", "showFade");
  seqImg.src = path;

  // fade in
  await sleep(40);
  seqImg.classList.add("showFade");

  // start audio for the duration (optional)
  if (audioEl) safePlay(audioEl, volume, false);

  // hold on screen
  await sleep(holdMs);

  // fade out
  seqImg.classList.remove("showFade");
  await sleep(1150);

  // stop audio after fade (optional)
  if (audioEl) safeStop(audioEl);

  // hide image
  seqImg.classList.add("hidden");
  seqImg.removeAttribute("src");
}



// ===== NO positioning helpers =====
function setNoInlineAligned() {
  noIsAbsolute = false;
  noBtn.style.position = "static";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.opacity = "1";
  noBtn.style.pointerEvents = "auto";
  noBtn.style.transform = `scale(${noScale})`;
}

function makeNoAbsoluteAtCurrentSpot() {
  if (noIsAbsolute) return;
  noIsAbsolute = true;

  const area = document.getElementById("buttons");
  const rect = area.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const left = btnRect.left - rect.left;
  const top  = btnRect.top - rect.top;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${left}px`;
  noBtn.style.top  = `${top}px`;
}

// ===== Intro timings =====
async function runIntroOneByOne() {
  const lines = [
    { text: "Hello Wiktoria", holdMs: 2500 },
    { text: "A little birdie told me no one has asked you to be a Valentine yet.", holdMs: 3500 },
    { text: "Well, don’t you worry, beautiful — your Romeo has arrived!", holdMs: 3500 },
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

  // Rose entrance
  rose.classList.add("flyIn");
  await sleep(1200);

  intro.classList.add("fadeOut");
  await sleep(750);

  intro.style.display = "none";
  card.classList.remove("hidden");

  // ✅ Start aligned
  setNoInlineAligned();

  // ✅ Start tension sound while choosing
  safePlay(audTension, 0.35, true);
}

startBtn.addEventListener("click", () => {
  userInteracted = true;
  startOverlay.remove();
  runIntroOneByOne();
});


// ===== NO movement =====
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

// ✅ On FIRST HOVER: convert to absolute at same spot, then slide away
function activateDodgingOnHover(ev) {
  if (finished) return;

  // convert from inline->absolute so it can move
  makeNoAbsoluteAtCurrentSpot();

  // move away immediately
  slideNoButtonAway(ev);
}

// Works reliably on mouse + trackpad + pen devices
noBtn.addEventListener("pointerenter", activateDodgingOnHover);
noBtn.addEventListener("mouseenter", activateDodgingOnHover); // extra safety

noBtn.addEventListener("pointermove", (ev) => {
  if (!noIsAbsolute) return;
  slideNoButtonAway(ev);
});


// ===== NO clicked: scaling + messages =====
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (finished) return;

  noClicks++;
  

  toast.textContent = noFlow[Math.min(noFlow.length - 1, noClicks - 1)];

  noScale = Math.max(0, 1 - noClicks * 0.12);
  yesScale = Math.min(2.2, 1 + noClicks * 0.10);

  applyButtonScales();

  if (noScale <= 0.08) {
    noBtn.style.opacity = "0";
    noBtn.style.pointerEvents = "none";
    toast.textContent = "NO has left the chat. 🙂";
    safeStop(audTension);
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

function startConfettiSides(perSide = 650) {
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

  // cache-bust so GitHub pages updates always show
  const bust = `?v=${Date.now()}`;
  imgEl.src = path + bust;
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
  // text/image/gtr/video
  seqText.classList.add("hidden");
  seqImg.classList.add("hidden");
  seqGtrWrap.classList.add("hidden");

  // reset image fade
  seqImg.classList.remove("showFade");
  seqImg.removeAttribute("src");

  // reset gtr
  seqGtr.removeAttribute("src");
  seqGtr.classList.remove("shake", "driveOff");

  // reset seq text styles
  seqText.classList.remove("seqFadeOut", "small");

  // video reset
  if (seqVid) {
    seqVid.classList.add("hidden");
    seqVid.classList.remove("showFade");
    try { seqVid.pause(); } catch {}
    seqVid.removeAttribute("src");
    try { seqVid.load(); } catch {}
  }

  // thank you scene reset
  if (thankWrap) thankWrap.classList.add("hidden");
  if (photoRing) {
    photoRing.classList.add("hidden");
    photoRing.classList.remove("show");
  }
  if (thankText) thankText.classList.add("hidden");

}


// ===== YES CLICK → sequence =====
yesBtn.addEventListener("click", async () => {
  if (finished) return;
  finished = true;

  safeStop(audTension);

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
  await sleep(1100);

  hideAllSeqVisuals();
  await fadeOutAudio(audSong, 1200);

  // short calm pause before the kiss
  await sleep(300);

  // play cat kiss video (with its own audio)
  await playSeqVideo("assets/cat-kiss.mp4", { maxMs: 12000 });
  await sleep(250);


  hideAllSeqVisuals();
  showSeqText("Here are your gifts…", { big: false });
  await sleep(1700);
  hideSeqTextFade();
  await sleep(700);

  hideAllSeqVisuals();
  await showImageSmooth("assets/love-stone.png", 8000, audStoneGift, 0.8);


  hideAllSeqVisuals();
  await showImageSmooth("assets/cat-flowers.gif", 8000, audFlowersGift, 0.7);


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

 


  // Fade transition into thank-you scene
  await fadeBetween(900);

  // start music FIRST (give it a tiny headstart)
  audThankYou.load?.();
  safePlay(audThankYou, 0.6, false);
  await sleep(250);

  // show container, but keep text/photos hidden
  thankWrap.classList.remove("hidden");
  photoRing.classList.remove("hidden");
  photoRing.classList.remove("show");
  thankText.classList.add("hidden");

  // delay so the music clearly leads
  await sleep(900);

// show text
thankText.classList.remove("hidden");

// then photos
await sleep(700);

setImg(us1, "assets/us-1.jpg");
setImg(us2, "assets/us-2.jpg");
setImg(us3, "assets/us-3.jpg");
setImg(us4, "assets/us-4.jpg");
setImg(us5, "assets/us-5.jpg");
setImg(us6, "assets/us-6.jpg");
setImg(us7, "assets/us-7.jpg");
setImg(us8, "assets/us-8.jpg"); // <<< IMPORTANT: match your real file

await sleep(50);
photoRing.classList.add("show");

  // keep this scene on screen longer
  await sleep(20000);

  if (globalFade) globalFade.classList.add("on");
  await sleep(900);

  
  sequence.classList.add("hidden");
  finalPage.classList.remove("hidden");

  await sleep(120);
  if (globalFade) globalFade.classList.remove("on");
  await sleep(220);

  setImg(finalStone, "assets/love-stone.png");
  setImg(finalFlowerCat, "assets/cat-flowers.gif");
  setImg(finalGtr, "assets/gtr.png");

  setImg(finalUs1, "assets/us-1.jpg");
  setImg(finalUs2, "assets/us-2.jpg");
  setImg(finalUs3, "assets/us-3.jpg");
  setImg(finalUs4, "assets/us-4.jpg");
  setImg(finalUs5, "assets/us-5.jpg");
  setImg(finalUs6, "assets/us-6.jpg");
  setImg(finalUs7, "assets/us-7.jpg");
  setImg(finalUs8, "assets/us-8.jpg");

  
});

restartBtn.addEventListener("click", () => {
  safeStop(audSong);
  safeStop(audEngine);
  safeStop(audTension);
  safeStop(audThankYou);

  finished = false;
  noClicks = 0;
  yesScale = 1;
  noScale = 1;
  applyButtonScales();

  toast.textContent = "";

  // reset NO
  setNoInlineAligned();

  finalPage.classList.add("hidden");

  intro.style.display = "";
  intro.classList.remove("fadeOut");
  rose.classList.remove("flyIn");
  introSingleLine.classList.remove("show", "hide");

  card.classList.add("hidden");
  runIntroOneByOne();
});
