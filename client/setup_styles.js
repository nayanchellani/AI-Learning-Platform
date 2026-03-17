import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');

const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      const baseName = path.basename(file, '.jsx');
      const cssFileName = `${baseName}.css`;
      const cssFilePath = path.join(dir, cssFileName);
      
      // Create Empty CSS File
      if (!fs.existsSync(cssFilePath)) {
        fs.writeFileSync(cssFilePath, `/* Styles for ${baseName} Component */\n`);
        console.log(`Created: ${cssFileName}`);
      }
      
      // Inject Import into JSX File
      let jsxContent = fs.readFileSync(fullPath, 'utf-8');
      const importStatement = `import './${cssFileName}';`;
      
      if (!jsxContent.includes(importStatement)) {
        const lines = jsxContent.split('\n');
        // Find the last import statement or insert at line 2
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                insertIndex = i + 1;
            }
        }
        lines.splice(insertIndex, 0, importStatement);
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Updated: ${file} (Added import)`);
      }
    }
  });
};

processDirectory(pagesDir);
console.log('Done!');
