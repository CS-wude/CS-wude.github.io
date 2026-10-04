import { cp, mkdir, readdir, rm } from 'node:fs/promises';
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
console.log('Built blog artifact.');
