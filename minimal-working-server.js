// minimal-working-server.js - Just the essentials to make thumbs down work
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WORKING improve-response endpoint
app.post('/api/improve-response', async (req, res) => {
  console.log('🔥 IMPROVE-RESPONSE ENDPOINT HIT!');
  console.log('Body received:', req.body);
  
  try {
    const { userQuery, badResponse } = req.body;
    
    if (!userQuery || !badResponse) {
      console.log('❌ Missing data');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing userQuery or badResponse' 
      });
    }

    console.log(`👎 Processing: "${userQuery}"`);
    
    // For now, create a simple improved response
    const improvedResponse = `Here's a better answer about ${userQuery}: This response has been improved based on your feedback. Thank you for helping make the chatbot better!`;
    
    // Simple training data (you can add OpenAI integration later)
    const simpleTrainingEntry = {
      pattern: `/(${userQuery.toLowerCase().replace(/[^\w\s]/g, '').trim()})/i`,
      responses: [improvedResponse]
    };
    
    // Try to save to responseData.js
    let saveSuccess = false;
    try {
      saveSuccess = await saveToResponseData(simpleTrainingEntry);
      console.log('💾 Save result:', saveSuccess);
    } catch (saveError) {
      console.log('⚠️ Save failed:', saveError.message);
    }
    
    console.log('✅ Sending success response');
    res.json({
      success: true,
      newResponse: improvedResponse,
      trainingAdded: saveSuccess,
      message: saveSuccess ? 'Response improved and saved!' : 'Response improved (save failed)'
    });
    
  } catch (error) {
    console.error('💥 Error in improve-response:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple function to save to responseData.js
async function saveToResponseData(newEntry) {
  const filename = 'responseData.js';
  
  try {
    let existingData = { userdata: [] };
    
    // Read existing file if it exists
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf8');
      const match = content.match(/const responses = ({[\s\S]*?});/);
      if (match) {
        try {
          existingData = eval('(' + match[1] + ')');
        } catch (evalError) {
          console.log('⚠️ Could not parse existing data, starting fresh');
        }
      }
    }
    
    // Ensure userdata array exists
    if (!existingData.userdata) {
      existingData.userdata = [];
    }
    
    // Add new entry
    existingData.userdata.push(newEntry);
    
    // Write back to file
    let jsContent = 'const responses = {\n';
    for (const [domain, entries] of Object.entries(existingData)) {
      if (Array.isArray(entries) && entries.length > 0) {
        jsContent += `  ${domain}: [\n`;
        entries.forEach((entry, index) => {
          if (entry && entry.pattern && Array.isArray(entry.responses)) {
            jsContent += `    { pattern: ${entry.pattern}, responses: ${JSON.stringify(entry.responses)} }`;
            jsContent += index < entries.length - 1 ? ',\n' : '\n';
          }
        });
        jsContent += '  ],\n';
      }
    }
    jsContent += '};\n\nexport default responses;';
    
    fs.writeFileSync(filename, jsContent);
    console.log(`💾 Saved to ${filename} - Total userdata entries: ${existingData.userdata.length}`);
    return true;
    
  } catch (error) {
    console.error('❌ Save error:', error.message);
    return false;
  }
}

// Feed knowledge endpoint (simple version)
app.post('/api/feed-knowledge', (req, res) => {
  console.log('📝 Feed knowledge endpoint hit');
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }
  
  // Simple response for now
  res.json({
    success: true,
    message: 'Knowledge feed processed',
    patterns: [question]
  });
});

// Catch-all 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    requested: `${req.method} ${req.url}`,
    available: [
      'GET /',
      'GET /api/health', 
      'POST /api/improve-response',
      'POST /api/feed-knowledge'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 MINIMAL SERVER STARTED');
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log('🎯 Available endpoints:');
  console.log('   GET  / (main page)');
  console.log('   GET  /api/health');
  console.log('   POST /api/improve-response ⭐️');
  console.log('   POST /api/feed-knowledge');
  console.log('\n✅ Ready to test thumbs down functionality!');
  console.log('📝 Watch console for detailed request logs');
});

module.exports = app;