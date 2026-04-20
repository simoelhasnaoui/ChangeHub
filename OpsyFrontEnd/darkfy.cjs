const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white': 'bg-[#1e1e2e]',
  'text-gray-900': 'text-white',
  'text-gray-800': 'text-gray-200',
  'text-gray-700': 'text-gray-300',
  'text-gray-600': 'text-gray-400',
  'text-gray-500': 'text-gray-400',
  'text-gray-400': 'text-gray-500',
  'border-gray-200': 'border-[#313244]',
  'border-gray-100': 'border-[#252538]',
  'bg-gray-50': 'bg-[#181825]',
  'bg-gray-100': 'bg-[#2a2a4a]',
  'border-gray-300': 'border-[#45475a]',
  
  'bg-yellow-100': 'bg-yellow-900/30',
  'text-yellow-700': 'text-yellow-400',
  'text-yellow-600': 'text-yellow-400',
  
  'bg-blue-100': 'bg-blue-900/30',
  'text-blue-700': 'text-blue-400',
  'text-blue-600': 'text-blue-400',
  
  'bg-green-100': 'bg-green-900/30',
  'text-green-700': 'text-green-400',
  'text-green-600': 'text-green-400',
  
  'bg-red-100': 'bg-red-900/30',
  'text-red-700': 'text-red-400',
  
  'bg-purple-100': 'bg-purple-900/30',
  'text-purple-700': 'text-purple-400',
  'text-purple-600': 'text-purple-400',
  
  'bg-gray-100 text-gray-600': 'bg-gray-800/50 text-gray-400',
  'text-gray-400': 'text-gray-400'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/hp/Desktop/OpsyFrontEnd/src/pages');
files.push('c:/Users/hp/Desktop/OpsyFrontEnd/src/pages/Login.jsx');

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of Object.entries(replacements)) {
    if(search !== replace) {
        content = content.split(search).join(replace);
    }
  }
  fs.writeFileSync(file, content);
});
console.log('Class mapping complete!');
