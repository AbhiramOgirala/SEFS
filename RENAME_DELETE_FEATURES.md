# Rename and Delete File Features

## Overview
Users can now rename and delete files directly from the application using a context menu (right-click menu).

## Features

### 1. Context Menu
- **Trigger**: Right-click on any file in the sidebar
- **Options**:
  - 📂 Open - Opens the file with default application
  - ✏️ Rename - Opens rename dialog
  - 🗑️ Delete - Deletes the file (with confirmation)

### 2. Rename File
**How it works**:
1. Right-click on a file
2. Select "Rename" from context menu
3. Modal dialog appears with current filename
4. Edit the filename
5. Press Enter or click "Rename" to confirm
6. Press Escape or click "Cancel" to abort

**Features**:
- Pre-selects filename (without extension) for easy editing
- Validates filename (cannot be empty)
- Checks for duplicate filenames
- Shows error messages if rename fails
- Updates UI automatically after successful rename
- Updates all internal references and cluster assignments

**Error Handling**:
- Empty filename: "Filename cannot be empty"
- Duplicate name: "A file with this name already exists"
- System errors: Shows specific error message

### 3. Delete File
**How it works**:
1. Right-click on a file
2. Select "Delete" from context menu
3. Confirmation dialog appears
4. Click "Delete" to confirm or "Cancel" to abort
5. File is permanently deleted
6. UI updates automatically

**Safety Features**:
- Confirmation dialog before deletion
- Shows filename in confirmation
- Warning that action cannot be undone
- Removes file from clusters
- Cleans up empty clusters automatically

## User Interface

### Context Menu
- Appears at mouse cursor position
- Dark theme matching application
- Hover effects for better UX
- Delete option highlighted in red
- Closes when clicking elsewhere

### Rename Dialog
- Modal overlay (darkens background)
- Centered on screen
- Input field with current filename
- Cancel and Rename buttons
- Error messages displayed inline
- Keyboard shortcuts (Enter/Escape)

### Confirmation Dialog
- Native Electron dialog
- Warning icon
- Shows filename
- "Delete" and "Cancel" buttons
- Cannot be undone warning

## Technical Implementation

### Backend (semantic-engine.js)

#### renameFile(oldPath, newName)
```javascript
// Validates new name
// Checks for duplicates
// Renames actual file on disk
// Updates internal data structures
// Updates cluster references
// Returns success/error result
```

#### deleteFile(filePath)
```javascript
// Checks if file exists
// Deletes actual file from disk
// Removes from internal data structures
// Removes from clusters
// Cleans up empty clusters
// Returns success/error result
```

### IPC Handlers (main.js)

#### rename-file
- Calls semanticEngine.renameFile()
- Updates UI structure on success
- Returns result to renderer

#### delete-file
- Shows confirmation dialog first
- Calls semanticEngine.deleteFile() if confirmed
- Updates UI structure on success
- Returns result to renderer

### Frontend (renderer.js)

#### showContextMenu(event, filePath, fileName)
- Creates context menu at cursor position
- Handles menu item clicks
- Closes menu when clicking elsewhere

#### showRenameDialog(filePath, currentName)
- Creates modal overlay
- Pre-selects filename for editing
- Validates input
- Calls rename API
- Shows errors inline
- Closes on success

#### deleteFileAction(filePath)
- Calls delete API
- Shows error if deletion fails
- UI updates automatically via structure-updated event

## Keyboard Shortcuts

### Rename Dialog
- **Enter**: Confirm rename
- **Escape**: Cancel rename

### Context Menu
- **Right-click**: Open context menu
- **Click elsewhere**: Close menu

## Data Flow

### Rename Flow
```
User right-clicks file
  → Context menu appears
  → User clicks "Rename"
  → Rename dialog opens
  → User enters new name
  → Frontend validates input
  → IPC call to main process
  → Backend renames file on disk
  → Backend updates internal data
  → Backend updates cluster references
  → Success response sent back
  → UI structure updated
  → Dialog closes
```

### Delete Flow
```
User right-clicks file
  → Context menu appears
  → User clicks "Delete"
  → Confirmation dialog appears
  → User confirms deletion
  → IPC call to main process
  → Backend deletes file from disk
  → Backend removes from data structures
  → Backend removes from clusters
  → Backend cleans up empty clusters
  → Success response sent back
  → UI structure updated
```

## Error Handling

### Rename Errors
- **Empty filename**: Caught in frontend, shows error
- **Duplicate filename**: Caught in backend, returns error
- **File not found**: Caught in backend, returns error
- **Permission denied**: Caught in backend, returns error
- **Invalid characters**: Handled by OS, returns error

### Delete Errors
- **File not found**: Caught in backend, returns error
- **Permission denied**: Caught in backend, returns error
- **File in use**: Caught in backend, returns error
- **User cancellation**: Handled gracefully, no error shown

## Automatic Updates

### After Rename
- File path updated in all data structures
- Cluster references updated
- UI re-rendered with new filename
- File remains in same cluster

### After Delete
- File removed from all data structures
- File removed from cluster
- Empty clusters automatically deleted
- UI re-rendered without the file

## Safety Considerations

### Rename Safety
- Validates filename before attempting rename
- Checks for duplicates to prevent overwrites
- Atomic operation (either succeeds or fails completely)
- No data loss on failure

### Delete Safety
- Requires explicit confirmation
- Shows clear warning about permanence
- Cannot be undone (OS-level deletion)
- Removes all references to prevent orphaned data

## Future Enhancements

Possible improvements:
1. **Undo/Redo**: Add undo functionality for deletions
2. **Batch operations**: Rename/delete multiple files at once
3. **Move to trash**: Move to recycle bin instead of permanent delete
4. **Keyboard shortcuts**: Add hotkeys for rename (F2) and delete (Del)
5. **Drag and drop**: Drag files to rename or move
6. **File properties**: Show file size, date, type in context menu
7. **Copy/Cut/Paste**: Add clipboard operations
8. **Duplicate file**: Create a copy of the file

## Examples

### Example 1: Rename File
```
1. Right-click "Document.pdf"
2. Click "Rename"
3. Change to "Report_2024.pdf"
4. Press Enter
5. File renamed successfully
6. UI updates to show new name
```

### Example 2: Delete File
```
1. Right-click "temp_file.txt"
2. Click "Delete"
3. Confirmation dialog appears
4. Click "Delete" to confirm
5. File deleted permanently
6. UI updates, file removed from cluster
```

### Example 3: Rename Error
```
1. Right-click "file1.txt"
2. Click "Rename"
3. Change to "file2.txt" (already exists)
4. Press Enter
5. Error: "A file with this name already exists"
6. User can try different name or cancel
```

## Accessibility

Current features:
- Keyboard navigation in dialogs
- Clear visual feedback
- Error messages displayed prominently
- High contrast for important actions (delete in red)

Future improvements:
- Screen reader support
- ARIA labels for all interactive elements
- Focus management
- Keyboard-only operation
