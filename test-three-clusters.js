// Test script for 3 distinct clusters
const SemanticEngine = require('./src/semantic-engine');
const fs = require('fs').promises;
const path = require('path');

async function testThreeClusters() {
  console.log('🧪 Testing 3-Cluster Scenario\n');
  
  const testDir = path.join(__dirname, 'test-three-topics');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create files with 3 distinct topics
    const samples = [
      // Machine Learning cluster
      {
        name: 'ml_basics.txt',
        content: 'Machine learning algorithms enable computers to learn from data. Supervised learning uses labeled datasets to train models. Neural networks and deep learning have revolutionized artificial intelligence applications.'
      },
      {
        name: 'ml_advanced.txt',
        content: 'Deep learning models use multiple layers of neural networks. Training algorithms optimize weights through backpropagation. Machine learning frameworks like TensorFlow enable efficient model development.'
      },
      
      // Cybersecurity cluster
      {
        name: 'security_basics.txt',
        content: 'Cybersecurity protects systems from digital attacks and threats. Encryption secures data transmission and storage. Firewalls and intrusion detection systems prevent unauthorized access to networks.'
      },
      {
        name: 'security_advanced.txt',
        content: 'Advanced persistent threats require sophisticated defense mechanisms. Security incident response teams handle breach investigations. Penetration testing identifies vulnerabilities before attackers exploit them.'
      },
      {
        name: 'security_protocols.txt',
        content: 'Network security protocols include SSL, TLS, and IPSec. Authentication systems verify user identities through passwords and biometrics. Security audits assess compliance with protection standards.'
      },
      
      // Climate Change cluster
      {
        name: 'climate_basics.txt',
        content: 'Climate change affects global weather patterns and temperatures. Greenhouse gas emissions contribute to atmospheric warming. Rising sea levels threaten coastal communities worldwide.'
      },
      {
        name: 'climate_impact.txt',
        content: 'Environmental changes impact ecosystems and biodiversity. Extreme weather events increase due to climate shifts. Renewable energy sources reduce carbon footprint and emissions.'
      }
    ];
    
    console.log('📝 Creating test files with 3 distinct topics...');
    for (const sample of samples) {
      await fs.writeFile(
        path.join(testDir, sample.name),
        sample.content
      );
    }
    console.log(`✓ Created ${samples.length} test files\n`);
    
    // Initialize semantic engine
    console.log('🔧 Initializing Semantic Engine...');
    const engine = new SemanticEngine(testDir);
    
    engine.config = {
      fileTypes: ['.txt', '.pdf'],
      excludePatterns: ['node_modules', '.git'],
      semanticFolderPrefix: 'semantic_',
      maxFileSize: 10 * 1024 * 1024,
      virtualMode: true,
      security: {
        maxContentPreview: 1000
      }
    };
    
    await engine.scanAndProcess();
    
    // Display results
    console.log('\n📊 Clustering Results:\n');
    const structure = engine.getFileStructure();
    
    console.log(`Total clusters created: ${structure.clusters.length}\n`);
    
    structure.clusters.forEach((cluster, idx) => {
      console.log(`Cluster ${idx + 1}: "${cluster.name}"`);
      console.log(`  Files (${cluster.files.length}):`);
      cluster.files.forEach(file => {
        console.log(`    - ${file.name}`);
      });
      console.log('');
    });
    
    // Verify results
    const expectedClusters = 3;
    if (structure.clusters.length === expectedClusters) {
      console.log('✅ SUCCESS: Created expected 3 clusters!');
    } else {
      console.log(`⚠️  WARNING: Expected ${expectedClusters} clusters, got ${structure.clusters.length}`);
    }
    
    console.log('\nExpected clustering:');
    console.log('  Cluster 1: Machine Learning files (2 files)');
    console.log('  Cluster 2: Cybersecurity files (3 files)');
    console.log('  Cluster 3: Climate Change files (2 files)\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testThreeClusters();
