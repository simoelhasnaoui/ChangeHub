const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      // Exclude the components/landing directory since it's already purple
      if (!filePath.includes(path.join('components', 'landing'))) {
        // Also exclude Landing.jsx
        if (!filePath.endsWith('Landing.jsx')) {
          fileList.push(filePath);
        }
      }
    }
  }
  return fileList;
}

const replacements = [
  // Layout/White structural overrides
  { match: /bg-white/g, replace: 'bg-purple-900/40 backdrop-blur-[24px] border border-purple-700/30' },
  { match: /bg-slate-50/g, replace: 'bg-purple-800/30' },
  { match: /bg-\[\#f8f9fb\]/g, replace: 'bg-transparent' },
  
  // Borders
  { match: /border-slate-200/g, replace: 'border-purple-700/50' },
  { match: /border-slate-100/g, replace: 'border-purple-700/50' },
  { match: /border-slate-300/g, replace: 'border-purple-700/50' },

  // Text colors mapped to standard UI text dims/brights
  { match: /text-slate-500/g, replace: 'text-yellow-100/70' },
  { match: /text-slate-400/g, replace: 'text-yellow-100/50' },
  { match: /text-slate-600/g, replace: 'text-yellow-100/90' },
  { match: /text-slate-900/g, replace: 'text-yellow-50' },

  // Interactive buttons & state
  { match: /hover:bg-slate-50/g, replace: 'hover:bg-purple-800/50' },
  { match: /hover:text-slate-900/g, replace: 'hover:text-yellow-300' },
  
  // Specific Gradient / Neon text injection for main titles
  { match: /text-text-main font-bold/g, replace: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400 font-extrabold pb-1' },
  { match: /text-text-main text-lg/g, replace: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400 text-lg pb-1' },

  // Buttons that were bg-primary with white text to the gradient 
  { match: /bg-primary text-white/g, replace: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-950 font-bold shadow-lg shadow-orange-500/30 border-none' },
  { match: /hover:bg-primary-hover/g, replace: 'hover:shadow-xl hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all' }
];

const files = getAllJsxFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({match, replace}) => {
    content = content.replace(match, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  }
});
console.log('Done deep-purpling internal app.');
