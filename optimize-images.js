import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imageDir = './src/assets';
const outputDir = './src/assets/optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if imageDir exists
if (fs.existsSync(imageDir)) {
  fs.readdirSync(imageDir).forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      sharp(path.join(imageDir, file))
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, file.replace(ext, '.webp')))
        .then(() => console.log(`✓ Optimized: ${file}`));
    }
  });
} else {
  console.log('No assets folder found for images');
}
