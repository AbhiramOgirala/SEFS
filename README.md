# Semantic Entropy File System (SEFS)

A self-organizing file manager that dynamically organizes **ALL file types** based on their semantic content using AI-powered clustering.

## 🚀 Quick Start

**First time user?** → Read [START_HERE.md](START_HERE.md)

**Seeing only 1 file?** → Run `npm run reset` then `npm start`

```bash
npm install
npm start
```

## Features

✅ **Auto-Detection & Processing**: Automatically monitors and processes files of any type
✅ **Semantic Folder Organization**: Creates dynamic folders based on content similarity (not file type!)
✅ **OS-Level Synchronization**: Real-time bidirectional sync with file system
✅ **Interactive 2D Visualization**: Visual node-based interface with live updates
✅ **Real-time Monitoring**: Detects file changes, additions, and deletions instantly
✅ **Security-First Design**: Sandboxed processing, no external API calls
✅ **Multi-Format Support**: Works with text files, code files, PDFs, JSON, CSV, and more

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

1. Click "Select Root Folder" to choose a directory to monitor
2. Add PDF or text files to the folder
3. Watch as SEFS automatically organizes them into semantic clusters
4. Hover over nodes to see file previews
5. Click nodes to open files

**Important:** If you've run SEFS before, files may already be in `_semantic_*` folders. Run `npm run reset` to move them back before starting.

## Quick Commands

```bash
npm start          # Run application
npm run reset      # Reset files from semantic folders
npm run test-setup # Create test files
npm run dev        # Run with console logging
```

## How It Works

1. **Content Extraction**: Extracts text from ALL file types (code, docs, data, etc.)
2. **Semantic Analysis**: Analyzes what files are ABOUT using NLP
3. **Clustering**: Groups files by content similarity (not file type!)
4. **Organization**: Creates `_semantic_*` folders and moves files
5. **Monitoring**: Watches for changes and re-organizes automatically

**Example**: A Python ML script, a text document about AI, and a PDF on neural networks will all cluster together because they're about the same topic - regardless of format!

Read [HOW_CLUSTERING_WORKS.md](HOW_CLUSTERING_WORKS.md) for details.

## Security Features

- No external API calls - all processing is local
- Sandboxed file operations within selected root folder
- Context isolation in Electron
- Read-only access to file content
- No execution of file content
- Automatic cleanup of empty folders

## File Support

- `.txt` - Plain text files
- `.pdf` - PDF documents
- `.md` - Markdown files
- `.js` - JavaScript code
- `.py` - Python code
- `.java` - Java code
- `.cpp`, `.c` - C/C++ code
- `.html`, `.css` - Web files
- `.json`, `.xml` - Data files
- `.csv` - Spreadsheet data
- `.log` - Log files
- And any other text-based format!

**Key Point**: Files are clustered by CONTENT SIMILARITY, not by file type. A Python ML script and a text document about machine learning will be grouped together!

## Architecture

- **semantic-engine.js**: Core clustering and organization logic
- **file-monitor.js**: Real-time file system monitoring
- **main.js**: Electron main process
- **renderer.js**: 2D visualization and UI
- **preload.js**: Secure IPC bridge

## Limitations

- Requires at least 2 files for clustering
- Best results with 5+ files
- Large files (>10MB) may take longer to process
- Semantic folders are prefixed with `_semantic_`

## Development

```bash
npm run dev
```

## License

MIT
