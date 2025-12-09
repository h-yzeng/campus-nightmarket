/**
 * Script to generate placeholder silent MP3 files for notification sounds.
 * These are minimal valid MP3 files that can be replaced with actual sounds later.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal valid silent MP3 (base64 encoded)
// This is a very short (0.1s) silent MP3 file
const SILENT_MP3_BASE64 =
  '//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAEsADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD////////////////////////////////////////////////////////////////////////////////////////AAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const soundTypes = ['order-placed', 'order-confirmed', 'order-ready', 'order-completed', 'message'];

const soundsDir = path.join(__dirname, '..', 'public', 'sounds');

// Ensure sounds directory exists
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

console.log('Generating placeholder notification sound files...');

soundTypes.forEach((type) => {
  const filePath = path.join(soundsDir, `${type}.mp3`);
  const mp3Buffer = Buffer.from(SILENT_MP3_BASE64, 'base64');

  fs.writeFileSync(filePath, mp3Buffer);
  console.log(`✓ Created ${type}.mp3`);
});

console.log(`\n✅ All ${soundTypes.length} placeholder sound files created!`);
console.log('\nNote: These are silent placeholders. Replace them with actual notification sounds.');
console.log('Recommended sources:');
console.log('  - https://notificationsounds.com/');
console.log('  - https://mixkit.co/free-sound-effects/notification/');
