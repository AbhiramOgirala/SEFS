# Installation & Deployment Guide

## System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.13+, or Ubuntu 18.04+
- **RAM**: 4GB
- **Disk Space**: 100MB + space for your files
- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher

### Recommended Requirements
- **RAM**: 8GB or more
- **Disk Space**: 500MB+ for better performance
- **Node.js**: 18.0.0 or higher (LTS)
- **SSD**: For faster file operations

## Pre-Installation

### 1. Install Node.js

#### Windows
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (choose LTS version)
3. Verify installation:
```cmd
node --version
npm --version
```

#### macOS
Using Homebrew:
```bash
brew install node
```

Or download from [nodejs.org](https://nodejs.org/)

Verify:
```bash
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:
```bash
node --version
npm --version
```

### 2. Install Git (Optional)
Only needed if cloning from repository.

#### Windows
Download from [git-scm.com](https://git-scm.com/)

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt-get install git
```

## Installation Methods

### Method 1: From Source (Recommended for Development)

1. **Clone or Download Repository**
```bash
git clone https://github.com/yourusername/semantic-entropy-file-system.git
cd semantic-entropy-file-system
```

Or download and extract ZIP file.

2. **Install Dependencies**
```bash
npm install
```

This will install:
- electron (desktop framework)
- chokidar (file monitoring)
- natural (NLP library)
- ml-kmeans (clustering)
- pdf-parse (PDF processing)

3. **Verify Installation**
```bash
npm start
```

Application window should open.

### Method 2: From Pre-built Binary (Coming Soon)

1. Download appropriate installer:
   - Windows: `SEFS-Setup-1.0.0.exe`
   - macOS: `SEFS-1.0.0.dmg`
   - Linux: `SEFS-1.0.0.AppImage`

2. Run installer and follow prompts

3. Launch application from Start Menu/Applications

## Post-Installation

### 1. Create Test Files
```bash
npm run test-setup
```

This creates a `test-files` directory with sample documents.

### 2. First Run
1. Launch application: `npm start`
2. Click "Select Root Folder"
3. Choose the `test-files` directory
4. Watch semantic organization happen!

### 3. Verify Features
- [ ] Files detected and processed
- [ ] Semantic folders created
- [ ] Visualization shows clusters
- [ ] Hover shows tooltips
- [ ] Click opens files

## Configuration

### Basic Configuration

Edit `config.json` in project root:

```json
{
  "fileTypes": [".txt", ".pdf", ".md"],
  "maxFileSize": 10485760,
  "minClusterSize": 2,
  "maxClusters": 5
}
```

### Advanced Configuration

See [config.json](config.json) for all options.

Common customizations:
- Add file types: `"fileTypes": [".txt", ".pdf", ".md", ".docx"]`
- Increase size limit: `"maxFileSize": 52428800` (50MB)
- More clusters: `"maxClusters": 10`
- Custom prefix: `"semanticFolderPrefix": "_auto_"`

## Building Executables

### Prerequisites
```bash
npm install electron-builder --save-dev
```

### Build for Current Platform
```bash
npm run build
```

Output in `dist/` directory.

### Build for Specific Platform

#### Windows
```bash
npm run build:win
```

Creates:
- `SEFS-Setup-1.0.0.exe` (installer)
- `SEFS-1.0.0.exe` (portable)

#### macOS
```bash
npm run build:mac
```

Creates:
- `SEFS-1.0.0.dmg` (installer)
- `SEFS-1.0.0.app` (application)

#### Linux
```bash
npm run build:linux
```

Creates:
- `SEFS-1.0.0.AppImage` (portable)
- `SEFS-1.0.0.deb` (Debian/Ubuntu)

### Cross-Platform Building

Build all platforms (requires appropriate OS):
```bash
npm run build -- --win --mac --linux
```

## Deployment

### For End Users

1. **Package Application**
```bash
npm run build
```

2. **Distribute Installer**
- Upload to GitHub Releases
- Host on website
- Share via file sharing

3. **Installation Instructions**
- Windows: Run .exe installer
- macOS: Open .dmg and drag to Applications
- Linux: Make .AppImage executable and run

### For Development Team

1. **Clone Repository**
```bash
git clone <repository-url>
cd semantic-entropy-file-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Mode**
```bash
npm run dev
```

4. **Make Changes**
- Edit source files in `src/`
- Test changes immediately
- Application auto-reloads

5. **Commit Changes**
```bash
git add .
git commit -m "Description of changes"
git push
```

## Platform-Specific Notes

### Windows

#### Antivirus Issues
Some antivirus software may flag Electron apps. Add exception:
1. Open Windows Security
2. Virus & threat protection
3. Manage settings
4. Add exclusion
5. Add SEFS installation folder

#### Path Length Limits
Windows has 260 character path limit. Use shorter paths or enable long paths:
```cmd
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1
```

### macOS

#### Gatekeeper
First time opening:
1. Right-click application
2. Select "Open"
3. Click "Open" in dialog

Or disable Gatekeeper (not recommended):
```bash
sudo spctl --master-disable
```

#### Full Disk Access
Grant permission for file monitoring:
1. System Preferences > Security & Privacy
2. Privacy tab > Full Disk Access
3. Add SEFS application

### Linux

#### AppImage Permissions
Make executable:
```bash
chmod +x SEFS-1.0.0.AppImage
./SEFS-1.0.0.AppImage
```

#### Missing Libraries
Install dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install libgconf-2-4 libgtk-3-0 libnss3

# Fedora
sudo dnf install gtk3 nss

# Arch
sudo pacman -S gtk3 nss
```

## Troubleshooting Installation

### npm install fails

**Error: EACCES permission denied**
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

**Error: Cannot find module**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error: Python not found**
Some dependencies need Python. Install:
- Windows: Download from python.org
- macOS: `brew install python`
- Linux: `sudo apt-get install python3`

### Application won't start

**Check Node.js version**
```bash
node --version  # Should be 16.0.0+
```

**Update Node.js if needed**
- Windows/macOS: Download from nodejs.org
- Linux: Use nvm or package manager

**Check for port conflicts**
Electron uses random ports, but check:
```bash
# Windows
netstat -ano | findstr :LISTEN

# macOS/Linux
lsof -i -P | grep LISTEN
```

### Build fails

**Error: electron-builder not found**
```bash
npm install electron-builder --save-dev
```

**Error: Cannot create executable**
- Check disk space
- Verify write permissions
- Try building for single platform first

## Updating

### Update Application

1. **Pull latest changes**
```bash
git pull origin main
```

2. **Update dependencies**
```bash
npm install
```

3. **Restart application**
```bash
npm start
```

### Update Dependencies

**Check for updates**
```bash
npm outdated
```

**Update all dependencies**
```bash
npm update
```

**Update specific package**
```bash
npm install electron@latest
```

## Uninstallation

### Development Installation

1. **Stop application**
2. **Delete project folder**
```bash
rm -rf semantic-entropy-file-system
```

### Binary Installation

#### Windows
1. Control Panel > Programs > Uninstall
2. Find "Semantic Entropy File System"
3. Click Uninstall

#### macOS
1. Open Applications folder
2. Drag SEFS to Trash
3. Empty Trash

#### Linux
```bash
# AppImage - just delete file
rm SEFS-1.0.0.AppImage

# .deb package
sudo apt-get remove semantic-entropy-file-system
```

## Next Steps

After successful installation:

1. **Read Quick Start**: [QUICKSTART.md](QUICKSTART.md)
2. **Explore Features**: [FEATURES.md](FEATURES.md)
3. **Configure Settings**: [config.json](config.json)
4. **Review Security**: [SECURITY.md](SECURITY.md)

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review console logs: `npm run dev`
3. Verify system requirements
4. Search existing issues on GitHub
5. Create new issue with details

## Additional Resources

- **Documentation Index**: [INDEX.md](INDEX.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Feature List**: [FEATURES.md](FEATURES.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)
