#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const AUDIO_DIR = path.join(__dirname, '../public/audio');
const REQUIRED_FILES = [
  'rain.mp3',
  'forest.mp3',
  'ocean.mp3',
  'soft-music.mp3',
  'meditation-bells.mp3'
];

const MIN_DURATION = 60; // 1 minute in seconds
const MAX_DURATION = 120; // 2 minutes in seconds
const MIN_BITRATE = 192000; // 192kbps in bps

async function getAudioInfo(filepath) {
  try {
    // Use ffprobe to get audio file information
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format "${filepath}"`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error getting info for ${filepath}:`, error.message);
    return null;
  }
}

async function validateAudioFile(filename) {
  const filepath = path.join(AUDIO_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    console.error(`❌ ${filename}: File not found`);
    return false;
  }

  // Get audio information
  const info = await getAudioInfo(filepath);
  if (!info) return false;

  const { format } = info;
  const duration = parseFloat(format.duration);
  const bitrate = parseInt(format.bit_rate);

  const issues = [];

  // Check duration
  if (duration < MIN_DURATION) {
    issues.push(`Duration too short: ${duration.toFixed(1)}s (min: ${MIN_DURATION}s)`);
  }
  if (duration > MAX_DURATION) {
    issues.push(`Duration too long: ${duration.toFixed(1)}s (max: ${MAX_DURATION}s)`);
  }

  // Check bitrate
  if (bitrate < MIN_BITRATE) {
    issues.push(`Bitrate too low: ${Math.floor(bitrate/1000)}kbps (min: ${MIN_BITRATE/1000}kbps)`);
  }

  if (issues.length > 0) {
    console.error(`❌ ${filename}:`);
    issues.forEach(issue => console.error(`   - ${issue}`));
    return false;
  }

  console.log(`✅ ${filename}: OK (${duration.toFixed(1)}s, ${Math.floor(bitrate/1000)}kbps)`);
  return true;
}

async function main() {
  console.log('Validating audio files...\n');

  const results = await Promise.all(
    REQUIRED_FILES.map(validateAudioFile)
  );

  const validCount = results.filter(Boolean).length;
  console.log(`\nValidation complete: ${validCount}/${REQUIRED_FILES.length} files OK`);

  if (validCount !== REQUIRED_FILES.length) {
    process.exit(1);
  }
}

main().catch(console.error);
