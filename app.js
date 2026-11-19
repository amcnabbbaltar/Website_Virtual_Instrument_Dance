// Dance Cards — webcam dance game. MediaPipe Pose runs locally (files in /mediapipe), no internet needed.
// Flow: IDLE (swipe to draw) → CARD (prompt shown + read aloud) → PICK (choose instrument by gesture) → PLAY.
import { Engine, CHORDS, INSTRUMENTS, DRUM_NOTES, chordLabel } from './audio.js';

// ---------------------------------------------------------------- settings
const DEFAULTS = { sens: 1, seated: false, newcard: 'handsup', dwell: 1.5, speak: true, voice: '', key: 0,
  audio: null, ambvol: 0.6, video: true, prompts: '', camera: '' };
const params = new URLSearchParams(location.search);
const IN_MAX = !!(window.max && window.max.outlet);
let S = { ...DEFAULTS };
try { S = { ...S, ...JSON.parse(localStorage.getItem('dancecards.settings') || '{}') }; } catch (e) {}
if (!S.audio) S.audio = IN_MAX ? 'max' : 'browser';
const save = () => { try { localStorage.setItem('dancecards.settings', JSON.stringify(S)); } catch (e) {} };

// ---------------------------------------------------------------- Max bridge (when running inside jweb)
const lastSent = {};
function toMax(name, ...args) {
  if (!IN_MAX) return;
  try { window.max.outlet(name, ...args); } catch (e) {}
}
function toMaxThrottled(name, value, ms = 66) {
  const now = performance.now();
  if (lastSent[name] && now - lastSent[name] < ms) return;
  lastSent[name] = now; toMax(name, +value.toFixed(3));
}
if (IN_MAX && window.max.bindInlet) {
  window.max.bindInlet('newcard', () => drawCard());
  window.max.bindInlet('ambient', v => setAmbient(v === undefined ? !ambientOn : !!+v));
  window.max.bindInlet('instrument', id => chooseInstrument(String(id)));
}
const browserSound = () => S.audio !== 'max';
const maxSound = () => S.audio !== 'browser';

// ---------------------------------------------------------------- DOM
const $ = id => document.getElementById(id);
const video = $('video'), canvas = $('stage'), g = canvas.getContext('2d');
const statusEl = $('status'), cardEl = $('card'), cardText = $('card-text');
const picker = $('picker'), ladder = $('ladder'), hud = $('hud');
const engine = new Engine();

function setStatus(t) { if (statusEl.textContent !== t) statusEl.textContent = t; }

// instrument tiles
INSTRUMENTS.forEach((ins, i) => {
  const d = document.createElement('div');
  d.className = 'tile'; d.dataset.id = ins.id;
  d.innerHTML = `<div class="fill"></div><div class="icon">${ins.icon}</div><div class="name">${ins.label}</div><div class="small">key ${i + 1}</div>`;
  d.onclick = () => chooseInstrument(ins.id);
  picker.appendChild(d);
});
const tiles = [...picker.children];
// chord ladder
CHORDS.forEach(() => { const r = document.createElement('div'); r.className = 'rung'; ladder.appendChild(r); });
const rungs = [...ladder.children];
function refreshLadder() { rungs.forEach((r, i) => r.textContent = engine.instrument === 'drums'
  ? ['Kick', 'Kick', 'Snare', 'Tom', 'Hat', 'Crash'][i] : chordLabel(i, S.key)); }

// ---------------------------------------------------------------- prompts
let prompts = [], bag = [];
const FALLBACK = ['Move as if the floor is slowly melting', 'Only your hands are allowed to dance',
  'Dance like you are underwater', 'Grow from very small to very big', 'Let your breath lead the movement'];
const parsePrompts = txt => txt.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
async function loadPrompts() {
  if (S.prompts.trim()) { prompts = parsePrompts(S.prompts); }
  else {
    try { const r = await fetch('prompts.txt', { cache: 'no-cache' }); prompts = parsePrompts(await r.text()); }
    catch (e) { prompts = FALLBACK; }
  }
  if (!prompts.length) prompts = FALLBACK;
  bag = [];
}
function nextPrompt() {            // shuffle-bag: every card once before any repeats
  if (!bag.length) bag = [...prompts].sort(() => Math.random() - 0.5);
  return bag.pop();
}

// ---------------------------------------------------------------- speech (uses voices installed on the computer)
let voices = [];
function loadVoices() {
  if (!window.speechSynthesis) return;
  voices = speechSynthesis.getVoices();
  const sel = $('set-voice');
  sel.innerHTML = '<option value="">Automatic (offline voice if possible)</option>' +
    voices.map(v => `<option value="${v.name}">${v.name} (${v.lang})${v.localService ? '' : ' — needs internet'}</option>`).join('');
  sel.value = S.voice;
}
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speak(text, onEnd) {
  if (!S.speak || !window.speechSynthesis) { onEnd && setTimeout(onEnd, 2500); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const lang = document.documentElement.lang || 'en';
  u.voice = voices.find(v => v.name === S.voice) ||
            voices.find(v => v.localService && v.lang.startsWith(navigator.language.slice(0, 2))) ||
            voices.find(v => v.localService && v.lang.startsWith(lang)) || null;
  u.rate = 0.95;
  let done = false; const fin = () => { if (!done) { done = true; onEnd && onEnd(); } };
  u.onend = fin; u.onerror = fin;
  setTimeout(fin, 1500 + text.length * 90);   // safety net if the voice never reports "end"
  speechSynthesis.speak(u);
}

// ---------------------------------------------------------------- game state
let state = 'idle';          // idle | card | pick | play
let currentCard = '';
let ambientOn = false;
let cardTimer = null;

function setState(s) {
  state = s;
  toMax('state', s);
  cardEl.classList.toggle('hidden', s === 'idle');
  cardEl.classList.toggle('small', s === 'pick' || s === 'play');
  cardEl.classList.toggle('top', s === 'play');
  picker.classList.toggle('hidden', s !== 'pick');
  ladder.classList.toggle('hidden', s !== 'play');
  hud.classList.toggle('hidden', s !== 'play');
  if (s === 'idle') setStatus('👋 Swipe a hand to draw a card');
  if (s === 'pick') { setStatus('✋ Point at an instrument and hold'); markCurrentTile(); }
  if (s === 'play') { refreshLadder(); setStatus(''); }
}

function drawCard() {
  clearTimeout(cardTimer);
  currentCard = nextPrompt();
  cardText.textContent = currentCard;
  cardEl.classList.remove('small', 'top');
  void cardEl.offsetWidth;               // restart the flip animation
  setState('card');
  setStatus('');
  engine.releasePad();
  if (browserSound()) engine.drum('crash', 0.35);
  toMax('card', currentCard);
  // stay on the card while it is read, then go to the instrument picker
  const shownAt = performance.now();
  speak(currentCard, () => {
    const wait = Math.max(0, 3500 - (performance.now() - shownAt));
    cardTimer = setTimeout(() => { if (state === 'card') { speak('Choose your instrument'); setState('pick'); } }, wait + 800);
  });
}

function chooseInstrument(id) {
  const ins = INSTRUMENTS.find(i => i.id === id);
  if (!ins) return;
  engine.setInstrument(id);
  toMax('instrument', id); toMax('program', ins.gm);
  speak(ins.label);
  $('hud-instr').textContent = ins.icon + ' ' + ins.label.toUpperCase();
  lastZone = -1;
  if (state !== 'idle') setState('play'); else markCurrentTile();
}
function markCurrentTile() { tiles.forEach(t => t.classList.toggle('current', t.dataset.id === engine.instrument)); }

function setAmbient(on) {
  ambientOn = on;
  if (browserSound()) engine.setAmbient(on); else engine.setAmbient(false);
  toMax('ambient', on ? 1 : 0);
  $('hud-ambient').textContent = on ? 'AMBIENT ON' : 'AMBIENT OFF';
  $('hud-ambient').classList.toggle('on', on);
  if (on && engine.ambientMissing && browserSound())
    flash('No ambient file yet: put ambient.mp3 in the ambient folder or choose it in Settings');
}
let flashTimer;
function flash(t) { setStatus(t); clearTimeout(flashTimer); flashTimer = setTimeout(() => { if (state === 'idle') setState('idle'); else if (state === 'play') setStatus(''); }, 3500); }

// ---------------------------------------------------------------- tracking → gestures → music
const L = { nose: 0, ls: 11, rs: 12, le: 13, re: 14, lw: 15, rw: 16, lh: 23, rh: 24, lk: 25, rk: 26, la: 27, ra: 28 };
let prevPts = null, prevT = 0, energy = 0, reverbSmooth = 0.3;
const hist = { lw: [], rw: [] };          // wrist position history for swipe detection
let lastSwipe = 0, lastSeen = 0;
let pickCol = -1, pickSince = 0;
let handsUpSince = 0;
let lastZone = -1, zoneCandidate = -1, zoneSince = 0;
const lastPunch = { lw: 0, rw: 0 }, prevSpeed = { lw: 0, rw: 0 };

function onPose(lm, iw, ih, now) {
  const P = i => ({ x: lm[i].x * iw, y: lm[i].y * ih, v: lm[i].visibility ?? 1 });
  const ls = P(L.ls), rs = P(L.rs);
  if (ls.v < 0.5 || rs.v < 0.5) return false;
  const sw = Math.max(20, Math.hypot(ls.x - rs.x, ls.y - rs.y));   // shoulder width = body-size unit
  const mid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const s = S.sens;
  const wr = { lw: P(L.lw), rw: P(L.rw) }, el = { lw: P(L.le), rw: P(L.re) };
  const nose = P(L.nose);
  const hands = ['lw', 'rw'].filter(k => wr[k].v > 0.4);
  const height = k => (mid.y - wr[k].y) / sw;        // + above shoulders, − below (in shoulder widths)
  lastSeen = now;

  // movement energy: average speed of wrists, elbows, head (+ legs unless seated), in body units / second
  const ids = [L.lw, L.rw, L.le, L.re, L.nose].concat(S.seated ? [] : [L.lk, L.rk, L.la, L.ra]);
  const pts = ids.map(P);
  const dt = Math.max(0.016, (now - prevT) / 1000);
  if (prevPts && dt < 0.5) {
    let sum = 0, n = 0;
    pts.forEach((p, i) => { if (p.v > 0.4 && prevPts[i].v > 0.4) { sum += Math.hypot(p.x - prevPts[i].x, p.y - prevPts[i].y) / sw / dt; n++; } });
    const speed = n ? sum / n : 0;
    const target = Math.min(1, (speed * s) / 3.5);
    energy += (target - energy) * (target > energy ? 0.25 : 0.06);  // quick rise, slow fall
  }
  prevPts = pts; prevT = now;

  // wrist speeds (for swipes and punches)
  const wspeed = {};
  for (const k of ['lw', 'rw']) {
    const h = hist[k];
    if (wr[k].v > 0.4) h.push({ t: now, x: wr[k].x / sw, y: wr[k].y / sw });
    while (h.length && now - h[0].t > 500) h.shift();
    wspeed[k] = h.length > 1 ? Math.hypot(h[h.length - 1].x - h[h.length - 2].x, h[h.length - 1].y - h[h.length - 2].y) /
      Math.max(0.016, (h[h.length - 1].t - h[h.length - 2].t) / 1000) : 0;
  }

  const swiped = detectSwipe(now, s);

  if (state === 'idle') {
    if (swiped) drawCard();
  } else if (state === 'pick') {
    handlePick(hands, wr, el, mid, sw, height, s, now);
  } else if (state === 'play') {
    // new card while playing
    if (S.newcard === 'swipe' && swiped) { drawCard(); return true; }
    if (S.newcard === 'handsup') {
      const up = hands.length === 2 && wr.lw.y < nose.y && wr.rw.y < nose.y;
      if (up) { handsUpSince = handsUpSince || now; const p = (now - handsUpSince) / 1500;
        setStatus('🙌 New card… ' + '●'.repeat(Math.min(5, Math.ceil(p * 5))));
        if (p >= 1) { handsUpSince = 0; drawCard(); return true; } }
      else if (handsUpSince) { handsUpSince = 0; setStatus(''); }
    }
    playMusic(hands, wr, sw, height, s, now, wspeed);
  }
  return true;
}

function detectSwipe(now, s) {
  if (now - lastSwipe < 1300) return false;
  const need = 1.5 / Math.sqrt(s);           // horizontal travel needed, in shoulder widths
  for (const k of ['lw', 'rw']) {
    const h = hist[k];
    if (h.length < 4) continue;
    const recent = h.filter(p => now - p.t < 450);
    if (recent.length < 3) continue;
    const dx = recent[recent.length - 1].x - recent[0].x, dy = recent[recent.length - 1].y - recent[0].y;
    if (Math.abs(dx) > need && Math.abs(dy) < Math.abs(dx) * 0.7) {
      lastSwipe = now; hist.lw.length = 0; hist.rw.length = 0;
      return true;
    }
  }
  return false;
}

function handlePick(hands, wr, el, mid, sw, height, s, now) {
  // the raised hand (wrist above its elbow, or above chest) points at a column; hold to choose
  const raised = hands.filter(k => wr[k].y < el[k].y || height(k) > -0.4);
  if (!raised.length) { pickCol = -1; updateTiles(-1, 0); return; }
  const k = raised.sort((a, b) => height(b) - height(a))[0];
  const rel = ((wr[k].x - mid.x) / sw) * s;            // −2.4 … +2.4 body widths, mirrored view
  const col = Math.max(0, Math.min(3, Math.floor((rel + 2.4) / 4.8 * 4)));
  if (col !== pickCol) { pickCol = col; pickSince = now; }
  const p = Math.min(1, (now - pickSince) / (S.dwell * 1000));
  updateTiles(col, p);
  if (p >= 1) { pickCol = -1; chooseInstrument(INSTRUMENTS[col].id); }
}
function updateTiles(col, p) {
  tiles.forEach((t, i) => { t.classList.toggle('hover', i === col); t.firstChild.style.height = (i === col ? p * 100 : 0) + '%'; });
}

function playMusic(hands, wr, sw, height, s, now, wspeed) {
  // REVERB ← how much the body moves (bigger movement = more reverb)
  const targetVerb = 0.08 + energy * 0.82;
  reverbSmooth += (targetVerb - reverbSmooth) * 0.08;
  if (browserSound()) { engine.setReverb(reverbSmooth); engine.setGrooveEnergy(energy); }
  toMaxThrottled('reverb', reverbSmooth); toMaxThrottled('energy', energy);
  $('hud-reverb').style.width = Math.round(reverbSmooth * 100) + '%';

  // BRIGHTNESS ← distance between the two hands (open arms = brighter synth)
  if (hands.length === 2) {
    const spread = Math.hypot(wr.lw.x - wr.rw.x, wr.lw.y - wr.rw.y) / sw;
    const b = Math.max(0, Math.min(1, (spread * s - 0.5) / 3));
    if (browserSound()) engine.setBrightness(b);
    toMaxThrottled('bright', b);
  }

  if (!hands.length) return;
  // CHORD ← height of the highest hand (6 zones, from hip to above the head)
  const top = hands.sort((a, b) => height(b) - height(a))[0];
  const zf = ((height(top) - 0.4) * s + 2.0) / 4.0 * CHORDS.length;   // centered just above shoulders
  let zone = Math.max(0, Math.min(CHORDS.length - 1, Math.floor(zf)));
  if (lastZone >= 0 && zf > lastZone - 0.2 && zf < lastZone + 1.2) zone = lastZone;   // hysteresis: no flicker
  if (zone !== zoneCandidate) { zoneCandidate = zone; zoneSince = now; }
  if (zone !== lastZone && now - zoneSince > 90) {
    lastZone = zone; triggerChord(zone, 0.55 + energy * 0.45);
  }
  // ACCENT ← a quick punch/flick of a wrist re-plays the chord (piano, bells, drums)
  for (const k of hands) {
    const sp = wspeed[k] * s;
    if (engine.instrument !== 'synth' && prevSpeed[k] > 5 && sp < prevSpeed[k] && now - lastPunch[k] > 280 && lastZone >= 0) {
      lastPunch[k] = now; triggerChord(lastZone, Math.min(1, 0.5 + prevSpeed[k] / 20));
    }
    prevSpeed[k] = sp;
  }
}

function triggerChord(zone, vel) {
  if (browserSound()) engine.playChord(zone, vel);
  if (maxSound()) {
    if (engine.instrument === 'drums') {
      const type = ['kick', 'kick', 'snare', 'tom', 'hat', 'crash'][zone];
      toMax('drum', DRUM_NOTES[type], Math.round(vel * 127));
    } else toMax('notes', Math.round(vel * 127), ...engine.chordNotes(zone));
  }
  toMax('chord', chordLabel(zone, S.key), zone);
  $('hud-chord').textContent = engine.instrument === 'drums' ? ['Kick', 'Kick', 'Snare', 'Tom', 'Hat', 'Crash'][zone] : chordLabel(zone, S.key);
  rungs.forEach((r, i) => r.classList.toggle('on', i === zone));
}

// ---------------------------------------------------------------- drawing
const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
function draw(results) {
  const cw = canvas.width = innerWidth * devicePixelRatio, ch = canvas.height = innerHeight * devicePixelRatio;
  const img = results.image, iw = img.width, ih = img.height;
  const sc = Math.max(cw / iw, ch / ih), ox = (cw - iw * sc) / 2, oy = (ch - ih * sc) / 2;
  g.fillStyle = '#0b0b12'; g.fillRect(0, 0, cw, ch);
  if (S.video) { g.globalAlpha = 0.4; g.drawImage(img, ox, oy, iw * sc, ih * sc); g.globalAlpha = 1; }
  const lm = results.poseLandmarks;
  if (!lm) return;
  const X = i => lm[i].x * iw * sc + ox, Y = i => lm[i].y * ih * sc + oy;
  g.lineCap = 'round'; g.lineWidth = 10 * devicePixelRatio; g.strokeStyle = 'rgba(255,255,255,.75)';
  for (const [a, b] of BONES) {
    if ((lm[a].visibility ?? 1) < 0.4 || (lm[b].visibility ?? 1) < 0.4) continue;
    g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke();
  }
  g.fillStyle = '#ffd23f';
  for (const i of [15, 16]) if ((lm[i].visibility ?? 1) > 0.4) { g.beginPath(); g.arc(X(i), Y(i), 22 * devicePixelRatio, 0, 7); g.fill(); }
}

// ---------------------------------------------------------------- camera + MediaPipe
let pose, running = false;
async function initPose() {
  pose = new Pose({ locateFile: f => `mediapipe/pose/${f}` });
  pose.setOptions({ modelComplexity: +(params.get('model') ?? 1), smoothLandmarks: true, enableSegmentation: false,
    minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: true });
  pose.onResults(results => {
    const now = performance.now();
    draw(results);
    const ok = results.poseLandmarks && onPose(results.poseLandmarks, results.image.width, results.image.height, now);
    if (!ok) {
      prevPts = null;
      if (now - lastSeen > 1500) {
        if (state === 'play' && lastZone >= 0) { engine.releasePad(); lastZone = -1; rungs.forEach(r => r.classList.remove('on')); }
        if (state === 'idle' || state === 'play') setStatus(state === 'idle' ? '🧍 Step into the camera view' : '🧍 I can’t see you — step back into view');
      }
    } else if (state === 'idle' && !statusEl.textContent.startsWith('No ambient')) setStatus('👋 Swipe a hand to draw a card');
    else if (state === 'play' && statusEl.textContent.startsWith('🧍')) setStatus('');
  });
  await pose.initialize();
}

async function startCamera() {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  const constraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 }, ...(S.camera ? { deviceId: { exact: S.camera } } : {}) }, audio: false };
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia(constraints); }
  catch (e) { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
  video.srcObject = stream; await video.play();
  const cams = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
  $('set-camera').innerHTML = cams.map((c, i) => `<option value="${c.deviceId}">${c.label || 'Camera ' + (i + 1)}</option>`).join('');
  $('set-camera').value = stream.getVideoTracks()[0].getSettings().deviceId || '';
}

async function loop() {
  if (!running) return;
  if (video.readyState >= 2) { try { await pose.send({ image: video }); } catch (e) { console.error(e); } }
  requestAnimationFrame(loop);
}

async function start() {
  $('start-btn').disabled = true; $('start-btn').textContent = 'Starting…';
  try {
    await engine.init();
    engine.setAmbientVolume(S.ambvol);
    await startCamera();
  } catch (e) {
    $('start-btn').disabled = false; $('start-btn').textContent = 'Try again';
    $('start-note').textContent = 'Camera not available: ' + e.message + '. Allow camera access and make sure no other app is using it.';
    return;
  }
  $('start').classList.add('hidden');
  running = true; loop();
  if (state === 'idle') setState('idle');
  speak('Swipe a hand to draw a card');
}

// ---------------------------------------------------------------- settings UI + keyboard
function bindSettings() {
  const keySel = $('set-key');
  keySel.innerHTML = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k, i) => `<option value="${i <= 6 ? i : i - 12}">${k}</option>`).join('');
  const map = { 'set-sens': 'sens', 'set-dwell': 'dwell', 'set-newcard': 'newcard', 'set-voice': 'voice', 'set-key': 'key', 'set-audio': 'audio', 'set-ambvol': 'ambvol', 'set-prompts': 'prompts', 'set-camera': 'camera' };
  for (const [id, k] of Object.entries(map)) {
    const el = $(id); el.value = S[k];
    el.addEventListener('change', () => {
      S[k] = (typeof DEFAULTS[k] === 'number') ? +el.value : el.value; save();
      if (k === 'key') { engine.transpose = S.key; refreshLadder(); }
      if (k === 'ambvol') engine.setAmbientVolume(S.ambvol);
      if (k === 'prompts') loadPrompts();
      if (k === 'camera' && running) startCamera();
      if (k === 'audio') { if (!browserSound()) { engine.releasePad(); engine.setAmbient(false); } else if (ambientOn) engine.setAmbient(true); }
    });
  }
  for (const [id, k] of [['set-seated', 'seated'], ['set-speak', 'speak'], ['set-video', 'video']]) {
    const el = $(id); el.checked = S[k];
    el.addEventListener('change', () => { S[k] = el.checked; save(); });
  }
  $('set-ambfile').addEventListener('change', e => { const f = e.target.files[0]; if (f) engine.loadAmbientFile(f); });
  $('set-ambient').onclick = () => setAmbient(!ambientOn);
  $('set-reset').onclick = () => { localStorage.removeItem('dancecards.settings'); location.reload(); };
  $('gear').onclick = () => $('settings').showModal();
  engine.transpose = S.key;
}

addEventListener('keydown', e => {
  if ($('settings').open || !running) return;
  if (e.code === 'Space') { e.preventDefault(); drawCard(); }
  else if (/^Digit[1-4]$/.test(e.code)) chooseInstrument(INSTRUMENTS[+e.code.slice(5) - 1].id);
  else if (e.code === 'KeyA') setAmbient(!ambientOn);
  else if (e.code === 'KeyS') $('settings').showModal();
  else if (e.code === 'KeyM') engine.setMuted(!engine.muted);
  else if (e.code === 'KeyF') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  else if (e.code === 'Escape' && state !== 'idle') { engine.releasePad(); setState('idle'); }
});

// ---------------------------------------------------------------- boot
bindSettings();
loadPrompts();
$('hud-instr').textContent = '🌊 SYNTH';
$('start-btn').onclick = start;
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !IN_MAX)
  navigator.serviceWorker.register('sw.js').catch(() => {});
initPose().then(() => {
  $('start-btn').disabled = false; $('start-btn').textContent = '▶ Start';
  if (params.get('autostart') === '1') start();
}).catch(e => {
  $('start-btn').textContent = 'Tracker failed to load';
  $('start-note').textContent = (location.protocol === 'file:'
    ? 'This page must be opened through a local server or website, not by double-clicking the file. See README. '
    : '') + e.message;
});
window.__dance = { pauseTracking() { running = false; }, engine, get state() { return state; }, drawCard, chooseInstrument, setAmbient, onPose, get energy() { return energy; }, get zone() { return lastZone; }, get reverb() { return reverbSmooth; } };   // for testing / helpers
