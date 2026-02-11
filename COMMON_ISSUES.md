# Common Issues & Solutions

## Issue: Only 1 File Detected / Single "Documents" Cluster

### Symptoms
- Application shows only 1 file
- Single cluster named "Documents"
- Expected multiple files but only seeing one

### Causes & Solutions

#### 1. Files Already in Semantic Folders
**Cause:** Files were moved to `_semantic_*` folders in a previous run.

**Solution:**
```bash
npm run reset
```

This moves all files back from semantic folders to the root directory.

**Manual Solution:**
1. Look for folders starting with `_semantic_` in your root directory
2. Move all files from these folders back to root
3. Delete the empty `_semantic_` folders
4. Restart the application

---

#### 2. Wrong Folder Selected
**Cause:** Selected a folder that doesn't contain the expected files.

**Solution:**
1. Check the path shown in the application header
2. Click "Select Root Folder" again
3. Navigate to the correct folder (e.g., `example-files`)

---

#### 3. Files Have Insufficient Content
**Cause:** Files are empty or have less than 10 characters.

**Solution:**
1. Open the files and verify they contain text
2. Ensure files have at least a few sentences
3. Check console logs for "insufficient content" warnings

**Check Console:**
```bash
npm run dev
```
Look for messages like:
- "File has insufficient content, skipping"
- "File is empty, skipping"

---

#### 4. Files Are Not Supported Format
**Cause:** Files are not .txt, .pdf, or .md format.

**Solution:**
1. Verify file extensions
2. Convert files to supported formats
3. Or add new formats to `config.json`:

```json
{
  "fileTypes": [".txt", ".pdf", ".md", ".docx"]
}
```

---

#### 5. PDF Files Have No Text
**Cause:** PDFs contain only images, no extractable text.

**Solution:**
1. Use PDFs with actual text content
2. Or use OCR to convert image PDFs to text
3. Test with .txt files first

---

## Quick Diagnostic Steps

### Step 1: Check Console Logs
```bash
npm run dev
```

Look for these messages:
- "Found X total files"
- "Found X valid files"
- "Processed X files successfully"
- "Clustering X files"

### Step 2: Verify File Count
Expected output for `example-files`:
```
Found 6 total files
Found 6 valid files
Processed 6 files successfully
Clustering 6 files
Creating 2 clusters
```

### Step 3: Check for Semantic Folders
```bash
# Windows
dir /b | findstr "_semantic_"

# Mac/Linux
ls -d _semantic_*
```

If you see semantic folders, run `npm run reset`.

### Step 4: Verify File Content
Open a few files and ensure they have actual text content (not just whitespace).

---

## Testing with Fresh Files

### Option 1: Use Test Setup
```bash
npm run test-setup
```

This creates a `test-files` directory with 8 sample documents.

### Option 2: Create Manual Test Files

Create 3 simple test files:

**test1.txt:**
```
Machine learning is a subset of artificial intelligence. 
Neural networks learn patterns from data. Deep learning 
uses multiple layers for complex pattern recognition.
```

**test2.txt:**
```
Web development involves HTML, CSS, and JavaScript. 
React and Vue are popular frontend frameworks. 
Node.js enables server-side JavaScript development.
```

**test3.txt:**
```
Cloud computing provides on-demand computing resources. 
AWS, Azure, and Google Cloud are major providers. 
Serverless architecture reduces infrastructure management.
```

---

## Expected Behavior

### With 6 Example Files
- Should create 2-3 clusters
- Clusters named based on content (e.g., "Machine_Learning", "Web_Development")
- Files distributed across clusters

### With 1 File
- Creates single "Documents" cluster
- This is expected behavior (need 2+ files for clustering)

### With 2-4 Files
- Creates 2 clusters
- Files grouped by similarity

### With 5+ Files
- Creates 2-3 clusters (up to 5 maximum)
- Better semantic separation

---

## Reset Everything

If nothing works, complete reset:

```bash
# 1. Reset files
npm run reset

# 2. Clear any semantic folders manually
# Delete all folders starting with _semantic_

# 3. Restart application
npm start

# 4. Select folder again
```

---

## Still Not Working?

### Check These:

1. **Node.js Version**
   ```bash
   node --version  # Should be 16.0.0+
   ```

2. **Dependencies Installed**
   ```bash
   npm install
   ```

3. **File Permissions**
   - Ensure you have read/write access to the folder
   - Try a folder in your user directory

4. **Console Errors**
   - Run `npm run dev`
   - Look for red error messages
   - Share error messages for help

5. **File System**
   - Ensure files aren't locked by other programs
   - Close any programs using the files
   - Try with a fresh folder

---

## Debug Mode

Enable detailed logging:

```bash
npm run dev
```

You should see:
```
Found 6 total files
Found 6 valid files: [list of paths]
Successfully processed: sample1.txt
Successfully processed: sample2.txt
...
Processed 6 files successfully
Vocabulary size: 150 words
Creating 2 clusters
Created 2 clusters
```

If you see different output, that indicates where the problem is.

---

## Contact Support

If issue persists:
1. Run `npm run dev`
2. Copy console output
3. Note which folder you selected
4. List files in that folder
5. Open GitHub issue with this information
