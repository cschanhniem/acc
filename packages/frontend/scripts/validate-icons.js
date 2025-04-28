#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SOUND_TYPES = ['rain', 'forest', 'ocean', 'music', 'bell'];
const REQUIRED_SIZES = [96, 128, 192, 256];

// Generate the list of required files
const REQUIRED_FILES = SOUND_TYPES.flatMap(type =>
  REQUIRED_SIZES.map(size => `${type}-${size}.png`)
);

async function getImageInfo(filepath) {
  try {
    const { stdout } = await execAsync(
      `identify -format "%w %h %[channels]" "${filepath}"`
    );
    const [width, height, channels] = stdout.split(' ').map(Number);
    return { width, height, channels };
  } catch (error) {
    console.error(`Error getting info for ${filepath}:`, error.message);
    return null;
  }
}

async function validateIconFile(filename) {
  const filepath = path.join(ICONS_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    console.error(`❌ ${filename}: File not found`);
    return false;
  }

  // Get image information
  const info = await getImageInfo(filepath);
  if (!info) return false;

  const issues = [];

  // Check dimensions
  const expectedSize = parseInt(filename.match(/\d+/)[0]);
  if (info.width !== expectedSize || info.height !== expectedSize) {
    issues.push(
      `Invalid dimensions: ${info.width}x${info.height} (expected ${expectedSize}x${expectedSize})`
    );
  }

  // Check for alpha channel (4 channels = RGB + Alpha)
  if (info.channels !== 4) {
    issues.push('Missing transparency (alpha channel)');
  }

  if (issues.length > 0) {
    console.error(`❌ ${filename}:`);
    issues.forEach(issue => console.error(`   - ${issue}`));
    return false;
  }

  console.log(`✅ ${filename}: OK (${info.width}x${info.height})`);
  return true;
}

async function main() {
  console.log('Validating icon files...\n');

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const results = await Promise.all(
    REQUIRED_FILES.map(validateIconFile)
  );

  const validCount = results.filter(Boolean).length;
  
  console.log(`\nValidation complete: ${validCount}/${REQUIRED_FILES.length} files OK`);
  
  if (validCount === 0) {
    console.log('\nTo get started:');
    console.log('1. Design icons at 256px size');
    console.log('2. Export to all required sizes');
    console.log('3. Ensure PNG format with transparency');
    console.log('4. Place files in the icons directory');
  }

  if (validCount !== REQUIRED_FILES.length) {
    const missing = REQUIRED_FILES.filter((file, index) => !results[index]);
    console.log('\nMissing or invalid files:');
    missing.forEach(file => console.log(`- ${file}`));
    process.exit(1);
  }
}

main().catch(console.error);
