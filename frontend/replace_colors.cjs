const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const colorMap = {
  // Purples -> primary blue / semantic colors
  "'#7E22CE'": "'#1d3989'",
  "'#581C87'": "'#1d3989'",
  "'#A855F7'": "'#3b82f6'",
  "'#faf5ff'": "'rgba(59, 130, 246, 0.05)'",
  "'#f3e8ff'": "'rgba(59, 130, 246, 0.1)'",
  "bg-purple-50": "bg-blue-50",
  "text-purple-600": "text-blue-600",
  "border-purple-600": "border-blue-600",
  "hover:bg-purple-700": "hover:bg-blue-700",
  "text-purple-700": "text-blue-700",
  "bg-purple-600": "bg-blue-600",
  "hover:border-purple-300": "hover:border-blue-300",
  "'linear-gradient(135deg, #7E22CE, #A855F7)'": "'#1d3989'",
  "'linear-gradient(135deg, #7E22CE, #581C87)'": "'#1d3989'",

  // Slate / Grays -> surface text
  "'#0F172A'": "'#00113f'", // on-surface
  "'#64748B'": "'#4d5d85'", // on-surface-variant

  // General background updates
  "glass-card": "bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container",
  
  // Outer wrappers
  'min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto': 'space-y-6 animate-in fade-in duration-500',
  'min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto': 'space-y-6 animate-in fade-in duration-500',
  "'Instrument Sans', sans-serif": "'Outfit', sans-serif"
};

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      // Skip recently rewritten files
      if (['AdminDashboard.tsx', 'CandidateDashboard.tsx', 'LoginPage.tsx', 'ModuleViewPage.tsx'].includes(item)) {
        continue;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [search, replace] of Object.entries(colorMap)) {
        // Simple string replace for all instances
        if (content.includes(search)) {
          content = content.split(search).join(replace);
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

processDirectory(pagesDir);
console.log('Colors replaced globally.');
