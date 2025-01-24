import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively read all files in a directory
function readFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readFiles(fullPath);
    } else if (file.endsWith('.ts')) {
      fixImports(fullPath);
    }
  });
}

// Function to fix import statements
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(/from\s+['"](\..*?)['"]/g, (match, importPath) => {
    // Only add `.js` if it's a relative path
    if (!importPath.endsWith('.js') && !importPath.endsWith('.ts')) {
      return `from '${importPath}.js'`;
    }
    return match;
  });

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

// Start processing
const srcDir = path.join(__dirname, 'src');
readFiles(srcDir);

console.log('Done adding .js extensions to imports!');
