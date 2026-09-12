import sharp from 'sharp';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
for (const [svg, png] of [
  ['sites/product/public/og-wude.svg', 'sites/product/public/og-fde-brand.png'],
]) await sharp(resolve(root, svg)).png().toFile(resolve(root, png));
