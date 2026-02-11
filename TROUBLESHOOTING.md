# Troubleshooting Guide

## Installation Issues

### Problem: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Electron fails to install
**Solution:**
- Check Node.js version (requires 16+)
- Try with administrator/sudo privileges
- Set npm registry: `npm config set registry https://registry.npmjs.org/`

## Application Issues

### Problem: Application won't start
**Symptoms:** Window doesn't open or crashes immediately

**Solutions:**
1. Check console for errors: `npm start`
2. Verify all dependencies installed: `npm install`
3. Check Node.js version: `node --version` (should be 16+)
4. Try dev mode: `npm run dev`

### Problem: "Select Root Folder" button does nothing
**Symptoms:** Click button but no dialog appears

**Solutions:**
1. Check if dialog is hidden behind window
2. Restart application
3. Check console for permission errors
4. Try different folder location

### Problem: No files detected
**Symptoms:** Selected folder but no files appear

**Solutions:**
1. Verify folder contains .txt, .pdf, or .md files
2. Check files aren't in excluded folders (node_modules, .git, etc.)
3. Ensure files aren't empty (minimum 10 characters)
4. Check file permissions (must be readable)
5. Look for errors in console

### Problem: Files not clustering
**Symptoms:** All files in one cluster or no clusters

**Solutions:**
1. Need at least 2 valid files for clustering
2. Files must have sufficient content (>10 chars)
3. Very similar files will cluster together (expected)
4. Try adding more diverse content
5. Check that files contain actual text (not just images in PDFs)

### Problem: Files not moving to semantic folders
**Symptoms:** Clusters appear but files stay in original location

**Solutions:**
1. Check folder write permissions
2. Ensure files aren't locked by other applications
3. Close any programs using the files
4. Check disk space
5. Look for error messages in console

### Problem: Visualization not showing
**Symptoms:** Blank canvas or no nodes visible

**Solutions:**
1. Resize window to trigger redraw
2. Check browser console (F12) for JavaScript errors
3. Ensure files were processed (check sidebar)
4. Refresh by reselecting folder
5. Try with smaller number of files first

### Problem: Tooltips not appearing
**Symptoms:** Hover over nodes but no preview shows

**Solutions:**
1. Ensure mouse is directly over node circle
2. Check if tooltip is appearing off-screen
3. Try different node
4. Refresh visualization

## Performance Issues

### Problem: Application slow or unresponsive
**Symptoms:** Lag when adding files or updating visualization

**Solutions:**
1. Reduce number of files (start with <50)
2. Check file sizes (large PDFs take longer)
3. Close other applications
4. Increase debounce delay in config.json
5. Monitor system resources

### Problem: High CPU usage
**Symptoms:** Fan running, system slow

**Solutions:**
1. Wait for initial processing to complete
2. Avoid adding many files at once
3. Check for infinite processing loop (restart app)
4. Reduce maxClusters in config.json

### Problem: High memory usage
**Symptoms:** Application using excessive RAM

**Solutions:**
1. Reduce number of files being processed
2. Lower maxFileSize in config.json
3. Restart application periodically
4. Check for memory leaks (report as bug)

## File System Issues

### Problem: Semantic folders not created
**Symptoms:** No _semantic_* folders appear

**Solutions:**
1. Check folder write permissions
2. Verify not running in read-only location
3. Check disk space
4. Look for permission errors in console

### Problem: Files disappearing
**Symptoms:** Files moved but can't find them

**Solutions:**
1. Check _semantic_* folders in root directory
2. Files are moved, not deleted
3. Use system search to locate files
4. Check file monitor logs in console

### Problem: Duplicate files
**Symptoms:** Same file appears multiple times

**Solutions:**
1. This shouldn't happen - report as bug
2. Check if files have different paths
3. Manually remove duplicates
4. Restart application

### Problem: Empty semantic folders remain
**Symptoms:** _semantic_* folders with no files

**Solutions:**
1. Should auto-cleanup - wait a moment
2. Manually delete empty folders
3. Restart application to trigger cleanup
4. Check cleanup function in console

## Security Issues

### Problem: Can't access files outside root folder
**Symptoms:** Error when trying to process certain files

**Solution:**
- This is intentional security feature
- Only files within selected root folder are processed
- Move files into root folder if needed

### Problem: Large files not processing
**Symptoms:** Some files ignored

**Solution:**
- Default limit is 10MB
- Increase maxFileSize in config.json if needed
- Consider splitting large files

## Configuration Issues

### Problem: Config changes not taking effect
**Symptoms:** Modified config.json but no change

**Solutions:**
1. Restart application after config changes
2. Verify JSON syntax is valid
3. Check for typos in property names
4. Restore default config if broken

### Problem: Invalid configuration
**Symptoms:** Application crashes on start

**Solutions:**
1. Validate JSON syntax: https://jsonlint.com
2. Compare with default config
3. Delete config.json to use defaults
4. Check console for specific error

## Platform-Specific Issues

### Windows
- **Problem:** Path errors
  - Use forward slashes or double backslashes
  - Avoid special characters in paths

- **Problem:** Permission denied
  - Run as administrator
  - Check antivirus isn't blocking

### macOS
- **Problem:** App won't open
  - Right-click > Open (first time)
  - Check Security & Privacy settings

- **Problem:** File access denied
  - Grant Full Disk Access in System Preferences

### Linux
- **Problem:** Missing dependencies
  - Install: `sudo apt-get install libgconf-2-4`
  - Check distribution-specific requirements

## Debug Mode

Enable detailed logging:

```bash
npm run dev
```

Then check console for:
- File processing logs
- Clustering information
- Error messages
- Performance metrics

## Getting Help

If issues persist:

1. Check console for error messages
2. Review SECURITY.md for limitations
3. Verify system requirements
4. Try with minimal test case (2-3 files)
5. Report bug with:
   - Error messages
   - Steps to reproduce
   - System information
   - Sample files (if possible)

## Common Error Messages

### "Error processing [file]"
- File may be corrupted
- Unsupported format
- Permission issue
- Try opening file manually

### "Error initializing system"
- Invalid root path
- Permission denied
- Disk space issue
- Check folder exists

### "Clustering failed"
- Not enough valid files
- All files too similar
- Memory issue
- Try with fewer files

### "Cannot move file"
- File in use by another program
- Permission denied
- Destination exists
- Close file and retry

## Prevention Tips

1. Start with small test folder
2. Use supported file types only
3. Ensure adequate disk space
4. Keep files under 10MB
5. Close files before processing
6. Regular application restarts
7. Monitor console for warnings
8. Backup important files first

## Reset Application

Complete reset:

```bash
# Stop application
# Delete semantic folders
rm -rf /path/to/root/_semantic_*

# Clear node_modules
rm -rf node_modules

# Reinstall
npm install

# Restart
npm start
```
