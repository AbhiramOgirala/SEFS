// Test silhouette-based clustering
const SemanticEngine = require('./src/semantic-engine');
const fs = require('fs').promises;
const path = require('path');

async function testSilhouette() {
  console.log('🧪 Testing Silhouette-Based Cluster Detection\n');
  
  const testDir = path.join(__dirname, 'test-silhouette');
  
  try {
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.mkdir(testDir, { recursive: true });
    
    // Create files with 4 distinct topics
    const files = [
      // ML files (3)
      { name: 'ml1.txt', content: 'Machine learning algorithms train models using data. Neural networks learn patterns through backpropagation.' },
      { name: 'ml2.txt', content: 'Deep learning uses multiple layers. Convolutional networks excel at image recognition tasks.' },
      { name: 'ml3.txt', content: 'Supervised learning requires labeled datasets. Classification and regression are common tasks.' },
      
      // Security files (3)
      { name: 'sec1.txt', content: 'Cybersecurity protects systems from attacks. Firewalls block unauthorized access to networks.' },
      { name: 'sec2.txt', content: 'Encryption secures data transmission. Authentication verifies user identities before access.' },
      { name: 'sec3.txt', content: 'Intrusion detection monitors suspicious activity. Threat intelligence helps prevent breaches.' },
      
      // Climate files (2)
      { name: 'climate1.txt', content: 'Climate change affects global temperatures. Greenhouse gases cause atmospheric warming.' },
      { name: 'climate2.txt', content: 'Rising sea levels threaten coastlines. Extreme weather events increase with warming.' },
      
      // Fruit files (2)
      { name: 'fruit1.txt', content: 'Fruits provide vitamins and minerals. Apples and oranges are rich in nutrients.' },
      { name: 'fruit2.txt', content: 'Berries contain antioxidants. Bananas offer potassium and energy for health.' }
    ];
    
    for (const file of files) {
      await fs.writeFile(path.join(testDir, file.name), file.content);
    }
    
    console.log(`✓ Created ${files.length} files with 4 distinct topics\n`);
    console.log('Expected: 4 clusters (ML, Security, Climate, Fruits)\n');
    console.log('='.repeat(80));
    
    const engine = new SemanticEngine(testDir);
    engine.config = {
      fileTypes: ['.txt'],
      excludePatterns: [],
      semanticFolderPrefix: 'semantic_',
      maxFileSize: 10 * 1024 * 1024,
      virtualMode: true,
      security: { maxContentPreview: 1000 }
    };
    
    await engine.scanAndProcess();
    
    console.log('='.repeat(80));
    console.log('\n📊 Final Clustering Results:\n');
    
    const structure = engine.getFileStructure();
    structure.clusters.forEach((cluster, idx) => {
      console.log(`Cluster ${idx + 1}: "${cluster.name}" (${cluster.files.length} files)`);
      cluster.files.forEach(f => console.log(`  - ${f.name}`));
    });
    
    console.log(`\n✓ Created ${structure.clusters.length} clusters`);
    
    if (structure.clusters.length === 4) {
      console.log('✅ SUCCESS: Silhouette method found 4 natural clusters!');
    } else {
      console.log(`⚠️  Expected 4 clusters, got ${structure.clusters.length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testSilhouette();
