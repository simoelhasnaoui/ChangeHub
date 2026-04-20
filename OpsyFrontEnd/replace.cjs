const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'pages');

const replacements = {
  'text-white': 'text-text-main',
  'text-gray-400': 'text-slate-500',
  'text-gray-300': 'text-slate-600',
  'text-gray-200': 'text-slate-700',
  'bg-\\[#1e1e2e\\]': 'bg-white shadow-card',
  'border-\\[#313244\\]': 'border-slate-100',
  'border-\\[#252538\\]': 'border-slate-100',
  'bg-\\[#181825\\]': 'bg-slate-50',
  'bg-\\[#2a2a4a\\]': 'bg-slate-100',
  'border-gray-50': 'border-slate-100', // wait, border-gray-50 is already light, let's just make it border-slate-100
  'bg-yellow-900/30 text-yellow-400': 'bg-yellow-50 text-yellow-700 font-semibold ring-1 ring-inset ring-yellow-600/20',
  'bg-blue-900/30 text-blue-400': 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-inset ring-blue-600/20',
  'bg-purple-900/30 text-purple-400': 'bg-purple-50 text-purple-700 font-semibold ring-1 ring-inset ring-purple-600/20',
  'bg-green-900/30 text-green-400': 'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20',
  'bg-red-900/30 text-red-400': 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20',
  'text-blue-400': 'text-primary',
  'text-yellow-400': 'text-yellow-600',
  'text-green-400': 'text-green-600',
  'text-red-400': 'text-red-600',
  'text-purple-400': 'text-purple-600',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary-hover',
};

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g');
        content = content.replace(regex, value);
      }
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

walk(dirPath);
console.log('Done replacing colors.');
