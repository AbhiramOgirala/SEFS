let currentStructure = null;

// DOM Elements
const selectFolderBtn = document.getElementById('selectFolder');
const currentPathSpan = document.getElementById('currentPath');
const canvas = document.getElementById('canvas');
const clusterList = document.getElementById('clusterList');
const tooltip = document.getElementById('tooltip');
const openingIndicator = document.getElementById('openingIndicator');
const virtualModeIndicator = document.getElementById('virtualModeIndicator');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResults = document.getElementById('searchResults');

// Show virtual mode indicator (always on since config.json has virtualMode: true)
virtualModeIndicator.style.display = 'inline';

// Search functionality
let searchTimeout = null;

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  // Show/hide clear button
  clearSearchBtn.style.display = query ? 'block' : 'none';
  
  // Debounce search
  clearTimeout(searchTimeout);
  
  if (!query) {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    await performSearch(query);
  }, 300);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  searchResults.style.display = 'none';
  searchResults.innerHTML = '';
  searchInput.focus();
});

async function performSearch(query) {
  const results = await window.sefs.searchFiles(query);
  displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No files found matching your search.</div>';
    searchResults.style.display = 'block';
    return;
  }
  
  const queryLower = query.toLowerCase();
  
  searchResults.innerHTML = results.map(result => {
    // Highlight search term in filename
    const highlightedName = highlightText(result.name, query);
    
    // Highlight search term in preview
    const highlightedPreview = highlightText(result.preview, query);
    
    return `
      <div class="search-result-item" data-path="${escapeHtml(result.path)}">
        <div class="search-result-filename">${highlightedName}</div>
        <div class="search-result-path">${escapeHtml(result.path)}</div>
        <div class="search-result-preview">${highlightedPreview}</div>
        <span class="search-result-cluster">📁 ${escapeHtml(result.cluster)}</span>
      </div>
    `;
  }).join('');
  
  searchResults.style.display = 'block';
  
  // Add click handlers to search results
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', async () => {
      const filePath = item.getAttribute('data-path');
      await openFile(filePath);
      
      // Clear search after opening file
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      searchResults.style.display = 'none';
    });
  });
}

function highlightText(text, query) {
  if (!text || !query) return escapeHtml(text);
  
  const escapedText = escapeHtml(text);
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let result = '';
  let lastIndex = 0;
  let index = textLower.indexOf(queryLower);
  
  while (index !== -1) {
    // Add text before match
    result += escapedText.substring(lastIndex, index);
    // Add highlighted match
    result += `<span class="search-highlight">${escapedText.substring(index, index + query.length)}</span>`;
    lastIndex = index + query.length;
    index = textLower.indexOf(queryLower, lastIndex);
  }
  
  // Add remaining text
  result += escapedText.substring(lastIndex);
  
  return result;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event Listeners
selectFolderBtn.addEventListener('click', async () => {
  const result = await window.sefs.selectRootFolder();
  if (result.success) {
    currentPathSpan.textContent = result.path;
    loadStructure();
  }
});

// Listen for structure updates
window.sefs.onStructureUpdated((structure) => {
  currentStructure = structure;
  render();
});

async function loadStructure() {
  currentStructure = await window.sefs.getFileStructure();
  render();
}

function render() {
  if (!currentStructure) return;
  
  renderVisualization();
  renderSidebar();
}

function renderVisualization() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  
  canvas.innerHTML = '';
  
  if (!currentStructure.clusters || currentStructure.clusters.length === 0) {
    return;
  }

  // Calculate positions for clusters
  const clusterPositions = calculateClusterPositions(currentStructure.clusters, width, height);
  
  // Draw cluster boundaries
  clusterPositions.forEach((cluster, idx) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Cluster boundary
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cluster.x);
    circle.setAttribute('cy', cluster.y);
    circle.setAttribute('r', cluster.radius);
    circle.setAttribute('class', 'cluster-boundary');
    g.appendChild(circle);
    
    // Cluster label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', cluster.x);
    label.setAttribute('y', cluster.y - cluster.radius - 10);
    label.setAttribute('class', 'node-text');
    label.setAttribute('style', 'font-size: 14px; font-weight: 600;');
    label.textContent = cluster.name;
    g.appendChild(label);
    
    canvas.appendChild(g);
  });
  
  // Draw file nodes
  clusterPositions.forEach((cluster, idx) => {
    cluster.files.forEach((file, fileIdx) => {
      const angle = (fileIdx / cluster.files.length) * 2 * Math.PI;
      const radius = cluster.radius * 0.6;
      const x = cluster.x + Math.cos(angle) * radius;
      const y = cluster.y + Math.sin(angle) * radius;
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'node');
      
      // File circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 20);
      circle.setAttribute('class', 'node-circle');
      g.appendChild(circle);
      
      // File name (truncated)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 35);
      text.setAttribute('class', 'node-text');
      text.textContent = truncate(file.name, 15);
      g.appendChild(text);
      
      // Event handlers
      g.addEventListener('mouseenter', (e) => showTooltip(e, file));
      g.addEventListener('mouseleave', hideTooltip);
      g.addEventListener('click', async () => {
        console.log('Opening file:', file.path);
        showOpeningIndicator();
        try {
          await window.sefs.openFile(file.path);
          console.log('File opened successfully');
          hideOpeningIndicator();
        } catch (error) {
          console.error('Error opening file:', error);
          hideOpeningIndicator();
          alert(`Could not open file: ${error.message}`);
        }
      });
      
      canvas.appendChild(g);
    });
  });
}

function calculateClusterPositions(clusters, width, height) {
  const padding = 100;
  const positions = [];
  
  const cols = Math.ceil(Math.sqrt(clusters.length));
  const rows = Math.ceil(clusters.length / cols);
  
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = (height - padding * 2) / rows;
  
  clusters.forEach((cluster, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    
    const x = padding + col * cellWidth + cellWidth / 2;
    const y = padding + row * cellHeight + cellHeight / 2;
    const radius = Math.min(cellWidth, cellHeight) / 2.5;
    
    positions.push({
      x,
      y,
      radius,
      name: cluster.name,
      files: cluster.files
    });
  });
  
  return positions;
}

function renderSidebar() {
  clusterList.innerHTML = '';
  
  if (!currentStructure.clusters || currentStructure.clusters.length === 0) {
    clusterList.innerHTML = '<p style="color: #888;">No files to organize yet.</p>';
    return;
  }
  
  currentStructure.clusters.forEach(cluster => {
    const clusterDiv = document.createElement('div');
    clusterDiv.className = 'cluster';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'cluster-name';
    nameDiv.textContent = `${cluster.name} (${cluster.files.length})`;
    clusterDiv.appendChild(nameDiv);
    
    cluster.files.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'file-item';
      fileDiv.textContent = file.name;
      fileDiv.addEventListener('click', async () => {
        console.log('Opening file from sidebar:', file.path);
        showOpeningIndicator();
        try {
          await window.sefs.openFile(file.path);
          console.log('File opened successfully');
          hideOpeningIndicator();
        } catch (error) {
          console.error('Error opening file:', error);
          hideOpeningIndicator();
          alert(`Could not open file: ${error.message}`);
        }
      });
      clusterDiv.appendChild(fileDiv);
    });
    
    clusterList.appendChild(clusterDiv);
  });
}

function showTooltip(event, file) {
  tooltip.innerHTML = `
    <div class="tooltip-title">${file.name}</div>
    <div class="tooltip-preview">${truncate(file.preview, 150)}</div>
  `;
  
  tooltip.style.left = event.pageX + 15 + 'px';
  tooltip.style.top = event.pageY + 15 + 'px';
  tooltip.classList.add('visible');
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

function showOpeningIndicator() {
  openingIndicator.classList.add('visible');
}

function hideOpeningIndicator() {
  setTimeout(() => {
    openingIndicator.classList.remove('visible');
  }, 500);
}

// Handle window resize
window.addEventListener('resize', () => {
  if (currentStructure) renderVisualization();
});
