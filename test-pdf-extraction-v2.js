const fs = require('fs').promises;
const path = require('path');
const PDFParser = require('pdf2json');

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

async function testPDFExtraction() {
  const testDir = 'C:\\Users\\abhir\\OneDrive\\Desktop\\Test';
  
  try {
    const files = await fs.readdir(testDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files\n`);
    
    for (const pdfFile of pdfFiles) {
      const filePath = path.join(testDir, pdfFile);
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Testing: ${pdfFile}`);
      console.log('='.repeat(80));
      
      try {
        const text = await extractPDFText(filePath);
        console.log(`✓ Success!`);
        console.log(`  Text length: ${text.length} characters`);
        console.log(`  Preview: "${text.substring(0, 150).replace(/\s+/g, ' ')}..."`);
        
        // Check filename vs content
        const fileName = path.basename(pdfFile, '.pdf').toLowerCase();
        const contentLower = text.toLowerCase();
        
        const fileNameWords = fileName.split(/[_\s-]+/).filter(w => w.length > 3);
        const hasMatch = fileNameWords.some(word => contentLower.includes(word));
        
        if (!hasMatch && fileNameWords.length > 0) {
          console.log(`  ⚠️  WARNING: Content may not match filename!`);
          console.log(`     Expected: ${fileNameWords.join(', ')}`);
        } else {
          console.log(`  ✓ Content matches filename expectations`);
        }
        
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

testPDFExtraction();
