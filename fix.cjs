const fs = require('fs');
const glob = require('glob');
const files = glob.sync('frontend/src/**/*.tsx');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/const API_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:8080';/g, "const API_URL = '';");
  newContent = newContent.replace(/>NEXUS<\/span>/g, '><img src="/logo.png" alt="Parto" className="h-8 w-auto" /></span>');
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log(`Updated ${f}`);
  }
});
