const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const SemanticEngine = require('./semantic-engine');
const FileMonitor = require('./file-monitor');

let mainWindow;
let semanticEngine;
let fileMonitor;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/ui/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (fileMonitor) fileMonitor.stop();
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('select-root-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const rootPath = result.filePaths[0];
    await initializeSystem(rootPath);
    return { success: true, path: rootPath };
  }
  return { success: false };
});

ipcMain.handle('get-file-structure', async () => {
  if (!semanticEngine) return null;
  return semanticEngine.getFileStructure();
});

ipcMain.handle('open-file', async (event, filePath) => {
  const { shell } = require('electron');
  const fs = require('fs');
  
  try {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      dialog.showErrorBox('File Not Found', `Cannot open file: ${filePath}`);
      return { success: false, error: 'File not found' };
    }
    
    console.log('Opening file:', filePath);
    
    // Open file with default application
    const result = await shell.openPath(filePath);
    
    if (result) {
      // If result is not empty, there was an error
      console.error('Error opening file:', result);
      dialog.showErrorBox('Cannot Open File', `Error: ${result}`);
      return { success: false, error: result };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exception opening file:', error);
    dialog.showErrorBox('Error', `Failed to open file: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('search-files', async (event, query) => {
  if (!semanticEngine) return [];
  return semanticEngine.searchFiles(query);
});

async function initializeSystem(rootPath) {
  try {
    // Stop existing monitor
    if (fileMonitor) fileMonitor.stop();
    
    // Initialize semantic engine
    semanticEngine = new SemanticEngine(rootPath);
    await semanticEngine.initialize();
    
    // Send initial structure
    const structure = semanticEngine.getFileStructure();
    mainWindow.webContents.send('structure-updated', structure);
    
    // Initialize file monitor
    fileMonitor = new FileMonitor(rootPath, semanticEngine);
    fileMonitor.on('structure-updated', (structure) => {
      mainWindow.webContents.send('structure-updated', structure);
    });
    
    // Handle new files detected
    fileMonitor.on('new-files-detected', async (filePaths) => {
      const fileNames = filePaths.map(fp => path.basename(fp));
      const fileCount = filePaths.length;
      
      const message = fileCount === 1 
        ? `New file detected:\n\n${fileNames[0]}\n\nDo you want to read and cluster this file?`
        : `${fileCount} new files detected:\n\n${fileNames.slice(0, 5).join('\n')}${fileCount > 5 ? `\n... and ${fileCount - 5} more` : ''}\n\nDo you want to read and cluster these files?`;
      
      const response = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        title: 'New Files Detected',
        message: message,
        detail: 'The files will be analyzed and automatically organized into semantic clusters.'
      });
      
      if (response.response === 0) {
        // User clicked Yes
        console.log('User confirmed processing new files');
        await fileMonitor.processNewFiles(filePaths);
      } else {
        // User clicked No
        console.log('User declined processing new files');
        fileMonitor.cancelNewFiles();
      }
    });
    
    fileMonitor.start();
  } catch (error) {
    console.error('Error initializing system:', error);
    dialog.showErrorBox('Initialization Error', `Failed to initialize SEFS: ${error.message}`);
  }
}
