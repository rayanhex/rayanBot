// Response Format Converter - Fixes existing response files
const fs = require('fs');

function convertResponseFormat(inputFile, outputFile = 'converted_responses.js') {
  try {
    console.log(`🔄 Converting ${inputFile} to proper format...`);
    
    // Read the file
    let content = fs.readFileSync(inputFile, 'utf8');
    
    // Fix common formatting issues
    content = content
      // Fix missing commas and brackets
      .replace(/\]\s*\}/g, '] }')
      // Fix multiline arrays to single line
      .replace(/responses:\s*\[\s*\n\s*"/g, 'responses: ["')
      .replace(/",\s*\n\s*"/g, '", "')
      .replace(/"\s*\n\s*\]/g, '"]')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      // Fix bracket spacing
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']')
      // Ensure proper line breaks between entries
      .replace(/\}\s*,\s*\{/g, '},\n    {')
      // Fix domain formatting
      .replace(/(\w+):\s*\[/g, '  $1: [\n    ')
      .replace(/\]\s*,\s*(\w+):/g, '\n  ],\n  $1:')
      .replace(/\]\s*\}\s*;/, '\n  ]\n};\n\nmodule.exports = responses;');
    
    // Write the corrected file
    fs.writeFileSync(outputFile, content);
    
    console.log(`✅ Converted file saved as ${outputFile}`);
    console.log(`💡 Test the file by running: node -c ${outputFile}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);
    return false;
  }
}

// Advanced converter that parses and rebuilds the structure
function deepConvertFormat(inputFile, outputFile = 'properly_formatted_responses.js') {
  try {
    console.log(`🔧 Deep converting ${inputFile}...`);
    
    // Read and evaluate the file content safely
    let content = fs.readFileSync(inputFile, 'utf8');
    
    // Extract the responses object more carefully
    let responses = {};
    
    // Try to extract each domain section
    const domainMatches = content.match(/(\w+):\s*\[[\s\S]*?\]/g);
    
    if (domainMatches) {
      domainMatches.forEach(match => {
        const domainName = match.match(/(\w+):/)[1];
        
        // Extract entries for this domain
        const entryMatches = match.match(/\{\s*pattern:[^}]+\}/g);
        
        if (entryMatches) {
          responses[domainName] = [];
          
          entryMatches.forEach(entryStr => {
            try {
              // Extract pattern
              const patternMatch = entryStr.match(/pattern:\s*(\/.+?\/i)/);
              
              // Extract responses array
              const responsesMatch = entryStr.match(/responses:\s*\[([\s\S]*?)\]/);
              
              if (patternMatch && responsesMatch) {
                const pattern = patternMatch[1];
                
                // Parse responses more carefully
                const responsesStr = responsesMatch[1];
                const responseItems = responsesStr.split('",').map(item => 
                  item.replace(/^\s*"/, '').replace(/"\s*$/, '').trim()
                ).filter(item => item.length > 0);
                
                responses[domainName].push({
                  pattern: pattern,
                  responses: responseItems
                });
              }
            } catch (err) {
              console.warn(`⚠️  Skipped malformed entry in ${domainName}`);
            }
          });
        }
      });
    }
    
    // Generate properly formatted output
    let jsContent = 'const responses = {\n';
    
    for (const [domain, entries] of Object.entries(responses)) {
      if (Array.isArray(entries) && entries.length > 0) {
        jsContent += `  ${domain}: [\n`;
        
        entries.forEach((entry, index) => {
          if (entry && entry.pattern && Array.isArray(entry.responses)) {
            const responsesJson = JSON.stringify(entry.responses);
            jsContent += `    { pattern: ${entry.pattern}, responses: ${responsesJson} }`;
            jsContent += index < entries.length - 1 ? ',\n' : '\n';
          }
        });
        
        jsContent += '  ],\n';
      }
    }
    
    jsContent += '};\n\nmodule.exports = responses;';
    
    fs.writeFileSync(outputFile, jsContent);
    
    console.log(`✅ Deep conversion completed: ${outputFile}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Deep conversion failed: ${error.message}`);
    return false;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'responses.js';
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    console.log('Usage: node converter.js <input_file>');
    return;
  }
  
  console.log('🚀 Starting response format conversion...\n');
  
  // Try simple conversion first
  const simpleSuccess = convertResponseFormat(inputFile, 'simple_converted.js');
  
  // Try deep conversion as backup
  const deepSuccess = deepConvertFormat(inputFile, 'deep_converted.js');
  
  if (simpleSuccess || deepSuccess) {
    console.log('\n✅ Conversion completed!');
    console.log('📁 Files created:');
    if (simpleSuccess) console.log('   - simple_converted.js');
    if (deepSuccess) console.log('   - deep_converted.js');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the converted file: node -c converted_file.js');
    console.log('   2. Replace your original file when satisfied');
    console.log('   3. Use the new training generator for future additions');
  } else {
    console.log('❌ Both conversion methods failed. Manual fixing required.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertResponseFormat, deepConvertFormat };