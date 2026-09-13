const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT || 4200);
const root = path.join(__dirname, 'dist');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = path.normalize(requestPath).replace(/^\.\.(?:[\/\\]|$)/, '');
  let file = path.join(root, safePath === '/' ? 'index.html' : safePath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  res.setHeader('Content-Type', contentTypes[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', file.endsWith('index.html') || file.endsWith('runtime-config.js') ? 'no-cache' : 'public, max-age=31536000, immutable');
  fs.createReadStream(file).on('error', () => { res.statusCode = 500; res.end('Internal Server Error'); }).pipe(res);
});
server.listen(port, '0.0.0.0', () => console.log(`Frontend escuchando en 0.0.0.0:${port}`));
