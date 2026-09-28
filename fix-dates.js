const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('.toLocaleDateString(') || content.includes('.toLocaleDateString()')) {
    
    // Replace empty args
    if (content.match(/\.toLocaleDateString\(\)/g)) {
      content = content.replace(/\.toLocaleDateString\(\)/g, ".toLocaleDateString('en-GB')");
      changed = true;
    }

    // Replace 'en-NG', { ... }
    if (content.match(/\.toLocaleDateString\("en-NG",/g)) {
      content = content.replace(/\.toLocaleDateString\("en-NG",/g, ".toLocaleDateString('en-GB',");
      changed = true;
    }
    
    // Replace undefined, { ... }
    if (content.match(/\.toLocaleDateString\(undefined,/g)) {
      content = content.replace(/\.toLocaleDateString\(undefined,/g, ".toLocaleDateString('en-GB',");
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
