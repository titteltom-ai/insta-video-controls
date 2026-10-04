// Instagram Video Controls
// Tasten:
//   S = langsamer         D = schneller         R = Geschwindigkeit zurücksetzen
//   G = vorspulen          J = zurückspulen       (Standard-Sprung: 2s)
//   Z = Sprunggröße +1s    H = Sprunggröße -0,20s
//   Leertaste (Space) = Pause / Weiter

const SPEED_STEP = 0.25;
const MIN_SPEED = 0.25;
const MAX_SPEED = 4;

const DEFAULT_SEEK_STEP = 2; // Sekunden
const SEEK_STEP_INCREASE = 1;
const SEEK_STEP_DECREASE = 0.2;
const MIN_SEEK_STEP = 0.2;

let seekStep = DEFAULT_SEEK_STEP;

let overlayEl = null;
let overlayTimeout = null;

function showOverlay(text) {
  if (!overlayEl) {
    overlayEl = document.createElement("div");
    overlayEl.id = "ivc-overlay";
    document.documentElement.appendChild(overlayEl);
  }
  overlayEl.textContent = text;
  overlayEl.classList.add("ivc-visible");
  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    overlayEl.classList.remove("ivc-visible");
  }, 800);
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  return (
    tag === "input" ||
    tag === "textarea" ||
    el.isContentEditable === true
  );
}

// Wählt das Video aus, das gerade am meisten sichtbar ist (z.B. bei Reels/Feed
// gibt es oft mehrere <video>-Elemente gleichzeitig im DOM).
function getActiveVideo() {
  const videos = Array.from(document.querySelectorAll("video"));
  if (videos.length === 0) return null;
  if (videos.length === 1) return videos[0];

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let best = null;
  let bestScore = 0;

  for (const video of videos) {
    const rect = video.getBoundingClientRect();
    const visibleWidth =
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
    const visibleHeight =
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    if (visibleWidth <= 0 || visibleHeight <= 0) continue;

    let score = visibleWidth * visibleHeight;
    if (!video.paused) score *= 1.5; // spielende Videos bevorzugen

    if (score > bestScore) {
      bestScore = score;
      best = video;
    }
  }

  return best || videos[0];
}

function changeSpeed(delta) {
  const video = getActiveVideo();
  if (!video) return;
  let newSpeed = Math.round((video.playbackRate + delta) * 100) / 100;
  newSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, newSpeed));
  video.playbackRate = newSpeed;
  showOverlay(`Geschwindigkeit: ${newSpeed.toFixed(2)}x`);
}

function resetSpeed() {
  const video = getActiveVideo();
  if (!video) return;
  video.playbackRate = 1;
  showOverlay("Geschwindigkeit: 1.00x");
}

function seek(deltaSeconds) {
  const video = getActiveVideo();
  if (!video) return;
  const newTime = Math.max(
    0,
    Math.min(video.duration || Infinity, video.currentTime + deltaSeconds)
  );
  video.currentTime = newTime;
  const rounded = Math.round(deltaSeconds * 100) / 100;
  showOverlay(rounded > 0 ? `+${rounded}s` : `${rounded}s`);
}

function changeSeekStep(delta) {
  let newStep = Math.round((seekStep + delta) * 100) / 100;
  newStep = Math.max(MIN_SEEK_STEP, newStep);
  seekStep = newStep;
  showOverlay(`Sprunggröße: ${seekStep.toFixed(2)}s`);
}

function togglePlayPause() {
  const video = getActiveVideo();
  if (!video) return;
  if (video.paused) {
    video.play();
    showOverlay("▶ Wiedergabe");
  } else {
    video.pause();
    showOverlay("⏸ Pause");
  }
}

document.addEventListener(
  "keydown",
  (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    switch (event.key.toLowerCase()) {
      case "d":
        changeSpeed(SPEED_STEP);
        break;
      case "s":
        changeSpeed(-SPEED_STEP);
        break;
      case "r":
        resetSpeed();
        break;
      case "g":
        seek(seekStep);
        break;
      case "j":
        seek(-seekStep);
        break;
      case "z":
        changeSeekStep(SEEK_STEP_INCREASE);
        break;
      case "h":
        changeSeekStep(-SEEK_STEP_DECREASE);
        break;
      case " ":
        togglePlayPause();
        break;
      default:
        return;
    }

    event.preventDefault();
  },
  true
);

// ---------- Schieberegler-Leiste (Scrubber) ----------
// Fixe Leiste unten mittig, angelehnt an TikTok: dünne Linie, die beim
// Hovern/Ziehen dicker wird, plus großzügiger unsichtbarer Grabbereich,
// damit man beim Ziehen nicht exakt auf die dünne Linie treffen muss.

let scrubberEl, scrubberHitEl, scrubberTrackEl, scrubberFillEl, scrubberThumbEl, scrubberTimeEl;
let scrubberVideo = null;
let isDraggingScrubber = false;

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function buildScrubber() {
  scrubberEl = document.createElement("div");
  scrubberEl.id = "ivc-scrubber";

  scrubberTimeEl = document.createElement("div");
  scrubberTimeEl.id = "ivc-scrubber-time";

  scrubberHitEl = document.createElement("div");
  scrubberHitEl.id = "ivc-scrubber-hit";

  scrubberTrackEl = document.createElement("div");
  scrubberTrackEl.id = "ivc-scrubber-track";

  scrubberFillEl = document.createElement("div");
  scrubberFillEl.id = "ivc-scrubber-fill";

  scrubberThumbEl = document.createElement("div");
  scrubberThumbEl.id = "ivc-scrubber-thumb";

  scrubberTrackEl.appendChild(scrubberFillEl);
  scrubberTrackEl.appendChild(scrubberThumbEl);
  scrubberHitEl.appendChild(scrubberTrackEl);
  scrubberEl.appendChild(scrubberTimeEl);
  scrubberEl.appendChild(scrubberHitEl);
  document.documentElement.appendChild(scrubberEl);

  scrubberHitEl.addEventListener("pointerdown", onScrubberPointerDown);
}

function updateScrubberUI() {
  if (
    !scrubberVideo ||
    !isFinite(scrubberVideo.duration) ||
    scrubberVideo.duration <= 0
  ) {
    scrubberEl.classList.remove("ivc-visible");
    return;
  }
  scrubberEl.classList.add("ivc-visible");
  const ratio = Math.min(
    1,
    Math.max(0, scrubberVideo.currentTime / scrubberVideo.duration)
  );
  scrubberFillEl.style.width = `${ratio * 100}%`;
  scrubberThumbEl.style.left = `${ratio * 100}%`;
  scrubberTimeEl.textContent = `${formatTime(
    scrubberVideo.currentTime
  )} / ${formatTime(scrubberVideo.duration)}`;
}

function refreshScrubberTarget() {
  if (isDraggingScrubber) return;
  const active = getActiveVideo();
  scrubberVideo = active;
  if (scrubberVideo) {
    updateScrubberUI();
  } else {
    scrubberEl.classList.remove("ivc-visible");
  }
}

function seekFromPointer(clientX) {
  if (!scrubberVideo || !isFinite(scrubberVideo.duration)) return;
  const rect = scrubberTrackEl.getBoundingClientRect();
  let ratio = (clientX - rect.left) / rect.width;
  ratio = Math.min(1, Math.max(0, ratio));
  scrubberVideo.currentTime = ratio * scrubberVideo.duration;
  updateScrubberUI();
}

function onScrubberPointerDown(event) {
  if (!scrubberVideo) return;
  isDraggingScrubber = true;
  scrubberEl.classList.add("ivc-dragging");
  scrubberHitEl.setPointerCapture(event.pointerId);
  seekFromPointer(event.clientX);

  const onMove = (e) => seekFromPointer(e.clientX);
  const onUp = () => {
    isDraggingScrubber = false;
    scrubberEl.classList.remove("ivc-dragging");
    scrubberHitEl.removeEventListener("pointermove", onMove);
    scrubberHitEl.removeEventListener("pointerup", onUp);
    scrubberHitEl.removeEventListener("pointercancel", onUp);
  };

  scrubberHitEl.addEventListener("pointermove", onMove);
  scrubberHitEl.addEventListener("pointerup", onUp);
  scrubberHitEl.addEventListener("pointercancel", onUp);
  event.preventDefault();
}

buildScrubber();
setInterval(refreshScrubberTarget, 200);

// timeupdate feuert nicht bubbling, aber Capture-Listener auf document
// bekommen es trotzdem auf dem Weg zum Ziel-Element mit -> sorgt für
// flüssige Bewegung der Leiste zusätzlich zum 200ms-Polling.
document.addEventListener(
  "timeupdate",
  (event) => {
    if (event.target === scrubberVideo && !isDraggingScrubber) {
      updateScrubberUI();
    }
  },
  true
);
