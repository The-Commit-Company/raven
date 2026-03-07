#!/usr/bin/env node
/**
 * Import translations from the original nested JSON format
 * and update the fr.po file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PO_FILE = path.resolve(__dirname, '../../../raven/locale/fr.po');

// Get original fr.json from git
function getOriginalTranslations() {
  try {
    const json = execSync('git show HEAD:apps/mobile/locales/fr.json', {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '../../..')
    });
    return JSON.parse(json);
  } catch (e) {
    console.error('Could not get original fr.json from git');
    return null;
  }
}

// Flatten nested JSON to key-value pairs
function flattenJSON(obj, prefix = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenJSON(value, prefix ? `${prefix}.${key}` : key));
    } else if (typeof value === 'string') {
      result[prefix ? `${prefix}.${key}` : key] = value;
    }
  }

  return result;
}

// Parse PO file
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

    msgid = msgid.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    msgstr = msgstr.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    if (msgid) {
      translations[msgid] = msgstr;
    }
  }

  return translations;
}

// Escape for PO
function escapePO(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Generate PO
function generatePO(translations) {
  const header = `# Raven Mobile Translations - French
# Single source of truth for mobile app translations
# Edit this file to add/update translations
#
msgid ""
msgstr ""
"Project-Id-Version: Raven Mobile\\n"
"Language: fr\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

`;

  let content = header;
  const sortedKeys = Object.keys(translations).sort();

  for (const msgid of sortedKeys) {
    const msgstr = translations[msgid];
    content += `msgid "${escapePO(msgid)}"\n`;
    content += `msgstr "${escapePO(msgstr)}"\n\n`;
  }

  return content;
}

// Build a lookup from flattened keys to French translations
function buildTranslationLookup(originalJson) {
  const flatFr = flattenJSON(originalJson);
  const lookup = {};

  // Also need the English JSON to map keys to English strings
  try {
    const enJson = execSync('git show HEAD:apps/mobile/locales/en.json', {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '../../..')
    });
    const flatEn = flattenJSON(JSON.parse(enJson));

    // Map English string -> French translation
    for (const [key, enValue] of Object.entries(flatEn)) {
      if (flatFr[key]) {
        lookup[enValue] = flatFr[key];
      }
    }
  } catch (e) {
    console.error('Could not get en.json');
  }

  return lookup;
}

function main() {
  const originalJson = getOriginalTranslations();
  if (!originalJson) return;

  console.log('Building translation lookup...');
  const lookup = buildTranslationLookup(originalJson);
  console.log(`Found ${Object.keys(lookup).length} English->French mappings`);

  console.log('Reading current PO file...');
  const poContent = fs.readFileSync(PO_FILE, 'utf-8');
  const translations = parsePO(poContent);
  console.log(`Current PO has ${Object.keys(translations).length} entries`);

  // Update translations with lookup
  let updatedCount = 0;
  for (const [msgid, msgstr] of Object.entries(translations)) {
    if (!msgstr && lookup[msgid]) {
      translations[msgid] = lookup[msgid];
      updatedCount++;
    }
  }

  console.log(`\nUpdated ${updatedCount} translations from original JSON`);

  // Count remaining untranslated
  const untranslated = Object.entries(translations).filter(([_, v]) => !v).length;
  console.log(`Remaining untranslated: ${untranslated}`);

  // Write updated PO
  fs.writeFileSync(PO_FILE, generatePO(translations));
  console.log(`\nSaved to ${PO_FILE}`);
}

main();
