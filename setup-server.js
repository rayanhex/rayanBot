// setup-server.js - Run this to check if everything is configured correctly
const fs = require('fs');
const path = require('path');

console.log('🔧 RayanBot Server Setup Checker\n');

// Check if required files exist
const requiredFiles = ['responseData.js', 'index.html'];
const missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    missingFiles.push(file);
  }
});

// Check if package.json exists and has required dependencies
let packageExists = false;
if (fs.existsSync('package.json')) {
  console.log('✅ package.json found');
  packageExists = true;
  
  try {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'openai'];
    
    console.log('\n📦 Checking dependencies:');
    requiredDeps.forEach(dep => {
      if (packageData.dependencies && packageData.dependencies[dep]) {
        console.log(`✅ ${dep} found in dependencies`);
      } else if (packageData.devDependencies && packageData.devDependencies[dep]) {
        console.log(`✅ ${dep} found in devDependencies`);
      } else {
        console.log(`❌ ${dep} missing - run: npm install ${dep}`);
      }
    });
  } catch (error) {
    console.log('⚠️ Error reading package.json');
  }
} else {
  console.log('❌ package.json missing');
}

// Check environment variables
console.log('\n🔑 Environment Variables:');
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OPENAI_API_KEY is set');
} else {
  console.log('❌ OPENAI_API_KEY not set');
  console.log('   Set it with: export OPENAI_API_KEY=your-key-here (Mac/Linux)');
  console.log('   Or: set OPENAI_API_KEY=your-key-here (Windows)');
}

// Check if server.js has the correct structure
if (fs.existsSync('server.js')) {
  console.log('\n📝 Checking server.js:');
  const serverContent = fs.readFileSync('server.js', 'utf8');
  
  // Count how many times improve-response appears
  const improveResponseCount = (serverContent.match(/\/api\/improve-response/g) || []).length;
  
  if (improveResponseCount === 1) {
    console.log('✅ Single /api/improve-response endpoint found');
  } else if (improveResponseCount > 1) {
    console.log(`❌ Multiple /api/improve-response endpoints found (${improveResponseCount}) - this will cause conflicts!`);
    console.log('   Please use the fixed server.js provided');
  } else {
    console.log('❌ No /api/improve-response endpoint found');
  }
  
  if (serverContent.includes('/api/feed-knowledge')) {
    console.log('✅ /api/feed-knowledge endpoint found');
  } else {
    console.log('❌ /api/feed-knowledge endpoint missing');
  }
} else {
  console.log('\n❌ server.js not found');
}

// Final recommendations
console.log('\n🎯 Setup Recommendations:');

if (missingFiles.length > 0) {
  console.log('❌ Missing required files. Make sure you have:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

if (!packageExists) {
  console.log('❌ Run: npm init -y');
  console.log('❌ Then run: npm install express openai');
}

if (!process.env.OPENAI_API_KEY) {
  console.log('❌ Set your OpenAI API key as environment variable');
}

console.log('\n🚀 To start the server:');
console.log('1. Make sure all dependencies are installed: npm install express openai');
console.log('2. Set your OpenAI API key: export OPENAI_API_KEY=your-key-here');
console.log('3. Start the server: node server.js');
console.log('4. Open browser to: http://localhost:3000');

console.log('\n✨ Once running, both Feed Knowledge and Thumbs Down will save to responseData.js permanently!');