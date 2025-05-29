#!/usr/bin/env node

// Quick test of the enhance API endpoint
const axios = require('axios');

async function testEnhance() {
  console.log('=== Testing Enhancement API ===\n');
  
  const testCases = [
    {
      idea: "something for productivity",
      mood: "Professional",
      audience: "Remote workers"
    },
    {
      idea: "help people sleep",
      mood: "Calming", 
      audience: "Stressed professionals"
    }
  ];
  
  for (const test of testCases) {
    console.log(`Testing: "${test.idea}"`);
    console.log(`Mood: ${test.mood}, Audience: ${test.audience}`);
    console.log('-'.repeat(50));
    
    try {
      const response = await axios.post('http://localhost:8000/api/enhance-product-idea', test);
      
      console.log('Success!');
      console.log('Enhanced:', response.data.enhancedIdea);
      
      if (response.data.warning) {
        console.log('⚠️  Warning:', response.data.warning);
      }
      
      // Check if it's a real enhancement
      if (response.data.enhancedIdea.includes('TaskFlow Pro') || 
          response.data.enhancedIdea.includes('DreamWave') ||
          response.data.enhancedIdea.length > test.idea.length * 3) {
        console.log('✅ Real AI enhancement detected!');
      } else {
        console.log('⚠️  Looks like a basic fallback response');
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
  }
}

testEnhance();
