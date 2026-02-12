# New File Detection Feature

## Overview
The system now asks for user confirmation before processing new files that are added to the monitored directory.

## How It Works

### 1. File Detection
When new files are added to the monitored folder:
- The system detects them immediately using the file watcher
- Multiple files added within 2 seconds are batched together
- A popup dialog appears asking for confirmation

### 2. User Prompt
The dialog shows:
- **Single file**: "New file detected: [filename]"
- **Multiple files**: "X new files detected: [list of files]"
- **Question**: "Do you want to read and cluster these files?"
- **Buttons**: "Yes" or "No"

### 3. User Response

#### If User Clicks "Yes":
- Files are processed and analyzed
- Content is extracted (including PDFs)
- Files are clustered with existing files
- UI updates to show new cluster structure

#### If User Clicks "No":
- Files are ignored
- No processing occurs
- Files remain in their original location
- User can manually trigger clustering later if needed

## Features

### Batch Processing
- Multiple files added at once are grouped into a single prompt
- Reduces notification spam when copying multiple files
- Shows up to 5 filenames in the dialog (with "... and X more" for larger batches)

### Smart Timing
- 2-second delay to collect all files being added
- Prevents multiple popups when dragging/dropping multiple files
- Ensures all files in a batch operation are captured

### Non-Intrusive
- Dialog appears on top but doesn't block other operations
- User can decline and continue working
- No automatic processing without consent

## Example Scenarios

### Scenario 1: Single File
```
User copies "New_Document.pdf" to the folder
→ Dialog appears: "New file detected: New_Document.pdf"
→ User clicks "Yes"
→ File is analyzed and clustered
```

### Scenario 2: Multiple Files
```
User drags 10 files into the folder
→ System waits 2 seconds
→ Dialog appears: "10 new files detected: file1.pdf, file2.txt, ..."
→ User clicks "Yes"
→ All 10 files are processed together
```

### Scenario 3: User Declines
```
User copies "temp_file.txt" to the folder
→ Dialog appears
→ User clicks "No"
→ File is not processed
→ File remains in original location
```

## Technical Implementation

### FileMonitor Changes
- Added `pendingNewFiles` array to batch new files
- Added `newFileTimer` for 2-second debounce
- New method: `processNewFiles(filePaths)` - processes confirmed files
- New method: `cancelNewFiles()` - clears pending files when user declines
- Emits `new-files-detected` event with array of file paths

### Main.js Changes
- Listens for `new-files-detected` event
- Shows Electron dialog with file list
- Calls `processNewFiles()` if user confirms
- Calls `cancelNewFiles()` if user declines

## Benefits

1. **User Control**: Users decide when to process files
2. **Prevents Accidents**: Temporary files won't be automatically clustered
3. **Batch Efficiency**: Multiple files processed together
4. **Clear Communication**: Users know exactly what's happening
5. **Non-Disruptive**: Can decline and continue working

## Future Enhancements

Possible improvements:
- "Always ask" / "Always process" preference setting
- File type filtering (e.g., only ask for certain file types)
- Preview file content before processing
- Undo option after processing
- Schedule processing for later
