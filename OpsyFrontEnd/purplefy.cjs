const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'components', 'landing');

const replacements = [
  // Navbar Liquid Glass
  { match: /bg-white\/80 backdrop-blur-md border-b border-slate-200\/50/g, replace: 'bg-purple-900/20 backdrop-blur-[24px] backdrop-saturate-[180%] border-b border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]' },
  
  // Backgrounds
  { match: /bg-white/g, replace: 'bg-purple-900/40 backdrop-blur-sm shadow-xl border border-purple-700/30' },
  { match: /bg-\[\#f8f9fb\]/g, replace: 'bg-transparent' },
  { match: /bg-slate-50/g, replace: 'bg-purple-800/30' },
  
  // Text Colors
  { match: /text-slate-900/g, replace: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400 font-extrabold pb-1' },
  { match: /text-slate-800/g, replace: 'text-yellow-400' },
  { match: /text-slate-700/g, replace: 'text-orange-300' },
  { match: /text-slate-600/g, replace: 'text-yellow-100/90' },
  { match: /text-slate-500/g, replace: 'text-yellow-100/70' },
  { match: /text-slate-400/g, replace: 'text-yellow-100/50' },
  
  // Border colors
  { match: /border-slate-100/g, replace: 'border-purple-700/50' },
  { match: /border-slate-200\/60/g, replace: 'border-purple-700/50' },
  { match: /border-slate-200/g, replace: 'border-purple-700/50' },

  // Special case: Navbar Get Started solid button had bg-slate-900, now its text-transparent which kills the bg. Let's fix.
  // Actually, wait, it was `bg-slate-900 text-white`.
  { match: /bg-slate-900 text-white/g, replace: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-950 shadow-lg shadow-orange-500/30' }
];

function processFiles() {
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    if (!file.endsWith('.jsx')) continue;
    // skip pricing and testimonials if they exist just in case they were removed from Landing but still present
    
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const {match, replace} of replacements) {
      content = content.replace(match, replace);
    }
    
    // Quick fix for the Get Started button if it got wrecked by text-slate-900 replace
    // "bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-950 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400 font-extrabold pb-1"
    content = content.replace(/text-purple-950 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400 font-extrabold pb-1/g, 'text-purple-950');

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

processFiles();
console.log('Landing page stylized with purple/yellow/liquid glass.');
