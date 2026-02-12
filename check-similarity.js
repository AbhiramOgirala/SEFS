// Quick script to check why Renewable Energy clusters with Fruits
const SemanticEngine = require('./src/semantic-engine');
const path = require('path');

async function checkSimilarity() {
  console.log('🔍 Checking Renewable Energy vs Fruits Similarity\n');
  
  const testDir = 'C:\\Users\\abhir\\OneDrive\\Desktop\\Test';
  
  const engine = new SemanticEngine(testDir);
  engine.config = {
    fileTypes: ['.txt', '.pdf'],
    excludePatterns: ['node_modules', '.git'],
    semanticFolderPrefix: 'semantic_',
    maxFileSize: 10 * 1024 * 1024,
    virtualMode: true,
    security: { maxContentPreview: 5000 }
  };
  
  await engine.scanAndProcess();
  
  // Find the files
  const renewableFile = Array.from(engine.files.entries()).find(([p]) => 
    p.includes('Renewable_Energy')
  );
  
  const fruitFiles = Array.from(engine.files.entries()).filter(([p]) => 
    p.includes('Fruit')
  );
  
  if (!renewableFile) {
    console.log('❌ Renewable Energy file not found');
    return;
  }
  
  console.log('📄 Renewable Energy File:');
  console.log(`   Content preview: ${renewableFile[1].content.substring(0, 200)}...\n`);
  
  console.log('📄 Fruit Files:');
  fruitFiles.forEach(([p, data]) => {
    console.log(`   ${path.basename(p)}`);
    console.log(`   Content preview: ${data.content.substring(0, 200)}...\n`);
  });
  
  // Check similarity
  console.log('🔗 Similarity Scores:\n');
  fruitFiles.forEach(([p, data]) => {
    const sim = engine.cosineSimilarity(renewableFile[1].vector, data.vector);
    console.log(`Renewable Energy vs ${path.basename(p)}: ${sim.toFixed(3)}`);
  });
  
  // Show common terms
  console.log('\n📊 Top Terms in Each File:\n');
  
  console.log('Renewable Energy top terms:');
  const renewableTerms = Object.entries(renewableFile[1].vector)
    .filter(([term]) => !term.includes('_'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, weight]) => `${term}(${weight.toFixed(2)})`)
    .join(', ');
  console.log(`  ${renewableTerms}\n`);
  
  fruitFiles.forEach(([p, data]) => {
    console.log(`${path.basename(p)} top terms:`);
    const terms = Object.entries(data.vector)
      .filter(([term]) => !term.includes('_'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([term, weight]) => `${term}(${weight.toFixed(2)})`)
      .join(', ');
    console.log(`  ${terms}\n`);
  });
  
  // Check for overlapping terms
  console.log('🔄 Overlapping Terms:\n');
  const renewableTermSet = new Set(Object.keys(renewableFile[1].vector));
  
  fruitFiles.forEach(([p, data]) => {
    const fruitTermSet = new Set(Object.keys(data.vector));
    const overlap = [...renewableTermSet].filter(t => fruitTermSet.has(t) && !t.includes('_'));
    console.log(`Renewable Energy & ${path.basename(p)}: ${overlap.length} common terms`);
    if (overlap.length > 0) {
      console.log(`  Common: ${overlap.slice(0, 10).join(', ')}`);
    }
  });
}

checkSimilarity().catch(console.error);
