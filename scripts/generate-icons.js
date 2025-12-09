#!/usr/bin/env node
/**
 * Generate PWA icons from the favicon SVG.
 * Uses sharp for SVG to PNG conversion.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for the PWA manifest
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const projectRoot = path.join(__dirname, '..');
  const faviconPath = path.join(projectRoot, 'public', 'favicon.svg');
  const iconsDir = path.join(projectRoot, 'public', 'icons');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Read SVG content
  const svgBuffer = fs.readFileSync(faviconPath);

  console.log('Generating PWA icons...');

  // Generate each icon size
  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Also generate apple-touch-icon (180x180)
  const appleTouchIconPath = path.join(projectRoot, 'public', 'apple-touch-icon.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile(appleTouchIconPath);

  console.log('✓ Generated apple-touch-icon.png');
  console.log(`\n✅ All ${ICON_SIZES.length + 1} icons generated successfully!`);
}

generateIcons().catch(console.error);
