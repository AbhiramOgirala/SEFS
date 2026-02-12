const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sefs', {
  selectRootFolder: () => ipcRenderer.invoke('select-root-folder'),
  getFileStructure: () => ipcRenderer.invoke('get-file-structure'),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  searchFiles: (query) => ipcRenderer.invoke('search-files', query),
  onStructureUpdated: (callback) => {
    ipcRenderer.on('structure-updated', (event, structure) => callback(structure));
  }
});
