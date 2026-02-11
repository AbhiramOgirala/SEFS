# Quick Reference Card

## 🎯 Key Concept

**SEFS clusters by CONTENT SIMILARITY, not file type!**

A Python ML script + Text about AI = Same cluster ✓
JavaScript code + Java code (both about APIs) = Same cluster ✓
Files are grouped by WHAT THEY'RE ABOUT, not their format!

## 🚀 Essential Commands

```bash
# Installation
npm install

# Run Application
npm start

# Reset Files (if only 1 file showing)
npm run reset

# Create Text Examples
npm run test-setup

# Create Mixed File Type Examples (Python, JS, Java, HTML, etc.)
npm run mixed-examples

# Build Executable
npm run build

# Development Mode (with logging)
npm run dev
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | Electron main process |
| `src/semantic-engine.js` | Core clustering logic |
| `src/file-monitor.js` | File system watcher |
| `src/ui/renderer.js` | Visualization |
| `config.json` | Settings |

## 🎯 Quick Start (3 Steps)

1. **Install:** `npm install`
2. **Run:** `npm start`
3. **Select:** Click "Select Root Folder" → Choose `example-files`

## 📚 Documentation Quick Links

| Need | Read |
|------|------|
| Setup | [QUICKSTART.md](QUICKSTART.md) |
| Install | [INSTALLATION.md](INSTALLATION.md) |
| Features | [FEATURES.md](FEATURES.md) |
| Problems | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Security | [SECURITY.md](SECURITY.md) |
| API | [API_REFERENCE.md](API_REFERENCE.md) |
| Overview | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |

## ⚙️ Configuration Quick Edit

Edit `config.json`:

```json
{
  "fileTypes": [".txt", ".pdf", ".md"],
  "maxFileSize": 10485760,
  "maxClusters": 5
}
```

## 🔧 Common Tasks

### Add New File Type
1. Edit `config.json` → Add to `fileTypes`
2. Add extraction logic in `semantic-engine.js`

### Change Cluster Count
Edit `config.json` → Change `maxClusters`

### Increase File Size Limit
Edit `config.json` → Change `maxFileSize` (in bytes)

### Change Folder Prefix
Edit `config.json` → Change `semanticFolderPrefix`

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Won't start | Check Node.js version: `node --version` |
| No files detected | Verify file types (.txt, .pdf, .md) |
| Files not moving | Check folder permissions |
| Slow performance | Reduce file count or increase debounce |

## 🔒 Security Checklist

- ✅ Only processes files in selected folder
- ✅ No external API calls
- ✅ No code execution
- ✅ Sandboxed operations
- ✅ Path validation

## 📊 Performance Tips

- Start with <50 files
- Keep files under 10MB
- Use SSD for better performance
- Close files before processing
- Increase `debounceDelay` for large directories

## 🎨 UI Quick Guide

### Visualization Panel
- **Circles** = Clusters
- **Dots** = Files
- **Hover** = Preview
- **Click** = Open file

### Sidebar
- **Cluster names** = Topics
- **File lists** = Contents
- **Click** = Open file

## 🔑 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open DevTools | F12 or Ctrl+Shift+I |
| Reload | Ctrl+R (Cmd+R on Mac) |
| Quit | Ctrl+Q (Cmd+Q on Mac) |

## 📦 Build Commands

```bash
# All platforms
npm run build

# Windows only
npm run build:win

# macOS only
npm run build:mac

# Linux only
npm run build:linux
```

## 🌐 Supported Platforms

- ✅ Windows 10+
- ✅ macOS 10.13+
- ✅ Ubuntu 18.04+

## 📈 System Requirements

**Minimum:**
- 4GB RAM
- 100MB disk space
- Node.js 16+

**Recommended:**
- 8GB RAM
- SSD storage
- Node.js 18+ (LTS)

## 🎯 Feature Checklist

- ✅ Auto file detection
- ✅ Semantic clustering
- ✅ OS synchronization
- ✅ 2D visualization
- ✅ Live updates
- ✅ Security sandbox

## 💡 Pro Tips

1. **Start small** - Test with 5-10 files first
2. **Diverse content** - Better clustering with varied topics
3. **Check console** - Run `npm run dev` for debugging
4. **Backup files** - Always maintain backups
5. **Read docs** - Check [INDEX.md](INDEX.md) for all guides

## 🆘 Getting Help

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review console logs (`npm run dev`)
3. Search [INDEX.md](INDEX.md)
4. Open GitHub issue

## 📞 Quick Support

| Issue Type | Resource |
|------------|----------|
| Installation | [INSTALLATION.md](INSTALLATION.md) |
| Usage | [QUICKSTART.md](QUICKSTART.md) |
| Errors | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Security | [SECURITY.md](SECURITY.md) |
| API | [API_REFERENCE.md](API_REFERENCE.md) |

## 🎓 Learning Path

**Beginner:**
1. [README.md](README.md)
2. [QUICKSTART.md](QUICKSTART.md)
3. Run `npm run test-setup`

**Intermediate:**
1. [FEATURES.md](FEATURES.md)
2. Edit `config.json`
3. [SECURITY.md](SECURITY.md)

**Advanced:**
1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. [API_REFERENCE.md](API_REFERENCE.md)

## 🔄 Update Process

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Restart application
npm start
```

## 📝 Quick Notes

- Semantic folders start with `_semantic_`
- Files are physically moved on disk
- System monitors changes in real-time
- Clustering happens automatically
- All processing is local (no internet needed)

## ⚡ One-Liner Commands

```bash
# Complete setup
npm install && npm run test-setup && npm start

# Clean reinstall
rm -rf node_modules package-lock.json && npm install

# Build all platforms
npm run build -- --win --mac --linux
```

## 🎉 Success Indicators

✅ Application window opens
✅ Can select folder
✅ Files appear in visualization
✅ Semantic folders created
✅ Hover shows tooltips
✅ Click opens files

---

**Need more details?** Check [INDEX.md](INDEX.md) for complete documentation index.

**Ready to start?** Run `npm install && npm start`
