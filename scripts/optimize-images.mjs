import sharp from "sharp";
import { statSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const src = "assets/images/source/enive-hero-v2.png";
const meta = await sharp(src).metadata();
const width = Math.min(meta.width, 1920);

await sharp(src)
  .resize({ width, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile("assets/images/enive-hero.webp");
await sharp(src)
  .resize({ width, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("assets/images/enive-hero.jpg");

console.log("source:", meta.width, "x", meta.height, meta.format);
for (const f of [
  "assets/images/enive-hero.webp",
  "assets/images/enive-hero.jpg",
]) {
  const m = await sharp(f).metadata();
  console.log(
    f,
    "->",
    m.width,
    "x",
    m.height,
    (statSync(f).size / 1024).toFixed(0) + "KB",
  );
}

const serviceImages = [
  "assets/images/services/consultations-hero.jpeg",
  "assets/images/services/injectables-hero.jpeg",
  "assets/images/services/iv-hydration-hero.jpeg",
  "assets/images/services/laser-hair-removal-hero.jpeg",
  "assets/images/services/medical-weight-loss-hero.jpeg",
  "assets/images/services/peptide-therapy-hero.jpeg",
  "assets/images/services/wellness-hero.jpeg",
];

for (const input of serviceImages) {
  const output = join(
    dirname(input),
    `${basename(input, extname(input))}.webp`,
  );
  await sharp(input)
    .rotate()
    .resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(output);
  const outputMeta = await sharp(output).metadata();
  console.log(
    output,
    "->",
    outputMeta.width,
    "x",
    outputMeta.height,
    (statSync(output).size / 1024).toFixed(0) + "KB",
    `(from ${(statSync(input).size / 1024).toFixed(0)}KB)`,
  );
}
