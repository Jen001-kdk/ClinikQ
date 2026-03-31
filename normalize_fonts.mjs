import fs from 'fs';
import path from 'path';

const dirs = [
  'c:/Users/Hp/Desktop/ClinikQ/src/pages',
  'c:/Users/Hp/Desktop/ClinikQ/src/components'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/text-\[10px\]/g, 'text-xs');
  content = content.replace(/text-\[11px\]/g, 'text-xs');
  content = content.replace(/\bfont-extrabold\b/g, 'font-semibold');
  content = content.replace(/\bfont-black\b/g, 'font-bold');
  // Removing highly stylized tracking and uppercase
  content = content.replace(/\btracking-widest\b/g, '');
  content = content.replace(/\btracking-tight\b/g, '');
  content = content.replace(/\btracking-wider\b/g, '');
  content = content.replace(/\buppercase\b/g, '');
  
  // Also downgrade some overly large text if any
  content = content.replace(/\btext-5xl\b/g, 'text-3xl');
  content = content.replace(/\btext-4xl\b/g, 'text-2xl');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Normalized:', path.basename(filePath));
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

dirs.forEach(walkDir);
console.log('Done normalizing fonts.');
