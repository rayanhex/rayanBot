// server.js - Fixed version with single improve-response endpoint
const express = require('express');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable not set');
    console.log('🔧 To fix: Set your OpenAI API key as an environment variable');
    console.log('   Windows: set OPENAI_API_KEY=your-key-here');
    console.log('   Mac/Linux: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }
  
  openai = new OpenAI({ apiKey: apiKey });
  console.log('✅ OpenAI initialized successfully');
} catch (error) {
  console.error('❌ OpenAI initialization failed:', error.message);
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Utility functions
function validateTopic(topic) {
  if (!topic || typeof topic !== 'string') {
    return null;
  }
  return topic.trim().toLowerCase();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createFallbackEntry(topic) {
  const validatedTopic = validateTopic(topic) || 'general topic';
  
  return {
    questions: [
      validatedTopic,
      `${validatedTopic} tips`,
      `${validatedTopic} help`,
      `how to ${validatedTopic}`,
      `${validatedTopic} advice`
    ],
    responses: [
      `Here's helpful information about ${validatedTopic}.`,
      `Try focusing on the fundamentals of ${validatedTopic}.`,
      `Consider researching ${validatedTopic} for more details.`,
      `Start with the basics when learning about ${validatedTopic}.`,
      `Getting guidance can really help with ${validatedTopic}.`
    ]
  };
}

// Generate knowledge entry for Feed Knowledge
async function generateKnowledgeEntry(userQuestion) {
  const prompt = `You are creating training data for a chatbot based on a user's question: "${userQuestion}"

🎯 PRIMARY GOAL: Generate the MOST COMMON ways real users would ask about this topic

CRITICAL INSTRUCTIONS:
1. QUESTIONS section = 5 EXTREMELY COMMON ways users would ask about THE SAME SPECIFIC THING as "${userQuestion}"
2. RESPONSES section = 5 different helpful answers that ALL address the same question

QUESTIONS MUST BE:
- The MOST LIKELY phrases users would actually type in a chatbot
- Natural, conversational language (not formal)
- Common keywords users search for
- Simple, everyday phrasing
- All variations of the same question: "${userQuestion}"

RESPONSES should be:
- 5 different ways to give helpful information about the topic
- All responses address the SAME question
- NO NUMBERING (no "1.", "2.", etc.)
- Vary the wording but keep the core information consistent
- Provide actual helpful information, not generic responses

Now generate for user question: "${userQuestion}"

QUESTIONS:
[5 MOST COMMON ways users would naturally ask about the same thing as "${userQuestion}"]

RESPONSES:
[5 different helpful answers about "${userQuestion}"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response format');
    }

    return parseOpenAIResponse(response.choices[0].message.content, userQuestion);
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return createFallbackEntry(userQuestion);
  }
}

// Generate improved response for Thumbs Down
async function generateImprovedResponseServer(userQuery, badResponse) {
  const prompt = `A user asked: "${userQuery}"
The chatbot gave this unsatisfactory response: "${badResponse}"

Please provide a much better, helpful response to the user's question: "${userQuery}"

Your response should be:
- Directly helpful and relevant to their question
- Informative and accurate
- Natural and conversational
- Between 20-150 words
- NOT mention that the previous response was bad

Just give the improved response, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response format');
    }

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error in improvement:', error.message);
    // Fallback response
    return `I understand you're asking about ${userQuery}. Let me provide a better response with more helpful information about this topic.`;
  }
}

// Generate training data from improved response
async function generateTrainingDataFromImprovedResponse(userQuery, improvedResponse) {
  const trainingPrompt = `You are creating training data for a chatbot. A user asked: "${userQuery}" and we have a good response: "${improvedResponse}"

Generate 5 EXTREMELY COMMON ways users would ask about THE SAME THING as "${userQuery}":

QUESTIONS should be:
- Natural, conversational variations of "${userQuery}"
- Common keywords users would actually type
- Different phrasings of the same question
- Simple, everyday language

Just list the 5 question variations, one per line, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: trainingPrompt }],
      max_tokens: 150,
      temperature: 0.7
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid training data response');
    }

    const variations = response.choices[0].message.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    // If no variations, use the original query
    if (variations.length === 0) {
      variations.push(userQuery);
    }

    return {
      questions: variations,
      responses: [improvedResponse]
    };

  } catch (error) {
    console.error('Error generating training variations:', error.message);
    return {
      questions: [userQuery],
      responses: [improvedResponse]
    };
  }
}

// Parse OpenAI response
function parseOpenAIResponse(content, topic) {
  try {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    const questionStart = lines.findIndex(line => line.toUpperCase().includes('QUESTION'));
    const responseStart = lines.findIndex(line => line.toUpperCase().includes('RESPONSE'));
    
    let questions = [];
    let responses = [];
    
    if (questionStart !== -1 && responseStart !== -1 && responseStart > questionStart) {
      // Extract questions
      for (let i = questionStart + 1; i < responseStart; i++) {
        if (lines[i] && !lines[i].toUpperCase().includes('RESPONSE')) {
          let cleanQuestion = lines[i]
            .replace(/^[-*•]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .trim();
          
          if (cleanQuestion.length > 0 && cleanQuestion.length < 50) {
            questions.push(cleanQuestion);
          }
        }
      }
      
      // Extract responses
      for (let i = responseStart + 1; i < lines.length; i++) {
        if (lines[i]) {
          let cleanResponse = lines[i]
            .replace(/^[-*•]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .trim();
          
          if (cleanResponse.length > 10 && cleanResponse.length < 300) {
            responses.push(cleanResponse);
          }
        }
      }
    }
    
    // Fallback parsing
    if (questions.length < 3) {
      questions = lines.filter(line => {
        const lower = line.toLowerCase();
        return line.length < 50 && line.length > 3 && 
               (lower.includes(topic.toLowerCase()) || lower.includes('tips') || lower.includes('help'));
      }).slice(0, 5);
    }
    
    if (responses.length < 3) {
      responses = lines.filter(line => {
        return line.length > 15 && line.length < 300 && 
               !line.toLowerCase().includes('question') && 
               !line.toLowerCase().includes('response');
      }).slice(0, 5);
    }
    
    // Final fallback
    if (questions.length === 0) {
      const baseTopic = topic.toLowerCase();
      questions = [
        baseTopic,
        `${baseTopic} help`,
        `${baseTopic} tips`,
        `${baseTopic} advice`,
        `${baseTopic} guide`
      ];
    }
    
    if (responses.length === 0) {
      responses = [
        `Here's helpful information about ${topic}.`,
        `Try researching ${topic} for more details.`,
        `Consider looking into ${topic} fundamentals.`,
        `Start with the basics of ${topic}.`,
        `Getting guidance about ${topic} can be very helpful.`
      ];
    }
    
    return {
      questions: questions.slice(0, 5),
      responses: responses.slice(0, 5)
    };
  } catch (error) {
    console.error('Parsing error:', error.message);
    return createFallbackEntry(topic);
  }
}

// Format as training data
function formatAsTrainingData(questions, responses) {
  try {
    const cleanedQuestions = questions
      .filter(q => q && typeof q === 'string')
      .map(q => {
        return q.toLowerCase()
          .replace(/^(how to|how do i|what are|can you|tell me|what is)\s+/i, '')
          .replace(/\?$/, '')
          .replace(/[^\w\s]/g, '')
          .trim();
      })
      .filter(q => q.length > 0)
      .slice(0, 5);
    
    if (cleanedQuestions.length === 0) {
      cleanedQuestions.push('general help');
    }

    const escapedQuestions = cleanedQuestions.map(q => escapeRegex(q));
    const patternString = escapedQuestions.join('|');
    
    const validResponses = responses
      .filter(r => r && typeof r === 'string' && r.trim().length > 0)
      .slice(0, 5);
    
    if (validResponses.length === 0) {
      validResponses.push("I can help you with that topic.");
    }
    
    return {
      pattern: `/(${patternString})/i`,
      responses: validResponses
    };
  } catch (error) {
    console.error('Error formatting training data:', error.message);
    return {
      pattern: "/(general help)/i",
      responses: ["I can help you with that topic."]
    };
  }
}

// Append to responseData.js file
async function appendToResponseData(newEntry) {
  const filename = 'responseData.js';
  
  try {
    let existingContent = '';
    let existingData = {};
    
    // Read existing file
    if (fs.existsSync(filename)) {
      try {
        existingContent = fs.readFileSync(filename, 'utf8');
        const match = existingContent.match(/const responses = ({[\s\S]*?});/);
        
        if (match) {
          try {
            existingData = eval('(' + match[1] + ')');
          } catch (evalError) {
            // Alternative parsing method
            const tempFile = filename + '.temp.js';
            const tempContent = existingContent.replace(/export default responses;?/g, 'module.exports = responses;');
            fs.writeFileSync(tempFile, tempContent);
            
            delete require.cache[path.resolve(tempFile)];
            existingData = require(path.resolve(tempFile));
            
            fs.unlinkSync(tempFile);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not parse existing file, creating backup...');
        fs.writeFileSync(filename + '.backup', existingContent);
        existingData = {};
      }
    }
    
    // Add to userdata domain
    if (!existingData.userdata) {
      existingData.userdata = [];
    }
    existingData.userdata.push(newEntry);
    
    // Format and save
    let jsContent = 'const responses = {\n';
    
    for (const [domain, entries] of Object.entries(existingData)) {
      if (Array.isArray(entries) && entries.length > 0) {
        jsContent += `  ${domain}: [\n`;
        
        entries.forEach((entry, index) => {
          if (entry && entry.pattern && Array.isArray(entry.responses)) {
            jsContent += `    { pattern: ${entry.pattern}, responses: ${JSON.stringify(entry.responses, null, 0)} }`;
            jsContent += index < entries.length - 1 ? ',\n' : '\n';
          }
        });
        
        jsContent += '  ],\n';
      }
    }
    
    jsContent += '};\n\nexport default responses;';
    
    fs.writeFileSync(filename, jsContent);
    
    // Save JSON backup
    const jsonFilename = filename.replace('.js', '.json');
    fs.writeFileSync(jsonFilename, JSON.stringify(existingData, null, 2));
    
    console.log(`💾 Training data appended to ${filename}`);
    console.log(`📊 Total entries in database: ${Object.values(existingData).reduce((sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0), 0)}`);
    console.log(`📊 Total userdata entries: ${existingData.userdata ? existingData.userdata.length : 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error saving to responseData.js:', error.message);
    return false;
  }
}

// API endpoint for feed knowledge
app.post('/api/feed-knowledge', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid question provided' });
    }

    console.log(`📝 Processing knowledge feed for: "${question}"`);
    
    // Generate training data entry
    const entry = await generateKnowledgeEntry(question);
    const formattedEntry = formatAsTrainingData(entry.questions, entry.responses);
    
    // Save to responseData.js
    const saveSuccess = await appendToResponseData(formattedEntry);
    
    if (saveSuccess) {
      console.log(`✅ Knowledge added successfully for: "${question}"`);
      
      res.json({
        success: true,
        message: 'Knowledge added successfully!',
        patterns: entry.questions,
        responses: entry.responses
      });
    } else {
      throw new Error('Failed to save to database');
    }
    
  } catch (error) {
    console.error('Feed knowledge error:', error.message);
    res.status(500).json({
      error: 'Failed to process knowledge feed',
      message: error.message
    });
  }
});

// SINGLE API endpoint for improving responses via thumbs down
app.post('/api/improve-response', async (req, res) => {
  try {
    const { userQuery, badResponse } = req.body;
    
    if (!userQuery || !badResponse) {
      return res.status(400).json({ error: 'Missing userQuery or badResponse' });
    }

    console.log(`👎 Processing thumbs down feedback for: "${userQuery}"`);
    
    // Generate improved response
    const improvedResponse = await generateImprovedResponseServer(userQuery, badResponse);
    console.log(`✅ Generated improved response: "${improvedResponse}"`);
    
    // Generate training data for this improvement
    const trainingData = await generateTrainingDataFromImprovedResponse(userQuery, improvedResponse);
    console.log(`✅ Generated training variations:`, trainingData.questions);
    
    // Format the training data entry EXACTLY like Feed Knowledge does
    const formattedEntry = formatAsTrainingData(trainingData.questions, [improvedResponse]);
    console.log(`✅ Formatted training entry:`, formattedEntry);
    
    // Save to responseData.js using the SAME function as Feed Knowledge
    console.log(`💾 Saving improved response to responseData.js...`);
    const saveSuccess = await appendToResponseData(formattedEntry);
    
    if (saveSuccess) {
      console.log(`✅ Response improved and saved to responseData.js for: "${userQuery}"`);
      
      res.json({
        success: true,
        newResponse: improvedResponse,
        trainingAdded: true,
        patterns: trainingData.questions,
        message: 'Response improved and saved to database'
      });
    } else {
      throw new Error('Failed to save improved response to responseData.js');
    }
    
  } catch (error) {
    console.error('👎 Improve response error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to improve response',
      message: error.message
    });
  }
});

// Serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // or whatever your HTML file is named
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openai: openai ? 'connected' : 'not connected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Knowledge Feed Server running on http://localhost:${PORT}`);
  console.log(`💡 OpenAI API key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`📁 Ready to accept knowledge feeds and thumbs down improvements`);
  console.log(`🎯 Available endpoints:`);
  console.log(`   - GET  / (Main chatbot interface)`);
  console.log(`   - POST /api/feed-knowledge (Feed Knowledge feature)`);
  console.log(`   - POST /api/improve-response (Thumbs Down feature)`);
  console.log(`   - GET  /api/health (Server health check)`);
  console.log(`\n🔧 Make sure to run: npm install express openai`);
  console.log(`🔧 Set your OpenAI API key: export OPENAI_API_KEY=your-key-here`);
});

module.exports = app;