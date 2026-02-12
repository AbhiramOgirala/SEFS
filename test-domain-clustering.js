const SemanticEngine = require('./src/semantic-engine');

async function testDomainClustering() {
  console.log('Testing domain-aware clustering...\n');
  
  const engine = new SemanticEngine('C:\\Users\\abhir\\OneDrive\\Desktop\\Test');
  
  try {
    await engine.initialize();
    await engine.scanAndProcess();
    await engine.performClustering();
    
    console.log('\n' + '='.repeat(80));
    console.log('CLUSTERING RESULTS');
    console.log('='.repeat(80) + '\n');
    
    engine.clusters.forEach((cluster, id) => {
      console.log(`Cluster "${cluster.name}": ${cluster.files.length} files`);
      cluster.files.forEach(file => {
        const fileName = require('path').basename(file);
        console.log(`  - ${fileName}`);
      });
      console.log();
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDomainClustering();
