const SemanticEngine = require('./src/semantic-engine');

async function testTravelMoviesSeparation() {
  console.log('Testing Travel and Movies Separation...\n');
  
  const engine = new SemanticEngine('C:\\Users\\abhir\\OneDrive\\Desktop\\Test');
  
  try {
    await engine.initialize();
    await engine.scanAndProcess();
    await engine.performClustering();
    
    console.log('\n' + '='.repeat(80));
    console.log('CLUSTERING RESULTS');
    console.log('='.repeat(80) + '\n');
    
    let travelCluster = null;
    let moviesCluster = null;
    
    engine.clusters.forEach((cluster, id) => {
      console.log(`Cluster "${cluster.name}": ${cluster.files.length} files`);
      cluster.files.forEach(file => {
        const fileName = require('path').basename(file);
        console.log(`  - ${fileName}`);
        
        // Check if this cluster contains travel or movies files
        if (fileName.toLowerCase().includes('travel')) {
          travelCluster = cluster.name;
        }
        if (fileName.toLowerCase().includes('movie')) {
          moviesCluster = cluster.name;
        }
      });
      console.log();
    });
    
    console.log('='.repeat(80));
    console.log('SEPARATION CHECK');
    console.log('='.repeat(80));
    
    if (travelCluster && moviesCluster) {
      if (travelCluster === moviesCluster) {
        console.log('❌ FAILED: Travel and Movies files are in the SAME cluster');
        console.log(`   Cluster: ${travelCluster}`);
      } else {
        console.log('✅ SUCCESS: Travel and Movies files are in DIFFERENT clusters');
        console.log(`   Travel cluster: ${travelCluster}`);
        console.log(`   Movies cluster: ${moviesCluster}`);
      }
    } else {
      console.log('⚠️  Could not find travel or movies files');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTravelMoviesSeparation();
