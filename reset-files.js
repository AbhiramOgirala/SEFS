/**
 * Reset Script - Moves files back from semantic folders
 * Run this if files get stuck in semantic folders
 */

const fs = require('fs').promises;
const path = require('path');

async function resetFiles(rootPath) {
  try {
    console.log(`Resetting files in: ${rootPath}`);
    
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('_semantic_')) {
        const semanticFolderPath = path.join(rootPath, entry.name);
        console.log(`Found semantic folder: ${entry.name}`);
        
        // Get all files in semantic folder
        const files = await fs.readdir(semanticFolderPath);
        
        // Move each file back to root
        for (const file of files) {
          const oldPath = path.join(semanticFolderPath, file);
          const newPath = path.join(rootPath, file);
          
          try {
            await fs.rename(oldPath, newPath);
            console.log(`  Moved: ${file}`);
          } catch (error) {
            console.error(`  Error moving ${file}:`, error.message);
          }
        }
        
        // Remove empty semantic folder
        try {
          await fs.rmdir(semanticFolderPath);
          console.log(`  Removed folder: ${entry.name}`);
        } catch (error) {
          console.error(`  Error removing folder:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Reset complete!');
  } catch (error) {
    console.error('Error during reset:', error);
  }
}

// Get path from command line or use example-files
const targetPath = process.argv[2] || path.join(__dirname, 'example-files');
resetFiles(targetPath);
