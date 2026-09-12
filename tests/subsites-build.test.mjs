import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../_site');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]);
}
test('both subsites render their content at the requested paths', () => {
  for (const page of ['product/index.html', 'product/en/index.html', 'fde-learning/index.html']) {
    assert.ok(existsSync(join(root, page)), `Missing ${page}`);
  }
  assert.match(readFileSync(join(root, 'product/index.html'), 'utf8'), /wude/i);
  assert.equal(readdirSync(join(root, 'product/cases'), { withFileTypes: true }).filter(e => e.isDirectory()).length, 7);
  assert.equal(readdirSync(join(root, 'fde-learning/course')).length, 20);
});
test('rendered local links and assets resolve, and old personal contacts are absent', () => {
  assert.ok(existsSync(root), 'Build the sites first');
  const broken = [];
  for (const file of files(root).filter(f => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /837911722@qq\.com|wmc837911722@gmail\.com|wechat-fengyu/);
    const page = `https://cs-wude.github.io/${file.slice(root.length + 1).replaceAll('\\', '/')}`;
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(#|mailto:|tel:|data:|javascript:)/.test(raw)) continue;
      const url = new URL(raw.replaceAll('&amp;', '&'), page);
      if (url.hostname === 'github.com') {
        const guideFile = url.pathname.match(/^\/CS-wude\/fde-learning\/(?:blob|tree|edit)\/main\/(.+)$/);
        if (url.pathname.startsWith('/CS-wude/fde-learning/') && !guideFile) broken.push(`${file}: ${raw}`);
        if (guideFile && !existsSync(resolve(import.meta.dirname, '../sites/fde-learning', decodeURIComponent(guideFile[1])))) {
          broken.push(`${file}: ${raw}`);
        }
        const repositoryFile = url.pathname.match(/^\/CS-wude\/CS-wude\.github\.io\/(?:blob|tree|edit)\/main\/(.+)$/);
        if (repositoryFile && !existsSync(resolve(import.meta.dirname, '..', decodeURIComponent(repositoryFile[1])))) {
          broken.push(`${file}: ${raw}`);
        }
      }
      if (url.origin !== 'https://cs-wude.github.io') continue;
      const target = join(root, decodeURIComponent(url.pathname));
      if (!existsSync(target) && !existsSync(join(target, 'index.html'))) broken.push(`${file}: ${raw}`);
    }
  }
  assert.deepEqual(broken, []);
  for (const privateDir of ['sites', 'node_modules', '.git', '.worktrees', 'tests', 'docs']) {
    assert.equal(existsSync(join(root, privateDir)), false, `Artifact contains ${privateDir}`);
  }
});
test('subsite text assets contain no old author identity or account verification', () => {
  for (const site of ['product', 'fde-learning']) {
    for (const file of files(join(root, site)).filter(f => /\.(?:html|js|json|svg|txt|xml|css)$/.test(f))) {
      assert.doesNotMatch(readFileSync(file, 'utf8'), /wmc837911722|837911722@qq|fengyu|风雨|2ABD6FF780C81CC0672EA3C010EE51FA/i, file);
      assert.doesNotMatch(readFileSync(file, 'utf8'), /sites\/fde-learning\/(?:blob|tree)\/main/, file);
    }
  }
});
