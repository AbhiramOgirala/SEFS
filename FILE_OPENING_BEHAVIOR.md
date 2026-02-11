# File Opening Behavior Explained

## What Happens When You Click a File?

When you click on a file in SEFS, the system uses `shell.openPath()` which:

1. **Opens the file in its default application** (not downloads it)
2. **Uses your operating system's file associations**
3. **Works exactly like double-clicking a file in your file explorer**

## Expected Behavior by File Type

### Text Files (.txt, .md, .log)
- Opens in: Notepad (Windows), TextEdit (Mac), gedit (Linux)
- Or: Your default text editor

### PDF Files (.pdf)
- Opens in: Adobe Reader, Preview (Mac), or your default PDF viewer

### Code Files (.js, .py, .java)
- Opens in: VS Code, Sublime Text, or your default code editor
- Depends on your system's file associations

### Data Files (.json, .csv, .xml)
- Opens in: Text editor or specialized viewer
- Depends on your system's file associations

### HTML Files (.html)
- Opens in: Your default web browser

## Why It Might Look Like "Downloading"

If you're seeing files "download" instead of open, it could be:

### 1. Running in Development Mode
When running `npm run dev`, the Electron DevTools might show network activity that looks like downloading, but it's actually just opening the file.

### 2. Browser Context Confusion
The Electron app has a browser-like interface, but clicking files should open them externally, not download them within the app.

### 3. No Default Application Set
If your system doesn't have a default application for a file type:
- Windows: Shows "How do you want to open this file?" dialog
- Mac: Shows "There is no application set to open the document"
- Linux: May show similar dialog

## What Should Happen (Step by Step)

1. **You click a file** in SEFS visualization or sidebar
2. **SEFS sends command** to operating system
3. **OS finds default application** for that file type
4. **Application launches** and opens the file
5. **File opens in separate window** (not in SEFS)

## Troubleshooting

### Files Not Opening?

**Check Console Logs:**
```bash
npm run dev
```

Click a file and look for:
```
Opening file: /path/to/file.txt
File opened successfully
```

Or error messages like:
```
Error opening file: [error details]
```

### Set Default Applications

**Windows:**
1. Right-click file in File Explorer
2. "Open with" → "Choose another app"
3. Select application and check "Always use this app"

**Mac:**
1. Right-click file in Finder
2. "Get Info"
3. "Open with" → Select application
4. Click "Change All..."

**Linux:**
1. Right-click file
2. "Properties" → "Open With"
3. Select default application

## Testing File Opening

### Test 1: Text File
1. Create `test.txt` with some content
2. Add to monitored folder
3. Click in SEFS
4. Should open in text editor

### Test 2: Check Console
```bash
npm run dev
```
Click a file and verify console shows:
- "Opening file: [path]"
- "File opened successfully"

### Test 3: Manual Test
1. Note the file path from SEFS
2. Open File Explorer/Finder
3. Navigate to that path
4. Double-click the file
5. Should open the same way as clicking in SEFS

## Common Issues

### Issue: "File not found"
**Cause:** File was moved or deleted
**Solution:** Refresh SEFS or reselect folder

### Issue: "Cannot open file"
**Cause:** No default application set
**Solution:** Set default application for file type

### Issue: "Permission denied"
**Cause:** File is locked or no read permission
**Solution:** Check file permissions

### Issue: Nothing happens
**Cause:** Silent failure
**Solution:** 
1. Run `npm run dev`
2. Check console for errors
3. Verify file exists at path shown

## Expected vs Unexpected Behavior

### ✅ Expected (Correct)
- File opens in external application
- New window appears with file content
- SEFS stays open in background

### ❌ Unexpected (Issue)
- File downloads to Downloads folder
- File opens inside SEFS window
- Multiple copies of file created
- File doesn't open at all

## If Files Are Actually Downloading

If files are genuinely downloading to your Downloads folder instead of opening:

### Possible Causes:
1. **Browser context issue** - Electron might be treating files as downloads
2. **File association problem** - OS doesn't know how to open the file
3. **Security restriction** - OS blocking file opening

### Solutions:

#### Solution 1: Check Electron Version
Ensure you're using Electron 28.0.0+:
```bash
npm list electron
```

#### Solution 2: Verify File Paths
Files should be absolute paths like:
- Windows: `C:\Users\...\file.txt`
- Mac/Linux: `/home/.../file.txt`

Not relative paths or URLs.

#### Solution 3: Test with Simple File
Create a simple text file:
```bash
echo "Test content" > test.txt
```

Add to SEFS and try opening. If this works, issue is with specific file types.

#### Solution 4: Check Shell Integration
The `shell.openPath()` API should work. If not, there might be an Electron issue.

## Alternative: Show in Folder

If opening files is problematic, you can modify the code to "Show in Folder" instead:

```javascript
// In main.js
ipcMain.handle('show-in-folder', async (event, filePath) => {
  const { shell } = require('electron');
  shell.showItemInFolder(filePath);
});
```

This opens File Explorer/Finder with the file selected, then you can double-click it manually.

## Debug Mode

To see exactly what's happening:

```bash
npm run dev
```

Then check console for:
1. File path being passed
2. Success/error messages
3. Any exceptions

## Summary

**Normal Behavior:** Clicking a file in SEFS should open it in its default application (like double-clicking in File Explorer).

**Not Normal:** Files downloading to Downloads folder or not opening at all.

If you're experiencing the "not normal" behavior, please:
1. Run `npm run dev`
2. Click a file
3. Copy console output
4. Report the issue with details

The system is designed to open files, not download them!
