// Dance Cards — tiny local web server for Max (Node for Max). No internet, no npm install needed.
// It serves the Dance Cards folder at http://localhost:8137 and tells [jweb] to open it.
const http = require('http');
const fs = require('fs');
const path = require('path');
let maxApi = null;
try { maxApi = require('max-api'); } catch (e) { /* running outside Max: plain node server.js */ }

const ROOT = path.resolve(__dirname, '..');
const PORT = +(process.argv[2] || 8137);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aif': 'audio/aiff', '.aiff': 'audio/aiff' };
const log = (...a) => maxApi ? maxApi.post(a.join(' ')) : console.log(...a);

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}/index.html?autostart=1`;
  log('Dance Cards running at', url);
  if (maxApi) {
    maxApi.outlet('url', url);
    // tell sfplay~ where the ambient file is (wav/aif recommended in Max; mp3 works on most systems)
    for (const name of ['ambient.wav', 'ambient.aif', 'ambient.aiff', 'ambient.mp3']) {
      const f = path.join(ROOT, 'ambient', name);
      if (fs.existsSync(f)) { maxApi.outlet('ambientpath', f); break; }
    }
  }
});
server.on('error', e => log('Server error:', e.message, '(is Dance Cards already open in another patch?)'));
