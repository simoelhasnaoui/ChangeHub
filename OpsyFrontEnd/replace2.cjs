const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'pages');

const replacements = {
  'bg-primary hover:bg-primary-hover text-text-main': 'bg-primary hover:bg-primary-hover text-white',
  'bg-red-600 hover:bg-red-700 text-text-main': 'bg-red-600 hover:bg-red-700 text-white',
  'bg-green-600 hover:bg-green-700 text-text-main': 'bg-green-600 hover:bg-green-700 text-white',
  'bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-main': 'bg-primary hover:bg-primary-hover disabled:opacity-50 text-white',
  'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-text-main': 'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white',
  'bg-red-600 hover:bg-red-700 disabled:opacity-50 text-text-main': 'bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white',
  'className="bg-primary text-text-main': 'className="bg-primary text-white',
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
        // split to escape regex cleanly or use string replace all
        content = content.replaceAll(key, value);
      }
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

walk(dirPath);
console.log('Done fixing button text colors.');
