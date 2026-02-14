import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'public/icons/icon.svg');
const outputDir = join(projectRoot, 'public/icons');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

async function generateIcons() {
  console.log('Generating PWA icons from SVG...');
  
  const svgBuffer = readFileSync(svgPath);
  
  for (const { name, size } of sizes) {
    const outputPath = join(outputDir, name);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }
  
  console.log('\\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
