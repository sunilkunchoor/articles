const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgFile = path.join(__dirname, '../src/app/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generate() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  await sharp(svgFile)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));

  await sharp(svgFile)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));

  console.log('Icons generated successfully.');
}

generate().catch(console.error);
