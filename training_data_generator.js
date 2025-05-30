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

      geography1: [
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
      ],

      history_oa1: [
          // Major Historical Events
          'what was World War I',
          'when did World War I start',
          'when did World War I end',
          'causes of World War I',
          'what was World War II',
          'when did World War II start',
          'when did World War II end',
          'causes of World War II',
          'what was the Holocaust',
          'how many people died in the Holocaust',
          'what was the American Civil War',
          'when did the American Civil War start',
          'when did the American Civil War end',
          'causes of the American Civil War',
          'what was the French Revolution',
          'when did the French Revolution happen',
          'causes of the French Revolution',
          'what was the Russian Revolution',
          'when did the Russian Revolution happen',
          'what was the Industrial Revolution',
          'when did the Industrial Revolution start',
          'effects of the Industrial Revolution',
          'what was the Renaissance',
          'when did the Renaissance happen',
          'where did the Renaissance start',
          'what was the Cold War',
          'when did the Cold War start',
          'when did the Cold War end',
          'what was the Fall of the Roman Empire',
          'when did the Roman Empire fall',
          'causes of the Fall of the Roman Empire',
          'what was the Black Death',
          'when did the Black Death happen',
          'how many people died in the Black Death',
          'what was the American Revolution',
          'when did the American Revolution start',
          'when did the American Revolution end',
          'causes of the American Revolution',
          'what was the Great Depression',
          'when did the Great Depression start',
          'when did the Great Depression end',
          'causes of the Great Depression',
          'what was Pearl Harbor',
          'when did Pearl Harbor happen',
          'what was D-Day',
          'when did D-Day happen',
          'what was the Boston Tea Party',
          'when did the Boston Tea Party happen',
          'what was the Fall of the Berlin Wall',
          'when did the Berlin Wall fall',
          'what was 9/11',
          'when did 9/11 happen',
          'what was the Cuban Missile Crisis',
          'when did the Cuban Missile Crisis happen',
          'what was the Protestant Reformation',
          'when did the Protestant Reformation start',
          'what was the Crusades',
          'when did the Crusades happen',
          'how many Crusades were there',
          'what was the Magna Carta',
          'when was the Magna Carta signed',
          'what was the Trail of Tears',
          'when did the Trail of Tears happen',
          'what was the Salem Witch Trials',
          'when did the Salem Witch Trials happen',
          'what was the Great Fire of London',
          'when did the Great Fire of London happen',
          'what was the Thirty Years War',
          'when did the Thirty Years War happen',
          'what was the Spanish Inquisition',
          'when did the Spanish Inquisition start',
          'what was the Hundred Years War',
          'when did the Hundred Years War happen',
          'what was the War of 1812',
          'when did the War of 1812 happen',
          'what was the Vietnam War',
          'when did the Vietnam War start',
          'when did the Vietnam War end',
          'what was the Korean War',
          'when did the Korean War happen',
          'what was the Space Race',
          'when did the Space Race happen',
          'what was the Moon Landing',
          'when did the Moon Landing happen',
        
          // Major Historical Figures
          'who is Napoleon Bonaparte',
          'who is Adolf Hitler',
          'who is Winston Churchill',
          'who is Abraham Lincoln',
          'who is George Washington',
          'who is Julius Caesar',
          'who is Alexander the Great',
          'who is Cleopatra',
          'who is Leonardo da Vinci',
          'who is Michelangelo',
          'who is William Shakespeare',
          'who is Martin Luther King Jr',
          'who is John F. Kennedy',
          'who is Franklin D. Roosevelt',
          'who is Theodore Roosevelt',
          'who is Thomas Jefferson',
          'who is Benjamin Franklin',
          'who is Christopher Columbus',
          'who is Marco Polo',
          'who is Magellan',
          'who is Captain James Cook',
          'who is Lewis and Clark',
          'who is Joan of Arc',
          'who is Marie Antoinette',
          'who is Louis XIV',
          'who is Catherine the Great',
          'who is Peter the Great',
          'who is Ivan the Terrible',
          'who is Charlemagne',
          'who is King Arthur',
          'who is Henry VIII',
          'who is Elizabeth I',
          'who is Queen Victoria',
          'who is Mozart',
          'who is Beethoven',
          'who is Bach',
          'who is Galileo',
          'who is Isaac Newton',
          'who is Charles Darwin',
          'who is Albert Einstein',
          'who is Marie Curie',
          'who is Thomas Edison',
          'who is Nikola Tesla',
          'who is Alexander Graham Bell',
          'who is Henry Ford',
          'who is Wright Brothers',
          'who is Karl Marx',
          'who is Adam Smith',
          'who is Plato',
          'who is Aristotle',
          'who is Socrates',
          'who is Confucius',
          'who is Buddha',
          'who is Jesus Christ',
          'who is Muhammad',
          'who is Moses',
          'who is Gandhi',
          'who is Nelson Mandela',
          'who is Martin Luther',
          'who is John Calvin',
          'who is Genghis Khan',
          'who is Attila the Hun',
          'who is Hannibal',
          'who is Spartacus',
          'who is King Tut',
          'who is Ramses II',
          'who is Hammurabi',
          'who is Sun Tzu',
          'who is Lao Tzu',
          'who is Homer',
          'who is Virgil',
          'who is Dante',
          'who is Chaucer',
          'who is Mark Twain',
          'who is Charles Dickens',
          'who is Jane Austen',
          'who is Edgar Allan Poe',
          'who is Ernest Hemingway',
          'who is Pablo Picasso',
          'who is Vincent van Gogh',
          'who is Claude Monet',
          'who is Rembrandt',
          'who is Mona Lisa',
          'who is Rodin',
          'who is Stalin',
          'who is Lenin',
          'who is Mao Zedong',
          'who is Fidel Castro',
          'who is Che Guevara',
          'who is Ho Chi Minh',
          'who is Emperor Hirohito',
          'who is Hiroshima',
          'who is Anne Frank',
          'who is Harriet Tubman',
          'who is Frederick Douglass',
          'who is Booker T. Washington',
          'who is W.E.B. Du Bois',
          'who is Rosa Parks',
          'who is Malcolm X',
          'who is Susan B. Anthony',
          'who is Elizabeth Cady Stanton',
          'who is Pocahontas',
          'who is Sacagawea',
          'who is Sitting Bull',
          'who is Geronimo',
          'who is Chief Joseph',
          'who is Crazy Horse',
          'who is Buffalo Bill',
          'who is Jesse James',
          'who is Billy the Kid',
          'who is Wyatt Earp',
          'who is Al Capone',
          'who is John Dillinger',
          'who is Bonnie and Clyde',

      ],
 
      where_is_queries: [
        "where is New York",
        "where is London",
        "where is Paris",
        "where is Tokyo",
        "where is Los Angeles",
        "where is Sydney",
        "where is Rome",
        "where is Berlin",
        "where is Toronto",
        "where is Chicago",
        "where is Dubai",
        "where is Moscow",
        "where is Beijing",
        "where is Mumbai",
        "where is Rio de Janeiro",
        "where is Mexico City",
        "where is Cairo",
        "where is Bangkok",
        "where is San Francisco",
        "where is Madrid",
        "where is Buenos Aires",
        "where is Cape Town",
        "where is Singapore",
        "where is Seoul",
        "where is Amsterdam",
        "where is Istanbul",
        "where is Hong Kong",
        "where is Vancouver",
        "where is Las Vegas",
        "where is Miami",
        "where is Barcelona",
        "where is Auckland",
        "where is Vienna",
        "where is Dublin",
        "where is Brussels",
        "where is Honolulu",
        "where is Montreal",
        "where is Johannesburg",
        "where is Zurich",
        "where is Venice",
        "where is New Delhi",
        "where is Stockholm",
        "where is Lisbon",
        "where is Nairobi",
        "where is Melbourne",
        "where is Havana",
        "where is Prague",
        "where is Helsinki",
        "where is Oslo",
        "where is Copenhagen"
      ],
   
   
   
      calories: [
            'how many calories in an apple',
            'how many calories in a banana',
            'how many calories in an egg',
            'how many calories in a slice of bread',
            'how many calories in a slice of pizza',
            'how many calories in a Big Mac',
            'how many calories in a McDonald\'s fries',
            'how many calories in a Whopper',
            'how many calories in a can of Coke',
            'how many calories in a beer',
            'how many calories in wine',
            'how many calories in vodka',
            'how many calories in whiskey',
            'how many calories in a donut',
            'how many calories in a bagel',
            'how many calories in rice',
            'how many calories in pasta',
            'how many calories in chicken breast',
            'how many calories in ground beef',
            'how many calories in salmon',
            'how many calories in tuna',
            'how many calories in avocado',
            'how many calories in peanut butter',
            'how many calories in almonds',
            'how many calories in walnuts',
            'how many calories in chocolate',
            'how many calories in ice cream',
            'how many calories in a cookie',
            'how many calories in cake',
            'how many calories in french fries',
            'how many calories in a hamburger',
            'how many calories in a cheeseburger',
            'how many calories in fried chicken',
            'how many calories in a burrito',
            'how many calories in a taco',
            'how many calories in sushi',
            'how many calories in ramen',
            'how many calories in cereal',
            'how many calories in milk',
            'how many calories in yogurt',
            'how many calories in cheese',
            'how many calories in butter',
            'how many calories in olive oil',
            'how many calories in sugar',
            'how many calories in honey',
            'how many calories in orange juice',
            'how many calories in coffee',
            'how many calories in Starbucks coffee',
            'how many calories in popcorn',
            'how many calories in chips',
            'how many calories in crackers',
            'how many calories in granola bar',
            'how many calories in protein bar',
            'how many calories in smoothie',
            'how many calories in salad',
            'how many calories in caesar salad',
            'how many calories in subway sandwich',
            'how many calories in chipotle bowl',
            'how many calories in Domino\'s pizza',
            'how many calories in KFC chicken',
            'how many calories in Taco Bell taco',
            'how many calories in In-N-Out burger',
            'how many calories in Chick-fil-A sandwich',
            'how many calories in Dunkin donuts',
            'how many calories in Krispy Kreme donut',
            'how many calories in Oreos',
            'how many calories in Kit Kat',
            'how many calories in Snickers',
            'how many calories in M&Ms',
            'how many calories in Coca Cola',
            'how many calories in Pepsi',
            'how many calories in energy drink',
            'how many calories in Red Bull'
          ],

          do_you_like_oa: [
            'do you like music',
            'do you like movies',
            'do you like books',
            'do you like reading',
            'do you like sports',
            'do you like animals',
            'do you like humans',
            'do you like people',
            'do you like art',
            'do you like painting',
            'do you like dancing',
            'do you like singing',
            'do you like cooking',
            'do you like traveling',
            'do you like nature',
            'do you like the ocean',
            'do you like the beach',
            'do you like mountains',
            'do you like rain',
            'do you like snow',
            'do you like winter',
            'do you like summer',
            'do you like spring',
            'do you like fall',
            'do you like video games',
            'do you like gaming',
            'do you like technology',
            'do you like science',
            'do you like math',
            'do you like history',
            'do you like learning',
            'do you like school',
            'do you like work',
            'do you like your job',
            'do you like comedy',
            'do you like jokes',
            'do you like horror movies',
            'do you like scary movies',
            'do you like romantic movies',
            'do you like action movies',
            'do you like anime',
            'do you like cartoons',
            'do you like Disney',
            'do you like Marvel',
            'do you like Star Wars',
            'do you like Harry Potter',
            'do you like rock music',
            'do you like pop music',
            'do you like rap music',
            'do you like country music',
            'do you like classical music',
            'do you like jazz',
            'do you like Christmas',
            'do you like Halloween',
            'do you like birthdays',
            'do you like parties',
            'do you like shopping',
            'do you like fashion',
            'do you like exercise',
            'do you like working out',
            'do you like running',
            'do you like swimming',
            'do you like football',
            'do you like basketball',
            'do you like baseball',
            'do you like soccer',
            'do you like cheese',
            'do you like pasta',
            'do you like sushi',
            'do you like Mexican food',
            'do you like Italian food',
            'do you like Chinese food',
            'do you like Japanese food',
            'do you like Indian food',
            'do you like Thai food',
            'do you like Korean food',
            'do you like French food',
            'do you like Greek food',
            'do you like Middle Eastern food',
            'do you like Mediterranean food',
            'do you like Vietnamese food',
            'do you like American food',
            'do you like spicy food',
            'do you like sweet food',
            'do you like vegetables',
            'do you like fruits',
            'do you like meat',
            'do you like fish',
            'do you like being alone',
            'do you like socializing',
            'do you like talking',
            'do you like helping people',
            'do you like being an AI',
            'do you like your creator',
            'do you like other AIs',
            'do you like ChatGPT',
            'do you like Google',
            'do you like solving problems',
            'do you like challenges',
            'do you like surprises',
            'do you like change',
            'do you like routine',
            'do you like adventure'
          ],


          tech_questions: [
            'why is my computer slow',
            'why is my phone battery dying so fast',
            'why is my wifi not working',
            'how to speed up my computer',
            'how to fix slow internet',
            'how to connect to wifi',
            'how to reset my password',
            'how to backup my phone',
            'how to free up storage space',
            'how to delete cookies',
            'how to clear cache',
            'how to update my software',
            'how to install an app',
            'how to uninstall a program',
            'how to take a screenshot',
            'how to record my screen',
            'how to transfer files',
            'how to sync my devices',
            'what is the cloud',
            'what is malware',
            'what is a virus',
            'what is antivirus software',
            'what is a VPN',
            'what is two-factor authentication',
            'what is encryption',
            'what is a firewall',
            'what is phishing',
            'what is spam',
            'what is a browser',
            'what is an operating system',
            'what is RAM',
            'what is storage',
            'what is CPU',
            'what is GPU',
            'what is SSD',
            'what is hard drive',
            'what is USB',
            'what is Bluetooth',
            'what is 5G',
            'what is WiFi 6',
            'what is artificial intelligence',
            'what is machine learning',
            'what is coding',
            'what is programming',
            'what is Python',
            'what is JavaScript',
            'what is HTML',
            'what is CSS',
            'what is a website',
            'what is an app',
            'what is software',
            'what is hardware',
            'what is the internet',
            'what is social media',
            'what is streaming',
            'what is Netflix',
            'what is YouTube',
            'what is Google',
            'what is Amazon',
            'what is Apple',
            'what is Microsoft',
            'what is iPhone',
            'what is Android',
            'what is Windows',
            'what is Mac',
            'what is Linux',
            'what is Chrome',
            'what is Safari',
            'what is Firefox',
            'how to create a strong password',
            'how to protect my privacy online',
            'how to avoid scams',
            'how to shop safely online',
            'how to video call',
            'how to send an email',
            'how to use social media safely',
            'how to block ads',
            'how to download files',
            'how to upload photos',
            'how to edit photos',
            'how to make a video',
            'how to compress files',
            'how to recover deleted files',
            'what\'s the best laptop',
            'what\'s the best phone',
            'what\'s the best smartphone',
            'what\'s the best iPhone',
            'what\'s the best Android phone',
            'what\'s the best antivirus',
            'what\'s the best VPN',
            'what\'s the best browser',
            'what\'s the best programming language',
            'what\'s the best coding language to learn',
            'what\'s the best cloud storage',
            'what\'s the best password manager',
            'what\'s the best headphones',
            'what\'s the best wireless earbuds',
            'what\'s the best smartwatch'
          ],

          brand_preferences: [
            'do you like Apple',
            'do you like iPhone',
            'do you like Samsung',
            'do you like Google',
            'do you like Microsoft',
            'do you like Xbox',
            'do you like PlayStation',
            'do you like Nintendo',
            'do you like Tesla',
            'do you like Amazon',
            'do you like Netflix',
            'do you like Disney',
            'do you like McDonald\'s',
            'do you like Starbucks',
            'do you like Coca Cola',
            'do you like Pepsi',
            'do you like Nike',
            'do you like Adidas',
            'do you like Facebook',
            'do you like Instagram',
            'do you like TikTok',
            'do you like YouTube',
            'do you like Twitter',
            'do you like Spotify',
            'do you like Uber',
            'do you like Target',
            'do you like Walmart',
            'do you like Costco',
            'do you like BMW',
            'do you like Mercedes',
            'do you like Toyota',
            'do you like Ford',
            'do you like Chevrolet',
            'do you like Honda',
            'do you like IKEA',
            'do you like H&M',
            'do you like Zara',
            'do you like Louis Vuitton',
            'do you like Gucci',
            'do you like Rolex',
            'do you like Supreme',
            'do you like Victoria\'s Secret',
            'do you like Sephora',
            'do you like Ulta',
            'do you like Home Depot',
            'do you like Lowe\'s',
            'do you like Best Buy',
            'do you like GameStop',
            'do you like Whole Foods',
            'do you like Trader Joe\'s'
          ],

          facts_oa: [
            'how many bones are in the human body',
            'how many hearts does an octopus have',
            'how many stomachs does a cow have',
            'how many teeth do sharks have',
            'how many eyes do spiders have',
            'how many legs does a spider have',
            'how many chambers does a human heart have',
            'how many ribs do humans have',
            'how many muscles are in the human body',
            'how many taste buds do humans have',
            'how fast can a cheetah run',
            'how fast can a human run',
            'how fast does light travel',
            'how fast does sound travel',
            'how fast does the Earth rotate',
            'how far is the moon from Earth',
            'how far is the sun from Earth',
            'how far is Mars from Earth',
            'how big is the sun',
            'how big is the moon',
            'how old is the Earth',
            'how old is the universe',
            'how old are the pyramids',
            'how tall is Mount Everest',
            'how deep is the ocean',
            'how deep is the Mariana Trench',
            'how long is the Great Wall of China',
            'how many countries are in the world',
            'how many states are in the US',
            'how many continents are there',
            'how many oceans are there',
            'how many planets are in our solar system',
            'what is the largest animal in the world',
            'what is the smallest animal in the world',
            'what is the fastest animal in the world',
            'what is the slowest animal in the world',
            'what is the tallest animal in the world',
            'what is the heaviest animal in the world',
            'what is the smartest animal in the world',
            'what is the deadliest animal in the world',
            'what is the largest country in the world',
            'what is the smallest country in the world',
            'what is the most populated country in the world',
            'what is the richest country in the world',
            'what is the hottest place on Earth',
            'what is the coldest place on Earth',
            'what is the driest place on Earth',
            'what is the wettest place on Earth',
            'what is the highest mountain in the world',
            'what is the longest river in the world',
            'what is the largest desert in the world',
            'what is the largest lake in the world',
            'what is the largest island in the world',
            'what is the most spoken language in the world',
            'what is the oldest language in the world',
            'what is the hardest language to learn',
            'what is the most common blood type',
            'what is the rarest blood type',
            'what is the strongest muscle in the human body',
            'what is the largest organ in the human body',
            'what is the smallest bone in the human body',
            'what is the longest bone in the human body',
            'what percentage of the human body is water',
            'what percentage of the brain do we use',
            'how many cells are in the human body',
            'how many hairs are on a human head',
            'how long do humans live',
            'how long do dogs live',
            'how long do cats live',
            'how long do elephants live',
            'how long do turtles live',
            'how long do trees live',
            'what do pandas eat',
            'what do koalas eat',
            'what do elephants eat',
            'what do giraffes eat',
            'what do penguins eat',
            'what do sharks eat',
            'what do whales eat',
            'what do bees eat',
            'what do butterflies eat',
            'what do spiders eat',
            'why is the sky blue',
            'why is grass green',
            'why is blood red',
            'why do we sleep',
            'why do we dream',
            'why do we yawn',
            'why do we hiccup',
            'why do we sneeze',
            'why do we cry',
            'why do we laugh',
            'why do we get goosebumps',
            'why do leaves change color',
            'why do seasons change',
            'why does it rain',
            'why does it snow',
            'why is the ocean salty',
            'why do earthquakes happen',
            'why do volcanoes erupt',
            'why is fire hot',
            'why is ice cold',
            'why do magnets work',
            'why does gravity exist',
            'why do we age',
            'why do we have fingerprints',
            'why do we have belly buttons',
            'how many seconds are in a year',
            'how many minutes are in a year',
            'how many hours are in a year',
            'how many days are in a year',
            'how many weeks are in a year',
            'how many moons does Jupiter have',
            'how many moons does Saturn have',
            'how hot is the sun',
            'how cold is space',
            'how long does it take to get to Mars',
            'how long does it take light to reach Earth from the sun',
            'how many zeros are in a million',
            'how many zeros are in a billion',
            'how many zeros are in a trillion',
            'what is the speed of light in mph',
            'what is the boiling point of water',
            'what is the freezing point of water',
            'how many elements are on the periodic table',
            'what is absolute zero',
            'how much does the Earth weigh',
            'how fast does hair grow',
            'how fast do nails grow',
            'what is the longest mountain range',
            'what is the largest volcano',
            'what is the deepest lake',
            'how tall is the Eiffel Tower',
            'what is the tallest building in the world',
            'what is the average IQ',
            'what is the normal body temperature',
            'what is the normal blood pressure',
            'how many people are in the world',
            'what is the most popular name',
            'what is the most common eye color',
            'what is the most common hair color',
            'what is the average height of a human',
            'what is the average weight of a human',
            'how many teeth do adults have',
            'how many teeth do children have',
            'what is the strongest bone in the body',
            'what is the weakest bone in the body',
            'how many calories should you eat per day',
            'how much water should you drink per day',
            'how much sleep do you need',
            'what is the legal drinking age',
            'what is the legal driving age',
            'what is minimum wage',
            'what is the retirement age',
            'how many time zones are there',
            'what is the most expensive car',
            'what is the fastest car',
            'what is the best selling car',
            'how many books are in the Bible',
            'what is the longest word in English',
            'what is the shortest word in English',
            'how many letters are in the alphabet',
            'what is the most used letter in English',
            'what is pi',
            'what is the square root of 2'
          ],


          what_is: [
            'what is love',
            'what is life',
            'what is happiness',
            'what is the meaning of life',
            'what is success',
            'what is friendship',
            'what is time',
            'what is money',
            'what is democracy',
            'what is capitalism',
            'what is socialism',
            'what is communism',
            'what is fascism',
            'what is inflation',
            'what is recession',
            'what is depression',
            'what is anxiety',
            'what is stress',
            'what is meditation',
            'what is yoga',
            'what is karma',
            'what is mindfulness',
            'what is artificial intelligence',
            'what is machine learning',
            'what is blockchain',
            'what is cryptocurrency',
            'what is Bitcoin',
          ],
          common_problems: [
            'my computer is running slow',
            'my phone battery drains quickly',
            'my wifi is not working',
            'my printer won\'t print',
            'I forgot my password',
            'my phone screen is cracked',
            'my car won\'t start',
            'my car is making noise',
            'my check engine light is on',
            'my toilet is clogged',
            'my sink is clogged',
            'my shower has low water pressure',
            'my garbage disposal is jammed',
            'my air conditioner isn\'t cooling',
            'my heater isn\'t working',
            'my smoke detector keeps beeping',
            'I have a flat tire',
            'my credit score is low',
            'I have too much debt',
            'I can\'t pay my bills',
            'I\'m always tired',
            'I can\'t sleep',
            'I have insomnia',
            'I have anxiety',
            'I feel depressed',
            'I\'m stressed all the time',
            'I have no motivation',
            'I procrastinate too much',
            'I can\'t focus',
            'I have bad breath',
            'I have acne',
            'I\'m losing my hair',
            'I can\'t lose weight',
            'I have back pain',
            'I have a headache',
            'I have a sore throat',
            'I have a cough',
            'I have stomach pain',
            'I\'m constipated',
            'I have heartburn',
            'my relationship is failing',
            'I\'m lonely',
            'I have no friends',
            'I hate my job',
            'I can\'t find a job',
            'I\'m not getting promoted',
            'my boss is terrible',
            'I\'m underpaid',
            'I work too much',
            'I have no work-life balance',
            'my neighbors are noisy',
            'my landlord won\'t fix things',
            'I\'m being evicted',
            'I can\'t afford rent',
            'my roommate is messy',
            'I keep forgetting things',
            'I\'m always late',
            'I\'m disorganized',
            'I spend too much money',
            'I have no savings',
            'my kids won\'t listen',
            'my teenager is rebellious',
            'I\'m getting divorced',
            'my family doesn\'t understand me',
            'I\'m addicted to my phone',
            'I drink too much',
            'I smoke too much',
            'I eat too much junk food',
            'I don\'t exercise enough',
            'I\'m out of shape',
            'my house is always messy',
            'I have too much clutter',
            'I keep losing things',
            'my plants keep dying',
            'I have pests in my house',
            'my clothes don\'t fit',
            'I look older than my age',
            'I have wrinkles',
            'I have dark circles under my eyes',
            'my skin is dry',
            'my hair is damaged',
            'I snore too loud',
            'I grind my teeth',
            'I bite my nails',
            'I\'m always cold',
            'I\'m always hot',
            'I get sunburned easily',
            'I have seasonal allergies',
            'I get motion sickness',
            'I\'m afraid of flying',
            'I\'m socially awkward',
            'I can\'t make small talk',
            'I\'m bad at public speaking',
            'I have stage fright',
            'I\'m afraid of confrontation',
            'I can\'t say no to people',
            'people take advantage of me',
            'I\'m too sensitive',
            'I worry too much',
            'I overthink everything',
            'if you were human what would you do',
  'if you had a body what would you do',
  'do you want to be human',
  'do you wish you were human',
          ],

          skincare_facts: [
            'what is SPF',
            'what SPF should I use',
            'how often should I apply sunscreen',
            'what is retinol',
            'what does retinol do',
            'what is hyaluronic acid',
            'what is niacinamide',
            'what is vitamin C serum',
            'what is salicylic acid',
            'what is glycolic acid',
            'what is benzoyl peroxide',
            'what causes acne',
            'how to get rid of acne',
            'how to get rid of blackheads',
            'how to get rid of dark spots',
            'what causes wrinkles',
            'how to prevent wrinkles',
            'how to get rid of wrinkles',
            'what causes dry skin',
            'how to treat dry skin',
            'what causes oily skin',
            'how to treat oily skin',
            'what is combination skin',
            'what is sensitive skin',
            'what causes dark circles',
            'how to get rid of dark circles',
            'how to minimize pores',
            'what is a skincare routine',
            'what order should I apply skincare',
            'how often should I wash my face',
            'what is double cleansing',
            'what is toner',
            'what does toner do',
            'how often should I use face masks',
            'what is exfoliation',
            'how often should I exfoliate',
            'what is the difference between chemical and physical exfoliation',
            'what is collagen',
            'what causes aging',
            'how to prevent aging',
            'what are fine lines',
            'what is rosacea',
            'what is eczema',
            'what causes breakouts',
            'what is hormonal acne',
            'how to treat hormonal acne',
            'what is cystic acne',
            'how to get rid of acne scars',
            'what is hyperpigmentation',
            'what causes sun damage',
            'how to reverse sun damage',
            'what is skin cancer',
            'how to prevent skin cancer',
            'when should I see a dermatologist',
            'what is skin purging',
            'how to calm irritated skin'
          ],


          geography_facts: [
  'what is the largest country in the world',
  'what is the smallest country in the world',
  'what is the tallest mountain in the world',
  'what is the longest river in the world',
  'what is the largest desert in the world',
  'what is the largest ocean in the world',
  'what is the deepest ocean in the world',
  'what is the largest lake in the world',
  'what is the largest island in the world',
  'what is the highest waterfall in the world',
  'what is the deepest lake in the world',
  'what is the longest mountain range in the world',
  'what is the largest rainforest in the world',
  'what is the driest place on Earth',
  'what is the wettest place on Earth',
  'what is the hottest place on Earth',
  'what is the coldest place on Earth',
  'what is the windiest place on Earth',
  'how many continents are there',
  'what are the 7 continents',
  'how many oceans are there',
  'what are the 5 oceans',
  'which continent is the largest',
  'which continent is the smallest',
  'which ocean is the largest',
  'which ocean is the smallest',
  'what is the equator',
  'what is the prime meridian',
  'what is latitude',
  'what is longitude',
  'what is the North Pole',
  'what is the South Pole',
  'what is the Arctic',
  'what is Antarctica',
  'what is the tropics',
  'what is the Sahara Desert',
  'where is the Sahara Desert',
  'what is the Amazon Rainforest',
  'where is the Amazon Rainforest',
  'what is the Nile River',
  'where is the Nile River',
  'what is Mount Everest',
  'where is Mount Everest',
  'what is the Grand Canyon',
  'where is the Grand Canyon',
  'what is Niagara Falls',
  'where is Niagara Falls',
  'what is the Great Barrier Reef',
  'where is the Great Barrier Reef',
  'what is the Mariana Trench',
  'where is the Mariana Trench',
  'what is the Ring of Fire',
  'what is Pangaea',
  'what is continental drift',
  'what is plate tectonics',
  'what causes earthquakes',
  'what causes volcanoes',
  'what causes tsunamis',
  'what is the San Andreas Fault',
  'what is the Bermuda Triangle',
  'what is the International Date Line',
  'what are time zones',
  'how many time zones are there in the world',
  'what is Greenwich Mean Time',
  'what is GMT',
  'what is UTC',
  'what is a fjord',
  'what is a peninsula',
  'what is an archipelago',
  'what is a strait',
  'what is a delta',
  'what is a canyon',
  'what is a valley',
  'what is a plateau',
  'what is a glacier',
  'what is an iceberg',
  'what is a coral reef',
  'what is an atoll',
  'what is a bay',
  'what is a gulf',
  'what is a cape',
  'what is climate',
  'what is weather',
  'what is the difference between weather and climate',
  'what is a monsoon',
  'what is a hurricane',
  'what is a tornado',
  'what is a typhoon',
  'what is a cyclone',
  'what is the difference between hurricane and typhoon',
  'what causes seasons',
  'why is it hot at the equator',
  'why is it cold at the poles',
  'what is the greenhouse effect',
  'what is global warming',
  'what is climate change',
  'what is sea level rise',
  'what is deforestation',
  'what is desertification',
  'what is erosion',
  'what is weathering',
  'what are tectonic plates',
  'how many countries border China',
  'how many countries border Russia',
  'which country has the most neighbors',
  'which countries are landlocked',
  'what is a landlocked country'
],

car_queries: [
    'how to change a tire',
    'how to jump start a car',
    'how to check tire pressure',
    'how to change oil',
    'how to check oil level',
    'what does check engine light mean',
    'why is my car overheating',
    'why won\'t my car start',
    'how to parallel park',
    'how often should I change my oil',
    'how often should I rotate my tires',
    'what is the best car',
    'what is the most reliable car',
    'what is the safest car',
    'what is the cheapest car',
    'what is the fastest car',
    'what car should I buy',
    'how much is car insurance',
    'how to get cheaper car insurance',
    'what is full coverage insurance',
    'how to buy a used car',
    'what to look for when buying a used car',
    'how to negotiate car price',
    'what is a good mileage for a used car',
    'how long do cars last',
    'what is considered high mileage',
    'how to improve gas mileage',
    'what is good gas mileage',
    'what type of gas should I use',
    'premium vs regular gas',
    'how to wash a car',
    'how often should I wash my car',
    'what is car detailing',
    'how much does car detailing cost',
    'how to remove scratches from car',
    'what causes car rust',
    'how to prevent car rust',
    'what is synthetic oil',
    'synthetic vs conventional oil',
    'what is an oil filter',
    'what is transmission fluid',
    'what is brake fluid',
    'what is coolant',
    'what is power steering fluid',
    'how often should I replace brake pads',
    'what are the signs of bad brake pads',
    'how much does brake repair cost',
    'what is a timing belt',
    'when should I replace timing belt',
    'what happens if timing belt breaks'
  ],


ceo_queries: [
  'who is the CEO of Apple',
  'who is the CEO of Google',
  'who is the CEO of Microsoft',
  'who is the CEO of Amazon',
  'who is the CEO of Tesla',
  'who is the CEO of Meta',
  'who is the CEO of Facebook',
  'who is the CEO of Netflix',
  'who is the CEO of Disney',
  'who is the CEO of Nike',
  'who is the CEO of McDonald\'s',
  'who is the CEO of Starbucks',
  'who is the CEO of Walmart',
  'who is the CEO of Target',
  'who is the CEO of Costco',
  'who is the CEO of Samsung',
  'who is the CEO of Sony',
  'who is the CEO of Toyota',
  'who is the CEO of Ford',
  'who is the CEO of General Motors',
  'who is the CEO of BMW',
  'who is the CEO of Mercedes',
  'who is the CEO of Volkswagen',
  'who is the CEO of Coca Cola',
  'who is the CEO of Pepsi',
  'who is the CEO of Johnson & Johnson',
  'who is the CEO of Pfizer',
  'who is the CEO of Moderna',
  'who is the CEO of JPMorgan Chase',
  'who is the CEO of Bank of America',
  'who is the CEO of Wells Fargo',
  'who is the CEO of Goldman Sachs',
  'who is the CEO of Twitter',
  'who is the CEO of X',
  'who is the CEO of TikTok',
  'who is the CEO of YouTube',
  'who is the CEO of Instagram',
  'who is the CEO of Snapchat',
  'who is the CEO of Uber',
  'who is the CEO of Lyft',
  'who is the CEO of Airbnb',
  'who is the CEO of SpaceX',
  'who is the CEO of OpenAI',
  'who is the CEO of Nvidia',
  'who is the CEO of Intel',
  'who is the CEO of AMD',
  'who is the CEO of IBM',
  'who is the CEO of Oracle',
  'who is the CEO of Salesforce',
  'who is the CEO of Adobe'
],

company_founded: [
    'when was Apple founded',
    'when was Google founded',
    'when was Microsoft founded',
    'when was Amazon founded',
    'when was Tesla founded',
    'when was Facebook founded',
    'when was Meta founded',
    'when was Netflix founded',
    'when was Disney founded',
    'when was McDonald\'s founded',
    'when was Starbucks founded',
    'when was Coca Cola founded',
    'when was Pepsi founded',
    'when was Nike founded',
    'when was Adidas founded',
    'when was Walmart founded',
    'when was Target founded',
    'when was Toyota founded',
    'when was Ford founded',
    'when was General Motors founded',
    'when was BMW founded',
    'when was Mercedes founded',
    'when was Volkswagen founded',
    'when was Samsung founded',
    'when was Sony founded',
    'when was IBM founded',
    'when was Intel founded',
    'when was AMD founded',
    'when was Oracle founded',
    'when was Adobe founded',
    'when was Twitter founded',
    'when was YouTube founded',
    'when was Instagram founded',
    'when was Snapchat founded',
    'when was TikTok founded',
    'when was Uber founded',
    'when was Lyft founded',
    'when was Airbnb founded',
    'when was SpaceX founded',
    'when was PayPal founded',
    'when was eBay founded',
    'when was Yahoo founded',
    'when was AOL founded',
    'when was Skype founded',
    'when was Spotify founded',
    'when was Dropbox founded',
    'when was Zoom founded',
    'when was Slack founded',
    'when was OpenAI founded',
    'when was Nvidia founded'
  ],

  app_help: [
    'how to create a playlist on Spotify',
    'how to download songs on Spotify',
    'how to share a playlist on Spotify',
    'how to cancel Spotify subscription',
    'how to change Spotify username',
    'how to create a YouTube channel',
    'how to upload a video to YouTube',
    'how to monetize YouTube channel',
    'how to delete YouTube video',
    'how to change YouTube channel name',
    'how to make Instagram story',
    'how to delete Instagram post',
    'how to create Instagram Reels',
    'how to save Instagram photos',
    'how to change Instagram username',
    'how to make TikTok video',
    'how to add music to TikTok',
    'how to duet on TikTok',
    'how to save TikTok video',
    'how to delete TikTok video',
    'how to send disappearing messages on Instagram',
    'how to video chat on WhatsApp',
    'how to backup WhatsApp messages',
    'how to delete WhatsApp messages',
    'how to create WhatsApp group',
    'how to schedule tweets on Twitter',
    'how to pin tweet on Twitter',
    'how to delete Twitter account',
    'how to change Twitter handle',
    'how to create Twitter thread',
    'how to share Netflix account',
    'how to cancel Netflix subscription',
    'how to download Netflix shows',
  ],

  travel_queries: [
    'what to do in Paris',
    'best time to visit Paris',
    'how many days in Paris',
    'what to do in London',
    'best time to visit London',
    'how many days in London',
    'what to do in New York',
    'best time to visit New York',
    'how many days in New York',
    'what to do in Tokyo',
    'best time to visit Tokyo',
    'how many days in Tokyo',
    'what to do in Rome',
    'best time to visit Rome',
    'how many days in Rome',
    'what to do in Barcelona',
    'best time to visit Barcelona',
    'what to do in Amsterdam',
    'best time to visit Amsterdam',
    'what to do in Dubai',
    'best time to visit Dubai',
    'what to do in Bali',
    'best time to visit Bali',
    'what to do in Thailand',
    'best time to visit Thailand',
    'what to do in Greece',
    'best time to visit Greece',
    'what to do in Italy',
    'best time to visit Italy',
    'what to do in Spain',
    'best time to visit Spain',
    'what to do in Portugal',
    'best time to visit Portugal',
    'what to do in Iceland',
    'best time to visit Iceland',
    'what to do in Norway',
    'best time to visit Norway',
    'what to do in Hawaii',
    'best time to visit Hawaii',
    'what to do in California',
    'best time to visit California',
    'what to do in Florida',
    'best time to visit Florida',
    'what to do in Las Vegas',
    'best time to visit Las Vegas',
    'what to do in Miami',
    'best time to visit Miami',
    'what to do in Los Angeles',
    'what to do in San Francisco',
    'what to do in Chicago',
    'what to do in Australia',
    'best time to visit Australia',
    'what to do in Sydney',
    'what to do in Melbourne',
    'what to do in New Zealand',
    'best time to visit New Zealand',
    'what to do in Canada',
    'best time to visit Canada',
    'what to do in Toronto',
    'what to do in Vancouver',
    'what to do in Mexico',
    'best time to visit Mexico',
    'what to do in Cancun',
    'what to do in Costa Rica',
    'best time to visit Costa Rica',
    'what to do in Brazil',
    'best time to visit Brazil',
    'what to do in Argentina',
    'what to do in Peru',
    'best time to visit Peru',
    'what to do in Egypt',
    'best time to visit Egypt',
    'what to do in Morocco',
    'best time to visit Morocco',
    'what to do in South Africa',
    'best time to visit South Africa',
    'what to do in Kenya',
    'what to do in Tanzania',
    'what to do in India',
    'best time to visit India',
    'what to do in China',
    'best time to visit China',
    'what to do in South Korea',
    'best time to visit South Korea',
    'what to do in Singapore',
    'what to do in Malaysia',
    'what to do in Vietnam',
    'best time to visit Vietnam',
    'what to do in Indonesia',
    'what to do in Philippines',
    'what to do in Turkey',
    'best time to visit Turkey',
    'what to do in Israel',
    'what to do in Jordan',
    'what to do in Russia',
    'what to do in Croatia',
    'what to do in Czech Republic'
  ],

inventions: [
  'who invented the telephone',
  'who invented the light bulb',
  'who invented the computer',
  'who invented the internet',
  'who invented the airplane',
  'who invented the car',
  'who invented the television',
  'who invented the radio',
  'who invented the camera',
  'who invented the printing press',
  'who invented the wheel',
  'who invented electricity',
  'who invented the steam engine',
  'who invented the microwave',
  'who invented the refrigerator',
  'who invented the air conditioner',
  'who invented the washing machine',
  'who invented the dishwasher',
  'who invented the vacuum cleaner',
  'who invented the toaster',
  'who invented the phone',
  'who invented the cell phone',
  'who invented the smartphone',
  'who invented the iPhone',
  'who invented the iPad',
  'who invented the laptop',
  'who invented the mouse',
  'who invented the keyboard',
  'who invented the email',
  'who invented Google',
  'who invented Facebook',
  'who invented YouTube',
  'who invented Twitter',
  'who invented Instagram',
  'who invented WhatsApp',
  'who invented Uber',
  'who invented Netflix',
  'who invented Amazon',
  'who invented eBay',
  'who invented PayPal',
  'who invented Spotify',
  'who invented the calculator',
  'who invented the clock',
  'who refrigerator',
  'who invented the mirror',
  'who invented the bicycle',
  'who invented the motorcycle',
  'who invented the train',
  'who invented the helicopter',
  'who invented the rocket'
],

chemistry: [
    'what is an atom',
    'what is a molecule',
    'what is an element',
    'what is a compound',
    'what is the periodic table',
    'how many elements are in the periodic table',
    'what is hydrogen',
    'what is oxygen',
    'what is carbon',
    'what is nitrogen',
    'what is sodium',
    'what is chlorine',
    'what is iron',
    'what is gold',
    'what is silver',
    'what is copper',
    'what is helium',
    'what is neon',
    'what is water',
    'what is carbon dioxide',
    'what is methane',
    'what is ammonia',
    'what is salt',
    'what is sugar',
    'what is alcohol',
    'what is acid',
    'what is a base',
    'what is pH',
    'what is a neutral pH',
    'what is an acidic pH',
    'what is a basic pH',
    'what is hydrochloric acid',
    'what is sulfuric acid',
    'what is nitric acid',
    'what is sodium hydroxide',
    'what is a chemical reaction',
    'what is combustion',
    'what is oxidation',
    'what is reduction',
    'what is a catalyst',
    'what is an enzyme',
    'what is photosynthesis',
    'what is cellular respiration',
    'what is fermentation',
    'what is distillation',
    'what is evaporation',
    'what is condensation',
    'what is sublimation',
    'what is melting point',
    'what is boiling point',
    'what is freezing point',
    'what is density',
    'what is solubility',
    'what is concentration',
    'what is molarity',
    'what is molar mass',
    'what is atomic mass',
    'what is atomic number',
    'what is mass number',
    'what is an isotope',
    'what is radioactivity',
    'what is half-life',
    'what is nuclear decay',
    'what is alpha radiation',
    'what is beta radiation',
    'what is gamma radiation',
    'what is an electron',
    'what is a proton',
    'what is a neutron',
    'what is electron configuration',
    'what is valence electrons',
    'what is an ion',
    'what is a cation',
    'what is an anion',
    'what is ionic bonding',
    'what is covalent bonding',
    'what is metallic bonding',
    'what is hydrogen bonding',
    'what is a polar molecule',
    'what is a nonpolar molecule',
    'what is electronegativity',
    'what is organic chemistry',
    'what is inorganic chemistry',
    'what is biochemistry',
    'what is physical chemistry',
    'what is analytical chemistry',
    'what is a hydrocarbon',
    'what is methanol',
    'what is ethanol',
    'what is acetone',
    'what is benzene',
    'what is glucose',
    'what is fructose',
    'what is sucrose',
    'what is starch',
    'what is cellulose',
    'what is protein',
    'what is amino acid',
    'what is RNA',
    'what is a polymer',
    'what is plastic',
    'what is rubber',
    'what is soap',
    'what is detergent',
    'what is bleach',
    'what is vinegar',
    'what is baking soda'
  ],

  prime_ministers1: [
    'who is the prime minister of the United Kingdom',
    'who is the prime minister of Canada',
    'who is the prime minister of Australia',
    'who is the prime minister of New Zealand',
    'who is the prime minister of India',
    'who is the prime minister of Japan',
    'who is the prime minister of Italy',
    'who is the prime minister of Germany',
    'who is the prime minister of France',
    'who is the prime minister of Spain',
    'who is the prime minister of Netherlands',
    'who is the prime minister of Belgium',
    'who is the prime minister of Sweden',
    'who is the prime minister of Norway',
    'who is the prime minister of Denmark',
    'who is the prime minister of Finland',
    'who is the prime minister of Poland',
    'who is the prime minister of Greece',
    'who is the prime minister of Portugal',
    'who is the prime minister of Ireland',
    'who is the prime minister of Israel',
    'who is the prime minister of Turkey',
    'who is the prime minister of South Korea',
    'who is the prime minister of Thailand',
    'who is the prime minister of Malaysia',
    'who is the prime minister of Singapore',
    'who is the prime minister of Vietnam',
    'who is the prime minister of Bangladesh',
    'who is the prime minister of Pakistan',
    'who is the prime minister of Nepal',
    'who is the prime minister of Sri Lanka',
    'who is the prime minister of Jamaica',
    'who is the prime minister of Barbados',
    'who is the prime minister of Trinidad and Tobago',
    'who is the prime minister of Bahamas',
    'who is the prime minister of Czech Republic',
    'who is the prime minister of Slovakia',
    'who is the prime minister of Hungary',
    'who is the prime minister of Romania',
    'who is the prime minister of Bulgaria',
    'who is the prime minister of Croatia',
    'who is the prime minister of Slovenia',
    'who is the prime minister of Serbia',
    'who is the prime minister of Montenegro',
    'who is the prime minister of North Macedonia',
    'who is the prime minister of Albania',
    'who is the prime minister of Bosnia and Herzegovina',
    'who is the prime minister of Moldova',
    'who is the prime minister of Estonia',
    'who is the prime minister of Latvia',
    'who is the prime minister of Lithuania',
    'who is the prime minister of Luxembourg',
    'who is the prime minister of Malta',
    'who is the prime minister of Iceland',
    'who is the prime minister of Georgia',
    'who is the prime minister of Armenia',
    'who is the prime minister of Jordan',
    'who is the prime minister of Lebanon',
    'who is the prime minister of Iraq',
    'who is the prime minister of Kuwait',
    'who is the prime minister of Qatar',
    'who is the prime minister of Bahrain',
    'who is the prime minister of Morocco',
    'who is the prime minister of Tunisia',
    'who is the prime minister of Algeria',
    'who is the prime minister of Libya',
    'who is the prime minister of Egypt',
    'who is the prime minister of Sudan',
    'who is the prime minister of Ethiopia',
    'who is the prime minister of Kenya',
    'who is the prime minister of Uganda',
    'who is the prime minister of Tanzania',
    'who is the prime minister of Ghana',
    'who is the prime minister of Nigeria',
    'who is the prime minister of South Africa',
    'who is the prime minister of Mauritius',
    'who is the prime minister of Fiji',
    'who is the prime minister of Papua New Guinea',
    'who is the prime minister of Solomon Islands',
    'who is the prime minister of Vanuatu',
    'who is the prime minister of Samoa',
    'who is the prime minister of Tonga',
    'who is the prime minister of Tuvalu',
    'who is the prime minister of Cambodia',
    'who is the prime minister of Laos',
    'who is the prime minister of Myanmar',
    'who is the prime minister of Bhutan',
    'who is the prime minister of Maldives',
    'who is the prime minister of Afghanistan',
    'who is the prime minister of Uzbekistan',
    'who is the prime minister of Kazakhstan',
    'who is the prime minister of Kyrgyzstan',
    'who is the prime minister of Tajikistan',
    'who is the prime minister of Turkmenistan',
    'who is the prime minister of Mongolia',
    'who is the prime minister of North Korea',
    'who is the prime minister of Haiti',
    'who is the prime minister of Grenada',
    'who is the prime minister of Saint Lucia',
    'who is the prime minister of Saint Vincent and the Grenadines',
    'who is the prime minister of Dominica',
    'who is the prime minister of Antigua and Barbuda',
    'who is the prime minister of Saint Kitts and Nevis',
    'who is the prime minister of Belize'
  ],

  vacation_ideas1: [
    'where can I go on vacation',
    'where can I go for a road trip',
    'where can I go for a weekend trip',
    'where can I travel on a budget',
    'where can I go for a family vacation',
    'where can I go for spring break',
    'where can I go for a honeymoon',
    'where can I go for Christmas vacation',
    'where can I go for summer vacation'
  ],

  what_is_fruit: [
    "what is apple",
    "what is banana",
    "what is orange",
    "what is grape",
    "what is strawberry",
    "what is watermelon",
    "what is pineapple",
    "what is mango",
    "what is blueberry",
    "what is raspberry",
    "what is cherry",
    "what is peach",
    "what is pear",
    "what is kiwi",
    "what is lemon",
    "what is lime",
    "what is avocado",
    "what is tomato",
    "what is cucumber",
    "what is carrot",
    "what is broccoli",
    "what is cauliflower",
    "what is spinach",
    "what is lettuce",
    "what is cabbage",
    "what is celery",
    "what is zucchini",
    "what is pumpkin",
    "what is sweet potato",
    "what is potato",
    "what is onion",
    "what is garlic",
    "what is beetroot",
    "what is radish",
    "what is bell pepper",
    "what is chili pepper",
    "what is eggplant",
    "what is peas",
    "what is corn",
    "what is asparagus",
    "what is artichoke",
    "what is Brussels sprouts",
    "what is green beans",
    "what is kale",
    "what is leeks",
    "what is turnip",
    "what is parsnip",
    "what is mushroom",
    "what is okra",
    "what is rhubarb"
  ],

  who_is_president_queries: [
    "who is the president of the United States",
    "who is the president of France",
    "who is the president of Brazil",
    "who is the president of Russia",
    "who is the president of South Africa",
    "who is the president of Mexico",
    "who is the president of Argentina",
    "who is the president of Egypt",
    "who is the president of Nigeria",
    "who is the president of Indonesia",
    "who is the president of Turkey",
    "who is the president of Iran",
    "who is the president of Kenya",
    "who is the president of Colombia",
    "who is the president of Chile",
    "who is the president of Venezuela",
    "who is the president of Peru",
    "who is the president of Ghana",
    "who is the president of Uganda",
    "who is the president of Zimbabwe",
    "who is the president of Sudan",
    "who is the president of Tunisia",
    "who is the president of Algeria",
    "who is the president of Senegal",
    "who is the president of Paraguay",
    "who is the president of Ecuador",
    "who is the president of Belarus",
    "who is the president of Cuba",
    "who is the president of Botswana",
    "who is the president of Tanzania"
  ],

  what_should_i_queries: [
    "what should I eat for dinner",
    "what should I wear today",
    "what should I do for fun",
    "what should I study",
    "what should I buy",
    "what should I cook",
    "what should I watch",
    "what should I read",
    "what should I pack for vacation",
    "what should I write about",
    "what should I get my friend",
    "what should I do if I'm bored",
    "what should I plant in my garden",
    "what should I clean first",
    "what should I say in an interview",
    "what should I do when stressed",
    "what should I learn next",
    "what should I do for exercise",
    "what should I fix first in my house",
    "what should I do for my birthday",
    "what should I do after high school",
    "what should I do if I'm sick",
    "what should I do to save money",
    "what should I do if I'm lost",
    "what should I do to relax",
    "what should I bring to a party",
    "what should I do if I can't sleep",
    "what should I do for my skin",
    "what should I do if I feel anxious",
    "what should I do to be happy"
  ],
  
  
  animal_queries: [
    'how long do dogs live',
    'how long do cats live',
    'how long do elephants live',
    'how long do turtles live',
    'how long do goldfish live',
    'how long do hamsters live',
    'how long do rabbits live',
    'how long do horses live',
    'what do pandas eat',
    'what do koalas eat',
    'what do elephants eat',
    'what do giraffes eat',
    'what do lions eat',
    'what do tigers eat',
    'what do bears eat',
    'what do sharks eat',
    'what do whales eat',
    'what do dolphins eat',
    'what do penguins eat',
    'what do owls eat',
    'how fast can a cheetah run',
    'how fast can a lion run',
    'how fast can a horse run',
    'how fast can a dog run',
    'how fast can a human run',
    'how big do dogs get',
    'how big do cats get',
    'how big do elephants get',
    'how big do whales get',
    'how big do sharks get',
    'how many teeth do sharks have',
    'how many hearts does an octopus have',
    'how many legs does a spider have',
    'how many eyes do spiders have',
    'how many stomachs does a cow have',
    'how many bones do sharks have',
    'do fish sleep',
    'do sharks sleep',
    'do dolphins sleep',
    'do birds sleep',
    'do snakes sleep',
    'why do cats purr',
    'why do dogs wag their tails',
    'why do dogs bark',
    'why do cats meow',
    'why do roosters crow',
    'why do wolves howl',
    'why do elephants have big ears',
    'why do zebras have stripes',
    'why do flamingos stand on one leg',
    'who is the king of the jungle',
    'what is the largest animal in the world',
    'what is the smallest animal in the world',
    'what is the fastest animal in the world',
    'what is the slowest animal in the world',
    'what is the strongest animal in the world',
    'what is the smartest animal in the world',
    'what is the deadliest animal in the world',
    'what is the most dangerous animal in the world',
    'what is the tallest animal in the world',
    'what is the heaviest animal in the world',
    'what is the loudest animal in the world',
    'what animal lives the longest',
    'what animal has the best eyesight',
    'what animal has the best hearing',
    'what animal has the best sense of smell',
    'are sharks mammals',
    'are whales mammals',
    'are dolphins mammals',
    'are bats mammals',
    'are penguins birds',
    'are spiders insects',
    'are snakes reptiles',
    'can dogs see color',
    'can cats see color',
    'can dogs eat chocolate',
    'can cats eat chocolate',
    'can fish drown',
    'can sharks smell blood',
    'can elephants swim',
    'can pigs fly',
    'can chickens fly',
    'can penguins fly',
    'can ostriches fly',
    'do animals dream',
    'do fish have feelings',
    'do animals feel pain',
    'do insects feel pain',
    'do fish have brains',
    'do jellyfish have brains',
    'do worms have eyes',
    'do snakes have ears',
    'do fish have hearts',
    'do insects have blood',
    'how do birds fly',
    'how do fish breathe',
    'how do snakes move',
    'how do spiders make webs',
    'how do bees make honey'
  ],

  color_mix: [
    'what happens when you mix red and blue',
    'what happens when you mix red and yellow',
    'what happens when you mix blue and yellow',
    'what happens when you mix red and green',
    'what happens when you mix blue and green',
    'what happens when you mix yellow and green',
    'what happens when you mix red and white',
    'what happens when you mix blue and white',
    'what happens when you mix yellow and white',
    'what happens when you mix green and white',
    'what happens when you mix red and black',
    'what happens when you mix blue and black',
    'what happens when you mix yellow and black',
    'what happens when you mix green and black',
    'what happens when you mix black and white',
    'what happens when you mix red and orange',
    'what happens when you mix blue and orange',
    'what happens when you mix yellow and orange',
    'what happens when you mix red and purple',
    'what happens when you mix blue and purple',
    'what happens when you mix yellow and purple',
    'what happens when you mix green and purple',
    'what happens when you mix orange and purple',
    'what happens when you mix red and pink',
    'what happens when you mix blue and pink',
    'what happens when you mix yellow and pink',
    'what happens when you mix green and pink',
    'what happens when you mix purple and pink',
    'what happens when you mix orange and pink',
    'what happens when you mix red and brown',
    'what happens when you mix blue and brown',
    'what happens when you mix yellow and brown',
    'what happens when you mix green and brown',
    'what happens when you mix orange and brown',
    'what happens when you mix purple and brown',
    'what happens when you mix pink and brown',
    'what happens when you mix red and gray',
    'what happens when you mix blue and gray',
    'what happens when you mix yellow and gray',
    'what happens when you mix green and gray',
    'what happens when you mix orange and gray',
    'what happens when you mix purple and gray',
    'what happens when you mix pink and gray',
    'what happens when you mix brown and gray',
    'what happens when you mix all colors',
    'what happens when you mix primary colors',
    'what happens when you mix secondary colors',
    'what color do you get when you mix red and blue',
    'what color do you get when you mix red and yellow',
    'what color do you get when you mix blue and yellow',
    'what color do you get when you mix red and green',
    'what color do you get when you mix blue and green',
    'what color do you get when you mix yellow and green',
    'what color do you get when you mix red and orange',
    'what color do you get when you mix blue and orange',
    'what color do you get when you mix yellow and orange',
    'what color do you get when you mix red and purple',
    'what color do you get when you mix blue and purple',
    'what color do you get when you mix yellow and purple',
    'what color do you get when you mix green and orange',
    'what color do you get when you mix green and purple',
    'what color do you get when you mix orange and purple',
    'what color do you get when you mix red and white',
    'what color do you get when you mix blue and white',
    'what color do you get when you mix yellow and white',
    'what color do you get when you mix green and white',
    'what color do you get when you mix orange and white',
    'what color do you get when you mix purple and white',
    'what color do you get when you mix red and black',
    'what color do you get when you mix blue and black',
    'what color do you get when you mix yellow and black',
    'what color do you get when you mix green and black',
    'what color do you get when you mix orange and black',
    'what color do you get when you mix purple and black',
    'what color do you get when you mix red and pink',
    'what color do you get when you mix blue and pink',
    'what color do you get when you mix yellow and pink',
    'what color do you get when you mix green and pink',
    'what color do you get when you mix orange and pink',
    'what color do you get when you mix purple and pink',
    'what color do you get when you mix red and brown',
    'what color do you get when you mix blue and brown',
    'what color do you get when you mix yellow and brown',
    'what color do you get when you mix green and brown',
    'what color do you get when you mix orange and brown',
    'what color do you get when you mix purple and brown',
    'what color do you get when you mix pink and brown',
    'what color do you get when you mix red and gray',
    'what color do you get when you mix blue and gray',
    'what color do you get when you mix yellow and gray',
    'what color do you get when you mix green and gray',
    'what color do you get when you mix orange and gray',
    'what color do you get when you mix purple and gray',
    'what color do you get when you mix pink and gray',
    'what color do you get when you mix brown and gray',
    'what color do you get when you mix white and gray',
    'what color do you get when you mix black and gray'
  ],
  

  space_queries: [
    'what planet is closest to the sun',
    'what planet is second from the sun',
    'what planet is third from the sun',
    'what planet is fourth from the sun',
    'what planet is fifth from the sun',
    'what planet is sixth from the sun',
    'what planet is seventh from the sun',
    'what planet is eighth from the sun',
    'what planet is farthest from the sun',
    'how many planets are in our solar system',
    'what are the planets in order',
    'what is the largest planet',
    'what is the smallest planet',
    'what is the hottest planet',
    'what is the coldest planet',
    'which planet has rings',
    'which planet has the most moons',
    'how many moons does Earth have',
    'how many moons does Mars have',
    'how many moons does Jupiter have',
    'how many moons does Saturn have',
    'how many moons does Uranus have',
    'how many moons does Neptune have',
    'what is the sun',
    'how big is the sun',
    'how hot is the sun',
    'how far is the sun from Earth',
    'what is the moon',
    'how big is the moon',
    'how far is the moon from Earth',
    'why does the moon change shape',
    'what are the phases of the moon',
    'what is a solar eclipse',
    'what is a lunar eclipse',
    'what is a black hole',
    'what is a galaxy',
    'what galaxy do we live in',
    'how many galaxies are there',
    'what is the Milky Way',
    'what is a star',
    'how many stars are there',
    'what is the closest star to Earth',
    'what is the brightest star',
    'what is a constellation',
    'what is the Big Dipper',
    'what is the North Star',
    'what is a meteor',
    'what is a meteorite',
    'what is a comet',
    'what is an asteroid',
    'what is the asteroid belt',
    'what is the International Space Station',
    'what is NASA',
    'who was the first person in space',
    'who was the first person on the moon',
    'when did humans first land on the moon',
    'how long does it take to get to the moon',
    'how long does it take to get to Mars',
    'what is the speed of light',
    'how fast does light travel',
    'what is a light year',
    'how big is the universe',
    'how old is the universe',
    'what is the Big Bang',
    'is there life on other planets',
    'is there life on Mars',
    'what is alien life',
    'what are UFOs',
    'what is gravity',
    'why do planets orbit the sun',
    'what is a satellite',
    'what is space',
    'what is the atmosphere',
    'what is the ozone layer',
    'what causes seasons',
    'why is space dark',
    'why is space cold',
    'can you breathe in space',
    'what do astronauts eat',
    'how do astronauts sleep',
    'what is a space suit',
    'what is a rocket',
    'what is SpaceX',
    'what is the Hubble telescope',
    'what is the James Webb telescope',
    'what is Mars',
    'what is Venus',
    'what is Mercury',
    'what is Jupiter',
    'what is Saturn',
    'what is Uranus',
    'what is Neptune',
    'what is Pluto',
    'why is Pluto not a planet',
    'what is a dwarf planet',
    'what is the Kuiper Belt',
    'what is the Oort Cloud',
    'what are Saturn\'s rings made of',
    'what is the Great Red Spot',
    'what is a supernova',
    'what is a neutron star',
    'what is a pulsar',
    'what is dark matter',
    'what is dark energy'
  ],

  random_facts: [
    'why is the sky blue',
    'why is grass green',
    'why is blood red',
    'why do we yawn',
    'why do we hiccup',
    'why do we sneeze',
    'why do we cry',
    'why do we laugh',
    'why do we sleep',
    'why do we dream',
    'why do we get goosebumps',
    'why do we have fingerprints',
    'why do we have belly buttons',
    'why do we age',
    'why is the ocean salty',
    'why do bananas turn brown',
    'why do apples turn brown',
    'why do leaves change color',
    'why do flowers smell',
    'why do onions make you cry',
    'why does ice float',
    'why does hot water freeze faster',
    'why does soap clean',
    'why does rubber bounce',
    'why does metal conduct electricity',
    'why does wood float',
    'why does oil float on water',
    'why does sugar dissolve in water',
    'why does salt melt ice',
    'why does bread rise',
    'why does popcorn pop',
    'why does coffee keep you awake',
    'why does alcohol make you drunk',
    'why does spicy food make you sweat',
    'why does mint make your mouth cold',
    'why does garlic make your breath smell',
    'why does cheese smell',
    'why does milk expire',
    'why does food spoil',
    'why does fire burn',
    'why does water boil',
    'why does ice melt',
    'why does glass break',
    'why does paper cut',
    'why does glue stick',
    'why does velcro work',
    'why does a compass point north',
    'why does lightning happen',
    'why does thunder follow lightning',
    'why does rain fall',
    'why is water wet',
    'why do we have two eyes',
    'why do we have two ears',
    'why do we have eyebrows',
    'why do we have eyelashes',
    'why do we have hair',
    'why do we have nails',
    'why do cats have nine lives',
    'why do we say bless you when someone sneezes',
    'why do we shake hands',
    'why do we clap',
    'why do we kiss',
    'why do we hug',
    'why do clocks go clockwise',
    'why do we drive on the right side',
    'why do traffic lights have those colors',
    'why are stop signs red',
    'why are school buses yellow',
    'why do we get brain freeze',
    'why do we get dizzy when we spin',
    'why do we get hungry',
    'why do we get thirsty',
    'why do we burp',
    'why do we fart',
    'why do rainbows appear',
    'why does the sun rise in the east',
    'why don\'t we fall off the Earth'
  ],


  colour_mixes1: [ 'what happens when you mix no colors', 'what happens when you use red', 'what happens when you use blue', 'what happens when you mix red and blue', 
  'what happens when you use yellow', 'what happens when you mix red and yellow', 'what happens when you mix blue and yellow', 'what happens when you mix red, blue and yellow',
   'what happens when you use orange', 'what happens when you mix red and orange', 'what happens when you mix blue and orange', 'what happens when you mix red, blue and orange', 
   'what happens when you mix yellow and orange', 'what happens when you mix red, yellow and orange', 'what happens when you mix blue, yellow and orange', 'what happens when you mix red, blue, yellow and orange'
   , 'what happens when you use green', 'what happens when you mix red and green', 'what happens when you mix blue and green', 'what happens when you mix red, blue and green', 'what happens when you mix yellow and green'
   , 'what happens when you mix red, yellow and green', 'what happens when you mix blue, yellow and green', 'what happens when you mix red, blue, yellow and green', 'what happens when you mix orange and green'
   , 'what happens when you mix red, orange and green', 'what happens when you mix blue, orange and green', 'what happens when you mix red, blue, orange and green', 'what happens when you mix yellow, orange and green'
   , 'what happens when you mix red, yellow, orange and green', 'what happens when you mix blue, yellow, orange and green', 'what happens when you mix red, blue, yellow, orange and green', 'what happens when you use pink'
   , 'what happens when you mix red and pink', 'what happens when you mix blue and pink', 'what happens when you mix red, blue and pink', 'what happens when you mix yellow and pink', 'what happens when you mix red, yellow and pink'
   , 'what happens when you mix blue, yellow and pink', 'what happens when you mix red, blue, yellow and pink', 'what happens when you mix orange and pink', 'what happens when you mix red, orange and pink', 'what happens when you mix blue, orange and pink'
   , 'what happens when you mix red, blue, orange and pink', 'what happens when you mix yellow, orange and pink', 'what happens when you mix red, yellow, orange and pink', 'what happens when you mix blue, yellow, orange and pink', 'what happens when you mix red, blue, yellow, orange and pink'
   , 'what happens when you mix green and pink', 'what happens when you mix red, green and pink', 'what happens when you mix blue, green and pink', 'what happens when you mix red, blue, green and pink', 'what happens when you mix yellow, green and pink', 'what happens when you mix red, yellow, green and pink'
   , 'what happens when you mix blue, yellow, green and pink', 'what happens when you mix red, blue, yellow, green and pink', 'what happens when you mix orange, green and pink', 'what happens when you mix red, orange, green and pink', 'what happens when you mix blue, orange, green and pink', 'what happens when you mix red, blue, orange, green and pink', 'what happens when you mix yellow, orange, green and pink'
   , 'what happens when you mix red, yellow, orange, green and pink', 'what happens when you mix blue, yellow, orange, green and pink', 'what happens when you mix red, blue, yellow, orange, green and pink', 'what happens when you use purple', 'what happens when you mix red and purple', 'what happens when you mix blue and purple', 'what happens when you mix red, blue and purple', 'what happens when you mix yellow and purple', 'what happens when you mix red, yellow and purple', 'what happens when you mix blue, yellow and purple', 'what happens when you mix red, blue, yellow and purple', 'what happens when you mix orange and purple', 'what happens when you mix red, orange and purple'
   , 'what happens when you mix blue, orange and purple', 'what happens when you mix red, blue, orange and purple', 'what happens when you mix yellow, orange and purple', 'what happens when you mix red, yellow, orange and purple', 'what happens when you mix blue, yellow, orange and purple', 'what happens when you mix red, blue, yellow, orange and purple', 'what happens when you mix green and purple', 'what happens when you mix red, green and purple', 'what happens when you mix blue, green and purple', 'what happens when you mix red, blue, green and purple', 'what happens when you mix yellow, green and purple', 'what happens when you mix red, yellow, green and purple', 'what happens when you mix blue, yellow, green and purple'
   , 'what happens when you mix red, blue, yellow, green and purple', 'what happens when you mix orange, green and purple', 'what happens when you mix red, orange, green and purple', 'what happens when you mix blue, orange, green and purple', 'what happens when you mix red, blue, orange, green and purple', 'what happens when you mix yellow, orange, green and purple', 'what happens when you mix red, yellow, orange, green and purple', 'what happens when you mix blue, yellow, orange, green and purple', 'what happens when you mix red, blue, yellow, orange, green and purple', 'what happens when you mix pink and purple', 'what happens when you mix red, pink and purple', 'what happens when you mix blue, pink and purple', 'what happens when you mix red, blue, pink and purple', 'what happens when you mix yellow, pink and purple'
   , 'what happens when you mix red, yellow, pink and purple', 'what happens when you mix blue, yellow, pink and purple', 'what happens when you mix red, blue, yellow, pink and purple', 'what happens when you mix orange, pink and purple', 'what happens when you mix red, orange, pink and purple', 'what happens when you mix blue, orange, pink and purple', 'what happens when you mix red, blue, orange, pink and purple', 'what happens when you mix yellow, orange, pink and purple', 'what happens when you mix red, yellow, orange, pink and purple', 'what happens when you mix blue, yellow, orange, pink and purple', 'what happens when you mix red, blue, yellow, orange, pink and purple', 'what happens when you mix green, pink and purple', 'what happens when you mix red, green, pink and purple', 'what happens when you mix blue, green, pink and purple', 'what happens when you mix red, blue, green, pink and purple', 'what happens when you mix yellow, green, pink and purple', 'what happens when you mix red, yellow, green, pink and purple', 'what happens when you mix blue, yellow, green, pink and purple', 'what happens when you mix red, blue, yellow, green, pink and purple', 'what happens when you mix orange, green, pink and purple', 'what happens when you mix red, orange, green, pink and purple', 'what happens when you mix blue, orange, green, pink and purple', 'what happens when you mix red, blue, orange, green, pink and purple', 'what happens when you mix yellow, orange, green, pink and purple', 'what happens when you mix red, yellow, orange, green, pink and purple', 'what happens when you mix blue, yellow, orange, green, pink and purple', 'what happens when you mix red, blue, yellow, orange, green, pink and purple' ],


   




          
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
  getNextTopics(domain, batchSize = 5) {
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

🎯 PRIMARY GOAL: Generate the MOST COMMON ways real users would actually type questions about "${validatedTopic}"

CRITICAL INSTRUCTIONS:
1. QUESTIONS section = 5 EXTREMELY COMMON ways users would ask about THE SAME SPECIFIC THING related to "${validatedTopic}"
2. RESPONSES section = 5 different answers that ALL address that SAME specific aspect

QUESTIONS MUST BE:
- The MOST LIKELY phrases users would actually type in a chatbot
- Natural, conversational language (not formal)
- Common keywords users search for
- Simple, everyday phrasing
- Focus on ONE specific aspect and make 5 variations of how people commonly ask about it
- Think: "How would a typical person phrase this question?"

MAXIMIZE MATCH PROBABILITY by using:
- Very common words like "tips", "help", "how to", "advice", "guide", "best way"
- Simple language patterns users naturally use
- Both formal and casual variations
- Question words people actually use

RESPONSES should be:
- 5 different ways to give advice about the SAME thing
- All responses address the SAME specific issue
- NO NUMBERING (no "1.", "2.", etc.)
- Vary the wording but keep the core advice consistent

PERFECT EXAMPLE for "better sleep":
QUESTIONS: (all asking about bedtime routine - the most common way people ask)
better sleep routine
bedtime routine tips
nighttime routine help
how to create sleep routine
sleep routine advice

RESPONSES: (all about creating bedtime routine, just worded differently)
Try establishing a consistent bedtime routine every night.
Create a relaxing routine before bed to signal it's time to sleep.
Develop regular pre-sleep habits that help you wind down.
Having the same bedtime activities each night improves sleep quality.
A consistent evening routine helps your body prepare for rest.

ANOTHER EXAMPLE for "pull ups":
QUESTIONS: (all asking about improving pull-ups - most common phrasing)
how to do pull ups better
pull up tips
improve pull ups
pull up help
get better at pull ups

Now generate for "${validatedTopic}" - pick the MOST COMMON specific aspect users ask about and create 5 natural variations:

QUESTIONS:
[5 MOST COMMON ways users would naturally ask about the SAME specific thing related to ${validatedTopic}]

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

  async generateForDomain(domainName, saveInterval = 10) {
    console.log(`\n🔄 Processing ${domainName} domain...`);
    
    const topics = this.domains[domainName];
    if (!Array.isArray(topics) || topics.length === 0) {
      console.log(`  ⚠️  No topics found for domain: ${domainName}`);
      return [];
    }

    // Get starting point from progress
    const startIndex = this.progress[domainName] || 0;
    
    if (startIndex >= topics.length) {
      console.log(`  ✅ All topics already completed for ${domainName} domain!`);
      return [];
    }

    const remainingTopics = topics.slice(startIndex);
    console.log(`  📍 Processing remaining ${remainingTopics.length} topics for ${domainName} (${startIndex}/${topics.length} already done)`);

    let processedCount = 0;

    for (let i = 0; i < remainingTopics.length; i++) {
      const topic = remainingTopics[i];
      const currentIndex = startIndex + i;
      
      console.log(`  📝 [${currentIndex + 1}/${topics.length}] Generating data for: ${topic}`);

      try {
        const entry = await this.generateCompleteEntry(topic, domainName);
        
        // Skip if duplicate was detected or entry is invalid
        if (entry === null || !entry.questions || !entry.responses) {
          console.log(`    ⚠️  Skipping invalid entry for: ${topic}`);
          // Still update progress even for skipped entries
          this.progress[domainName] = currentIndex + 1;
          this.saveProgress();
          continue;
        }
        
        const formattedEntry = this.formatAsTrainingData(entry.questions, entry.responses);
        if (formattedEntry && formattedEntry.pattern && formattedEntry.responses) {
          // Save EACH entry immediately to responseData.js to prevent any loss
          const singleEntryData = {};
          singleEntryData[domainName] = [formattedEntry];
          
          console.log(`    💾 Saving entry to responseData.js...`);
          const saveSuccess = await this.appendToFile(singleEntryData, 'responseData.js');
          
          if (saveSuccess) {
            processedCount++;
            console.log(`    ✅ Entry ${processedCount} saved successfully for: ${topic}`);
          } else {
            console.log(`    ❌ Failed to save entry for: ${topic} - will retry`);
            // Retry save once
            await this.delay(1000);
            const retrySuccess = await this.appendToFile(singleEntryData, 'responseData.js');
            if (retrySuccess) {
              processedCount++;
              console.log(`    🔄 Entry ${processedCount} saved on retry for: ${topic}`);
            } else {
              console.log(`    ❌❌ CRITICAL: Could not save entry for: ${topic}`);
              // Log the entry to console so it's not completely lost
              console.log(`    📄 LOST ENTRY DATA:`, JSON.stringify(formattedEntry, null, 2));
            }
          }
        }
        
        // Update progress after each entry (successful or not)
        this.progress[domainName] = currentIndex + 1;
        this.saveProgress();
        
        // Show progress every 5 entries
        if (processedCount > 0 && processedCount % 5 === 0) {
          console.log(`    📊 Progress: ${processedCount} entries saved, ${currentIndex + 1}/${topics.length} topics processed`);
        }
        
        // Rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`  ❌ Error processing ${topic}:`, error.message);
        
        // Add fallback entry and save it immediately
        try {
          const fallback = this.createFallbackEntry(topic);
          const formattedFallback = this.formatAsTrainingData(fallback.questions, fallback.responses);
          if (formattedFallback && formattedFallback.pattern && formattedFallback.responses) {
            
            const fallbackData = {};
            fallbackData[domainName] = [formattedFallback];
            
            console.log(`    💾 Saving fallback entry to responseData.js...`);
            const saveSuccess = await this.appendToFile(fallbackData, 'responseData.js');
            
            if (saveSuccess) {
              processedCount++;
              console.log(`    🔄 Fallback entry ${processedCount} saved for: ${topic}`);
            } else {
              console.log(`    ❌ Failed to save fallback entry for: ${topic}`);
              console.log(`    📄 LOST FALLBACK DATA:`, JSON.stringify(formattedFallback, null, 2));
            }
          }
        } catch (fallbackError) {
          console.error(`  ❌ Fallback also failed for ${topic}:`, fallbackError.message);
        }
        
        // Update progress even for failed entries
        this.progress[domainName] = currentIndex + 1;
        this.saveProgress();
      }
    }

    console.log(`✅ ${domainName} domain completed! Successfully saved ${processedCount} entries to responseData.js`);
    
    // Mark domain as completed
    this.progress[domainName] = topics.length;
    this.saveProgress();
    
    return [];
  }

  async generateAllDomains(saveInterval = 10) {
    console.log(`🎯 Starting COMPLETE generation of all domains with auto-save every ${saveInterval} entries...\n`);
    
    const incompleteDomains = Object.entries(this.domains).filter(([domainName, topics]) => {
      return (this.progress[domainName] || 0) < topics.length;
    });

    if (incompleteDomains.length === 0) {
      console.log('🎉 All domains are already 100% complete!');
      return {};
    }

    console.log(`📋 Domains to complete: ${incompleteDomains.map(([name]) => name).join(', ')}\n`);
    
    for (const [domainName, topics] of incompleteDomains) {
      try {
        const remaining = topics.length - (this.progress[domainName] || 0);
        console.log(`\n🚀 Starting ${domainName} domain (${remaining} topics remaining)...`);
        
        // Process entire domain until completion
        await this.generateForDomain(domainName, saveInterval);
        
        console.log(`✅ ${domainName} domain 100% complete!`);
        
      } catch (error) {
        console.error(`❌ Failed to complete ${domainName}:`, error.message);
        console.log(`🔄 Progress saved, you can resume later`);
      }
    }

    // Final progress save
    this.saveProgress();
    
    console.log('\n🎊 GENERATION COMPLETE! All domains processed.');
    return {}; // Return empty since all data has been saved to file incrementally
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
      
      jsContent += '};\n\nexport default responses;';
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
          
          // Handle both CommonJS and ES6 module formats
          let match = existingContent.match(/const responses = ({[\s\S]*?});/);
          if (match) {
            // Safely evaluate the existing responses object
            try {
              existingData = eval('(' + match[1] + ')');
            } catch (evalError) {
              console.log('⚠️  Could not parse existing responses object with eval, trying alternative method...');
              
              // Alternative parsing method for complex objects
              try {
                // Create a temporary file to require it
                const tempFile = filename + '.temp.js';
                const tempContent = existingContent.replace(/export default responses;?/g, 'module.exports = responses;');
                fs.writeFileSync(tempFile, tempContent);
                
                // Clear require cache and require the temp file
                delete require.cache[path.resolve(tempFile)];
                existingData = require(path.resolve(tempFile));
                
                // Clean up temp file
                fs.unlinkSync(tempFile);
              } catch (requireError) {
                console.log('⚠️  Alternative parsing also failed, starting with empty data');
                existingData = {};
              }
            }
          } else {
            console.log('⚠️  Could not find responses object pattern in existing file');
          }
        } catch (error) {
          console.log('⚠️  Could not parse existing file, creating backup...');
          fs.writeFileSync(filename + '.backup', existingContent);
          existingData = {};
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
    // Generate ALL training data until 100% complete with auto-save every 10 entries
    console.log('🎯 MODE: Complete Generation (all domains until 100% done)');
    console.log('💾 Auto-save: Every 10 entries to prevent data loss\n');
    
    const trainingData = await generator.generateAllDomains(10);
    
    // Show final statistics
    console.log('\n📊 FINAL STATISTICS:');
    generator.showProgress();
    
    // Validate that everything is complete
    if (generator.isAllTopicsCompleted()) {
      console.log('\n🎉 SUCCESS! All topics have been completed!');
      
      // Count total entries in the final file
      try {
        const finalContent = fs.readFileSync('responseData.js', 'utf8');
        const match = finalContent.match(/const responses = ({[\s\S]*?});/);
        if (match) {
          const finalData = eval('(' + match[1] + ')');
          const totalEntries = Object.values(finalData).reduce((sum, entries) => {
            return sum + (Array.isArray(entries) ? entries.length : 0);
          }, 0);
          
          console.log(`📈 Total entries in database: ${totalEntries}`);
          console.log(`🎯 Domains covered: ${Object.keys(finalData).length}`);
        }
      } catch (error) {
        console.log('📊 Could not count final entries, but generation completed successfully');
      }
      
      console.log(`\n📁 Files updated:`);
      console.log(`   - responseData.js (complete database - 100% of all topics)`);
      console.log(`   - responseData.json (backup)`);
      console.log(`   - topic_progress.json (progress tracking - all domains at 100%)`);
      console.log(`\n💡 Your chatbot database is now complete!`);
      console.log(`   Use: import responses from './responseData.js'; in your chatbot`);
      
    } else {
      console.log('\n⚠️  Some domains may not be complete. Check progress above.');
      console.log('💡 Run the script again to continue where it left off.');
    }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   - Check your OpenAI API key');
    console.log('   - Ensure you have internet connection');
    console.log('   - Verify you have sufficient OpenAI credits');
    console.log('   - Your progress has been saved - you can resume by running again');
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