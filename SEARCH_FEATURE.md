# Search Feature Documentation

## Overview
The search feature allows users to quickly find files by searching both filenames and file content in real-time.

## Features

### 1. Dual Search Mode
- **Filename Search**: Matches search terms against file names
- **Content Search**: Searches within the actual content of files (including PDFs)

### 2. Real-Time Search
- Results appear as you type (300ms debounce)
- No need to press Enter or click a search button
- Instant feedback for quick navigation

### 3. Smart Result Display
Each search result shows:
- **Filename** (highlighted with search term)
- **Full file path** for context
- **Content preview** with search term highlighted
- **Cluster name** showing which semantic group the file belongs to

### 4. Result Prioritization
Results are sorted intelligently:
- Filename matches appear first
- Content matches appear after
- Helps users find files faster

### 5. Context Preview
- For content matches: Shows 50 characters before and after the match
- For filename matches: Shows first 100 characters of content
- Ellipsis (...) indicates truncated content

### 6. Interactive Results
- Click any result to open the file immediately
- Search clears automatically after opening a file
- Smooth, non-intrusive user experience

## User Interface

### Search Bar Location
- Located below the header, above the main visualization
- Always visible and accessible
- Prominent placement for easy access

### Visual Elements
- **Search icon** (🔍) in placeholder text
- **Clear button** (✕) appears when typing
- **Dropdown results** appear below search bar
- **Highlighted matches** in red for easy scanning

### Styling
- Dark theme matching the application
- Hover effects for better interactivity
- Smooth transitions and animations
- Scrollable results for many matches

## How to Use

### Basic Search
1. Click in the search bar
2. Start typing your search term
3. Results appear automatically
4. Click any result to open the file

### Clear Search
- Click the ✕ button
- Or delete all text manually
- Results disappear automatically

### Navigate Results
- Scroll through results if many matches
- Hover over results to highlight
- Click to open file

## Technical Implementation

### Backend (semantic-engine.js)
```javascript
searchFiles(query)
```
- Searches through all processed files
- Checks both filename and content
- Returns array of matching files with metadata
- Extracts context around matches

### IPC Communication (main.js)
```javascript
ipcMain.handle('search-files', async (event, query) => {
  return semanticEngine.searchFiles(query);
});
```

### Frontend (renderer.js)
- Debounced input handling (300ms)
- Dynamic result rendering
- Highlight matching terms
- Click handlers for opening files

### Preload (preload.js)
```javascript
searchFiles: (query) => ipcRenderer.invoke('search-files', query)
```

## Search Algorithm

### 1. Query Processing
- Converts query to lowercase
- Trims whitespace
- Returns empty array for empty queries

### 2. File Matching
For each file:
- Check if filename contains query
- Check if content contains query
- Mark match type (filename or content)

### 3. Preview Generation
- **Content match**: Extract 50 chars before/after match
- **Filename match**: Show first 100 chars of content
- Add ellipsis for truncated text

### 4. Result Sorting
- Filename matches first (more relevant)
- Content matches second
- Maintains order within each group

## Performance Considerations

### Optimizations
- **Debouncing**: 300ms delay prevents excessive searches
- **Case-insensitive**: Lowercase comparison for speed
- **Efficient iteration**: Single pass through files
- **Limited preview**: Only extracts necessary context

### Scalability
- Works well with hundreds of files
- Instant results for typical queries
- No noticeable lag on modern hardware

## Examples

### Example 1: Filename Search
```
Query: "security"
Results:
- Cybersecurity_Basics.txt (filename match)
- Network_Security_Threat_Intelligence.pdf (filename match)
- Advanced_Cybersecurity_Incident_Response.pdf (filename match)
```

### Example 2: Content Search
```
Query: "neural networks"
Results:
- Deep_Learning_Neural_Networks.pdf (content match)
  Preview: "...specialized branch of machine learning that uses multi-layer neural networks. Neural networks consist..."
```

### Example 3: Mixed Results
```
Query: "machine"
Results:
- ML_Fundamentals.txt (filename match)
- Computer_Vision_Applications.txt (content match)
  Preview: "...field of artificial intelligence that enables machines to interpret and understand..."
```

## Future Enhancements

Possible improvements:
1. **Advanced filters**: Filter by file type, cluster, date
2. **Regex support**: Allow regular expression searches
3. **Fuzzy matching**: Find similar terms (typo tolerance)
4. **Search history**: Remember recent searches
5. **Keyboard shortcuts**: Navigate results with arrow keys
6. **Export results**: Save search results to file
7. **Search within cluster**: Limit search to specific clusters
8. **Relevance scoring**: Rank results by match quality

## Keyboard Shortcuts (Future)

Planned shortcuts:
- `Ctrl+F` or `Cmd+F`: Focus search bar
- `Esc`: Clear search and close results
- `↑/↓`: Navigate through results
- `Enter`: Open selected result

## Accessibility

Current features:
- Clear visual feedback
- Keyboard accessible
- High contrast highlighting
- Readable font sizes

Future improvements:
- Screen reader support
- ARIA labels
- Focus management
- Keyboard navigation
