// Diagnostic script to check what content is being extracted from files
const SemanticEngine = require('./src/semantic-engine');
const fs = require('fs').promises;
const path = require('path');

async function diagnoseFiles(directory) {
  console.log('🔍 Diagnostic Mode - Analyzing File Content\n');
  console.log(`Directory: ${directory}\n`);
  
  try {
    const engine = new SemanticEngine(directory);
    
    engine.config = {
      fileTypes: ['.txt', '.pdf'],
      excludePatterns: ['node_modules', '.git'],
      semanticFolderPrefix: 'semantic_',
      maxFileSize: 10 * 1024 * 1024,
      virtualMode: true,
      security: {
        maxContentPreview: 5000 // Larger preview for diagnosis
      }
    };
    
    // Get all files
    const files = await engine.getAllFiles(directory);
    const validFiles = files.filter(f => engine.isValidFile(f));
    
    console.log(`Found ${validFiles.length} valid files\n`);
    console.log('=' .repeat(80));
    
    // Process each file and show content
    for (const filePath of validFiles) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath);
      
      console.log(`\n📄 File: ${fileName}`);
      console.log(`   Type: ${ext}`);
      
      try {
        const content = await engine.extractContent(filePath);
        const wordCount = content.split(/\s+/).length;
        const charCount = content.length;
        
        console.log(`   Length: ${charCount} characters, ${wordCount} words`);
        console.log(`   Preview (first 300 chars):`);
        console.log(`   "${content.substring(0, 300).replace(/\n/g, ' ')}..."`);
        
        // Show top terms after processing
        const vector = engine.textToVector(content);
        const topTerms = Object.entries(vector)
          .filter(([term]) => !term.includes('_')) // Exclude bigrams
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([term, freq]) => `${term}(${freq})`)
          .join(', ');
        
        console.log(`   Top terms: ${topTerms}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('-'.repeat(80));
    }
    
    console.log('\n\n🔬 Now running clustering analysis...\n');
    await engine.scanAndProcess();
    
    // Show clustering results with similarity analysis
    console.log('\n📊 Clustering Results with Similarity Matrix:\n');
    const structure = engine.getFileStructure();
    
    structure.clusters.forEach((cluster, idx) => {
      console.log(`\nCluster ${idx + 1}: "${cluster.name}" (${cluster.files.length} files)`);
      cluster.files.forEach(file => {
        console.log(`  - ${file.name}`);
      });
    });
    
    // Calculate inter-file similarities
    console.log('\n\n🔗 File Similarity Matrix (Cosine Similarity):\n');
    const fileEntries = Array.from(engine.files.entries());
    
    for (let i = 0; i < fileEntries.length; i++) {
      const [path1, data1] = fileEntries[i];
      const name1 = path.basename(path1);
      
      console.log(`\n${name1}:`);
      
      for (let j = 0; j < fileEntries.length; j++) {
        if (i === j) continue;
        
        const [path2, data2] = fileEntries[j];
        const name2 = path.basename(path2);
        
        const similarity = engine.cosineSimilarity(data1.vector, data2.vector);
        const bar = '█'.repeat(Math.round(similarity * 20));
        
        console.log(`  vs ${name2.padEnd(50)} ${similarity.toFixed(3)} ${bar}`);
      }
    }
    
    console.log('\n\n✅ Diagnosis complete!');
    console.log('\nInterpretation:');
    console.log('  - Similarity > 0.5: Files are quite similar');
    console.log('  - Similarity > 0.7: Files are very similar (may cluster together)');
    console.log('  - Similarity > 0.85: Files are extremely similar (will merge clusters)');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error(error.stack);
  }
}

// Get directory from command line or use default
const targetDir = process.argv[2] || 'C:\\Users\\abhir\\OneDrive\\Desktop\\Test';
diagnoseFiles(targetDir);
