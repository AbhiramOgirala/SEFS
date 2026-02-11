# API Reference

## Overview

This document provides detailed API documentation for developers who want to extend or integrate with SEFS.

## Core Classes

### SemanticEngine

Main class responsible for semantic analysis and file organization.

#### Constructor

```javascript
const engine = new SemanticEngine(rootPath);
```

**Parameters:**
- `rootPath` (string): Absolute path to root directory

#### Methods

##### `async initialize()`

Initializes the engine and performs initial scan.

```javascript
await engine.initialize();
```

**Returns:** Promise<void>

**Throws:** Error if initialization fails

---

##### `async scanAndProcess()`

Scans directory and processes all valid files.

```javascript
await engine.scanAndProcess();
```

**Returns:** Promise<void>

**Side Effects:**
- Updates `this.files` Map
- Performs clustering
- Organizes files into folders

---

##### `async processFile(filePath)`

Processes a single file.

```javascript
await engine.processFile('/path/to/file.txt');
```

**Parameters:**
- `filePath` (string): Absolute path to file

**Returns:** Promise<void>

**Side Effects:**
- Adds file to `this.files` Map
- Extracts content
- Creates vector representation

---

##### `async performClustering()`

Performs K-means clustering on processed files.

```javascript
await engine.performClustering();
```

**Returns:** Promise<void>

**Side Effects:**
- Updates `this.clusters` Map
- Assigns cluster IDs to files
- Names clusters

**Algorithm:**
- Determines optimal K (2 to 5)
- Uses K-means++ initialization
- Iterates until convergence

---

##### `async organizeFolders()`

Creates semantic folders and moves files.

```javascript
await engine.organizeFolders();
```

**Returns:** Promise<void>

**Side Effects:**
- Creates `_semantic_*` folders
- Moves files physically on disk
- Updates internal tracking

**Security:**
- Validates all paths
- Ensures operations within root

---

##### `getFileStructure()`

Returns current file organization structure.

```javascript
const structure = engine.getFileStructure();
```

**Returns:** Object
```javascript
{
  clusters: [
    {
      id: 0,
      name: "Machine_Learning",
      files: [
        {
          path: "/path/to/file.txt",
          name: "file.txt",
          preview: "Content preview..."
        }
      ]
    }
  ]
}
```

---

##### `async handleFileChange(filePath)`

Handles file creation or modification.

```javascript
await engine.handleFileChange('/path/to/file.txt');
```

**Parameters:**
- `filePath` (string): Path to changed file

**Returns:** Promise<void>

**Side Effects:**
- Reprocesses file
- Re-clusters all files
- Reorganizes folders

---

##### `async handleFileDelete(filePath)`

Handles file deletion.

```javascript
await engine.handleFileDelete('/path/to/file.txt');
```

**Parameters:**
- `filePath` (string): Path to deleted file

**Returns:** Promise<void>

**Side Effects:**
- Removes from tracking
- Re-clusters remaining files
- Reorganizes folders

---

#### Properties

##### `rootPath`
- **Type:** string
- **Description:** Absolute path to monitored directory
- **Read-only:** Yes

##### `files`
- **Type:** Map<string, FileData>
- **Description:** Map of file paths to file data
- **Structure:**
```javascript
{
  content: string,    // Preview (500 chars)
  vector: Object,     // TF-IDF vector
  cluster: number,    // Cluster ID
  name: string        // File name
}
```

##### `clusters`
- **Type:** Map<number, ClusterData>
- **Description:** Map of cluster IDs to cluster data
- **Structure:**
```javascript
{
  name: string,       // Cluster name
  files: string[]     // Array of file paths
}
```

##### `processing`
- **Type:** boolean
- **Description:** Whether processing is in progress
- **Read-only:** No

---

### FileMonitor

Monitors file system for changes.

#### Constructor

```javascript
const monitor = new FileMonitor(rootPath, semanticEngine);
```

**Parameters:**
- `rootPath` (string): Path to monitor
- `semanticEngine` (SemanticEngine): Engine instance

#### Methods

##### `start()`

Starts monitoring.

```javascript
monitor.start();
```

**Returns:** void

**Side Effects:**
- Initializes chokidar watcher
- Registers event handlers

---

##### `stop()`

Stops monitoring.

```javascript
monitor.stop();
```

**Returns:** void

**Side Effects:**
- Closes chokidar watcher
- Cleans up resources

---

##### `handleChange(event, filePath)`

Internal method to handle file changes.

```javascript
monitor.handleChange('add', '/path/to/file.txt');
```

**Parameters:**
- `event` (string): Event type ('add', 'change', 'unlink')
- `filePath` (string): Path to changed file

**Returns:** void

**Side Effects:**
- Triggers semantic engine processing
- Emits 'structure-updated' event

---

#### Events

##### `structure-updated`

Emitted when file structure changes.

```javascript
monitor.on('structure-updated', (structure) => {
  console.log('Structure updated:', structure);
});
```

**Payload:** File structure object (see `getFileStructure()`)

---

### ConfigLoader

Manages application configuration.

#### Methods

##### `async load()`

Loads configuration from file.

```javascript
await configLoader.load();
```

**Returns:** Promise<Object>

**Default Config:**
```javascript
{
  fileTypes: ['.txt', '.pdf', '.md'],
  maxFileSize: 10485760,
  minClusterSize: 2,
  maxClusters: 5,
  debounceDelay: 1000,
  semanticFolderPrefix: '_semantic_',
  excludePatterns: ['node_modules', '.git', '.kiro', 'dist', 'build'],
  security: {
    allowFileExecution: false,
    sandboxMode: true,
    maxContentPreview: 500
  }
}
```

---

##### `get(key)`

Gets configuration value.

```javascript
const fileTypes = configLoader.get('fileTypes');
```

**Parameters:**
- `key` (string): Configuration key

**Returns:** any

---

##### `getDefaults()`

Returns default configuration.

```javascript
const defaults = configLoader.getDefaults();
```

**Returns:** Object

---

## IPC API

Communication between main and renderer processes.

### Main Process Handlers

#### `select-root-folder`

Opens folder selection dialog.

```javascript
// Renderer
const result = await window.sefs.selectRootFolder();
```

**Returns:**
```javascript
{
  success: boolean,
  path?: string
}
```

---

#### `get-file-structure`

Gets current file structure.

```javascript
// Renderer
const structure = await window.sefs.getFileStructure();
```

**Returns:** File structure object

---

#### `open-file`

Opens file in default application.

```javascript
// Renderer
await window.sefs.openFile('/path/to/file.txt');
```

**Parameters:**
- `filePath` (string): Path to file

**Returns:** Promise<void>

---

### Renderer Events

#### `structure-updated`

Receives structure updates.

```javascript
// Renderer
window.sefs.onStructureUpdated((structure) => {
  console.log('New structure:', structure);
});
```

**Payload:** File structure object

---

## Utility Functions

### Text Processing

#### `textToVector(text)`

Converts text to TF-IDF vector.

```javascript
const vector = engine.textToVector("Machine learning is amazing");
```

**Parameters:**
- `text` (string): Input text

**Returns:** Object (word -> frequency map)

**Example:**
```javascript
{
  machine: 1,
  learning: 1,
  amazing: 1
}
```

---

#### `extractContent(filePath)`

Extracts text content from file.

```javascript
const content = await engine.extractContent('/path/to/file.pdf');
```

**Parameters:**
- `filePath` (string): Path to file

**Returns:** Promise<string>

**Supported Formats:**
- .txt (UTF-8)
- .pdf (text extraction)
- .md (UTF-8)

---

### Clustering

#### `performClustering()`

Internal clustering implementation.

**Algorithm Steps:**
1. Build vocabulary from all documents
2. Convert to dense vectors
3. Determine optimal K
4. Initialize centroids (K-means++)
5. Assign documents to clusters
6. Iterate until convergence
7. Name clusters

---

#### `nameClusters()`

Generates cluster names from content.

**Algorithm:**
1. Aggregate word frequencies per cluster
2. Sort by frequency
3. Select top 2 words
4. Capitalize and join

---

### File Operations

#### `getAllFiles(dir, fileList)`

Recursively gets all files in directory.

```javascript
const files = await engine.getAllFiles('/path/to/dir');
```

**Parameters:**
- `dir` (string): Directory path
- `fileList` (Array): Accumulator (optional)

**Returns:** Promise<string[]>

**Filters:**
- Hidden files (starting with .)
- Excluded patterns
- Semantic folders

---

#### `isValidFile(filePath)`

Checks if file is valid for processing.

```javascript
const valid = engine.isValidFile('/path/to/file.txt');
```

**Parameters:**
- `filePath` (string): Path to file

**Returns:** boolean

**Criteria:**
- Extension in `config.fileTypes`
- File exists and readable

---

## Configuration Schema

### config.json

```json
{
  "fileTypes": ["string"],
  "maxFileSize": "number (bytes)",
  "minClusterSize": "number",
  "maxClusters": "number",
  "debounceDelay": "number (milliseconds)",
  "semanticFolderPrefix": "string",
  "excludePatterns": ["string"],
  "security": {
    "allowFileExecution": "boolean",
    "sandboxMode": "boolean",
    "maxContentPreview": "number (characters)"
  }
}
```

---

## Extension Points

### Adding New File Types

1. **Update config.json:**
```json
{
  "fileTypes": [".txt", ".pdf", ".md", ".docx"]
}
```

2. **Add extraction logic in `extractContent()`:**
```javascript
async extractContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.docx') {
    // Add DOCX extraction logic
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  // ... existing logic
}
```

---

### Custom Clustering Algorithms

Replace `performClustering()` method:

```javascript
async performClustering() {
  // Your custom clustering logic
  // Must populate this.clusters Map
  // Must assign cluster IDs to files
}
```

---

### Custom Visualization

Modify `src/ui/renderer.js`:

```javascript
function renderVisualization() {
  // Your custom visualization logic
  // Access currentStructure for data
}
```

---

### Custom Naming Strategy

Override `nameClusters()` method:

```javascript
nameClusters() {
  this.clusters.forEach((cluster, id) => {
    // Your custom naming logic
    cluster.name = generateCustomName(cluster.files);
  });
}
```

---

## Error Handling

### Common Errors

#### `Error: EACCES: permission denied`

**Cause:** Insufficient file permissions

**Solution:**
```javascript
try {
  await fs.access(filePath, fs.constants.R_OK);
} catch (error) {
  console.error('Permission denied:', filePath);
}
```

---

#### `Error: File too large`

**Cause:** File exceeds `maxFileSize`

**Solution:** Increase limit in config.json or skip file

---

#### `Error: Cannot move file`

**Cause:** File locked by another process

**Solution:** Implement retry logic or skip file

---

## Performance Considerations

### Memory Usage

- Each file stores ~1KB metadata
- Vectors are sparse (only non-zero terms)
- Preview limited to 500 characters

**Optimization:**
```javascript
// Clear processed content
delete fileData.fullContent;
```

---

### Processing Speed

- Debouncing reduces redundant processing
- Incremental updates avoid full rescans
- Clustering complexity: O(n * k * i)
  - n = number of files
  - k = number of clusters
  - i = iterations (typically <10)

---

### Scalability

**Tested Limits:**
- 1000+ files
- 100MB+ total content
- 5 concurrent file operations

**Recommendations:**
- Batch process large imports
- Increase debounce delay for large directories
- Consider pagination for visualization

---

## Security API

### Path Validation

```javascript
// Ensure path is within root
const normalizedPath = path.resolve(filePath);
if (!normalizedPath.startsWith(this.rootPath)) {
  throw new Error('Path outside root directory');
}
```

---

### Content Sanitization

```javascript
// Limit preview length
const preview = content.substring(0, config.security.maxContentPreview);
```

---

### File Size Validation

```javascript
const stats = await fs.stat(filePath);
if (stats.size > config.maxFileSize) {
  throw new Error('File too large');
}
```

---

## Testing API

### Mock SemanticEngine

```javascript
class MockSemanticEngine extends SemanticEngine {
  async extractContent(filePath) {
    return 'Mock content for testing';
  }
}
```

---

### Test Helpers

```javascript
// Create test files
async function createTestFile(path, content) {
  await fs.writeFile(path, content);
}

// Wait for processing
async function waitForProcessing(engine) {
  while (engine.processing) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

---

## Examples

### Basic Usage

```javascript
const SemanticEngine = require('./src/semantic-engine');

const engine = new SemanticEngine('/path/to/documents');
await engine.initialize();

const structure = engine.getFileStructure();
console.log('Clusters:', structure.clusters.length);
```

---

### Custom File Processing

```javascript
class CustomEngine extends SemanticEngine {
  async processFile(filePath) {
    // Custom preprocessing
    const content = await this.extractContent(filePath);
    const cleaned = this.customClean(content);
    
    // Continue with standard processing
    const vector = this.textToVector(cleaned);
    this.files.set(filePath, { content: cleaned, vector });
  }
  
  customClean(text) {
    // Your custom cleaning logic
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  }
}
```

---

### Event Monitoring

```javascript
const FileMonitor = require('./src/file-monitor');

const monitor = new FileMonitor(rootPath, engine);

monitor.on('structure-updated', (structure) => {
  console.log('Files reorganized!');
  console.log('Clusters:', structure.clusters.length);
});

monitor.start();
```

---

## Version History

### 1.0.0 (Current)
- Initial release
- Core semantic clustering
- Real-time monitoring
- 2D visualization
- Security features

---

## Support

For API questions or issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review source code comments
3. Open GitHub issue
4. Consult [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
