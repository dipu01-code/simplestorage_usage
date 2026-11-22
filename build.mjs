// Bundles main.js and inlines it into dist/index.html (one self-contained file).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const out = await build({ entryPoints: [dir + 'main.js'], bundle: true, minify: true, format: 'iife', write: false });
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = readFileSync(dir + 'index.html', 'utf8')
  .replace('<script type="module" src="./main.js"></script>', `<script>${js}</script>`);
mkdirSync(dir + 'dist', { recursive: true });
writeFileSync(dir + 'dist/index.html', html);
console.log('wrote dist/index.html', html.length, 'bytes');
