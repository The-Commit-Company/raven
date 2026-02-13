#!/usr/bin/env node
/**
 * Convert Frappe .po files to i18next JSON format
 *
 * This script reads .po files from raven/locale/ and generates
 * JSON files for the mobile app.
 *
 * Usage: node scripts/po-to-json.js
 */

const fs = require('fs');
const path = require('path');

const RAVEN_LOCALE_DIR = path.resolve(__dirname, '../../../raven/locale');
const MOBILE_LOCALE_DIR = path.resolve(__dirname, '../locales');

// Languages to process
const LANGUAGES = ['fr'];

/**
 * Parse a .po file and extract translations
 */
function parsePO(content) {
  const translations = {};
  const entries = content.split(/\n\n+/);

  for (const entry of entries) {
    const lines = entry.split('\n');
    let msgid = '';
    let msgstr = '';
    let inMsgid = false;
    let inMsgstr = false;

    for (const line of lines) {
      if (line.startsWith('msgid "')) {
        inMsgid = true;
        inMsgstr = false;
        msgid = line.slice(7, -1);
      } else if (line.startsWith('msgstr "')) {
        inMsgid = false;
        inMsgstr = true;
        msgstr = line.slice(8, -1);
      } else if (line.startsWith('"') && line.endsWith('"')) {
        const text = line.slice(1, -1);
        if (inMsgid) msgid += text;
        if (inMsgstr) msgstr += text;
      }
    }

    // Unescape PO strings
    msgid = msgid.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    msgstr = msgstr.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    if (msgid && msgstr && msgid !== msgstr) {
      translations[msgid] = msgstr;
    }
  }

  return translations;
}

/**
 * Create English JSON (identity mapping for keys)
 */
function createEnglishJSON(frTranslations) {
  const en = {};
  // For English, the key equals the value
  for (const key of Object.keys(frTranslations)) {
    en[key] = key;
  }
  return en;
}

function main() {
  // Ensure output directory exists
  if (!fs.existsSync(MOBILE_LOCALE_DIR)) {
    fs.mkdirSync(MOBILE_LOCALE_DIR, { recursive: true });
  }

  let allTranslations = {};

  for (const lang of LANGUAGES) {
    const poFile = path.join(RAVEN_LOCALE_DIR, `${lang}.po`);

    if (!fs.existsSync(poFile)) {
      console.warn(`Warning: ${poFile} not found, skipping`);
      continue;
    }

    const content = fs.readFileSync(poFile, 'utf-8');
    const translations = parsePO(content);
    allTranslations = { ...allTranslations, ...translations };

    // Write JSON file
    const jsonFile = path.join(MOBILE_LOCALE_DIR, `${lang}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(translations, null, 2));
    console.log(`Generated ${jsonFile} (${Object.keys(translations).length} entries)`);
  }

  // Create English JSON
  const enJson = createEnglishJSON(allTranslations);
  const enFile = path.join(MOBILE_LOCALE_DIR, 'en.json');
  fs.writeFileSync(enFile, JSON.stringify(enJson, null, 2));
  console.log(`Generated ${enFile} (${Object.keys(enJson).length} entries)`);
}

main();
