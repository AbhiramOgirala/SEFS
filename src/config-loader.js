const fs = require('fs').promises;
const path = require('path');

class ConfigLoader {
  constructor() {
    this.config = null;
  }

  async load() {
    try {
      const configPath = path.join(__dirname, '..', 'config.json');
      const data = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(data);
      return this.config;
    } catch (error) {
      console.error('Error loading config, using defaults:', error.message);
      return this.getDefaults();
    }
  }

  getDefaults() {
    return {
      fileTypes: [
        // Text files
        '.txt', '.md', '.log', '.rtf',
        // Documents
        '.pdf', '.doc', '.docx',
        // Code files
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs',
        // Web files
        '.html', '.css', '.scss', '.sass', '.less', '.vue',
        // Data files
        '.json', '.xml', '.yaml', '.yml', '.csv', '.tsv',
        // Config files
        '.conf', '.config', '.ini', '.env', '.properties',
        // Shell scripts
        '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
        // Images (for metadata/filename clustering)
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
        // Presentations
        '.ppt', '.pptx',
        // Spreadsheets
        '.xls', '.xlsx',
        // Other
        '.sql', '.r', '.m', '.scala', '.pl', '.lua'
      ],
      maxFileSize: 10485760,
      minClusterSize: 2,
      maxClusters: 5,
      debounceDelay: 1000,
      semanticFolderPrefix: '_semantic_',
      excludePatterns: ['node_modules', '.git', '.kiro', 'dist', 'build', '.next', '__pycache__'],
      virtualMode: false, // Set to true to cluster without moving files
      security: {
        allowFileExecution: false,
        sandboxMode: true,
        maxContentPreview: 500
      }
    };
  }

  get(key) {
    return this.config ? this.config[key] : this.getDefaults()[key];
  }
}

module.exports = new ConfigLoader();
