# Quick Start Guide

## Getting Started

### 1. Start the Application
```bash
npm start
```

### 2. Select a Folder
- Click "Select Root Folder" button
- Choose a folder containing files to organize
- Files will be automatically processed and clustered

---

## Features Overview

### 🔍 Search Files
**Location**: Search bar at the top

**How to use**:
1. Click in the search bar
2. Start typing (filename or content)
3. Results appear instantly
4. Click any result to open the file
5. Click ✕ to clear search

**Tips**:
- Search works on both filenames and file content
- Matching terms are highlighted in red
- Filename matches appear first
- Shows which cluster each file belongs to

---

### ✏️ Rename Files
**Location**: Right-click menu on any file

**How to use**:
1. Right-click on a file in the sidebar
2. Select "✏️ Rename"
3. Edit the filename in the dialog
4. Press Enter or click "Rename"
5. Press Escape or click "Cancel" to abort

**Tips**:
- Filename (without extension) is pre-selected
- Cannot use empty names
- Cannot use duplicate names
- Error messages appear if something goes wrong

---

### 🗑️ Delete Files
**Location**: Right-click menu on any file

**How to use**:
1. Right-click on a file in the sidebar
2. Select "🗑️ Delete"
3. Confirm in the dialog
4. File is permanently deleted

**Warning**:
- This action cannot be undone!
- File is permanently deleted from disk
- Empty clusters are automatically removed

---

### 📂 Open Files
**Multiple ways to open**:

1. **Left-click** on file in sidebar
2. **Right-click** → Select "📂 Open"
3. **Click** on search result

Files open with your default application.

---

### 🔔 New File Detection
**Automatic**: Triggers when you add files to the folder

**What happens**:
1. You copy/move files into the monitored folder
2. Popup appears: "New files detected"
3. Shows list of new files
4. Click "Yes" to process or "No" to skip

**Tips**:
- Multiple files added at once are batched together
- 2-second window to collect all files
- You control when files are processed

---

## Context Menu (Right-Click)

Right-click on any file to see:

```
┌─────────────────┐
│ 📂 Open         │
│ ✏️ Rename       │
├─────────────────┤
│ 🗑️ Delete       │ (red)
└─────────────────┘
```

---

## Keyboard Shortcuts

### Rename Dialog
- **Enter**: Confirm rename
- **Escape**: Cancel rename

### General
- **Right-click**: Open context menu
- **Left-click**: Open file
- **Click elsewhere**: Close context menu

---

## Understanding the Interface

### Header
- **Title**: "🧠 Semantic Entropy File System"
- **Select Root Folder**: Choose folder to monitor
- **Virtual Mode**: Files are not physically moved
- **Current Path**: Shows selected folder

### Search Bar
- **Search input**: Type to search
- **Clear button** (✕): Appears when typing
- **Results dropdown**: Shows matching files

### Main Area
- **Visualization**: Circular clusters with files
- **Hover**: See file preview
- **Click**: Open file

### Sidebar
- **Cluster list**: All semantic clusters
- **File list**: Files in each cluster
- **Click**: Open file
- **Right-click**: Context menu

---

## Tips and Tricks

### Search Tips
- Search is case-insensitive
- Partial matches work (e.g., "sec" finds "security")
- Search both filename and content
- Results update as you type

### Rename Tips
- Use descriptive names
- Keep file extensions
- Avoid special characters
- Check for duplicates

### Delete Tips
- Double-check before deleting
- Deletion is permanent
- Empty clusters are auto-removed
- UI updates immediately

### Organization Tips
- Let the system cluster files automatically
- Use search to find files quickly
- Rename files for better organization
- Delete temporary files regularly

---

## Common Workflows

### Workflow 1: Find and Open File
```
1. Type filename in search bar
2. Click on result
3. File opens
```

### Workflow 2: Rename Multiple Files
```
1. Right-click first file → Rename
2. Enter new name → Press Enter
3. Right-click next file → Rename
4. Repeat as needed
```

### Workflow 3: Clean Up Folder
```
1. Search for "temp" or "old"
2. Right-click each result
3. Select Delete
4. Confirm deletion
```

### Workflow 4: Add New Files
```
1. Copy files into folder
2. Wait for popup
3. Click "Yes" to process
4. Files are clustered automatically
```

---

## Troubleshooting

### Search Not Working
- Make sure files are processed
- Check if folder is selected
- Try different search terms

### Cannot Rename File
- Check if file is in use
- Verify new name is valid
- Ensure no duplicate names

### Cannot Delete File
- Check if file is in use
- Verify file permissions
- Close any programs using the file

### Files Not Clustering
- Ensure files have content
- Check file types are supported
- Wait for processing to complete

---

## Supported File Types

### Text Files
- .txt, .md, .log, .rtf

### Code Files
- .js, .jsx, .ts, .tsx
- .py, .java, .cpp, .c, .cs
- .go, .rb, .php, .swift, .kt, .rs

### Web Files
- .html, .css, .scss, .sass, .less, .vue

### Data Files
- .json, .xml, .yaml, .yml
- .csv, .tsv

### Config Files
- .conf, .config, .ini, .env, .properties

### Script Files
- .sh, .bash, .zsh, .ps1, .bat, .cmd

### Database Files
- .sql

### Documents
- .pdf (text extraction)

### Images
- .jpg, .jpeg, .png, .gif, .bmp, .webp
- (clustered by filename)

---

## Best Practices

### File Organization
1. Use descriptive filenames
2. Keep related files together
3. Delete unnecessary files
4. Use search to navigate

### Performance
1. Don't monitor too many files at once
2. Close unused applications
3. Keep filenames reasonable length
4. Regular cleanup of temp files

### Safety
1. Always confirm before deleting
2. Keep backups of important files
3. Double-check rename operations
4. Review new files before processing

---

## Getting Help

### Check Documentation
- `SEARCH_FEATURE.md` - Search details
- `RENAME_DELETE_FEATURES.md` - Rename/delete details
- `NEW_FILE_DETECTION_FEATURE.md` - New file detection
- `ALL_FEATURES_COMPLETE.md` - Complete feature list

### Common Issues
- See `COMMON_ISSUES.md` for troubleshooting
- Check console for error messages
- Verify file permissions

---

## Enjoy!

You now have a powerful file organization system with:
- ✅ Intelligent clustering
- ✅ Fast search
- ✅ Easy file management
- ✅ User control
- ✅ Safe operations

Happy organizing! 🎉
