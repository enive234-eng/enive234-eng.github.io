import sharp from 'sharp';

const src = 'assets/images/source/enive-hero-v2.png';
const meta = await sharp(src).metadata();
const width = Math.min(meta.width, 1920);

await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile('assets/images/enive-hero.webp');
await sharp(src).resize({ width, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile('assets/images/enive-hero.jpg');

console.log('source:', meta.width, 'x', meta.height, meta.format);
for (const f of ['assets/images/enive-hero.webp', 'assets/images/enive-hero.jpg']) {
  const m = await sharp(f).metadata();
  console.log(f, '->', m.width, 'x', m.height, (m.size / 1024).toFixed(0) + 'KB');
}
