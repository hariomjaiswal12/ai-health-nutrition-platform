require('dotenv').config();
const axios = require('axios');

async function testGemini() {
  const apiKey = process.env.AI_API_KEY;
  
  console.log('Testing Gemini API...');
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Say hello in Ayurvedic style' }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );
    
    console.log('✅ SUCCESS! Gemini API works!');
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    
  } catch (err) {
    console.error('❌ FAILED!');
    console.error('Error:', err.response?.data || err.message);
    console.error('Status:', err.response?.status);
  }
}

testGemini();
