# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

## First Time Setup

1. **Launch SEFS**: The application window will open
2. **Select Root Folder**: Click "Select Root Folder" button
3. **Choose Directory**: Select a folder containing text or PDF files (or use the provided `example-files` folder)
4. **Watch Magic Happen**: SEFS will automatically:
   - Scan all files
   - Analyze content
   - Create semantic clusters
   - Organize files into `_semantic_*` folders

**Note:** If you've run the system before and files are already in semantic folders, run `npm run reset` first to move them back to the root directory.

## Using the Interface

### Visualization Panel (Left)
- **Cluster Circles**: Colored boundaries represent semantic groups
- **File Nodes**: Circles inside clusters represent individual files
- **Hover**: Move mouse over nodes to see file previews
- **Click**: Click any node to open the file in your default application

### Sidebar (Right)
- **Cluster List**: Shows all semantic clusters with file counts
- **File List**: Click any file name to open it
- **Live Updates**: Automatically refreshes when files change

## Testing with Example Files

The `example-files` folder contains 6 sample documents:
- 2 about Machine Learning/AI
- 2 about Web Development
- 2 about Cloud/Data topics

When you select this folder, SEFS will organize them into 2-3 semantic clusters.

## Adding New Files

1. Copy or create new `.txt` or `.pdf` files in the monitored folder
2. SEFS automatically detects and processes them
3. Files are re-organized based on updated semantic relationships
4. Visualization updates in real-time

## Understanding Semantic Folders

- Folders are named `_semantic_[TopicName]`
- Names are derived from most common words in cluster
- Files are physically moved to these folders
- Empty semantic folders are automatically cleaned up

## Tips

- Start with at least 5-10 files for best results
- More diverse content = better clustering
- Files with similar topics will group together
- Re-organization happens automatically on file changes

## Troubleshooting

**No clusters appearing?**
- Ensure you have at least 2 valid files (.txt, .pdf, .md)
- Check that files contain readable text content

**Files not moving?**
- Verify folder permissions
- Check console for error messages
- Ensure files aren't locked by other applications

**Visualization not updating?**
- Try resizing the window
- Click "Select Root Folder" again to refresh

## Next Steps

- Add your own documents to see how they cluster
- Experiment with different types of content
- Watch how the system adapts to new files
- Review the SECURITY.md for safety information
