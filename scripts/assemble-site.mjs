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
await cp(join(root, 'sites/product/dist-github-pages'), join(output, 'product'), { recursive: true });
if (!process.argv.includes('--product-only')) {
  await cp(join(root, 'sites/fde-learning/dist'), join(output, 'fde-learning'), { recursive: true });
  console.log('Built combined local preview with the portfolio, /product/ and /fde-learning/.');
} else {
  console.log('Built portfolio and /product/ artifact; /fde-learning/ deploys from its own repository.');
}
