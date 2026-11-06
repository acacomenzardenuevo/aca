// Prepare only referenced public files. Source artwork and QA files stay local.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = new Set(['index.html', 'CNAME', 'robots.txt', 'sitemap.xml']);
for (const match of html.matchAll(/(?:src|href)="((?:css|js|img|documentos)\/[^"?#]+)"/g)) files.add(match[1]);
for (const file of files) {
  const source = path.resolve(root, file);
  if (!source.startsWith(root + path.sep) || !fs.statSync(source).isFile()) throw Error('Invalid asset: ' + file);
}
// Reject stale output rather than silently publishing unrelated existing files.
if (fs.existsSync(output)) {
  function verify(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) verify(full);
      else if (!files.has(path.relative(output, full).split(path.sep).join('/'))) throw Error('Unexpected file in dist: ' + full);
    }
  }
  verify(output);
}
for (const file of files) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log('Prepared ' + files.size + ' public files in dist. Nothing published.');
