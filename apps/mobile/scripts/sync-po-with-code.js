#!/usr/bin/env node
/**
 * Sync fr.po with all translation strings found in the codebase
 *
 * This script:
 * 1. Extracts all __("...") strings from the code
 * 2. Reads existing fr.po translations
 * 3. Adds missing strings (untranslated)
 * 4. Keeps existing translations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MOBILE_DIR = path.resolve(__dirname, '..');
const PO_FILE = path.resolve(__dirname, '../../../raven/locale/fr.po');

// Extract all __("...") strings from code
function extractStringsFromCode() {
  const result = execSync(
    `grep -roh '__("[^"]*")' "${MOBILE_DIR}" --include="*.tsx" --include="*.ts" 2>/dev/null || true`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  const strings = new Set();
  const regex = /__\("([^"]*)"\)/g;
  let match;

  while ((match = regex.exec(result)) !== null) {
    strings.add(match[1]);
  }

  // Also extract strings with interpolation __("...", { ... })
  const resultWithOptions = execSync(
    `grep -roh '__("[^"]*",' "${MOBILE_DIR}" --include="*.tsx" --include="*.ts" 2>/dev/null || true`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  const regexWithOptions = /__\("([^"]*)",/g;
  while ((match = regexWithOptions.exec(resultWithOptions)) !== null) {
    strings.add(match[1]);
  }

  return Array.from(strings).sort();
}

// Parse existing .po file
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

    // Unescape
    msgid = msgid.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    msgstr = msgstr.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    if (msgid) {
      translations[msgid] = msgstr;
    }
  }

  return translations;
}

// Escape string for PO format
function escapePO(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Generate PO file content
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

function main() {
  console.log('Extracting strings from code...');
  const codeStrings = extractStringsFromCode();
  console.log(`Found ${codeStrings.length} unique strings in code`);

  console.log('Reading existing translations...');
  let existingTranslations = {};
  if (fs.existsSync(PO_FILE)) {
    const poContent = fs.readFileSync(PO_FILE, 'utf-8');
    existingTranslations = parsePO(poContent);
    console.log(`Found ${Object.keys(existingTranslations).length} existing translations`);
  }

  // Merge: keep existing translations, add new strings as untranslated
  const mergedTranslations = {};
  let newCount = 0;
  let keptCount = 0;

  for (const str of codeStrings) {
    if (existingTranslations[str]) {
      mergedTranslations[str] = existingTranslations[str];
      keptCount++;
    } else {
      // New string - add as untranslated (empty msgstr means untranslated)
      mergedTranslations[str] = '';
      newCount++;
    }
  }

  console.log(`\nResults:`);
  console.log(`  - Kept ${keptCount} existing translations`);
  console.log(`  - Added ${newCount} new strings (untranslated)`);
  console.log(`  - Total: ${Object.keys(mergedTranslations).length} strings`);

  // Write updated PO file
  const poContent = generatePO(mergedTranslations);
  fs.writeFileSync(PO_FILE, poContent);
  console.log(`\nUpdated ${PO_FILE}`);

  // List untranslated strings
  if (newCount > 0) {
    console.log(`\n⚠️  ${newCount} strings need translation:`);
    for (const str of codeStrings) {
      if (!existingTranslations[str]) {
        console.log(`  - "${str.substring(0, 60)}${str.length > 60 ? '...' : ''}"`);
      }
    }
  }
}

main();
