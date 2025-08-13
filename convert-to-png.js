import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conversions = [
  { input: 'icon-1024x1024.svg', output: 'icon.png', width: 1024, height: 1024 },
  { input: 'splash-200x200.svg', output: 'splash.png', width: 200, height: 200 },
  { input: 'hero-1200x630.svg', output: 'hero.png', width: 1200, height: 630 },
  { input: 'screenshot-1284x2778.svg', output: 'screenshot1.png', width: 1284, height: 2778 }
];

async function convertSvgToPng() {
  for (const conversion of conversions) {
    try {
      const inputPath = path.join(__dirname, 'public', conversion.input);
      const outputPath = path.join(__dirname, 'public', conversion.output);
      
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.log(`❌ Input file not found: ${conversion.input}`);
        continue;
      }
      
      // Convert SVG to PNG
      await sharp(inputPath)
        .resize(conversion.width, conversion.height)
        .png({ quality: 100, compressionLevel: 0 })
        .toFile(outputPath);
      
      console.log(`✅ Converted ${conversion.input} → ${conversion.output} (${conversion.width}x${conversion.height})`);
      
      // Verify file was created
      const stats = fs.statSync(outputPath);
      console.log(`   File size: ${Math.round(stats.size / 1024)}KB`);
      
    } catch (error) {
      console.error(`❌ Error converting ${conversion.input}:`, error.message);
    }
  }
}

// Also create an OG image (same as hero)
async function createOgImage() {
  try {
    const heroPath = path.join(__dirname, 'public', 'hero.png');
    const ogPath = path.join(__dirname, 'public', 'og-image.png');
    
    if (fs.existsSync(heroPath)) {
      fs.copyFileSync(heroPath, ogPath);
      console.log('✅ Created og-image.png (copy of hero.png)');
    }
  } catch (error) {
    console.error('❌ Error creating OG image:', error.message);
  }
}

console.log('🔄 Converting SVG files to PNG...\n');
await convertSvgToPng();
await createOgImage();

console.log('\n✅ Conversion complete!');
console.log('\n📋 Created PNG files:');
console.log('- icon.png (1024x1024) - App icon');
console.log('- splash.png (200x200) - Splash screen');
console.log('- hero.png (1200x630) - Hero/promotional image');
console.log('- screenshot1.png (1284x2778) - App screenshot');
console.log('- og-image.png (1200x630) - Open Graph image');

console.log('\n🚀 Ready to upload to GitHub!');