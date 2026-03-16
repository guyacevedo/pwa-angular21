/**
 * Generates public/firebase-messaging-sw.js from the template,
 * replacing placeholders with environment variables.
 *
 * Reads from .env file if present, otherwise uses process.env (CI).
 *
 * Required vars: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
 *   FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID,
 *   FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID
 */

const fs = require('fs');
const path = require('path');

// Simple .env reader (no dotenv dependency needed)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    const value = trimmed.substring(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const required = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[generate-sw] Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.js.template');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

let content = fs.readFileSync(templatePath, 'utf8');

content = content
  .replace('%%FIREBASE_API_KEY%%', process.env.FIREBASE_API_KEY)
  .replace('%%FIREBASE_AUTH_DOMAIN%%', process.env.FIREBASE_AUTH_DOMAIN)
  .replace('%%FIREBASE_PROJECT_ID%%', process.env.FIREBASE_PROJECT_ID)
  .replace('%%FIREBASE_STORAGE_BUCKET%%', process.env.FIREBASE_STORAGE_BUCKET)
  .replace('%%FIREBASE_MESSAGING_SENDER_ID%%', process.env.FIREBASE_MESSAGING_SENDER_ID)
  .replace('%%FIREBASE_APP_ID%%', process.env.FIREBASE_APP_ID)
  .replace('%%FIREBASE_MEASUREMENT_ID%%', process.env.FIREBASE_MEASUREMENT_ID);

fs.writeFileSync(outputPath, content, 'utf8');
console.log('[generate-sw] firebase-messaging-sw.js generated successfully');
