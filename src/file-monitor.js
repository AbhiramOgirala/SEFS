const chokidar = require('chokidar');
const EventEmitter = require('events');
const path = require('path');

class FileMonitor extends EventEmitter {
  constructor(rootPath, semanticEngine) {
    super();
    this.rootPath = rootPath;
    this.semanticEngine = semanticEngine;
    this.watcher = null;
    this.debounceTimer = null;
    this.pendingNewFiles = [];
    this.newFileTimer = null;
  }

  start() {
    this.watcher = chokidar.watch(this.rootPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath) => this.handleChange('add', filePath))
      .on('change', (filePath) => this.handleChange('change', filePath))
      .on('unlink', (filePath) => this.handleChange('unlink', filePath));

    console.log(`Monitoring: ${this.rootPath}`);
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  handleChange(event, filePath) {
    // Ignore semantic folders
    if (filePath.includes('_semantic_')) return;

    console.log(`File ${event}: ${filePath}`);

    // For new files, collect them and ask user after a delay
    if (event === 'add') {
      // Add to pending list
      if (!this.pendingNewFiles.includes(filePath)) {
        this.pendingNewFiles.push(filePath);
      }

      // Debounce to collect multiple files added at once
      clearTimeout(this.newFileTimer);
      this.newFileTimer = setTimeout(() => {
        if (this.pendingNewFiles.length > 0) {
          // Emit event with all pending files
          this.emit('new-files-detected', [...this.pendingNewFiles]);
          // Don't clear the array yet - wait for user response
        }
      }, 2000); // Wait 2 seconds to collect all new files
      return;
    }

    // Debounce to avoid excessive processing
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      try {
        if (event === 'unlink') {
          await this.semanticEngine.handleFileDelete(filePath);
        } else {
          await this.semanticEngine.handleFileChange(filePath);
        }

        const structure = this.semanticEngine.getFileStructure();
        this.emit('structure-updated', structure);
      } catch (error) {
        console.error('Error handling file change:', error);
      }
    }, 1000);
  }

  async processNewFiles(filePaths) {
    // Process the confirmed new files
    try {
      for (const filePath of filePaths) {
        await this.semanticEngine.handleFileChange(filePath);
      }

      // Clear pending files
      this.pendingNewFiles = [];

      const structure = this.semanticEngine.getFileStructure();
      this.emit('structure-updated', structure);
      return { success: true };
    } catch (error) {
      console.error('Error processing new files:', error);
      return { success: false, error: error.message };
    }
  }

  cancelNewFiles() {
    // User declined to process new files
    this.pendingNewFiles = [];
  }
}

module.exports = FileMonitor;
