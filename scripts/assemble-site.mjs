import { cp, mkdir, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { SKILLS, CATEGORIES } from '../data/skills.js';
import { renderSkills, escapeHTML } from '../skills-render.js';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, '_site');
// This is a fixed generated directory inside this repository.
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (/\.(html|css|js)$/.test(entry.name) || entry.name === '.nojekyll')) {
    await cp(join(root, entry.name), join(output, entry.name));
  }
}
for (const dir of ['assets', 'data']) await cp(join(root, dir), join(output, dir), { recursive: true });
const skillPage = await readFile(join(root, 'skills.html'), 'utf8');
await writeFile(join(output, 'skills.html'), skillPage
  .replace('<!-- SKILL_CARDS -->', renderSkills(SKILLS))
  .replace('<!-- SKILL_CATEGORIES -->', CATEGORIES.map(category => `<option>${escapeHTML(category)}</option>`).join(''))
  .replace('<!-- SKILL_COUNT -->', `显示 ${SKILLS.length} / ${SKILLS.length} 个技能`));
console.log('Built blog artifact.');
