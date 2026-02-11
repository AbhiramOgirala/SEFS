const fs = require('fs').promises;
const path = require('path');
const natural = require('natural');
const pdfParse = require('pdf-parse');
const { kmeans } = require('ml-kmeans');
const configLoader = require('./config-loader');

class SemanticEngine {
  constructor(rootPath) {
    this.rootPath = path.resolve(rootPath); // Normalize path
    this.files = new Map(); // filePath -> { content, vector, cluster }
    this.clusters = new Map(); // clusterId -> { name, files[] }
    this.tfidf = new natural.TfIdf();
    this.processing = false;
    this.config = configLoader.getDefaults();
  }

  async initialize() {
    this.config = await configLoader.load();
    await this.scanAndProcess();
  }

  async scanAndProcess() {
    if (this.processing) return;
    this.processing = true;

    try {
      const files = await this.getAllFiles(this.rootPath);
      console.log(`Found ${files.length} total files`);
      
      const validFiles = files.filter(f => this.isValidFile(f));
      console.log(`Found ${validFiles.length} valid files`);

      // Process each file with progress indicator
      let processed = 0;
      for (const filePath of validFiles) {
        await this.processFile(filePath);
        processed++;
        if (processed % 10 === 0) {
          console.log(`Progress: ${processed}/${validFiles.length} files processed`);
        }
      }

      console.log(`✓ Processed ${this.files.size} files successfully`);

      // Perform clustering
      console.log('Starting clustering...');
      await this.performClustering();
      console.log('✓ Clustering complete');

      // Organize into OS folders (or skip if virtual mode)
      if (this.config.virtualMode) {
        console.log('✓ Virtual mode - skipping file organization');
      } else {
        console.log('Starting file organization...');
        await this.organizeFolders();
        console.log('✓ File organization complete');
      }
    } catch (error) {
      console.error('Error in scanAndProcess:', error);
      throw error;
    } finally {
      this.processing = false;
    }
  }

  async getAllFiles(dir, fileList = []) {
    // Security: Ensure we stay within root path
    const normalizedDir = path.resolve(dir);
    if (!normalizedDir.startsWith(this.rootPath)) {
      console.warn('Attempted to access path outside root:', normalizedDir);
      return fileList;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip excluded patterns
      const shouldExclude = this.config.excludePatterns.some(pattern => 
        entry.name.includes(pattern) || entry.name.startsWith('.')
      );
      
      if (shouldExclude || entry.name.startsWith(this.config.semanticFolderPrefix)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.getAllFiles(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
    
    return fileList;
  }

  isValidFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.fileTypes.includes(ext);
  }

  async processFile(filePath) {
    try {
      // Security: Check file size
      const stats = await fs.stat(filePath);
      if (stats.size > this.config.maxFileSize) {
        console.warn(`File too large, skipping: ${filePath}`);
        return;
      }

      if (stats.size === 0) {
        console.warn(`File is empty, skipping: ${filePath}`);
        return;
      }

      const content = await this.extractContent(filePath);
      if (!content || content.trim().length < 10) {
        console.warn(`File has insufficient content, skipping: ${path.basename(filePath)}`);
        return;
      }

      const vector = this.textToVector(content);
      
      this.files.set(filePath, {
        content: content.substring(0, this.config.security.maxContentPreview),
        vector,
        cluster: null,
        name: path.basename(filePath)
      });
      
      // Only log every 10th file to reduce console spam
      const processedCount = this.files.size;
      if (processedCount % 10 === 0 || processedCount === 1) {
        console.log(`Processed ${processedCount} files...`);
      }
    } catch (error) {
      // Skip locked or inaccessible files
      if (error.code === 'EBUSY' || error.code === 'EPERM' || error.code === 'UNKNOWN') {
        console.warn(`Skipping locked/inaccessible file: ${path.basename(filePath)}`);
      } else {
        console.error(`Error processing ${path.basename(filePath)}:`, error.message);
      }
    }
  }

  async extractContent(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath, ext);
    
    try {
      // PDF files
      if (ext === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      }
      
      // Text-based files (code, config, data, etc.)
      else if ([
        '.txt', '.md', '.log', '.rtf',
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs',
        '.html', '.css', '.scss', '.sass', '.less', '.vue',
        '.json', '.xml', '.yaml', '.yml', '.csv', '.tsv',
        '.conf', '.config', '.ini', '.env', '.properties',
        '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
        '.sql', '.r', '.m', '.scala', '.pl', '.lua', '.svg'
      ].includes(ext)) {
        return await fs.readFile(filePath, 'utf-8');
      }
      
      // Image files - use filename and metadata for clustering
      else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
        // Extract meaningful words from filename
        const words = fileName
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase();
        
        // Get file stats for additional context
        const stats = await fs.stat(filePath);
        const sizeCategory = stats.size < 100000 ? 'small' : stats.size < 1000000 ? 'medium' : 'large';
        
        return `image file ${words} ${sizeCategory} ${ext.substring(1)} photo picture`;
      }
      
      // Office documents - use filename for now (would need additional libraries for full extraction)
      else if (['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'].includes(ext)) {
        console.warn(`Office file ${ext} - using filename for clustering: ${filePath}`);
        
        // Extract meaningful words from filename
        const words = fileName
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase();
        
        const typeMap = {
          '.doc': 'document word text',
          '.docx': 'document word text',
          '.ppt': 'presentation slides powerpoint',
          '.pptx': 'presentation slides powerpoint',
          '.xls': 'spreadsheet excel data table',
          '.xlsx': 'spreadsheet excel data table'
        };
        
        return `${typeMap[ext]} ${words}`;
      }
      
      // Unknown file types - try to read as text, or use filename
      else {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          // Check if it's actually text (not binary)
          if (content.length > 0 && !/[\x00-\x08\x0E-\x1F]/.test(content.substring(0, 1000))) {
            return content;
          }
        } catch (error) {
          // Binary file or read error
        }
        
        // Fallback: use filename
        console.warn(`Binary/unknown file ${ext} - using filename: ${filePath}`);
        const words = fileName
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase();
        return `file ${words} ${ext.substring(1)}`;
      }
    } catch (error) {
      console.error(`Error extracting content from ${filePath}:`, error.message);
      
      // Fallback: use filename
      const words = fileName
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase();
      return `file ${words}`;
    }
  }

  textToVector(text) {
    // Simple TF-IDF vectorization
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Expanded stopwords list for better clustering
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'can', 'of', 'with', 'from', 'by', 'as', 'this', 'that', 'these', 'those',
      'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'also', 'into', 'through'
    ]);
    
    const filtered = tokens.filter(t => !stopwords.has(t) && t.length > 2);
    
    // Create frequency map
    const freq = {};
    filtered.forEach(token => {
      freq[token] = (freq[token] || 0) + 1;
    });
    
    return freq;
  }

  async performClustering() {
    const fileEntries = Array.from(this.files.entries());
    console.log(`📊 Clustering ${fileEntries.length} files`);
    
    if (fileEntries.length < 2) {
      // Single cluster for all files
      console.log('⚠️ Less than 2 files, creating single cluster');
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
      return;
    }

    // Build vocabulary
    console.log('Building vocabulary...');
    const vocab = new Set();
    fileEntries.forEach(([, data]) => {
      Object.keys(data.vector).forEach(word => vocab.add(word));
    });
    const vocabArray = Array.from(vocab);
    console.log(`✓ Vocabulary size: ${vocabArray.length} words`);

    if (vocabArray.length === 0) {
      console.warn('⚠️ No vocabulary found, creating single cluster');
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
      return;
    }

    // Convert to dense vectors and validate
    console.log('Converting to vectors...');
    const vectors = fileEntries.map(([, data]) => {
      return vocabArray.map(word => {
        const value = data.vector[word] || 0;
        // Ensure numeric value
        return isNaN(value) ? 0 : Number(value);
      });
    });

    // Validate vectors
    const validVectors = vectors.every(vec => 
      vec.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
    );

    if (!validVectors) {
      console.error('❌ Invalid vectors detected, creating single cluster');
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
      return;
    }

    // Determine optimal cluster count (2 to sqrt(n))
    const numClusters = Math.min(Math.max(2, Math.ceil(Math.sqrt(fileEntries.length))), 5);
    console.log(`Creating ${numClusters} clusters...`);

    try {
      // Perform k-means clustering
      const result = kmeans(vectors, numClusters, { initialization: 'kmeans++' });

      // Assign clusters
      this.clusters.clear();
      result.clusters.forEach((clusterId, idx) => {
        const filePath = fileEntries[idx][0];
        this.files.get(filePath).cluster = clusterId;

        if (!this.clusters.has(clusterId)) {
          this.clusters.set(clusterId, { name: '', files: [] });
        }
        this.clusters.get(clusterId).files.push(filePath);
      });

      console.log(`✓ Created ${this.clusters.size} clusters`);

      // Name clusters based on common terms
      console.log('Naming clusters...');
      this.nameClusters();
      console.log('✓ Clusters named');
    } catch (error) {
      console.error('❌ Clustering failed:', error.message);
      console.error('Stack:', error.stack);
      // Fallback to single cluster
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
    }
  }

  nameClusters() {
    this.clusters.forEach((cluster, id) => {
      const allWords = {};
      
      cluster.files.forEach(filePath => {
        const fileData = this.files.get(filePath);
        Object.entries(fileData.vector).forEach(([word, count]) => {
          allWords[word] = (allWords[word] || 0) + count;
        });
      });

      // Get top 2 words
      const topWords = Object.entries(allWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([word]) => word);

      cluster.name = topWords.length > 0 
        ? topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_')
        : `Cluster_${id}`;
    });
  }

  async organizeFolders() {
    // Check if virtual mode is enabled
    if (this.config.virtualMode) {
      console.log('Virtual mode enabled - files will NOT be moved');
      return; // Skip physical file organization
    }

    // Create semantic folders and move files
    for (const [clusterId, cluster] of this.clusters.entries()) {
      const folderName = `${this.config.semanticFolderPrefix}${cluster.name}`;
      const folderPath = path.join(this.rootPath, folderName);

      // Security: Ensure folder path is within root
      if (!path.resolve(folderPath).startsWith(this.rootPath)) {
        console.error('Security: Attempted to create folder outside root');
        continue;
      }

      // Create folder if it doesn't exist
      try {
        await fs.mkdir(folderPath, { recursive: true });
      } catch (error) {
        // Folder exists
      }

      // Move files to semantic folder
      for (const filePath of cluster.files) {
        const fileName = path.basename(filePath);
        const newPath = path.join(folderPath, fileName);

        // Security: Validate paths
        if (!path.resolve(newPath).startsWith(this.rootPath)) {
          console.error('Security: Attempted to move file outside root');
          continue;
        }

        // Only move if not already in correct location
        if (filePath !== newPath) {
          try {
            await fs.rename(filePath, newPath);
            // Update internal tracking
            const fileData = this.files.get(filePath);
            this.files.delete(filePath);
            this.files.set(newPath, fileData);
            
            // Update cluster file list
            const idx = cluster.files.indexOf(filePath);
            if (idx !== -1) cluster.files[idx] = newPath;
          } catch (error) {
            console.error(`Error moving ${filePath}:`, error.message);
          }
        }
      }
    }

    // Clean up empty semantic folders
    await this.cleanupEmptyFolders();
  }

  async cleanupEmptyFolders() {
    try {
      const entries = await fs.readdir(this.rootPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(this.config.semanticFolderPrefix)) {
          const folderPath = path.join(this.rootPath, entry.name);
          
          // Security: Ensure within root
          if (!path.resolve(folderPath).startsWith(this.rootPath)) continue;
          
          const contents = await fs.readdir(folderPath);
          
          if (contents.length === 0) {
            await fs.rmdir(folderPath);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning folders:', error.message);
    }
  }

  getFileStructure() {
    const structure = {
      clusters: [],
      files: []
    };

    this.clusters.forEach((cluster, id) => {
      structure.clusters.push({
        id,
        name: cluster.name,
        files: cluster.files.map(filePath => ({
          path: filePath,
          name: path.basename(filePath),
          preview: this.files.get(filePath)?.content || ''
        }))
      });
    });

    return structure;
  }

  async handleFileChange(filePath) {
    if (!this.isValidFile(filePath)) return;
    
    await this.processFile(filePath);
    await this.performClustering();
    await this.organizeFolders();
  }

  async handleFileDelete(filePath) {
    this.files.delete(filePath);
    await this.performClustering();
    await this.organizeFolders();
  }
}

module.exports = SemanticEngine;
