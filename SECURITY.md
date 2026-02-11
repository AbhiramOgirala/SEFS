# Security Policy

## Security Features

### 1. Local Processing Only
- All semantic analysis happens locally on your machine
- No external API calls or data transmission
- No telemetry or analytics

### 2. Sandboxed Operations
- File operations are restricted to the selected root folder
- Cannot access files outside the monitored directory
- Semantic folders are clearly marked with `_semantic_` prefix

### 3. Electron Security
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script
- No remote content loading

### 4. File Safety
- Read-only content extraction
- No execution of file content
- No modification of original file content
- Safe file moving operations with error handling

### 5. Input Validation
- File type validation (only .txt, .pdf, .md)
- Path sanitization to prevent directory traversal
- Size limits on content extraction

### 6. Privacy
- No logging of file content
- No persistent storage of sensitive data
- File previews limited to 500 characters

## Best Practices

1. **Choose Root Folder Carefully**: Only select folders you want to organize
2. **Backup Important Files**: Always maintain backups before using any file organization tool
3. **Review Semantic Folders**: Check the `_semantic_*` folders to ensure correct organization
4. **Monitor Permissions**: Ensure the application has appropriate file system permissions

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainer directly rather than using the issue tracker.

## Known Limitations

- The system moves files physically on disk - ensure you have backups
- Semantic folders are created in the root directory
- File monitoring may impact system performance with very large directories (1000+ files)

## Updates

Keep the application updated to receive security patches and improvements.
