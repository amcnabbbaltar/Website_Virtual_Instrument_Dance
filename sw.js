// Offline support: after the first visit, the whole game (tracker included) works with no internet.
const CACHE = 'dance-cards-v1';
const FILES = ["./", "index.html", "style.css", "app.js", "audio.js", "prompts.txt", "manifest.webmanifest", "icon.svg",
"mediapipe/pose/pose.js",
"mediapipe/pose/pose_landmark_full.tflite",
"mediapipe/pose/pose_landmark_lite.tflite",
"mediapipe/pose/pose_solution_packed_assets.data",
"mediapipe/pose/pose_solution_packed_assets_loader.js",
"mediapipe/pose/pose_solution_simd_wasm_bin.data",
"mediapipe/pose/pose_solution_simd_wasm_bin.js",
"mediapipe/pose/pose_solution_simd_wasm_bin.wasm",
"mediapipe/pose/pose_solution_wasm_bin.js",
"mediapipe/pose/pose_solution_wasm_bin.wasm",
"mediapipe/pose/pose_web.binarypb",
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // prompts.txt and the ambient file: try the network first so edits show up, fall back to cache when offline
  if (url.pathname.endsWith('prompts.txt') || url.pathname.includes('/ambient/')) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
