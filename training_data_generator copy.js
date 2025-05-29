// ERROR-FREE Training Data Generator - OpenAI Only with Topic Cycling
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI with error checking and environment variable
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY; // Use environment variable
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }
  
  openai = new OpenAI({
    apiKey: apiKey
  });
} catch (error) {
  console.error('❌ OpenAI initialization failed. Please check your API key.');
  console.error('   Set your API key as an environment variable: export OPENAI_API_KEY=your_key_here');
  process.exit(1);
}

// Training Data Generator with Topic Cycling
class TrainingDataGenerator {
  constructor() {
    this.domains = {
        geography: [
          'capital of Afghanistan',
          'population of Afghanistan',
          'capital of Albania',
          'population of Albania',
          'capital of Algeria',
          'population of Algeria',
          'capital of Argentina',
          'population of Argentina',
          'capital of Armenia',
          'population of Armenia',
          'capital of Australia',
          'population of Australia',
          'capital of Austria',
          'population of Austria',
          'capital of Azerbaijan',
          'population of Azerbaijan',
          'capital of Bahrain',
          'population of Bahrain',
          'capital of Bangladesh',
          'population of Bangladesh',
          'capital of Belarus',
          'population of Belarus',
          'capital of Belgium',
          'population of Belgium',
          'capital of Bolivia',
          'population of Bolivia',
          'capital of Bosnia',
          'population of Bosnia',
          'capital of Botswana',
          'population of Botswana',
          'capital of Brazil',
          'population of Brazil',
          'capital of Bulgaria',
          'population of Bulgaria',
          'capital of Cambodia',
          'population of Cambodia',
          'capital of Cameroon',
          'population of Cameroon',
          'capital of Canada',
          'population of Canada',
          'capital of Chile',
          'population of Chile',
          'capital of China',
          'population of China',
          'capital of Colombia',
          'population of Colombia',
          'capital of Costa Rica',
          'population of Costa Rica',
          'capital of Croatia',
          'population of Croatia',
          'capital of Cuba',
          'population of Cuba',
          'capital of Cyprus',
          'population of Cyprus',
          'capital of Czechia',
          'population of Czechia',
          'capital of Denmark',
          'population of Denmark',
          'capital of Dominican Republic',
          'population of Dominican Republic',
          'capital of Ecuador',
          'population of Ecuador',
          'capital of Egypt',
          'population of Egypt',
          'capital of Estonia',
          'population of Estonia',
          'capital of Ethiopia',
          'population of Ethiopia',
          'capital of Finland',
          'population of Finland',
          'capital of France',
          'population of France',
          'capital of Georgia',
          'population of Georgia',
          'capital of Germany',
          'population of Germany',
          'capital of Ghana',
          'population of Ghana',
          'capital of Greece',
          'population of Greece',
          'capital of Guatemala',
          'population of Guatemala',
          'capital of Hungary',
          'population of Hungary',
          'capital of Iceland',
          'population of Iceland',
          'capital of India',
          'population of India',
          'capital of Indonesia',
          'population of Indonesia',
          'capital of Iran',
          'population of Iran',
          'capital of Iraq',
          'population of Iraq',
          'capital of Ireland',
          'population of Ireland',
          'capital of Israel',
          'population of Israel',
          'capital of Italy',
          'population of Italy',
          'capital of Jamaica',
          'population of Jamaica',
          'capital of Japan',
          'population of Japan',
          'capital of Jordan',
          'population of Jordan',
          'capital of Kazakhstan',
          'population of Kazakhstan',
          'capital of Kenya',
          'population of Kenya',
          'capital of Korea, Republic of',
          'population of Korea, Republic of',
          'capital of Kuwait',
          'population of Kuwait',
          'capital of Latvia',
          'population of Latvia',
          'capital of Lebanon',
          'population of Lebanon',
          'capital of Libya',
          'population of Libya',
          'capital of Lithuania',
          'population of Lithuania',
          'capital of Malaysia',
          'population of Malaysia',
          'capital of Mexico',
          'population of Mexico',
          'capital of Mongolia',
          'population of Mongolia',
          'capital of Morocco',
          'population of Morocco',
          'capital of Myanmar',
          'population of Myanmar',
          'capital of Nepal',
          'population of Nepal',
          'capital of Netherlands',
          'population of Netherlands',
          'capital of New Zealand',
          'population of New Zealand',
          'capital of Nigeria',
          'population of Nigeria',
          'capital of Norway',
          'population of Norway',
          'capital of Pakistan',
          'population of Pakistan',
          'capital of Panama',
          'population of Panama',
          'capital of Peru',
          'population of Peru',
          'capital of Philippines',
          'population of Philippines',
          'capital of Poland',
          'population of Poland',
          'capital of Portugal',
          'population of Portugal',
          'capital of Qatar',
          'population of Qatar',
          'capital of Romania',
          'population of Romania',
          'capital of Russian Federation',
          'population of Russian Federation',
          'capital of Saudi Arabia',
          'population of Saudi Arabia',
          'capital of Singapore',
          'population of Singapore',
          'capital of Slovakia',
          'population of Slovakia',
          'capital of Slovenia',
          'population of Slovenia',
          'capital of South Africa',
          'population of South Africa',
          'capital of Korea',
          'population of Korea',
          'capital of Spain',
          'population of Spain',
          'capital of Sri Lanka',
          'population of Sri Lanka',
          'capital of Sweden',
          'population of Sweden',
          'capital of Switzerland',
          'population of Switzerland',
          'capital of Thailand',
          'population of Thailand',
          'capital of Turkey',
          'population of Turkey',
          'capital of Ukraine',
          'population of Ukraine',
          'capital of United Arab Emirates',
          'population of United Arab Emirates',
          'capital of United Kingdom',
          'population of United Kingdom',
          'capital of United States',
          'population of United States',
          'capital of Uruguay',
          'population of Uruguay',
          'capital of Uzbekistan',
          'population of Uzbekistan',
          'capital of Venezuela',
          'population of Venezuela',
          'capital of Vietnam',
          'population of Vietnam',
        ]
    };
    
    // File to track progress
    this.progressFile = 'topic_progress.json';
    this.progress = this.loadProgress();
    
    // Track generated topics to avoid duplicates within a session
    this.generatedTopics = new Set();
  }

  // Load progress from file
  loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const data = fs.readFileSync(this.progressFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('⚠️  Could not load progress file, starting fresh');
    }
    
    // Initialize progress for all domains
    const initialProgress = {};
    Object.keys(this.domains).forEach(domain => {
      initialProgress[domain] = 0;
    });
    return initialProgress;
  }

  // Save progress to file
  saveProgress() {
    try {
      fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
    } catch (error) {
      console.error('⚠️  Could not save progress:', error.message);
    }
  }

  // Get next batch of topics for a domain
  getNextTopics(domain, batchSize = 60) { // batch size
    const topics = this.domains[domain];
    if (!topics) return [];
    
    const startIndex = this.progress[domain] || 0;
    const endIndex = Math.min(startIndex + batchSize, topics.length);
    
    if (startIndex >= topics.length) {
      console.log(`  ✅ All topics completed for ${domain} domain!`);
      return [];
    }
    
    const nextTopics = topics.slice(startIndex, endIndex);
    
    // Update progress
    this.progress[domain] = endIndex;
    
    console.log(`  📍 Processing topics ${startIndex + 1}-${endIndex} of ${topics.length} for ${domain}`);
    
    return nextTopics;
  }

  // Check if all topics are completed
  isAllTopicsCompleted() {
    return Object.entries(this.domains).every(([domain, topics]) => {
      return (this.progress[domain] || 0) >= topics.length;
    });
  }

  // Reset progress for a specific domain or all domains
  resetProgress(domain = null) {
    if (domain && this.domains[domain]) {
      this.progress[domain] = 0;
      console.log(`🔄 Reset progress for ${domain} domain`);
    } else {
      Object.keys(this.domains).forEach(d => {
        this.progress[d] = 0;
      });
      console.log('🔄 Reset progress for all domains');
    }
    this.saveProgress();
  }

  // Show current progress
  showProgress() {
    console.log('\n📊 Current Progress:');
    console.log('==================');
    
    let totalTopics = 0;
    let completedTopics = 0;
    
    Object.entries(this.domains).forEach(([domain, topics]) => {
      const completed = this.progress[domain] || 0;
      const total = topics.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      console.log(`${domain.padEnd(15)}: ${completed.toString().padStart(2)}/${total.toString().padStart(2)} (${percentage.toString().padStart(3)}%)`);
      
      totalTopics += total;
      completedTopics += completed;
    });
    
    const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    console.log('==================');
    console.log(`${'TOTAL'.padEnd(15)}: ${completedTopics.toString().padStart(2)}/${totalTopics.toString().padStart(2)} (${overallPercentage.toString().padStart(3)}%)`);
    console.log('');
  }

  // Validate and clean topic string
  validateTopic(topic) {
    if (!topic || typeof topic !== 'string') {
      return null;
    }
    return topic.trim().toLowerCase();
  }

  // Safely escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async generateCompleteEntry(topic, domain) {
    const validatedTopic = this.validateTopic(topic);
    if (!validatedTopic) {
      console.log(`  ⚠️  Invalid topic: ${topic}`);
      return null;
    }

    // Check for duplicates
    const topicKey = `${domain}-${validatedTopic}`;
    if (this.generatedTopics.has(topicKey)) {
      console.log(`  ⚠️  Skipping duplicate: ${validatedTopic}`);
      return null;
    }
    
    this.generatedTopics.add(topicKey);

    const prompt = `You are creating training data for a chatbot. The topic is "${validatedTopic}" in the ${domain} domain.

CRITICAL INSTRUCTIONS:
1. QUESTIONS section = 5 different ways to ask about THE SAME SPECIFIC THING related to "${validatedTopic}"
2. RESPONSES section = 5 different answers that ALL address the SAME specific aspect of "${validatedTopic}"

QUESTIONS should be:
- 5 variations of asking about the SAME specific thing
- Same core question, just reworded differently
- Focus on ONE specific aspect of the topic
- Keywords like "tips", "help", "how to", "advice" but all about the SAME thing

RESPONSES should be:
- 5 different ways to give advice about the SAME thing
- All responses address the SAME specific issue
- NO NUMBERING (no "1.", "2.", etc.)
- Vary the wording but keep the core advice consistent

GOOD EXAMPLE for "better sleep":
QUESTIONS: (all asking about the same thing - bedtime routine)
better sleep routine
bedtime routine tips
nighttime routine help
sleep routine advice
establish sleep routine

RESPONSES: (all about creating a bedtime routine, just worded differently)
Try establishing a consistent bedtime routine every night.
Create a relaxing routine before bed to signal it's time to sleep.
Develop regular pre-sleep habits that help you wind down.
Having the same bedtime activities each night improves sleep quality.
A consistent evening routine helps your body prepare for rest.

BAD EXAMPLE (DON'T DO THIS):
QUESTIONS: sleep tips, insomnia help, bedroom temperature, sleep schedule, caffeine effects
^ These are 5 DIFFERENT topics, not variations of the same question

Now generate for "${validatedTopic}" - pick ONE specific aspect and create 5 variations:

QUESTIONS:
[5 ways to ask about the SAME specific thing related to ${validatedTopic}]

RESPONSES:
[5 different ways to answer that SAME specific question about ${validatedTopic}]`;

    try {
      if (!openai) {
        throw new Error('OpenAI not initialized');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Updated to use gpt-4o-mini
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid OpenAI response format');
      }

      return this.parseOpenAIResponse(response.choices[0].message.content, validatedTopic);
    } catch (error) {
      console.error(`  ❌ OpenAI error for ${validatedTopic}:`, error.message);
      return this.createFallbackEntry(validatedTopic);
    }
  }

  parseOpenAIResponse(content, topic) {
    try {
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
      }

      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      // Find questions and responses sections
      const questionStart = lines.findIndex(line => line.toUpperCase().includes('QUESTION'));
      const responseStart = lines.findIndex(line => line.toUpperCase().includes('RESPONSE'));
      
      let questions = [];
      let responses = [];
      
      if (questionStart !== -1 && responseStart !== -1 && responseStart > questionStart) {
        // Extract questions (user input patterns)
        for (let i = questionStart + 1; i < responseStart; i++) {
          if (lines[i] && !lines[i].toUpperCase().includes('RESPONSE')) {
            let cleanQuestion = lines[i]
              .replace(/^[-*•]\s*/, '')
              .replace(/^\d+\.\s*/, '') // Remove numbers
              .trim();
            
            // Skip if it looks like advice instead of a query
            if (!cleanQuestion.toLowerCase().includes('try ') && 
                !cleanQuestion.toLowerCase().includes('avoid ') &&
                !cleanQuestion.toLowerCase().includes('create ') &&
                !cleanQuestion.toLowerCase().includes('keep ') &&
                !cleanQuestion.toLowerCase().includes('consider ') &&
                cleanQuestion.length > 0 && cleanQuestion.length < 50) {
              questions.push(cleanQuestion);
            }
          }
        }
        
        // Extract responses (AI advice)
        for (let i = responseStart + 1; i < lines.length; i++) {
          if (lines[i]) {
            let cleanResponse = lines[i]
              .replace(/^[-*•]\s*/, '')
              .replace(/^\d+\.\s*/, '') // Remove numbers
              .trim();
            
            if (cleanResponse.length > 10 && cleanResponse.length < 200) {
              responses.push(cleanResponse);
            }
          }
        }
      }
      
      // Fallback: extract any reasonable looking questions and responses
      if (questions.length < 3) {
        questions = lines.filter(line => {
          const lower = line.toLowerCase();
          return (
            line.length < 50 &&
            line.length > 3 &&
            !lower.includes('try ') &&
            !lower.includes('avoid ') &&
            !lower.includes('create ') &&
            !lower.includes('consider ') &&
            (lower.includes(topic) || lower.includes('tips') || lower.includes('help') || lower.includes('advice'))
          );
        }).slice(0, 5);
      }
      
      if (responses.length < 3) {
        responses = lines.filter(line => {
          const lower = line.toLowerCase();
          return (
            line.length > 15 && 
            line.length < 200 &&
            !lower.includes('question') &&
            !lower.includes('response') &&
            (lower.includes('try') || lower.includes('consider') || lower.includes('focus') || lower.includes(topic))
          );
        }).slice(0, 5);
      }
      
      // Final fallback with proper format
      if (questions.length === 0) {
        questions = [
          topic,
          `${topic} tips`,
          `${topic} help`,
          `${topic} advice`,
          `${topic} guide`
        ];
      }
      
      if (responses.length === 0) {
        responses = [
          `Here's helpful advice about ${topic}.`,
          `Try focusing on the fundamentals of ${topic}.`,
          `Consider practicing ${topic} regularly for improvement.`,
          `Start with the basics when learning about ${topic}.`,
          `Getting guidance can really help with ${topic}.`
        ];
      }
      
      return {
        questions: questions.slice(0, 5),
        responses: responses.slice(0, 5)
      };
      
    } catch (error) {
      console.error(`  ⚠️  Parsing error for ${topic}, using fallback`);
      return this.createFallbackEntry(topic);
    }
  }

  createFallbackEntry(topic) {
    const validatedTopic = this.validateTopic(topic) || 'general topic';
    
    return {
      questions: [
        validatedTopic,
        `${validatedTopic} tips`,
        `${validatedTopic} help`,
        `how to ${validatedTopic}`,
        `${validatedTopic} advice`
      ],
      responses: [
        `Here's helpful advice about ${validatedTopic}.`,
        `Try focusing on the fundamentals of ${validatedTopic}.`,
        `Consider practicing ${validatedTopic} regularly for improvement.`,
        `Start with the basics when learning about ${validatedTopic}.`,
        `Getting guidance can really help with ${validatedTopic}.`
      ]
    };
  }

  formatAsTrainingData(questions, responses) {
    try {
      if (!Array.isArray(questions) || !Array.isArray(responses)) {
        throw new Error('Invalid input arrays');
      }

      // Clean up questions to remove filler words and validate
      const cleanedQuestions = questions
        .filter(q => q && typeof q === 'string')
        .map(q => {
          return q.toLowerCase()
            .replace(/^(how to|how do i|what are|do you have any|can you give me|tell me about|what is the best way to|how can i)\s+/i, '')
            .replace(/\?$/, '')
            .replace(/[^\w\s]/g, '')
            .trim();
        })
        .filter(q => q.length > 0)
        .slice(0, 5);
      
      // Ensure we have at least one valid question
      if (cleanedQuestions.length === 0) {
        cleanedQuestions.push('general help');
      }

      // Escape special regex characters and create pattern
      const escapedQuestions = cleanedQuestions.map(q => this.escapeRegex(q));
      const patternString = escapedQuestions.join('|');
      
      // Validate responses
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

  async generateForDomain(domainName, topicsPerBatch = 60) {
    console.log(`\n🔄 Processing ${domainName} domain...`);
    const domainData = [];
    
    const topics = this.getNextTopics(domainName, topicsPerBatch);

    if (topics.length === 0) {
      console.log(`  ✅ No more topics to process for ${domainName}`);
      return domainData;
    }

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.log(`  📝 Generating data for: ${topic}`);

      try {
        const entry = await this.generateCompleteEntry(topic, domainName);
        
        // Skip if duplicate was detected or entry is invalid
        if (entry === null || !entry.questions || !entry.responses) {
          continue;
        }
        
        const formattedEntry = this.formatAsTrainingData(entry.questions, entry.responses);
        if (formattedEntry && formattedEntry.pattern && formattedEntry.responses) {
          domainData.push(formattedEntry);
        }
        
        // Rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`  ❌ Error processing ${topic}:`, error.message);
        // Add fallback entry
        try {
          const fallback = this.createFallbackEntry(topic);
          const formattedFallback = this.formatAsTrainingData(fallback.questions, fallback.responses);
          if (formattedFallback && formattedFallback.pattern && formattedFallback.responses) {
            domainData.push(formattedFallback);
          }
        } catch (fallbackError) {
          console.error(`  ❌ Fallback also failed for ${topic}:`, fallbackError.message);
        }
      }
    }

    return domainData;
  }

  async generateAllDomains(topicsPerBatch = 5) {
    const allTrainingData = {};
    
    for (const [domainName] of Object.entries(this.domains)) {
      try {
        console.log(`\n🚀 Starting ${domainName} domain...`);
        allTrainingData[domainName] = await this.generateForDomain(domainName, topicsPerBatch);
        console.log(`✅ Generated ${allTrainingData[domainName].length} entries for ${domainName}`);
      } catch (error) {
        console.error(`❌ Failed to process ${domainName}:`, error.message);
        allTrainingData[domainName] = [];
      }
    }

    // Save progress after each run
    this.saveProgress();

    return allTrainingData;
  }

  formatAsJavaScript(trainingData) {
    try {
      let jsContent = 'const responses = {\n';
      
      for (const [domain, entries] of Object.entries(trainingData)) {
        if (Array.isArray(entries) && entries.length > 0) {
          jsContent += `  ${domain}: [\n`;
          
          entries.forEach((entry, index) => {
            if (entry && entry.pattern && Array.isArray(entry.responses)) {
              // Format exactly as requested: pattern on one line, responses properly formatted
              jsContent += `    { pattern: ${entry.pattern}, responses: ${JSON.stringify(entry.responses, null, 0)} }`;
              jsContent += index < entries.length - 1 ? ',\n' : '\n';
            }
          });
          
          jsContent += '  ],\n';
        }
      }
      
      jsContent += '};\n\nmodule.exports = responses;';
      return jsContent;
    } catch (error) {
      console.error('Error formatting JavaScript:', error.message);
      return 'const responses = {};\nmodule.exports = responses;';
    }
  }

  async appendToFile(trainingData, filename = 'responseData.js') {
    try {
      let existingContent = '';
      let existingData = {};
      
      // Check if file exists and read existing content
      if (fs.existsSync(filename)) {
        try {
          existingContent = fs.readFileSync(filename, 'utf8');
          // Extract existing responses object
          const match = existingContent.match(/const responses = ({[\s\S]*?});/);
          if (match) {
            // Safely evaluate the existing responses object
            existingData = eval('(' + match[1] + ')');
          }
        } catch (error) {
          console.log('⚠️  Could not parse existing file, creating backup...');
          fs.writeFileSync(filename + '.backup', existingContent);
        }
      }
      
      // Merge new data with existing data
      for (const [domain, entries] of Object.entries(trainingData)) {
        if (Array.isArray(entries) && entries.length > 0) {
          if (!existingData[domain]) {
            existingData[domain] = [];
          }
          // Append new entries to existing domain
          existingData[domain] = existingData[domain].concat(entries);
        }
      }
      
      // Format and save the combined data
      const jsContent = this.formatAsJavaScript(existingData);
      fs.writeFileSync(filename, jsContent);
      
      // Count total entries
      const totalEntries = Object.values(existingData).reduce((sum, entries) => {
        return sum + (Array.isArray(entries) ? entries.length : 0);
      }, 0);
      
      console.log(`\n💾 Training data appended to ${filename}`);
      console.log(`📊 Total entries in database: ${totalEntries}`);
      
      // Also save as JSON for backup
      const jsonFilename = filename.replace('.js', '.json');
      fs.writeFileSync(jsonFilename, JSON.stringify(existingData, null, 2));
      console.log(`💾 Backup saved as ${jsonFilename}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error saving files:', error.message);
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(ms, 1000)));
  }
}

// Main execution with comprehensive error handling
async function main() {
  console.log('🚀 Starting OpenAI Training Data Generation with Topic Cycling...\n');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  Please set your OpenAI API key as an environment variable:');
    console.log('   export OPENAI_API_KEY=your_actual_api_key_here');
    console.log('   or on Windows: set OPENAI_API_KEY=your_actual_api_key_here');
    return;
  }
  
  const generator = new TrainingDataGenerator();
  
  // Show current progress
  generator.showProgress();
  
  // Check if all topics are completed
  if (generator.isAllTopicsCompleted()) {
    console.log('🎉 All topics have been completed!');
    console.log('💡 Run with --reset to start over, or --reset-domain [domain] to reset specific domain');
    return;
  }
  
  try {
    // Generate training data for next batch (5 topics per domain)
    const trainingData = await generator.generateAllDomains(60);
    
    // Validate results
    const totalEntries = Object.values(trainingData).reduce((sum, entries) => {
      return sum + (Array.isArray(entries) ? entries.length : 0);
    }, 0);
    
    if (totalEntries === 0) {
      console.log('❌ No training data was generated. Please check your OpenAI API key and internet connection.');
      return;
    }
    
    // Save to file (append to existing)
    const saveSuccess = await generator.appendToFile(trainingData, 'responseData.js');
    
    if (saveSuccess) {
      // Print summary
      console.log(`\n✅ Complete! Generated ${totalEntries} training entries this run.`);
      console.log(`🤖 Used GPT-4o-mini model for generation`);
      console.log(`\n🎯 Domains processed this run: ${Object.keys(trainingData).filter(domain => trainingData[domain].length > 0).join(', ')}`);
      console.log(`\n📁 Files updated:`);
      console.log(`   - responseData.js (main database - keeps growing)`);
      console.log(`   - responseData.json (backup)`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Your responseData.js file now contains all entries`);
      console.log(`   2. Run the script again to add the next batch of topics`);
      console.log(`   3. Use: const responses = require('./responseData.js'); in your chatbot`);
    } else {
      console.log('❌ Failed to save files. Please check file permissions.');
    }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   - Check your OpenAI API key');
    console.log('   - Ensure you have internet connection');
    console.log('   - Verify you have sufficient OpenAI credits');
    console.log('   - Try running: npm install openai');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Run it
if (require.main === module) {
  main();
}

module.exports = TrainingDataGenerator;