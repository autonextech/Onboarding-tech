const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

const replacements = [
  // Blues
  [/bg-blue-600(?![\/\-])/g, 'bg-primary'],
  [/bg-blue-500(?![\/\-])/g, 'bg-secondary'],
  [/bg-blue-700(?![\/\-])/g, 'bg-primary-container'],
  [/bg-blue-800(?![\/\-])/g, 'bg-primary-container'],
  [/bg-blue-900(?![\/\-])/g, 'bg-primary-container'],
  [/bg-blue-50(?!\/)/g, 'bg-primary/5'],
  [/bg-blue-100(?![\/\-])/g, 'bg-primary/10'],
  [/text-blue-500(?![\/\-])/g, 'text-primary'],
  [/text-blue-600(?![\/\-])/g, 'text-primary'],
  [/text-blue-700(?![\/\-])/g, 'text-primary'],
  [/text-blue-800(?![\/\-])/g, 'text-primary'],
  [/text-blue-900(?![\/\-])/g, 'text-primary'],
  [/border-blue-500(?![\/\-])/g, 'border-primary'],
  [/border-blue-600(?![\/\-])/g, 'border-primary'],
  [/border-blue-100(?![\/\-])/g, 'border-primary/20'],
  [/hover:bg-blue-600(?![\/\-])/g, 'hover:bg-primary'],
  [/hover:bg-blue-700(?![\/\-])/g, 'hover:bg-primary-container'],
  [/hover:bg-blue-50(?!\/)/g, 'hover:bg-primary/5'],
  [/hover:text-blue-600(?![\/\-])/g, 'hover:text-primary'],
  [/hover:text-blue-800(?![\/\-])/g, 'hover:text-primary-container'],
  [/hover:border-blue-100(?![\/\-])/g, 'hover:border-primary/20'],
  
  // Purples
  [/bg-purple-600(?![\/\-])/g, 'bg-primary'],
  [/bg-purple-100(?![\/\-])/g, 'bg-primary/10'],
  [/hover:bg-purple-100(?![\/\-])/g, 'hover:bg-primary/10'],
  [/text-purple-600(?![\/\-])/g, 'text-primary'],
  [/hover:border-purple-400(?![\/\-])/g, 'hover:border-primary/40'],
  
  // Custom hex
  [/text-\[\#1d3989\]/g, 'text-primary'],
  [/bg-\[\#1d3989\]/g, 'bg-primary']
];

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [regex, replace] of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${item}`);
      }
    }
  }
}

// Ensure the Regex objects are reset before processing
replacements.forEach(r => r[0].lastIndex = 0);

processDirectory(pagesDir);
processDirectory(componentsDir);
console.log('Strict colors applied globally.');
