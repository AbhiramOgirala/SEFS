// Test script to verify dynamic file addition clustering
const SemanticEngine = require('./src/semantic-engine');
const fs = require('fs').promises;
const path = require('path');

async function testDynamicClustering() {
  console.log('🧪 Testing Dynamic File Addition Clustering\n');
  
  const testDir = path.join(__dirname, 'test-dynamic');
  
  try {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {}
    
    await fs.mkdir(testDir, { recursive: true });
    
    // Phase 1: Create initial files (2 topics)
    console.log('📝 Phase 1: Creating initial files (ML and Security)...');
    const initialFiles = [
      {
        name: 'ml_basics.txt',
        content: 'Machine learning algorithms enable computers to learn from data. Neural networks and deep learning have revolutionized artificial intelligence applications. Training models requires large datasets and computational resources.'
      },
      {
        name: 'ml_advanced.txt',
        content: 'Deep learning models use multiple layers of neural networks. Convolutional neural networks excel at image recognition. Recurrent networks handle sequential data effectively.'
      },
      {
        name: 'security_basics.txt',
        content: 'Cybersecurity protects systems from digital attacks and threats. Encryption secures data transmission and storage. Firewalls prevent unauthorized network access.'
      },
      {
        name: 'security_advanced.txt',
        content: 'Advanced persistent threats require sophisticated defense mechanisms. Intrusion detection systems monitor network traffic. Penetration testing identifies security vulnerabilities.'
      }
    ];
    
    for (const file of initialFiles) {
      await fs.writeFile(path.join(testDir, file.name), file.content);
    }
    console.log(`✓ Created ${initialFiles.length} initial files\n`);
    
    // Initialize and process
    console.log('🔧 Initializing Semantic Engine...');
    const engine = new SemanticEngine(testDir);
    engine.config = {
      fileTypes: ['.txt', '.pdf'],
      excludePatterns: ['node_modules', '.git'],
      semanticFolderPrefix: 'semantic_',
      maxFileSize: 10 * 1024 * 1024,
      virtualMode: true,
      security: { maxContentPreview: 1000 }
    };
    
    await engine.scanAndProcess();
    
    console.log('\n📊 Initial Clustering (2 topics):');
    let structure = engine.getFileStructure();
    structure.clusters.forEach((cluster, idx) => {
      console.log(`  Cluster ${idx + 1}: "${cluster.name}" (${cluster.files.length} files)`);
      cluster.files.forEach(f => console.log(`    - ${f.name}`));
    });
    
    console.log(`\n✓ Initial clusters: ${structure.clusters.length}`);
    console.log('Expected: 2 clusters (ML and Security)\n');
    
    // Phase 2: Add new files from a different topic (Climate)
    console.log('=' .repeat(80));
    console.log('\n📝 Phase 2: Adding NEW files (Climate topic)...');
    
    const newFiles = [
      {
        name: 'climate_basics.txt',
        content: 'Climate change affects global weather patterns and temperatures. Greenhouse gas emissions contribute to atmospheric warming. Rising sea levels threaten coastal communities worldwide.'
      },
      {
        name: 'climate_impact.txt',
        content: 'Environmental changes impact ecosystems and biodiversity. Extreme weather events increase due to climate shifts. Renewable energy sources reduce carbon footprint and emissions.'
      }
    ];
    
    for (const file of newFiles) {
      const filePath = path.join(testDir, file.name);
      await fs.writeFile(filePath, file.content);
      console.log(`  + Added: ${file.name}`);
      
      // Simulate file system watcher trigger
      await engine.handleFileChange(filePath);
    }
    
    console.log('\n📊 Updated Clustering (3 topics):');
    structure = engine.getFileStructure();
    structure.clusters.forEach((cluster, idx) => {
      console.log(`  Cluster ${idx + 1}: "${cluster.name}" (${cluster.files.length} files)`);
      cluster.files.forEach(f => console.log(`    - ${f.name}`));
    });
    
    console.log(`\n✓ Updated clusters: ${structure.clusters.length}`);
    console.log('Expected: 3 clusters (ML, Security, Climate)\n');
    
    // Verify results
    const expectedClusters = 3;
    if (structure.clusters.length === expectedClusters) {
      console.log('✅ SUCCESS: Dynamic clustering created expected 3 clusters!');
      
      // Check if climate files are in their own cluster
      const climateCluster = structure.clusters.find(c => 
        c.files.some(f => f.name.includes('climate'))
      );
      
      if (climateCluster) {
        const allClimateFiles = climateCluster.files.every(f => 
          f.name.includes('climate')
        );
        
        if (allClimateFiles && climateCluster.files.length === 2) {
          console.log('✅ Climate files are correctly clustered together!');
        } else {
          console.log('⚠️  Climate files are mixed with other topics');
        }
      }
    } else {
      console.log(`⚠️  WARNING: Expected ${expectedClusters} clusters, got ${structure.clusters.length}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\nTest Summary:');
    console.log('  - Initial state: 4 files, 2 topics');
    console.log('  - Added: 2 files, 1 new topic');
    console.log('  - Final state: 6 files, 3 topics');
    console.log('  - Dynamic re-clustering: ' + (structure.clusters.length === 3 ? 'WORKING ✅' : 'FAILED ❌'));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testDynamicClustering();
