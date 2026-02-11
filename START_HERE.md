# 🚀 START HERE - First Time Setup

## Important: Clustering Works by CONTENT, Not File Type!

SEFS groups files by what they're ABOUT, not what format they're in. A Python ML script will cluster with a text document about machine learning. A JavaScript React component will cluster with HTML web pages. **It's all about content similarity!**

Read [HOW_CLUSTERING_WORKS.md](HOW_CLUSTERING_WORKS.md) for details.

## Seeing Only 1 File? Read This!

If you're seeing only 1 file and a single "Documents" cluster, your files are likely already in semantic folders from a previous run.

### Quick Fix (30 seconds)

```bash
# 1. Reset files
npm run reset

# 2. Restart application  
npm start

# 3. Select the example-files folder
```

That's it! You should now see multiple clusters.

---

## Complete First-Time Setup

### Step 1: Install (One Time)
```bash
npm install
```

### Step 2: Start Application
```bash
npm start
```

### Step 3: Select Folder
1. Click the red "Select Root Folder" button
2. Navigate to the `example-files` folder in this project
3. Click "Select Folder"

### Step 4: Watch the Magic
You should see:
- Multiple colored cluster circles
- Files distributed across clusters
- Cluster names like "Machine_Learning", "Web_Development", etc.

---

## Expected Results

### With example-files folder (6 files):
- ✅ 2-3 semantic clusters
- ✅ Files grouped by topic
- ✅ Cluster names based on content
- ✅ Interactive visualization

### What You Should See:
```
Cluster 1: Machine_Learning (2-3 files)
  - sample1.txt (ML/AI content)
  - sample5.txt (Neural networks)
  
Cluster 2: Web_Development (2-3 files)
  - sample2.txt (Web technologies)
  - sample6.txt (Frontend)
  
Cluster 3: Data_Cloud (1-2 files)
  - sample3.txt (Data science)
  - sample4.txt (Cloud computing)
```

---

## Troubleshooting

### Problem: Only 1 File Showing

**Solution 1: Reset Files**
```bash
npm run reset
npm start
```

**Solution 2: Check Folder**
- Make sure you selected the `example-files` folder
- Path should show: `.../example-files`

**Solution 3: Check Console**
```bash
npm run dev
```
Look for:
- "Found 6 total files"
- "Processed 6 files successfully"

---

### Problem: No Clusters Appearing

**Solution: Create Test Files**
```bash
npm run test-setup
npm start
```
Then select the newly created `test-files` folder.

---

### Problem: Application Won't Start

**Solution: Check Node.js**
```bash
node --version  # Should be 16.0.0 or higher
```

If version is too old:
- Download latest from [nodejs.org](https://nodejs.org)
- Install and restart terminal
- Run `npm install` again

---

## Quick Test

Want to see it working immediately?

### Option 1: Text Files Only
```bash
# 1. Create text file examples
npm run test-setup

# 2. Start application
npm start

# 3. Select the test-files folder

# 4. You should see 2-3 clusters with 8 text files!
```

### Option 2: Mixed File Types (Recommended!)
```bash
# 1. Create mixed examples (Python, JavaScript, Java, HTML, JSON, etc.)
npm run mixed-examples

# 2. Start application
npm start

# 3. Select the mixed-files folder

# 4. Watch files cluster by CONTENT across different formats!
```

This demonstrates the power of semantic clustering - files are grouped by what they're about, not what type they are!

---

## Understanding the Interface

### Visualization Panel (Left Side)
- **Large Circles** = Semantic clusters (topics)
- **Small Circles** = Individual files
- **Hover** = See file preview
- **Click** = Open file

### Sidebar (Right Side)
- **Cluster Names** = Topic categories
- **File Lists** = Files in each cluster
- **Click** = Open file

### Header
- **Select Root Folder** = Choose directory to organize
- **Path Display** = Shows current folder

---

## What Happens Behind the Scenes

1. **Scan**: Finds all .txt, .pdf, .md files
2. **Extract**: Reads content from each file
3. **Analyze**: Converts text to numerical vectors
4. **Cluster**: Groups similar files using AI
5. **Organize**: Creates `_semantic_*` folders
6. **Move**: Physically moves files to clusters
7. **Visualize**: Shows results in 2D interface

---

## Next Steps

### Try It Yourself
1. Create a new folder
2. Add 5-10 text files on different topics
3. Select that folder in SEFS
4. Watch automatic organization

### Customize
Edit `config.json` to:
- Add more file types
- Change cluster count
- Adjust file size limits

### Learn More
- [QUICKSTART.md](QUICKSTART.md) - Detailed guide
- [COMMON_ISSUES.md](COMMON_ISSUES.md) - Troubleshooting
- [FEATURES.md](FEATURES.md) - Complete feature list

---

## Still Having Issues?

1. **Check:** [COMMON_ISSUES.md](COMMON_ISSUES.md)
2. **Debug:** Run `npm run dev` and check console
3. **Reset:** Run `npm run reset` to start fresh
4. **Ask:** Open GitHub issue with console output

---

## Success Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Started application (`npm start`)
- [ ] Selected example-files folder
- [ ] See multiple clusters (not just 1)
- [ ] Can hover and see tooltips
- [ ] Can click to open files

If all checked, you're ready to use SEFS! 🎉

---

## Pro Tips

1. **Start Small**: Test with 5-10 files first
2. **Diverse Content**: Better clustering with varied topics
3. **Check Console**: Run `npm run dev` to see what's happening
4. **Reset Often**: Use `npm run reset` between tests
5. **Backup Files**: Always keep backups of important files

---

**Ready? Run `npm start` and select the `example-files` folder!**
