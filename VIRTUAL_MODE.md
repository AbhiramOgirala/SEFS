# Virtual Mode vs Physical Mode

## What's the Difference?

### 🔵 Virtual Mode (DEFAULT - Recommended)
**Files stay in their original location**

- ✅ Files are NOT moved
- ✅ Original folder structure preserved
- ✅ Only visualization shows clustering
- ✅ Safe for production folders
- ✅ No risk of disrupting your project

**Use when:**
- Working with active projects
- Don't want to change file locations
- Just want to visualize semantic relationships
- Testing the system

### 🔴 Physical Mode
**Files are physically moved to semantic folders**

- ⚠️ Files ARE moved to `_semantic_*` folders
- ⚠️ Original structure is changed
- ⚠️ Can disrupt project dependencies
- ⚠️ Requires running `npm run reset` to undo

**Use when:**
- Want permanent reorganization
- Working with document archives
- Organizing personal files
- Creating new folder structure

## Current Configuration

Check `config.json`:

```json
{
  "virtualMode": true   // ← Virtual mode (files NOT moved)
}
```

or

```json
{
  "virtualMode": false  // ← Physical mode (files WILL be moved)
}
```

## How to Switch Modes

### Enable Virtual Mode (Recommended)

Edit `config.json`:
```json
{
  "virtualMode": true
}
```

Then restart: `npm start`

### Enable Physical Mode (Caution!)

Edit `config.json`:
```json
{
  "virtualMode": false
}
```

Then restart: `npm start`

**⚠️ Warning:** Files will be physically moved!

## Visual Indicators

### Virtual Mode Active
```
🧠 Semantic Entropy File System  [Select Root Folder]  📊 Virtual Mode (Files Not Moved)
```

### Physical Mode Active
```
🧠 Semantic Entropy File System  [Select Root Folder]  ⚠️ Physical Mode (Files Will Be Moved)
```

## What Happens in Each Mode

### Virtual Mode Flow
```
1. Select folder
   ↓
2. Scan files
   ↓
3. Analyze content
   ↓
4. Create clusters
   ↓
5. Show visualization
   ↓
6. Files stay in original location ✓
```

### Physical Mode Flow
```
1. Select folder
   ↓
2. Scan files
   ↓
3. Analyze content
   ↓
4. Create clusters
   ↓
5. Create _semantic_* folders
   ↓
6. Move files to semantic folders ⚠️
   ↓
7. Show visualization
```

## Example: Job Portal Project

### Virtual Mode (Safe)
```
Job Portal/
├── backend/
│   ├── app.js              ← Stays here
│   ├── controllers/
│   │   ├── userController.js  ← Stays here
│   │   └── jobController.js   ← Stays here
│   └── models/
│       └── userSchema.js      ← Stays here
└── frontend/
    └── src/
        └── App.jsx         ← Stays here

Visualization shows clusters, but files don't move!
```

### Physical Mode (Risky for projects!)
```
Job Portal/
├── _semantic_Backend_Controllers/
│   ├── app.js              ← Moved!
│   ├── userController.js   ← Moved!
│   └── jobController.js    ← Moved!
├── _semantic_Database_Models/
│   └── userSchema.js       ← Moved!
└── _semantic_Frontend_Components/
    └── App.jsx             ← Moved!

⚠️ Project structure broken! Imports won't work!
```

## Recommendations

### ✅ Use Virtual Mode For:
- Active development projects
- Code repositories
- Folders with dependencies
- Exploring semantic relationships
- Testing the system

### ⚠️ Use Physical Mode For:
- Document archives
- Personal file collections
- Photos and media
- Files without dependencies
- One-time organization tasks

## Undoing Physical Mode

If you accidentally used physical mode:

```bash
npm run reset
```

This moves all files back from `_semantic_*` folders to the root.

## FAQ

### Q: Can I see clusters without moving files?
**A:** Yes! That's exactly what virtual mode does.

### Q: Will virtual mode create any folders?
**A:** No, virtual mode doesn't create or modify anything on disk.

### Q: Is virtual mode slower?
**A:** No, it's actually faster since it skips file moving.

### Q: Can I switch modes while running?
**A:** No, you need to edit config.json and restart the app.

### Q: What's the default mode?
**A:** Virtual mode (virtualMode: true) is now the default for safety.

## Summary

**Virtual Mode = Visualization Only (Safe)**
- Files stay put
- Just shows you how they'd be clustered
- Perfect for exploring

**Physical Mode = Actually Move Files (Risky)**
- Files are moved
- Changes your folder structure
- Use with caution

**Current Setting:** Virtual Mode ✓ (Files will NOT be moved)
