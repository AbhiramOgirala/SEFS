const fs = require('fs').promises;
const path = require('path');
const natural = require('natural');
const PDFParser = require('pdf2json');
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

      // Check for duplicate content (possible PDF caching issue)
      const contentHash = content.substring(0, 100);
      const isDuplicate = Array.from(this.files.values()).some(
        fileData => fileData.contentHash === contentHash && fileData.contentHash.length > 50
      );
      
      if (isDuplicate) {
        console.warn(`⚠️  Duplicate content detected for ${path.basename(filePath)}, using filename instead`);
        
        // Check if filename matches the duplicate content topic
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileNameLower = fileName.toLowerCase();
        const contentPreview = content.substring(0, 200).toLowerCase();
        
        // Detect filename-content mismatch
        const filenameTopics = {
          ml: ['machine', 'learning', 'neural', 'algorithm', 'model', 'training'],
          security: ['security', 'cyber', 'threat', 'attack', 'firewall', 'encryption'],
          climate: ['climate', 'weather', 'temperature', 'emission', 'warming'],
          fruit: ['fruit', 'vitamin', 'nutrition', 'apple', 'banana']
        };
        
        let filenameTopic = null;
        let contentTopic = null;
        
        // Detect filename topic
        for (const [topic, keywords] of Object.entries(filenameTopics)) {
          if (keywords.some(kw => fileNameLower.includes(kw))) {
            filenameTopic = topic;
            break;
          }
        }
        
        // Detect content topic
        for (const [topic, keywords] of Object.entries(filenameTopics)) {
          if (keywords.some(kw => contentPreview.includes(kw))) {
            contentTopic = topic;
            break;
          }
        }
        
        // Warn if mismatch detected
        if (filenameTopic && contentTopic && filenameTopic !== contentTopic) {
          console.warn(`⚠️  MISMATCH: Filename suggests "${filenameTopic}" but content is about "${contentTopic}"`);
          console.warn(`   Using content for clustering, not filename!`);
          
          // Use the actual content instead of filename
          const vector = this.textToVector(content);
          
          this.files.set(filePath, {
            content: content.substring(0, this.config.security.maxContentPreview),
            vector,
            cluster: null,
            name: path.basename(filePath),
            contentHash
          });
          return;
        }
        
        // No mismatch, use filename-based content with heavy repetition for better weight
        const words = fileName
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase();
        // Repeat 10x to match weight of actual content files
        const filenameContent = Array(10).fill(words).join(' ');
        const vector = this.textToVector(filenameContent);
        
        this.files.set(filePath, {
          content: filenameContent.substring(0, this.config.security.maxContentPreview),
          vector,
          cluster: null,
          name: path.basename(filePath),
          contentHash: filenameContent.substring(0, 100)
        });
      } else {
        // Debug: Log content preview for verification
        const preview = content.substring(0, 150).replace(/\n/g, ' ');
        console.log(`  ${path.basename(filePath)}: "${preview}..."`);

        const vector = this.textToVector(content);
        
        this.files.set(filePath, {
          content: content.substring(0, this.config.security.maxContentPreview),
          vector,
          cluster: null,
          name: path.basename(filePath),
          contentHash
        });
      }
      
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
        try {
          // Use pdf2json for reliable extraction without caching issues
          const pdfParser = new PDFParser(null, 1); // null = no event emitter, 1 = verbose errors
          
          // Create promise wrapper for pdf2json
          const extractedText = await new Promise((resolve, reject) => {
            let textContent = '';
            
            pdfParser.on('pdfParser_dataError', (errData) => {
              reject(new Error(errData.parserError));
            });
            
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
              try {
                // Extract text from all pages
                if (pdfData.Pages && pdfData.Pages.length > 0) {
                  pdfData.Pages.forEach(page => {
                    if (page.Texts && page.Texts.length > 0) {
                      page.Texts.forEach(text => {
                        if (text.R && text.R.length > 0) {
                          text.R.forEach(r => {
                            if (r.T) {
                              // Decode URI component (pdf2json encodes text)
                              textContent += decodeURIComponent(r.T) + ' ';
                            }
                          });
                        }
                      });
                    }
                  });
                }
                resolve(textContent.trim());
              } catch (parseError) {
                reject(parseError);
              }
            });
            
            // Load PDF file
            pdfParser.loadPDF(filePath);
          });
          
          if (extractedText && extractedText.length > 50) {
            const preview = extractedText.substring(0, 100).replace(/\s+/g, ' ');
            console.log(`  ✓ PDF: ${path.basename(filePath)}`);
            console.log(`     "${preview}..."`);
            
            // Verify content matches filename expectations
            const fileNameLower = fileName.toLowerCase();
            const contentLower = extractedText.toLowerCase();
            
            // Extract key terms from filename
            const fileNameWords = fileNameLower
              .split(/[_\s-]+/)
              .filter(w => w.length > 3)
              .filter(w => !['file', 'document', 'content'].includes(w));
            
            // Check if any filename terms appear in content
            const hasMatch = fileNameWords.some(word => contentLower.includes(word));
            
            if (!hasMatch && fileNameWords.length > 0) {
              console.warn(`⚠️  WARNING: PDF content mismatch detected!`);
              console.warn(`   File: ${path.basename(filePath)}`);
              console.warn(`   Expected terms: ${fileNameWords.join(', ')}`);
              console.warn(`   Content: ${preview}`);
              console.warn(`   → This PDF may have incorrect content or be corrupted`);
            }
            
            return extractedText;
          } else {
            // PDF parsed but no text - might be image-based PDF
            console.warn(`⚠️  PDF has no extractable text: ${path.basename(filePath)}`);
            console.warn(`   → Using filename for clustering`);
            
            // Use enhanced filename analysis with heavy repetition
            const words = fileName
              .replace(/[_-]/g, ' ')
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .toLowerCase();
            // Repeat 15x to give strong weight in clustering
            return Array(15).fill(words).join(' ');
          }
        } catch (pdfError) {
          console.error(`❌ PDF extraction FAILED: ${path.basename(filePath)}`);
          console.error(`   Error: ${pdfError.message}`);
          
          if (pdfError.message.includes('XRef') || pdfError.message.includes('corrupt')) {
            console.error(`   → PDF appears to be corrupted or malformed`);
          }
          
          console.warn(`   → Falling back to filename-based clustering`);
          
          // Fallback: use enhanced filename for clustering with heavy repetition
          const words = fileName
            .replace(/[_-]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .toLowerCase();
          // Repeat 15x to give strong weight in clustering
          return Array(15).fill(words).join(' ');
        }
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
    // Enhanced NLP preprocessing for better text similarity
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;
    
    // Domain-specific term groups for semantic similarity
    // Files with terms from the same group will have higher similarity
    const domainGroups = {
      cybersecurity: [
        'cybersecurity', 'security', 'cyber', 'attack', 'threat', 'vulnerability',
        'incident', 'response', 'breach', 'firewall', 'encryption', 'malware',
        'phishing', 'ransomware', 'intrusion', 'detection', 'network', 'defense',
        'protection', 'safeguard', 'authentication', 'authorization', 'exploit',
        'secure', 'securing', 'protected', 'defending', 'monitor', 'monitoring',
        'intelligence', 'forensic', 'containment', 'eradication', 'recovery',
        'denial', 'service', 'dos', 'ddos', 'penetration', 'testing', 'audit',
        'compliance', 'risk', 'assessment', 'mitigation', 'patch', 'update'
      ],
      machine_learning: [
        'machine', 'learning', 'neural', 'network', 'deep', 'algorithm',
        'model', 'training', 'data', 'artificial', 'intelligence', 'ai',
        'supervised', 'unsupervised', 'classification', 'regression', 'prediction',
        'feature', 'dataset', 'accuracy', 'optimization', 'gradient', 'vision',
        'computer', 'image', 'recognition', 'convolutional', 'layer', 'activation'
      ],
      climate: [
        'climate', 'weather', 'temperature', 'global', 'warming', 'emission',
        'carbon', 'greenhouse', 'environment', 'renewable', 'energy', 'solar',
        'wind', 'fossil', 'pollution', 'sustainability', 'ecological'
      ],
      food_nutrition: [
        'fruit', 'food', 'nutrition', 'vitamin', 'mineral', 'healthy', 'diet',
        'organic', 'vegetable', 'protein', 'fiber', 'antioxidant', 'nutrient'
      ]
    };
    
    // Normalize text
    let normalized = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
    
    const tokens = tokenizer.tokenize(normalized);
    
    // Comprehensive stopwords list
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'can', 'of', 'with', 'from', 'by', 'as', 'this', 'that', 'these', 'those',
      'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'also', 'into', 'through',
      'about', 'after', 'before', 'between', 'during', 'under', 'over', 'above',
      'below', 'up', 'down', 'out', 'off', 'again', 'further', 'then', 'once'
    ]);
    
    // Filter and stem tokens
    const filtered = tokens
      .filter(t => !stopwords.has(t) && t.length > 2)
      .map(t => stemmer.stem(t));
    
    // Create frequency map with stemmed tokens
    const freq = {};
    filtered.forEach(token => {
      freq[token] = (freq[token] || 0) + 1;
    });
    
    // Add bigrams for better context (pairs of consecutive words)
    for (let i = 0; i < filtered.length - 1; i++) {
      const bigram = `${filtered[i]}_${filtered[i + 1]}`;
      freq[bigram] = (freq[bigram] || 0) + 0.5; // Weight bigrams slightly less
    }
    
    // Add domain markers to boost similarity within same domain
    // This helps group related files even if they use different terminology
    Object.entries(domainGroups).forEach(([domain, terms]) => {
      const stemmedTerms = terms.map(t => stemmer.stem(t));
      const matchCount = stemmedTerms.filter(t => freq[t] > 0).length;
      
      // If file has multiple terms from a domain, add a domain marker
      if (matchCount >= 2) {
        freq[`__domain_${domain}__`] = matchCount * 5; // Increased from 2 to 5 for stronger domain affinity
      }
    });
    
    return freq;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vec1, vec2) {
    const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    allKeys.forEach(key => {
      const v1 = vec1[key] || 0;
      const v2 = vec2[key] || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  // Calculate TF-IDF weights for better document representation
  calculateTFIDF(vectors) {
    const numDocs = vectors.length;
    const idf = {};
    
    // Calculate document frequency for each term
    const allTerms = new Set();
    vectors.forEach(vec => {
      Object.keys(vec).forEach(term => allTerms.add(term));
    });
    
    allTerms.forEach(term => {
      const docCount = vectors.filter(vec => vec[term] > 0).length;
      idf[term] = Math.log(numDocs / (docCount + 1));
    });
    
    // Apply TF-IDF weighting
    return vectors.map(vec => {
      const tfidf = {};
      Object.entries(vec).forEach(([term, tf]) => {
        tfidf[term] = tf * (idf[term] || 0);
      });
      return tfidf;
    });
  }

  async performClustering() {
    const fileEntries = Array.from(this.files.entries());
    console.log(`📊 Clustering ${fileEntries.length} files using enhanced NLP`);
    
    if (fileEntries.length < 2) {
      console.log('⚠️ Less than 2 files, creating single cluster');
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
      return;
    }

    // Build vocabulary from all documents
    console.log('Building vocabulary with stemming...');
    const vocab = new Set();
    fileEntries.forEach(([, data]) => {
      Object.keys(data.vector).forEach(word => vocab.add(word));
    });
    const vocabArray = Array.from(vocab);
    console.log(`✓ Vocabulary size: ${vocabArray.length} terms (including bigrams)`);

    if (vocabArray.length === 0) {
      console.warn('⚠️ No vocabulary found, creating single cluster');
      this.clusters.clear();
      this.clusters.set(0, { name: 'Documents', files: fileEntries.map(([p]) => p) });
      fileEntries.forEach(([path]) => {
        this.files.get(path).cluster = 0;
      });
      return;
    }

    // Apply TF-IDF weighting for better semantic representation
    console.log('Applying TF-IDF weighting...');
    const rawVectors = fileEntries.map(([, data]) => data.vector);
    const tfidfVectors = this.calculateTFIDF(rawVectors);
    
    // Update file vectors with TF-IDF weights
    fileEntries.forEach(([path, data], idx) => {
      data.vector = tfidfVectors[idx];
    });

    // Convert to dense vectors with TF-IDF weights
    console.log('Converting to dense vectors...');
    const vectors = tfidfVectors.map(vec => {
      return vocabArray.map(word => {
        const value = vec[word] || 0;
        return isNaN(value) ? 0 : Number(value);
      });
    });

    // Normalize vectors for better cosine similarity
    const normalizedVectors = vectors.map(vec => {
      const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
      return magnitude > 0 ? vec.map(val => val / magnitude) : vec;
    });

    // Validate vectors
    const validVectors = normalizedVectors.every(vec => 
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

    // Determine optimal cluster count using elbow method
    const maxClusters = Math.min(Math.ceil(Math.sqrt(fileEntries.length) * 1.5), 12);
    const minClusters = Math.min(2, fileEntries.length);
    const numClusters = this.determineOptimalClusters(normalizedVectors, minClusters, maxClusters);
    console.log(`📍 Optimal clusters determined: ${numClusters} (tested range: ${minClusters}-${maxClusters})`);

    try {
      // Perform k-means clustering with multiple iterations for stability
      console.log('Performing k-means clustering...');
      const result = kmeans(normalizedVectors, numClusters, { 
        initialization: 'kmeans++',
        maxIterations: 100
      });

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

      // Refine clusters by merging very similar ones
      console.log('Refining clusters based on similarity...');
      this.refineClusters(fileEntries);

      console.log(`✓ Created ${this.clusters.size} refined clusters`);

      // Name clusters based on distinctive terms
      console.log('Naming clusters with distinctive terms...');
      this.nameClusters();
      console.log('✓ Clusters named');
      
      // Log cluster statistics
      this.clusters.forEach((cluster, id) => {
        console.log(`  Cluster "${cluster.name}": ${cluster.files.length} files`);
      });
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

  // Calculate silhouette score for a clustering result
  calculateSilhouetteScore(vectors, clusterAssignments) {
    const n = vectors.length;
    if (n <= 1) return 0;
    
    const numClusters = Math.max(...clusterAssignments) + 1;
    
    // Group vectors by cluster
    const clusters = Array(numClusters).fill(null).map(() => []);
    clusterAssignments.forEach((clusterId, idx) => {
      clusters[clusterId].push(idx);
    });
    
    // Calculate silhouette for each point
    let totalSilhouette = 0;
    
    for (let i = 0; i < n; i++) {
      const myCluster = clusterAssignments[i];
      const myClusterPoints = clusters[myCluster];
      
      if (myClusterPoints.length === 1) {
        // Single point in cluster, silhouette = 0
        continue;
      }
      
      // Calculate a(i): average distance to points in same cluster
      let a = 0;
      for (const j of myClusterPoints) {
        if (i !== j) {
          a += this.euclideanDistance(vectors[i], vectors[j]);
        }
      }
      a /= (myClusterPoints.length - 1);
      
      // Calculate b(i): minimum average distance to points in other clusters
      let b = Infinity;
      for (let otherCluster = 0; otherCluster < numClusters; otherCluster++) {
        if (otherCluster === myCluster) continue;
        
        const otherPoints = clusters[otherCluster];
        if (otherPoints.length === 0) continue;
        
        let avgDist = 0;
        for (const j of otherPoints) {
          avgDist += this.euclideanDistance(vectors[i], vectors[j]);
        }
        avgDist /= otherPoints.length;
        
        b = Math.min(b, avgDist);
      }
      
      // Silhouette for this point
      const s = (b - a) / Math.max(a, b);
      totalSilhouette += s;
    }
    
    return totalSilhouette / n;
  }

  // Determine optimal number of clusters using silhouette analysis
  determineOptimalClusters(vectors, minK, maxK) {
    if (vectors.length <= minK) return minK;
    if (vectors.length <= 3) return Math.min(2, maxK);
    
    console.log('  Testing different cluster counts...');
    
    const scores = [];
    
    // Test each k value
    for (let k = minK; k <= Math.min(maxK, vectors.length - 1); k++) {
      try {
        const result = kmeans(vectors, k, { 
          initialization: 'kmeans++',
          maxIterations: 100
        });
        
        // Calculate silhouette score (measures cluster quality)
        const silhouette = this.calculateSilhouetteScore(vectors, result.clusters);
        
        // Calculate within-cluster sum of squares (WCSS)
        let wcss = 0;
        result.clusters.forEach((clusterId, idx) => {
          const centroid = result.centroids[clusterId];
          const point = vectors[idx];
          const dist = this.euclideanDistance(point, centroid);
          wcss += dist * dist;
        });
        
        // Calculate cluster size variance (penalize unbalanced clusters)
        const clusterSizes = Array(k).fill(0);
        result.clusters.forEach(c => clusterSizes[c]++);
        const avgSize = vectors.length / k;
        const sizeVariance = clusterSizes.reduce((sum, size) => 
          sum + Math.pow(size - avgSize, 2), 0) / k;
        const balancePenalty = sizeVariance / (avgSize * avgSize);
        
        // Combined score: silhouette - balance penalty
        const combinedScore = silhouette - (balancePenalty * 0.1);
        
        scores.push({ k, silhouette, wcss, balancePenalty, combinedScore });
        console.log(`    k=${k}: silhouette=${silhouette.toFixed(3)}, balance=${balancePenalty.toFixed(3)}, score=${combinedScore.toFixed(3)}`);
      } catch (error) {
        console.log(`    k=${k}: clustering failed`);
        continue;
      }
    }
    
    if (scores.length === 0) {
      return Math.min(Math.ceil(Math.sqrt(vectors.length)), maxK);
    }
    
    // Find k with highest combined score
    let bestK = minK;
    let bestScore = -Infinity;
    
    for (const score of scores) {
      if (score.combinedScore > bestScore) {
        bestScore = score.combinedScore;
        bestK = score.k;
      }
    }
    
    console.log(`  Best k=${bestK} with combined score ${bestScore.toFixed(3)}`);
    
    // If silhouette score is very low (< 0.15), clusters are poorly separated
    const bestSilhouette = scores.find(s => s.k === bestK).silhouette;
    if (bestSilhouette < 0.15) {
      console.log(`  ⚠️  Low silhouette score (${bestSilhouette.toFixed(3)}) indicates weak cluster separation`);
      console.log(`     This may be due to short documents or overlapping topics`);
    }
    
    return bestK;
  }

  // Calculate Euclidean distance between two vectors
  euclideanDistance(vec1, vec2) {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  // Refine clusters by merging very similar ones
  refineClusters(fileEntries) {
    const clusterVectors = new Map();
    
    // Calculate centroid for each cluster
    this.clusters.forEach((cluster, id) => {
      const clusterFiles = cluster.files.map(fp => 
        this.files.get(fp).vector
      );
      
      // Average vector (centroid)
      const centroid = {};
      clusterFiles.forEach(vec => {
        Object.entries(vec).forEach(([term, weight]) => {
          centroid[term] = (centroid[term] || 0) + weight;
        });
      });
      
      // Normalize by cluster size
      Object.keys(centroid).forEach(term => {
        centroid[term] /= clusterFiles.length;
      });
      
      clusterVectors.set(id, centroid);
    });
    
    // Find and merge ONLY extremely similar clusters (similarity > 0.85)
    // This threshold is higher to prevent merging distinct topics
    const clusterIds = Array.from(this.clusters.keys());
    const toMerge = [];
    
    for (let i = 0; i < clusterIds.length; i++) {
      for (let j = i + 1; j < clusterIds.length; j++) {
        const sim = this.cosineSimilarity(
          clusterVectors.get(clusterIds[i]),
          clusterVectors.get(clusterIds[j])
        );
        
        // Only merge if extremely similar (raised from 0.7 to 0.85)
        if (sim > 0.85) {
          toMerge.push([clusterIds[i], clusterIds[j]]);
          console.log(`  Merging clusters ${clusterIds[i]} and ${clusterIds[j]} (similarity: ${sim.toFixed(3)})`);
        }
      }
    }
    
    // Merge similar clusters
    toMerge.forEach(([id1, id2]) => {
      if (this.clusters.has(id1) && this.clusters.has(id2)) {
        const cluster1 = this.clusters.get(id1);
        const cluster2 = this.clusters.get(id2);
        
        // Merge files into cluster1
        cluster1.files.push(...cluster2.files);
        
        // Update file cluster assignments
        cluster2.files.forEach(fp => {
          this.files.get(fp).cluster = id1;
        });
        
        // Remove cluster2
        this.clusters.delete(id2);
      }
    });
    
    // Check for "miscellaneous" clusters (files with low intra-cluster similarity)
    // These should potentially be split or marked as outliers
    this.clusters.forEach((cluster, id) => {
      if (cluster.files.length < 2) return; // Skip single-file clusters
      
      // Calculate average intra-cluster similarity
      let totalSim = 0;
      let count = 0;
      
      for (let i = 0; i < cluster.files.length; i++) {
        for (let j = i + 1; j < cluster.files.length; j++) {
          const file1 = this.files.get(cluster.files[i]);
          const file2 = this.files.get(cluster.files[j]);
          totalSim += this.cosineSimilarity(file1.vector, file2.vector);
          count++;
        }
      }
      
      const avgSim = count > 0 ? totalSim / count : 0;
      
      // Warn if cluster has low cohesion (files aren't similar to each other)
      if (avgSim < 0.15 && cluster.files.length > 2) {
        console.log(`  ⚠️  Cluster "${cluster.name}" has low cohesion (avg similarity: ${avgSim.toFixed(3)})`);
        console.log(`     This cluster may contain unrelated files grouped together`);
      }
    });
  }

  nameClusters() {
    this.clusters.forEach((cluster, id) => {
      // Calculate TF-IDF scores for terms in this cluster vs all documents
      const clusterTerms = {};
      const allTerms = {};
      
      // Collect terms from cluster files
      cluster.files.forEach(filePath => {
        const fileData = this.files.get(filePath);
        Object.entries(fileData.vector).forEach(([term, weight]) => {
          clusterTerms[term] = (clusterTerms[term] || 0) + weight;
        });
      });
      
      // Collect terms from all files
      this.files.forEach((fileData) => {
        Object.entries(fileData.vector).forEach(([term, weight]) => {
          allTerms[term] = (allTerms[term] || 0) + weight;
        });
      });
      
      // Calculate distinctiveness score (cluster frequency / global frequency)
      const distinctiveness = {};
      Object.keys(clusterTerms).forEach(term => {
        const clusterFreq = clusterTerms[term] / cluster.files.length;
        const globalFreq = allTerms[term] / this.files.size;
        distinctiveness[term] = clusterFreq / (globalFreq + 0.1); // Add smoothing
      });
      
      // Get top distinctive terms (not just most frequent)
      const topTerms = Object.entries(distinctiveness)
        .filter(([term]) => !term.includes('_')) // Exclude bigrams from names
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([term]) => term);

      // Create readable cluster name
      if (topTerms.length > 0) {
        cluster.name = topTerms
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join('_');
      } else {
        cluster.name = `Cluster_${id}`;
      }
      
      // Limit name length
      if (cluster.name.length > 30) {
        const words = cluster.name.split('_');
        cluster.name = words.slice(0, 2).join('_');
      }
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
    
    console.log(`\n📝 File change detected: ${path.basename(filePath)}`);
    console.log('🔄 Re-processing all files to update TF-IDF weights...');
    
    // When a new file is added, we need to:
    // 1. Re-process ALL files to recalculate TF-IDF with new vocabulary
    // 2. Re-cluster with updated vectors
    // Simply adding the new file with old TF-IDF weights will cause incorrect clustering
    
    // Clear existing data
    const existingFiles = Array.from(this.files.keys());
    this.files.clear();
    
    // Re-process all files including the new one
    const allFiles = await this.getAllFiles(this.rootPath);
    const validFiles = allFiles.filter(f => this.isValidFile(f));
    
    console.log(`Processing ${validFiles.length} files (including new file)...`);
    
    for (const file of validFiles) {
      await this.processFile(file);
    }
    
    console.log('✓ All files re-processed with updated vocabulary');
    
    // Re-cluster with new TF-IDF weights
    await this.performClustering();
    
    // Organize folders if not in virtual mode
    if (!this.config.virtualMode) {
      await this.organizeFolders();
    }
  }

  async handleFileDelete(filePath) {
    console.log(`\n🗑️  File deletion detected: ${path.basename(filePath)}`);
    
    // Remove from tracking
    this.files.delete(filePath);
    
    if (this.files.size === 0) {
      console.log('No files remaining, clearing clusters');
      this.clusters.clear();
      return;
    }
    
    console.log('🔄 Re-processing remaining files to update TF-IDF weights...');
    
    // Re-process all remaining files to recalculate TF-IDF
    const remainingFiles = Array.from(this.files.keys());
    this.files.clear();
    
    for (const file of remainingFiles) {
      await this.processFile(file);
    }
    
    console.log('✓ Remaining files re-processed with updated vocabulary');
    
    // Re-cluster
    await this.performClustering();
    
    // Organize folders if not in virtual mode
    if (!this.config.virtualMode) {
      await this.organizeFolders();
    }
  }
}

module.exports = SemanticEngine;
