const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');

// Add import
if (!content.includes('import AIChatWidget')) {
  content = content.replace(
    `import '../global.css';`,
    `import '../global.css';\nimport AIChatWidget from '@/components/AIChatWidget';`
  );
}

// Add component
if (!content.includes('<AIChatWidget />')) {
  content = content.replace(
    `</body>`,
    `  <AIChatWidget />\n      </body>`
  );
}

fs.writeFileSync('src/app/[locale]/layout.tsx', content);
console.log('Modified layout.tsx');
