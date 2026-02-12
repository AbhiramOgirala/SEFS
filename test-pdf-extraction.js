const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

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
        // Method 1: Direct read and parse
        console.log('\n[Method 1: Direct Buffer]');
        const buffer1 = await fs.readFile(filePath);
        const data1 = await pdfParse(buffer1);
        console.log(`  Pages: ${data1.numpages}`);
        console.log(`  Text length: ${data1.text.length}`);
        console.log(`  Preview: "${data1.text.substring(0, 100).replace(/\s+/g, ' ')}..."`);
        
        // Method 2: Buffer copy
        console.log('\n[Method 2: Buffer Copy]');
        const buffer2 = await fs.readFile(filePath);
        const bufferCopy = Buffer.from(buffer2);
        const data2 = await pdfParse(bufferCopy);
        console.log(`  Pages: ${data2.numpages}`);
        console.log(`  Text length: ${data2.text.length}`);
        console.log(`  Preview: "${data2.text.substring(0, 100).replace(/\s+/g, ' ')}..."`);
        
        // Method 3: Buffer allocUnsafe
        console.log('\n[Method 3: Buffer AllocUnsafe]');
        const buffer3 = await fs.readFile(filePath);
        const bufferNew = Buffer.allocUnsafe(buffer3.length);
        buffer3.copy(bufferNew);
        const data3 = await pdfParse(bufferNew);
        console.log(`  Pages: ${data3.numpages}`);
        console.log(`  Text length: ${data3.text.length}`);
        console.log(`  Preview: "${data3.text.substring(0, 100).replace(/\s+/g, ' ')}..."`);
        
        // Check if all methods produce same result
        const same12 = data1.text === data2.text;
        const same23 = data2.text === data3.text;
        console.log(`\n  All methods match: ${same12 && same23 ? '✓ YES' : '✗ NO'}`);
        
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        console.error(`  Stack: ${error.stack}`);
      }
    }
    
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

testPDFExtraction();
