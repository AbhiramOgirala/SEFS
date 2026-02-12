// Test script to demonstrate improved NLP clustering
const SemanticEngine = require('./src/semantic-engine');
const fs = require('fs').promises;
const path = require('path');

async function testClustering() {
  console.log('🧪 Testing Enhanced NLP Clustering\n');
  
  // Create test directory
  const testDir = path.join(__dirname, 'test-nlp-files');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create sample text files with different themes
    const samples = [
      {
        name: 'ml_intro.txt',
        content: 'Machine learning is a subset of artificial intelligence. It focuses on training algorithms to learn from data and make predictions without explicit programming.'
      },
      {
        name: 'deep_learning.txt',
        content: 'Deep learning uses neural networks with multiple layers. These networks can learn complex patterns in data for tasks like image recognition and natural language processing.'
      },
      {
        name: 'finance_report.txt',
        content: 'The quarterly financial report shows revenue growth of 15%. Operating expenses decreased while profit margins improved significantly this quarter.'
      },
      {
        name: 'budget_analysis.txt',
        content: 'Budget analysis reveals cost savings opportunities. Financial planning should focus on reducing operational costs and improving cash flow management.'
      },
      {
        name: 'ai_research.txt',
        content: 'Artificial intelligence research explores machine learning algorithms and neural network architectures. Recent advances in deep learning have revolutionized AI applications.'
      },
      {
        name: 'market_trends.txt',
        content: 'Market trends indicate strong financial performance. Investment strategies should consider economic indicators and revenue forecasts for optimal returns.'
      }
    ];
    
    console.log('📝 Creating test files...');
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
    
    // Override config for testing
    engine.config = {
      fileTypes: ['.txt', '.pdf'],
      excludePatterns: ['node_modules', '.git'],
      semanticFolderPrefix: 'semantic_',
      maxFileSize: 10 * 1024 * 1024,
      virtualMode: true, // Don't move files during test
      security: {
        maxContentPreview: 1000
      }
    };
    
    await engine.scanAndProcess();
    
    // Display results
    console.log('\n📊 Clustering Results:\n');
    const structure = engine.getFileStructure();
    
    structure.clusters.forEach((cluster, idx) => {
      console.log(`Cluster ${idx + 1}: "${cluster.name}"`);
      console.log(`  Files (${cluster.files.length}):`);
      cluster.files.forEach(file => {
        console.log(`    - ${file.name}`);
      });
      console.log('');
    });
    
    console.log('✅ Test completed successfully!');
    console.log('\nExpected behavior:');
    console.log('  - AI/ML files should cluster together');
    console.log('  - Finance files should cluster together');
    console.log('  - Cluster names should reflect content themes\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test
testClustering();
