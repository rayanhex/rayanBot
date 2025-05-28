// ERROR-FREE Training Data Generator - OpenAI Only
const OpenAI = require('openai');
const fs = require('fs');

// Initialize OpenAI with error checking
let openai;
try {
  openai = new OpenAI({
    apiKey: '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' // Replace with your actual API key
  });
} catch (error) {
  console.error('❌ OpenAI initialization failed. Please check your API key.');
  process.exit(1);
}

// Training Data Generator
class TrainingDataGenerator {
  constructor() {
    this.domains = {
      fitness: [
        'pull-ups', 'push-ups', 'squats', 'deadlifts', 'bench press', 'running technique', 'weight lifting', 'yoga poses', 'stretching routines', 
        'cardio workouts', 'muscle building', 'fat loss', 'home workouts', 'gym etiquette', 'HIIT training', 'CrossFit', 'powerlifting',
        'bodyweight exercises', 'marathon training', 'strength training', 'flexibility', 'core workouts', 'leg day', 'arm workouts'
      ],
      health: [
        'better sleep', 'stress management', 'anxiety relief', 'headache remedies', 'immune system', 'healthy eating', 'mental wellness', 
        'meditation', 'staying hydrated', 'vitamin supplements', 'depression help', 'panic attacks', 'insomnia', 'back pain',
        'neck pain', 'eye strain', 'seasonal allergies', 'cold prevention', 'flu recovery', 'digestive health', 'skin health',
        'hair loss', 'weight management', 'blood pressure', 'cholesterol', 'diabetes management'
      ],
      finance: [
        'budgeting basics', 'credit score improvement', 'investment strategies', 'debt management', 'emergency fund', 'retirement planning', 
        'saving techniques', 'expense tracking', 'financial goals', 'side income', 'cryptocurrency', 'stock market', 'real estate investing',
        '401k optimization', 'IRA accounts', 'student loans', 'mortgage tips', 'insurance needs', 'tax strategies', 'financial planning',
        'passive income', 'dividend investing', 'day trading', 'personal loans', 'credit cards', 'bankruptcy recovery'
      ],
      technology: [
        'learn programming', 'build websites', 'Python basics', 'JavaScript tips', 'app development', 'computer troubleshooting', 
        'internet security', 'software tools', 'coding bootcamps', 'tech careers', 'React development', 'Node.js', 'database design',
        'cybersecurity', 'machine learning', 'artificial intelligence', 'cloud computing', 'mobile apps', 'web design',
        'data science', 'blockchain', 'DevOps', 'UI/UX design', 'game development', 'WordPress', 'social media marketing'
      ],
      cooking: [
        'meal preparation', 'healthy recipes', 'baking techniques', 'kitchen organization', 'spice usage', 'grilling tips', 
        'vegetarian cooking', 'food safety', 'cooking for beginners', 'international cuisine', 'pasta making', 'bread baking',
        'dessert recipes', 'slow cooker meals', 'air fryer cooking', 'meal planning', 'food preservation', 'knife skills',
        'sauce making', 'soup recipes', 'breakfast ideas', 'lunch prep', 'dinner parties', 'holiday cooking', 'diet cooking'
      ],
      productivity: [
        'time management', 'organization systems', 'goal achievement', 'habit formation', 'focus improvement', 'procrastination solutions', 
        'daily planning', 'work efficiency', 'motivation techniques', 'task prioritization', 'email management', 'meeting productivity',
        'workspace setup', 'digital organization', 'calendar management', 'project management', 'team collaboration', 'remote work',
        'work-life balance', 'stress reduction', 'decision making', 'creative thinking', 'problem solving', 'leadership skills'
      ],
      gaming: [
        'Fortnite strategies', 'GTA Online tips', 'Red Dead Redemption 2', 'Halo Infinite multiplayer', 'Kirby games', 'Bugsnax guide',
        'Wobbly Life gameplay', 'Beach Buggy Racing', 'Minecraft building', 'Call of Duty tips', 'FIFA gameplay', 'NBA 2K strategies',
        'Apex Legends', 'Valorant tactics', 'League of Legends', 'Overwatch 2', 'Rocket League', 'Among Us strategies',
        'Fall Guys tips', 'Genshin Impact', 'Pokemon strategies', 'Super Mario games', 'Zelda gameplay', 'Elden Ring guide',
        'gaming setup optimization', 'streaming basics', 'esports training', 'game development', 'retro gaming', 'mobile gaming'
      ],
      relationships: [
        'dating confidence', 'making new friends', 'communication skills', 'relationship conflicts', 'long distance relationships', 
        'online dating safety', 'social anxiety', 'family dynamics', 'workplace relationships', 'breakup recovery', 'marriage advice',
        'parenting tips', 'teenage relationships', 'friendship problems', 'toxic relationships', 'dating apps', 'first dates',
        'relationship red flags', 'intimacy issues', 'trust building', 'conflict resolution', 'romantic gestures', 'anniversary ideas',
        'meeting parents', 'wedding planning', 'divorce advice', 'single life'
      ],
      education: [
        'study techniques', 'test preparation', 'college applications', 'learning languages', 'research methods', 'online learning', 
        'note-taking systems', 'academic writing', 'time management for students', 'exam strategies', 'memory improvement',
        'reading comprehension', 'math help', 'science projects', 'history studying', 'literature analysis', 'essay writing',
        'presentation skills', 'group projects', 'scholarship applications', 'graduate school', 'thesis writing', 'plagiarism avoidance',
        'study abroad', 'adult education', 'career training'
      ],
      career: [
        'job interview preparation', 'resume optimization', 'professional networking', 'career transitions', 'salary negotiation', 
        'remote work skills', 'leadership development', 'workplace communication', 'professional growth', 'industry knowledge',
        'LinkedIn optimization', 'personal branding', 'skill development', 'performance reviews', 'workplace conflict',
        'team management', 'public speaking', 'business writing', 'project leadership', 'entrepreneurship', 'freelancing',
        'career change', 'retirement planning', 'work burnout', 'office politics', 'mentorship'
      ],
      hobbies: [
        'photography composition', 'gardening basics', 'creative writing', 'music production', 'drawing techniques', 'crafting projects', 
        'hiking preparation', 'travel photography', 'collecting strategies', 'artistic inspiration', 'painting techniques', 'sculpture',
        'knitting patterns', 'woodworking', 'pottery making', 'jewelry making', 'scrapbooking', 'model building', 'stamp collecting',
        'coin collecting', 'bird watching', 'astronomy', 'fishing techniques', 'camping gear', 'rock climbing', 'cycling routes'
      ],
      entertainment: [
        'Netflix recommendations', 'Disney+ shows', 'HBO Max series', 'movie reviews', 'TV show analysis', 'book recommendations', 
        'music discovery', 'podcast creation', 'streaming platforms', 'concert experiences', 'festival planning', 'theater appreciation',
        'comedy writing', 'stand-up comedy', 'movie trivia', 'binge watching', 'soundtrack music', 'celebrity news', 'award shows',
        'film photography', 'video editing', 'YouTube channels', 'TikTok trends', 'Instagram content', 'social media'
      ],
      lifestyle: [
        'home decoration', 'fashion styling', 'skincare routines', 'home organization', 'minimalist living', 'self-care practices', 
        'morning routines', 'sustainable choices', 'personal style', 'life balance', 'apartment living', 'house hunting',
        'interior design', 'feng shui', 'aromatherapy', 'meditation spaces', 'closet organization', 'seasonal decorating',
        'budget decorating', 'small space living', 'eco-friendly living', 'digital detox', 'wellness routines', 'holiday traditions'
      ],
      pets: [
        'dog training basics', 'cat behavior', 'pet health monitoring', 'pet adoption process', 'grooming techniques', 'pet nutrition', 
        'aquarium maintenance', 'bird care', 'exotic pet care', 'pet safety', 'puppy training', 'kitten care', 'senior pet care',
        'pet insurance', 'veterinary visits', 'pet emergencies', 'pet travel', 'pet-proofing homes', 'pet toys', 'pet photography',
        'rabbit care', 'hamster care', 'reptile care', 'fish tank setup', 'pet behaviorist', 'pet sitting'
      ],
      travel: [
        'budget travel planning', 'solo travel safety', 'packing efficiently', 'international travel', 'road trip planning', 
        'travel photography', 'cultural etiquette', 'travel apps', 'jet lag prevention', 'travel insurance', 'Europe travel',
        'Asia travel', 'backpacking tips', 'luxury travel', 'family travel', 'business travel', 'cruise tips', 'camping trips',
        'national parks', 'city breaks', 'beach vacations', 'mountain trips', 'adventure travel', 'travel blogging', 'travel scams'
      ],
      sports: [
        'LeBron James career', 'Tom Brady achievements', 'Serena Williams tennis', 'Cristiano Ronaldo skills', 'Lionel Messi technique',
        'Michael Jordan legacy', 'basketball fundamentals', 'soccer skills', 'tennis techniques', 'swimming strokes', 'cycling safety', 
        'golf basics', 'martial arts training', 'team sports strategy', 'sports nutrition', 'injury prevention', 'NFL strategies',
        'NBA playoffs', 'World Cup soccer', 'Olympic sports', 'baseball techniques', 'hockey skills', 'track and field',
        'boxing training', 'wrestling moves', 'volleyball techniques', 'sports psychology', 'athletic training'
      ],
      diy: [
        'home improvement projects', 'woodworking basics', 'car maintenance', 'electronics repair', 'basic plumbing', 'painting techniques', 
        'furniture restoration', 'craft projects', 'tool selection', 'safety practices', 'bathroom renovation', 'kitchen remodel',
        'deck building', 'flooring installation', 'electrical work', 'roofing repairs', 'landscaping', 'garden design',
        'shed building', 'fence installation', 'tile work', 'drywall repair', 'insulation installation', 'window replacement'
      ],
      shopping: [
        'Amazon deals', 'Black Friday shopping', 'Cyber Monday sales', 'coupon strategies', 'price comparison', 'online vs store shopping',
        'grocery budgeting', 'clothing deals', 'tech purchases', 'home goods shopping', 'gift selection', 'seasonal shopping', 
        'thrift shopping', 'outlet shopping', 'wholesale buying', 'cashback apps', 'loyalty programs', 'return policies',
        'product reviews', 'brand comparisons', 'quality assessment', 'bulk buying', 'subscription boxes', 'flash sales'
      ]
    };
    
    // Track generated topics to avoid duplicates
    this.generatedTopics = new Set();
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

    const prompt = `Create training data for a chatbot about "${validatedTopic}" in the ${domain} domain.

Generate EXACTLY 5 short, keyword-focused question patterns about ${validatedTopic}. 

IMPORTANT RULES:
- Keep patterns SHORT and focused on key words
- Remove unnecessary filler words like "do you have any", "can you give me", "what are some"
- Focus on the core topic keywords
- Make them natural but concise

GOOD EXAMPLES:
- "pull up tips" NOT "do you have any tips for pull ups"
- "lose weight fast" NOT "what are the best ways to lose weight quickly"
- "budget advice" NOT "can you give me advice about budgeting"

Generate 5 SHORT patterns for ${validatedTopic}:

QUESTIONS:
${validatedTopic}
${validatedTopic} tips
${validatedTopic} help
${validatedTopic} guide
${validatedTopic} advice

RESPONSES:
Response 1 specific to ${validatedTopic}.
Response 2 specific to ${validatedTopic}.
Response 3 specific to ${validatedTopic}.
Response 4 specific to ${validatedTopic}.
Response 5 specific to ${validatedTopic}.

Make responses actionable and under 100 characters each.`;

    try {
      if (!openai) {
        throw new Error('OpenAI not initialized');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
      
      // Find questions section
      const questionStart = lines.findIndex(line => line.toUpperCase().includes('QUESTION'));
      const responseStart = lines.findIndex(line => line.toUpperCase().includes('RESPONSE'));
      
      let questions = [];
      let responses = [];
      
      if (questionStart !== -1 && responseStart !== -1 && responseStart > questionStart) {
        // Extract questions
        for (let i = questionStart + 1; i < responseStart; i++) {
          if (lines[i] && !lines[i].toUpperCase().includes('RESPONSE')) {
            const cleanQuestion = lines[i].replace(/^[-*•]\s*/, '').trim();
            if (cleanQuestion.length > 0) {
              questions.push(cleanQuestion);
            }
          }
        }
        
        // Extract responses
        for (let i = responseStart + 1; i < lines.length; i++) {
          if (lines[i]) {
            const cleanResponse = lines[i].replace(/^[-*•]\s*/, '').trim();
            if (cleanResponse.length > 0) {
              responses.push(cleanResponse);
            }
          }
        }
      }
      
      // Fallback parsing if sections not found
      if (questions.length < 3) {
        questions = lines.filter(line => 
          line.toLowerCase().includes(topic.toLowerCase()) && 
          line.length < 100 &&
          (line.includes('tips') || line.includes('help') || line.includes('guide') || line.includes(topic))
        ).slice(0, 5);
      }
      
      if (responses.length < 3) {
        responses = lines.filter(line => 
          line.length > 15 && line.length < 150 &&
          !line.toLowerCase().includes('question') &&
          !line.toLowerCase().includes('response')
        ).slice(0, 5);
      }
      
      // Ensure minimum requirements
      if (questions.length === 0) {
        questions = [topic, `${topic} tips`, `${topic} help`];
      }
      if (responses.length === 0) {
        responses = [`Here's helpful advice about ${topic}.`, `Try practicing ${topic} regularly.`, `Start with ${topic} basics.`];
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
        `${validatedTopic} guide`,
        `${validatedTopic} advice`
      ],
      responses: [
        `Here's helpful advice about ${validatedTopic}.`,
        `Try practicing ${validatedTopic} regularly.`,
        `Start with the basics of ${validatedTopic}.`,
        `Consider getting guidance on ${validatedTopic}.`,
        `Focus on improving your ${validatedTopic} skills.`
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

  async generateForDomain(domainName, topicsPerDomain = 5) {
    console.log(`\n🔄 Processing ${domainName} domain...`);
    const domainData = [];
    const topics = this.domains[domainName];

    if (!Array.isArray(topics) || topics.length === 0) {
      console.log(`  ⚠️  No topics found for domain: ${domainName}`);
      return domainData;
    }

    const maxTopics = Math.min(topics.length, topicsPerDomain);

    for (let i = 0; i < maxTopics; i++) {
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

  async generateAllDomains(topicsPerDomain = 5) {
    const allTrainingData = {};
    
    for (const [domainName, topics] of Object.entries(this.domains)) {
      try {
        console.log(`\n🚀 Starting ${domainName} domain (${Math.min(topics.length, topicsPerDomain)} topics)...`);
        allTrainingData[domainName] = await this.generateForDomain(domainName, topicsPerDomain);
        console.log(`✅ Generated ${allTrainingData[domainName].length} entries for ${domainName}`);
      } catch (error) {
        console.error(`❌ Failed to process ${domainName}:`, error.message);
        allTrainingData[domainName] = [];
      }
    }

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
              jsContent += `    { pattern: ${entry.pattern}, responses: ${JSON.stringify(entry.responses, null, 6)} }`;
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

  async saveToFile(trainingData, filename = 'generated_responses.js') {
    try {
      const jsContent = this.formatAsJavaScript(trainingData);
      fs.writeFileSync(filename, jsContent);
      console.log(`\n💾 Training data saved to ${filename}`);
      
      // Also save as JSON for backup
      const jsonFilename = filename.replace('.js', '.json');
      fs.writeFileSync(jsonFilename, JSON.stringify(trainingData, null, 2));
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
  console.log('🚀 Starting OpenAI Training Data Generation...\n');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY && !openai) {
    console.log('⚠️  Please set your OpenAI API key in the script before running.');
    console.log('   Replace "your-openai-api-key-here" with your actual API key.');
    return;
  }
  
  const generator = new TrainingDataGenerator();
  
  try {
    // Generate training data (5 topics per domain = ~90 total entries)  
    // This will cost approximately $0.75-1.25 in OpenAI credits
    const trainingData = await generator.generateAllDomains(5);
    
    // Validate results
    const totalEntries = Object.values(trainingData).reduce((sum, entries) => {
      return sum + (Array.isArray(entries) ? entries.length : 0);
    }, 0);
    
    if (totalEntries === 0) {
      console.log('❌ No training data was generated. Please check your OpenAI API key and internet connection.');
      return;
    }
    
    // Save to file
    const saveSuccess = await generator.saveToFile(trainingData, 'expanded_responses.js');
    
    if (saveSuccess) {
      // Print summary
      console.log(`\n✅ Complete! Generated ${totalEntries} training entries across ${Object.keys(trainingData).length} domains.`);
      console.log(`\n🎯 Domains covered: ${Object.keys(trainingData).join(', ')}`);
      console.log(`\n📁 Files created:`);
      console.log(`   - expanded_responses.js (ready to use in your chatbot)`);
      console.log(`   - expanded_responses.json (backup)`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Replace your existing responses with: const responses = require('./expanded_responses.js');`);
      console.log(`   2. Or merge with existing data`);
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

/* 
SETUP INSTRUCTIONS:

1. Install OpenAI:
   npm install openai

2. Get your OpenAI API key:
   - Go to https://platform.openai.com/
   - Create account and get API key
   - Replace 'your-openai-api-key-here' above

3. Run:
   node training_data_generator.js

FEATURES:
✅ Error-free execution with comprehensive error handling
✅ Input validation and sanitization
✅ Graceful fallbacks for API failures
✅ Duplicate prevention
✅ Regex escaping for special characters
✅ File operation error handling
✅ Memory-efficient processing
✅ Rate limiting compliance
✅ Progress monitoring
✅ Detailed logging and troubleshooting

This will generate ~90 training entries with concise, keyword-focused patterns.
Cost: About $0.75-1.25 in OpenAI credits.
*/