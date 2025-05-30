// debug-server.js - Minimal server for debugging
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple improve-response endpoint (no OpenAI for now)
app.post('/api/improve-response', (req, res) => {
  console.log('🔥 improve-response endpoint hit!');
  console.log('Request body:', req.body);
  
  const { userQuery, badResponse } = req.body;
  
  if (!userQuery || !badResponse) {
    console.log('❌ Missing userQuery or badResponse');
    return res.status(400).json({ error: 'Missing userQuery or badResponse' });
  }
  
  console.log(`👎 Processing thumbs down for: "${userQuery}"`);
  
  // Simple mock response for testing
  const mockImprovedResponse = `Here's a better answer to "${userQuery}": This is an improved response that provides more helpful information.`;
  
  console.log('✅ Sending mock improved response');
  
  res.json({
    success: true,
    newResponse: mockImprovedResponse,
    trainingAdded: false, // Set to false for debugging
    message: 'Mock response generated successfully'
  });
});

// Feed knowledge endpoint (simple version)
app.post('/api/feed-knowledge', (req, res) => {
  console.log('📝 feed-knowledge endpoint hit!');
  console.log('Request body:', req.body);
  
  const { question } = req.body;
  
  if (!question) {
    console.log('❌ Missing question');
    return res.status(400).json({ error: 'Missing question' });
  }
  
  console.log(`📝 Processing feed knowledge for: "${question}"`);
  
  res.json({
    success: true,
    message: 'Mock knowledge feed processed',
    patterns: [question],
    responses: [`Mock response for: ${question}`]
  });
});

// Serve main page
app.get('/', (req, res) => {
  console.log('🏠 Serving main page');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'POST /api/improve-response',
      'POST /api/feed-knowledge'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 DEBUG SERVER STARTED');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('🔍 This is a debug version to identify the issue');
  console.log('\n📋 Available endpoints:');
  console.log('   GET  / (main page)');
  console.log('   GET  /api/health');
  console.log('   GET  /api/test');
  console.log('   POST /api/improve-response');
  console.log('   POST /api/feed-knowledge');
  console.log('\n🧪 Test the server:');
  console.log('   1. Open http://localhost:3000 in browser');
  console.log('   2. Try clicking thumbs down');
  console.log('   3. Check console for detailed logs');
  console.log('\n⚠️  This debug version does NOT use OpenAI or save to files');
});

module.exports = app;