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
}

module.exports = FileMonitor;
