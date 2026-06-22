import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "public/icons/icon.svg"));

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(join(root, `public/icons/icon-${size}.png`));
  console.log(`Wrote public/icons/icon-${size}.png`);
}

// Maskable icons need extra padding so Android adaptive icons don't clip.
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.72);
  const padded = await sharp(svg)
    .resize(inner, inner)
    .extend({
      top: Math.floor((size - inner) / 2),
      bottom: Math.ceil((size - inner) / 2),
      left: Math.floor((size - inner) / 2),
      right: Math.ceil((size - inner) / 2),
      background: "#0284c7",
    })
    .png()
    .toBuffer();
  await sharp(padded).toFile(join(root, `public/icons/icon-maskable-${size}.png`));
  console.log(`Wrote public/icons/icon-maskable-${size}.png`);
}
