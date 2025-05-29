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
      recipes_oa: [
          'how to make scrambled eggs',
          'how to cook eggs',
          'how to cook eggs over easy',
          'how to make omelet',
          'how to cook bacon',
          'how to make toast',
          'how to make pancakes',
          'how to make waffles',
          'how to make french toast',
          'how to make oatmeal',
          'how to make coffee',
          'how to make tea',
          'how to cook pasta',
          'how to cook noodles',
          'how to make spaghetti',
          'how to make ramen',
          'how to make instant ramen',
          'how to make instant noodles',
          'how to cook rice',
          'how to make fried rice',
          'how to cook chicken',
          'how to cook chicken breast',
          'how to make grilled chicken',
          'how to make fried chicken',
          'how to make chicken parmesan',
          'how to make roast chicken',
          'how to cook ground beef',
          'how to make grilled cheese',
          'how to make sandwiches',
          'how to make PB&J',
          'how to make peanut butter and jelly sandwich',
          'how to cook steak',
          'how to make hamburgers',
          'how to make burgers',
          'how to make pizza',
          'how to make tacos',
          'how to make quesadillas',
          'how to make nachos',
          'how to make guacamole',
          'how to make salsa',
          'how to make mac and cheese',
          'how to make mac n cheese',
          'how to make mashed potatoes',
          'how to cook baked potatoes',
          'how to make french fries',
          'how to make salad',
          'how to make caesar salad',
          'how to make pasta salad',
          'how to make potato salad',
          'how to make tuna salad',
          'how to make egg salad',
          'how to make chicken salad',
          'how to make coleslaw',
          'how to make chicken soup',
          'how to make chicken noodle soup',
          'how to make tomato soup',
          'how to make chili',
          'how to make beef stew',
          'how to cook meatballs',
          'how to make spaghetti and meatballs',
          'how to make lasagna',
          'how to make meatloaf',
          'how to cook pork chops',
          'how to make pot roast',
          'how to cook turkey',
          'how to cook salmon',
          'how to cook fish',
          'how to make stuffing',
          'how to make gravy',
          'how to bake cookies',
          'how to bake chocolate chip cookies',
          'how to make brownies',
          'how to bake cake',
          'how to make chocolate cake',
          'how to bake bread',
          'how to make banana bread',
          'how to make biscuits',
          'how to make muffins',
          'how to make smoothies',
          'how to make milkshake'
        ],

        physics: [
          'what is velocity',
          'what is acceleration',
          'what is force',
          'what is Newton\'s first law',
          'what is Newton\'s second law',
          'what is Newton\'s third law',
          'what is gravity',
          'what is friction',
          'what is momentum',
          'what is energy',
          'what is kinetic energy',
          'what is potential energy',
          'what is work',
          'what is power',
          'what is mass',
          'what is weight',
          'what is density',
          'what is pressure',
          'what is speed',
          'what is displacement',
          'what is distance',
          'what is motion',
          'what is uniform motion',
          'what is projectile motion',
          'what is circular motion',
          'what is centripetal force',
          'what is centrifugal force',
          'what is inertia',
          'what is conservation of energy',
          'what is conservation of momentum',
          'what is heat',
          'what is temperature',
          'what is thermal energy',
          'what is conduction',
          'what is convection',
          'what is radiation',
          'what is electric charge',
          'what is electric current',
          'what is voltage',
          'what is resistance',
          'what is Ohm\'s law',
          'what is electric field',
          'what is magnetic field',
          'what is electromagnetic induction',
          'what is frequency',
          'what is wavelength',
          'what is amplitude',
          'what is wave',
          'what is sound wave',
          'what is light wave',
          'what is reflection',
          'what is refraction',
          'what is interference',
          'what is diffraction',
          'what is atom',
          'what is electron',
          'what is proton',
          'what is neutron',
          'what is nucleus',
          'what is radioactivity',
          'what is half-life',
          'what is alpha radiation',
          'what is beta radiation',
          'what is gamma radiation',
          'what is fission',
          'what is fusion',
          'what is electric circuit',
          'what is series circuit',
          'what is parallel circuit',
          'what is transformer',
          'what is generator',
          'what is motor',
          'what is lens',
          'what is mirror',
          'what is prism',
          'what is photon',
          'what is quantum',
          'what is relativity',
          'what is time dilation',
          'what is Doppler effect',
          'what is simple harmonic motion',
          'what is pendulum',
          'what is spring constant',
          'what is torque',
          'what is angular velocity',
          'what is moment of inertia',
          'what is buoyancy',
          'what is Archimedes principle',
          'what is Pascal\'s principle',
          'what is Bernoulli\'s principle',
          'what is ideal gas law',
          'what is absolute zero',
          'what is entropy',
          'what is capacitor',
          'what is inductor',
          'what is semiconductor',
          'what is superconductor',
          'what is laser',
          'what is plasma',
          'what is black hole',
          'what is electromagnetic spectrum',
          'what is X-rays',
          'what is infrared radiation',
          'what is ultraviolet radiation',
          'what are the states of matter',
          'what is evaporation',
          'what is condensation',

        ],



        biology_oa: [
          'what is a cell',
          'what is DNA',
          'what is RNA',
          'what is mitosis',
          'what is meiosis',
          'what is photosynthesis',
          'what is cellular respiration',
          'what is evolution',
          'what is natural selection',
          'what is genetics',
          'what is heredity',
          'what is a gene',
          'what is a chromosome',
          'what is protein',
          'what is an enzyme',
          'what is metabolism',
          'what is homeostasis',
          'what is osmosis',
          'what is diffusion',
          'what is the cell membrane',
          'what is the nucleus',
          'what is mitochondria',
          'what is chloroplast',
          'what is cytoplasm',
          'what is ATP',
          'what is glucose',
          'what is adaptation',
          'what is mutation',
          'what is biodiversity',
          'what is ecosystem',
          'what is food chain',
          'what is food web',
          'what is producer',
          'what is consumer',
          'what is decomposer',
          'what is species',
          'what is population',
          'what is community',
          'what is habitat',
          'what is niche',
          'what is symbiosis',
          'what is mutualism',
          'what is parasitism',
          'what is commensalism',
          'what is predation',
          'what is competition',
          'what is bacteria',
          'what is virus',
          'what is prokaryote',
          'what is eukaryote',
          'what is tissue',
          'what is organ',
          'what is organ system',
          'what is organism',
          'what is kingdom',
          'what is phylum',
          'what is class',
          'what is order',
          'what is family',
          'what is genus',
          'what is binary nomenclature',
          'what is taxonomy',
          'what is vertebrate',
          'what is invertebrate',
          'what is mammal',
          'what is reptile',
          'what is amphibian',
          'what is bird',
          'what is fish',
          'what is plant',
          'what is animal',
          'what is fungus',
          'what is reproduction',
          'what is sexual reproduction',
          'what is asexual reproduction',
          'what is fertilization',
          'what is gamete',
          'what is zygote',
          'what is embryo',
          'what is fetus',
          'what is development',
          'what is growth',
          'what is puberty',
          'what is immune system',
          'what is antibody',
          'what is antigen',
          'what is vaccine',
          'what is disease',
          'what is infection',
          'what is circulatory system',
          'what is respiratory system',
          'what is digestive system',
          'what is nervous system',
          'what is endocrine system',
          'what is skeletal system',
          'what is muscular system',
          'what is excretory system',
          'what is reproductive system',
          'what is hormone',
          'what is neuron',
          'what is reflex',
          'what is transpiration',
          'what is germination',
          'what is pollination'
        ],

        famous_people: [
          'who is Elon Musk',
          'what companies does Elon Musk own',
          'who is Bill Gates',
          'what is Bill Gates net worth',
          'who is Jeff Bezos',
          'who is Mark Zuckerberg',
          'who is Steve Jobs',
          'when did Steve Jobs die',
          'who is Warren Buffett',
          'who is Oprah Winfrey',
          'who is Barack Obama',
          'who is Donald Trump',
          'who is Joe Biden',
          'who is Vladimir Putin',
          'who is Xi Jinping',
          'who is Pope Francis',
          'who is Queen Elizabeth II',
          'when did Queen Elizabeth II die',
          'who is King Charles III',
          'who is Volodymyr Zelensky',
          'who is Angela Merkel',
          'who is Emmanuel Macron',
          'who is Justin Trudeau',
          'who is Taylor Swift',
          'who is Beyoncé',
          'who is Lady Gaga',
          'who is Ariana Grande',
          'who is Ed Sheeran',
          'who is Drake',
          'who is Kanye West',
          'who is Kim Kardashian',
          'who is Cristiano Ronaldo',
          'who is Lionel Messi',
          'who is LeBron James',
          'who is Tom Brady',
          'who is Serena Williams',
          'who is Lewis Hamilton',
          'who is Tiger Woods',
          'who is Michael Jordan',
          'who is Kobe Bryant',
          'when did Kobe Bryant die',
          'who is Stephen Curry',
          'who is Leonardo DiCaprio',
          'who is Brad Pitt',
          'who is Angelina Jolie',
          'who is Will Smith',
          'who is Dwayne Johnson',
          'who is Robert Downey Jr',
          'who is Tom Hanks',
          'who is Jennifer Lawrence',
          'who is Scarlett Johansson',
          'who is Ryan Reynolds',
          'who is Johnny Depp',
          'who is Amber Heard',
          'who is Keanu Reeves',
          'who is The Rock',
          'who is Gordon Ramsay',
          'who is Ellen DeGeneres',
          'who is Jimmy Fallon',
          'who is Stephen Colbert',
          'who is Joe Rogan',
          'who is PewDiePie',
          'who is MrBeast',
          'who is Logan Paul',
          'who is Jake Paul',
          'who is James Charles',
          'who is Charli D\'Amelio',
          'who is Addison Rae',
          'who is Kylie Jenner',
          'who is Kendall Jenner',
          'who is Rihanna',
          'who is Selena Gomez',
          'who is Justin Bieber',
          'who is Britney Spears',
          'who is Miley Cyrus',
          'who is Billie Eilish',
          'who is Post Malone',
          'who is The Weeknd',
          'who is Adele',
          'who is Bruno Mars',
          'who is Ryan Gosling',
          'who is Emma Stone',
          'who is Chris Evans',
          'who is Chris Hemsworth',
          'who is Chris Pratt',
          'who is Zendaya',
          'who is Timothée Chalamet',
          'who is Margot Robbie',
          'who is Gal Gadot',
          'who is Henry Cavill',
          'who is Michael B. Jordan',
          'who is Greta Thunberg',
          'who is Malala Yousafzai',
          'who is Neil deGrasse Tyson',
          'who is Jordan Peterson',
          'who is Anthony Fauci',
          'who is Bernie Sanders',
          'who is Alexandria Ocasio-Cortez',
          'who is Elon Musk\'s ex-wife',
          'who is Grimes',
          'who is Pete Davidson',
          'who is Machine Gun Kelly',
          'who is Bad Bunny',
          'who is BTS',
          'who is Blackpink',
          'who is Tim Cook',
'who is Jack Ma',
'who is Richard Branson',
'who is Narendra Modi',
'who is Benjamin Netanyahu',
'who is Kim Jong Un',
'who is Kevin Hart',
'who is Dave Chappelle',
'who is Simon Cowell',
'who is Jay-Z',
'who is Eminem',
'who is Madonna',
'who is Elton John',
'who is Andrew Tate',
'who is Usain Bolt',
'who is Rafael Nadal',
'who is Roger Federer'
        ],

        movies_tv: [
          'what is Game of Thrones',
          'how does Game of Thrones end',
          'what is Breaking Bad',
          'what is The Office',
          'what is Friends',
          'what is Stranger Things',
          'when does Stranger Things season 5 come out',
          'what is The Marvel Cinematic Universe',
          'what is Avengers Endgame',
          'what is Spider-Man',
          'what is Batman',
          'what is Star Wars',
          'what order should I watch Star Wars',
          'what is The Mandalorian',
          'what is House of the Dragon',
          'what is The Last of Us',
          'what is Wednesday',
          'what is Squid Game',
          'what is Money Heist',
          'what is Bridgerton',
          'what is The Crown',
          'what is Ozark',
          'what is Better Call Saul',
          'what is The Walking Dead',
          'what is Euphoria',
          'what is The Boys',
          'what is Succession',
          'what is The Witcher',
          'what is Vikings',
          'what is Peaky Blinders',
          'what is Sherlock',
          'what is The Big Bang Theory',
          'what is How I Met Your Mother',
          'what is Grey\'s Anatomy',
          'what is Supernatural',
          'what is Rick and Morty',
          'what is South Park',
          'what is The Simpsons',
          'what is Family Guy',
          'what is Titanic',
          'what is Avatar',
          'what is The Fast and the Furious',
          'what is John Wick',
          'what is The Matrix',
          'what is Inception',
          'what is Interstellar',
          'what is The Dark Knight',
          'what is Pulp Fiction',
          'what is Forrest Gump',
          'what is The Shawshank Redemption',
          'what is The Godfather',
          'what is Harry Potter',
          'what order should I watch Harry Potter',
          'what is Lord of the Rings',
          'what order should I watch Lord of the Rings',
          'what is Jurassic Park',
          'what is Top Gun',
          'what is Mission Impossible',
          'what is James Bond',
          'what is Pirates of the Caribbean',
          'what is Transformers',
          'what is The Hunger Games',
          'what is Twilight',
          'what is Disney',
          'what is Netflix',
          'what is Marvel',
          'what is DC Comics',
          'what is anime',
          'what is One Piece',
          'what is Naruto',
          'what is Dragon Ball',
          'what is Attack on Titan',
          'what is Demon Slayer'
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
            'I\'m bored',
            'I have nothing to do',
            'I can\'t decide what to wear',
            'I can\'t decide what to eat',
            'I\'m running late',
            'I locked myself out',
            'I lost my keys',
            'I lost my wallet',
            'I spilled something on my clothes',
            'I have hiccups',
            'I have a splinter',
            'I have a paper cut',
            'I stubbed my toe',
            'I burned my food',
            'my food is too salty',
            'my food is too spicy',
            'I don\'t know what to cook',
            'my milk expired',
            'I\'m out of groceries',
            'I can\'t connect to Bluetooth',
            'my phone is frozen',
            'I accidentally deleted something',
            'I can\'t find a file',
            'my email isn\'t working',
            'I forgot someone\'s name',
            'I don\'t know what to say',
            'I\'m embarrassed',
            'I overslept',
            'I\'m hungover',
            'I have jet lag',
            'my zipper is stuck',
            'I have a stain on my shirt',
            'my shoes are too tight',
            'I have nothing to wear'
          ],

          math: [
            'what is PEMDAS',
            'what is order of operations',
            'what is distributive property',
            'what is commutative property',
            'what is associative property',
            'what is a fraction',
            'how to add fractions',
            'how to multiply fractions',
            'what is a decimal',
            'how to convert fractions to decimals',
            'what is a percentage',
            'what is prime number',
            'what is composite number',
            'what is greatest common factor',
            'what is least common multiple',
            'what is algebra',
            'what is a variable',
            'what is an equation',
            'how to solve for x',
            'what is inverse operation',
            'what is like terms',
            'what is a function',
            'what is coordinate plane',
            'what is x-axis',
            'what is y-axis',
            'what is origin',
            'what is slope',
            'what is y-intercept',
            'what is slope-intercept form',
            'what is point-slope form',
            'what is distance formula',
            'what is midpoint formula',
            'what is a linear equation',
            'what is a quadratic equation',
            'what is the quadratic formula',
            'what is factoring',
            'what is FOIL method',
            'what is completing the square',
            'what is a polynomial',
            'what is a monomial',
            'what is a binomial',
            'what is a trinomial',
            'what is an exponent',
            'what is a radical',
            'what is a square root',
            'what is a cube root',
            'what is absolute value',
            'what is an inequality',
            'what is a system of equations',
            'what is substitution method',
            'what is elimination method',
            'what is geometry',
            'what is a triangle',
            'what is the Pythagorean theorem',
            'what is area',
            'what is area of triangle',
            'what is area of circle',
            'what is perimeter',
            'what is circumference',
            'what is volume',
            'what is volume of cylinder',
            'what is volume of sphere',
            'what is surface area',
            'what is a circle',
            'what is pi',
            'what is diameter',
            'what is radius',
            'what is a polygon',
            'what is a rectangle',
            'what is a square',
            'what is a parallelogram',
            'what is a rhombus',
            'what is a trapezoid',
            'what is an angle',
            'what is a right angle',
            'what is an acute angle',
            'what is an obtuse angle',
            'what is a straight angle',
            'what is complementary angles',
            'what is supplementary angles',
            'what is trigonometry',
            'what is sine',
            'what is cosine',
            'what is tangent',
            'what is SOH CAH TOA',
            'what is the unit circle',
            'what is statistics',
            'what is mean',
            'what is median',
            'what is mode',
            'what is range',
            'what is standard deviation',
            'what is probability',
            'what is permutation',
            'what is combination',
            'what is factorial',
            'what is calculus',
            'what is a derivative',
            'what is an integral',
            'what is a limit',
            'what is the chain rule',
            'what is the product rule',
            'what is the quotient rule',
            'what is logarithm',
            'what is natural log',
            'what is exponential function',
            'what is domain',
            'what is range of a function',
            'what is vertex',
            'what is parabola',
            'what is hyperbola',
            'what is ellipse',
            'what is matrix',
            'what is determinant',
            'what is inverse function',
            'what is composite function',
            'what is asymptote',
            'what is intercept',
            'what is discriminant',
            'what is rational number',
            'what is irrational number',
            'what is imaginary number',
            'what is complex number',
            'what is sequence',
            'what is arithmetic sequence',
            'what is geometric sequence',
            'what is series',
            'what is set theory',
            'what is union',
            'what is intersection'
          ],
        
    
          kids_shows: [
            'what is SpongeBob SquarePants',
            'what is Dora the Explorer',
            'what is Peppa Pig',
            'what is Paw Patrol',
            'what is Bluey',
            'what is Cocomelon',
            'what is Baby Shark',
            'what is Sesame Street',
            'what is Mickey Mouse Clubhouse',
            'what is Doc McStuffins',
            'what is PJ Masks',
            'what is Moana',
            'what is The Lion King',
            'what is Toy Story',
            'what is Finding Nemo',
            'what is Monsters Inc',
            'what is The Incredibles',
            'what is Shrek',
            'what is Minions',
            'what is Despicable Me',
            'what is Trolls',
            'what is Encanto',
            'what is Turning Red',
            'what is Luca',
            'what is Coco',
            'what is Raya and the Last Dragon',
          ],

          cryptocurrency_oa: [
            'what is cryptocurrency',
            'what is Bitcoin',
            'what is Ethereum',
            'what is blockchain',
            'how to buy cryptocurrency',
            'how to buy Bitcoin',
            'what is a crypto wallet',
            'what is mining cryptocurrency',
            'what is Bitcoin mining',
            'how does cryptocurrency work',
            'is cryptocurrency safe',
            'what is the difference between Bitcoin and Ethereum',
            'what is DeFi',
            'what is NFT',
            'what is staking crypto',
            'how to store cryptocurrency safely',
            'what are cryptocurrency exchanges',
            'what is Coinbase',
            'what is Binance',
            'how to invest in cryptocurrency',
            'what are crypto taxes',
            'what is HODL',
            'what is Dogecoin',
            'what is Shiba Inu coin',
            'what is Solana',
            'what is Cardano',
            'what is Litecoin',
            'what is Ripple XRP',
            'what is BNB',
            'what is USDT',
            'what is USDC',
            'what is stablecoin',
            'what is Tether',
            'what is MetaMask',
            'what is seed phrase',
            'what is private key',
            'what is gas fee',
            'what is Ethereum gas',
            'what is FOMO in crypto',
            'what is FUD in crypto',
            'what is whale in crypto',
            'what is Bitcoin ETF'
          ],
          social_media: [
            'what is Facebook',
            'how to get more followers on Facebook',
            'what is Instagram',
            'how to get more followers on Instagram',
            'how to get verified on Instagram',
            'how to go viral on Instagram',
            'how to make money on Instagram',
            'what is TikTok',
            'how to go viral on TikTok',
            'how to get more followers on TikTok',
            'how to make money on TikTok',
            'what is Twitter',
            'how to get more followers on Twitter',
            'how to get verified on Twitter',
            'how to go viral on Twitter',
            'what is X',
            'what is YouTube',
            'how to make money on YouTube',
            'how to start a YouTube channel',
            'how to get more subscribers on YouTube',
            'how to get monetized on YouTube',
            'how to get verified on YouTube',
            'how to go viral on YouTube',
            'what is Twitch',
            'how to stream on Twitch',
            'how to get more followers on Twitch',
            'how to make money on Twitch',
            'how to get verified on Twitch'
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

          do_you_like: [
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