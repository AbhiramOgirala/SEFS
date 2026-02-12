const fs = require('fs').promises;
const path = require('path');
const natural = require('natural');
const PDFParser = require('pdf2json');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;

async function extractPDFText(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    let textContent = '';
    
    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(new Error(errData.parserError));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        if (pdfData.Pages && pdfData.Pages.length > 0) {
          pdfData.Pages.forEach(page => {
            if (page.Texts && page.Texts.length > 0) {
              page.Texts.forEach(text => {
                if (text.R && text.R.length > 0) {
                  text.R.forEach(r => {
                    if (r.T) {
                      textContent += decodeURIComponent(r.T) + ' ';
                    }
                  });
                }
              });
            }
          });
        }
        resolve(textContent.trim());
      } catch (parseError) {
        reject(parseError);
      }
    });
    
    pdfParser.loadPDF(filePath);
  });
}

function cosineSimilarity(vec1, vec2) {
  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (const key of keys) {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

async function analyzeCyberFiles() {
  const testDir = 'C:\\Users\\abhir\\OneDrive\\Desktop\\Test';
  
  const cyberFiles = [
    'Advanced_Cybersecurity_Incident_Response.pdf',
    'Network_Security_Threat_Intelligence.pdf',
    'Cybersecurity_Basics.txt'
  ];
  
  console.log('Analyzing cybersecurity file similarity...\n');
  
  const contents = {};
  
  // Extract content
  for (const file of cyberFiles) {
    const filePath = path.join(testDir, file);
    try {
      if (file.endsWith('.pdf')) {
        contents[file] = await extractPDFText(filePath);
      } else {
        contents[file] = await fs.readFile(filePath, 'utf-8');
      }
      console.log(`✓ Loaded: ${file}`);
      console.log(`  Length: ${contents[file].length} chars`);
      console.log(`  Preview: "${contents[file].substring(0, 80).replace(/\s+/g, ' ')}..."\n`);
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message);
    }
  }
  
  // Create TF-IDF vectors
  const tfidf = new TfIdf();
  
  for (const file of cyberFiles) {
    const text = contents[file].toLowerCase();
    const tokens = tokenizer.tokenize(text);
    const stemmed = tokens.map(t => stemmer.stem(t));
    tfidf.addDocument(stemmed);
  }
  
  // Extract vectors
  const vectors = {};
  cyberFiles.forEach((file, idx) => {
    vectors[file] = {};
    tfidf.listTerms(idx).forEach(item => {
      vectors[file][item.term] = item.tfidf;
    });
  });
  
  // Calculate similarities
  console.log('\n' + '='.repeat(80));
  console.log('SIMILARITY MATRIX');
  console.log('='.repeat(80) + '\n');
  
  for (let i = 0; i < cyberFiles.length; i++) {
    for (let j = i + 1; j < cyberFiles.length; j++) {
      const file1 = cyberFiles[i];
      const file2 = cyberFiles[j];
      const similarity = cosineSimilarity(vectors[file1], vectors[file2]);
      
      console.log(`${file1}`);
      console.log(`  vs`);
      console.log(`${file2}`);
      console.log(`  Similarity: ${(similarity * 100).toFixed(2)}%\n`);
    }
  }
  
  // Find common terms
  console.log('='.repeat(80));
  console.log('TOP TERMS IN EACH FILE');
  console.log('='.repeat(80) + '\n');
  
  cyberFiles.forEach((file, idx) => {
    console.log(`${file}:`);
    const terms = tfidf.listTerms(idx).slice(0, 15);
    console.log(`  ${terms.map(t => t.term).join(', ')}\n`);
  });
}

analyzeCyberFiles();
