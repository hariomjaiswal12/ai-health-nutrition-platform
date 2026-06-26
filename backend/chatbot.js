require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Food = require('./Food');

// Keyword advice dictionary
const adviceDict = {
  headache:
    'Try drinking warm ginger tea and avoid cold foods. Beneficial foods: Ginger, Cumin, Fennel.',
  fatigue:
    'Include energizing foods like honey and dates. Try: Almonds, Dates, Ashwagandha.',
  diabetes:
    'Focus on foods that balance kapha dosha like bitter gourd and fenugreek. Recommended: Bitter Gourd, Fenugreek, Turmeric.',
  bp: 'Avoid salty and oily foods; practice daily meditation for stress relief. Good foods: Garlic, Coriander, Amla.',
  fever:
    'Rest and stay hydrated. Try: Ginger tea, Turmeric milk, Light soups.',
  cold:
    'Warm foods and drinks help. Try: Ginger, Tulsi (Holy Basil), Black Pepper.',
  cough:
    'Soothing warm remedies help. Try: Honey, Turmeric, Ginger tea.'
};

// Enhanced intent detection
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();

  // Food-specific queries
  if (
    lowerMsg.match(
      /\b(ginger|turmeric|cucumber|dates|coconut|mint|barley|rice|ghee|amla|fenugreek|cumin|coriander|spinach)\b/i
    )
  ) {
    return 'specific_food';
  }

  // Dosha queries
  if (lowerMsg.match(/\b(pitta|vata|kapha|dosha|balance)\b/i)) {
    return 'dosha';
  }

  // Food category queries
  if (lowerMsg.match(/food|eat|diet|meal|recipe|ingredient/i)) {
    return 'food';
  }

  // Disease/symptom keywords
  if (lowerMsg.match(/diabetes|bp|blood pressure|fever|cold|cough|headache|fatigue/i)) {
    return 'symptom';
  }

  return 'general';
}

// Extract dosha from message
function extractDosha(message) {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.match(/\bpitta\b/i)) return 'pitta';
  if (lowerMsg.match(/\bvata\b/i)) return 'vata';
  if (lowerMsg.match(/\bkapha\b/i)) return 'kapha';
  return null;
}

// Extract food keywords
function extractFoodKeywords(message) {
  const foodNames = [
    'ginger',
    'turmeric',
    'cucumber',
    'dates',
    'coconut',
    'mint',
    'barley',
    'rice',
    'ghee',
    'amla',
    'fenugreek',
    'cumin',
    'coriander',
    'spinach',
    'bitter gourd',
    'sesame'
  ];
  const lowerMsg = message.toLowerCase();
  return foodNames.filter((food) => lowerMsg.includes(food));
}

// POST /chatbot/message
router.post('/message', async (req, res) => {
  const { message } = req.body;
  console.log('Chatbot endpoint hit:', message);

  if (!message) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const intent = detectIntent(message);
  console.log('Detected intent:', intent);

  let responseAdvice = '';
  let foodData = [];

  // STEP 1: Handle specific food queries
  if (intent === 'specific_food') {
    try {
      const foodKeywords = extractFoodKeywords(message);
      console.log('Food keywords found:', foodKeywords);

      if (foodKeywords.length > 0) {
        foodData = await Food.find({
          name: { $in: foodKeywords.map((k) => new RegExp(k, 'i')) }
        }).limit(5);

        if (foodData.length > 0) {
          const foodDetails = foodData
            .map(
              (f) =>
                `• **${f.name}** (${f.category}): ${f.benefits}${
                  f.taste ? ' | Taste: ' + f.taste : ''
                }${f.potency ? ' | Potency: ' + f.potency : ''}`
            )
            .join('\n\n');

          responseAdvice = `🌿 **Ayurvedic Food Information:**\n\n${foodDetails}`;
        } else {
          responseAdvice = `I found your query about "${foodKeywords.join(
            ', '
          )}", but don't have detailed information in my database yet. Let me provide general Ayurvedic guidance.`;
        }
      }
    } catch (dbErr) {
      console.error('Database query failed:', dbErr);
    }
  }

  // STEP 2: Handle dosha-based queries
  if (intent === 'dosha' && !responseAdvice) {
    try {
      const doshaFilter = extractDosha(message);
      console.log('Dosha filter:', doshaFilter);

      if (doshaFilter) {
        foodData = await Food.find({
          dosha: doshaFilter
        }).limit(5);

        if (foodData.length > 0) {
          const foodDetails = foodData
            .map(
              (f) =>
                `• **${f.name}** (${f.category}): ${f.benefits}${
                  f.taste ? ' | Taste: ' + f.taste : ''
                }${f.potency ? ' | Potency: ' + f.potency : ''}`
            )
            .join('\n\n');

          responseAdvice = `🍎 **Ayurvedic foods to balance ${doshaFilter.toUpperCase()} dosha:**\n\n${foodDetails}\n\nThese foods help balance ${doshaFilter} dosha according to Ayurvedic principles.`;
        } else {
          // Fallback to keyword advice
          const lowerMsg = message.toLowerCase();
          for (const keyword in adviceDict) {
            if (lowerMsg.includes(keyword)) {
              responseAdvice = adviceDict[keyword];
              break;
            }
          }
        }
      }
    } catch (dbErr) {
      console.error('Database query failed:', dbErr);
    }
  }

  // STEP 3: Check symptom keyword dictionary
  if (intent === 'symptom' && !responseAdvice) {
    const lowerMsg = message.toLowerCase();
    for (const keyword in adviceDict) {
      if (lowerMsg.includes(keyword)) {
        responseAdvice = adviceDict[keyword];

        // Try to enhance with DB foods
        try {
          const keywords = [
            'diabetes',
            'headache',
            'fever',
            'cold',
            'cough',
            'fatigue',
            'bp'
          ];
          const matchedKeyword = keywords.find((k) => lowerMsg.includes(k));

          if (matchedKeyword) {
            const relatedFoods = await Food.find({
              $or: [
                { benefits: new RegExp(matchedKeyword, 'i') },
                { properties: new RegExp(matchedKeyword, 'i') }
              ]
            }).limit(3);

            if (relatedFoods.length > 0) {
              const foodList = relatedFoods
                .map((f) => `${f.name} (${f.category})`)
                .join(', ');
              responseAdvice += `\n\n🌿 **Recommended foods from our database:** ${foodList}`;
            }
          }
        } catch (err) {
          console.error('DB enhancement error:', err);
        }
        break;
      }
    }
  }

  // STEP 4: General food/diet queries - search database
  if ((intent === 'food' || intent === 'general') && !responseAdvice) {
    try {
      const keywords = message.match(/\b\w{4,}\b/g) || [];
      if (keywords.length > 0) {
        foodData = await Food.find({
          $or: [
            { name: { $regex: keywords.join('|'), $options: 'i' } },
            { benefits: { $regex: keywords.join('|'), $options: 'i' } },
            { properties: { $regex: keywords.join('|'), $options: 'i' } },
            { category: { $regex: keywords.join('|'), $options: 'i' } }
          ]
        }).limit(5);

        if (foodData.length > 0) {
          const foodDetails = foodData
            .map(
              (f) =>
                `• **${f.name}** (${f.category}): ${f.benefits}${
                  f.taste ? ' | Taste: ' + f.taste : ''
                }${f.potency ? ' | Potency: ' + f.potency : ''}`
            )
            .join('\n\n');

          responseAdvice = `🌿 **Ayurvedic recommendations from our database:**\n\n${foodDetails}`;
        }
      }
    } catch (dbErr) {
      console.error('Database search failed:', dbErr);
    }
  }

  // STEP 5: Use Google Gemini AI for complex queries (only if no response yet)
  if (!responseAdvice) {
    try {
      let contextPrompt = `You are an expert Ayurvedic health advisor. User question: "${message}"\n\n`;

      if (foodData.length > 0) {
        contextPrompt += `Relevant Ayurvedic foods from database:\n`;
        foodData.forEach((f) => {
          contextPrompt += `- ${f.name}: ${f.benefits}\n`;
        });
        contextPrompt += '\n';
      }

      contextPrompt +=
        'Provide dietary and health advice combining Ayurvedic wisdom. Be specific, practical, and cite Ayurvedic principles when relevant. Keep response under 200 words.';

      console.log('Calling Gemini API (chatbot)...');

      const apiUrl =
        process.env.AI_API_URL ||
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
      const apiKey = process.env.AI_API_KEY;

      if (!apiKey) {
        throw new Error('AI_API_KEY not configured in .env');
      }

      const geminiResponse = await axios.post(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: contextPrompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      responseAdvice =
        geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response. Please try rephrasing your question.";

      console.log('Gemini API response received (chatbot)');
    } catch (aiErr) {
      console.error('Gemini API error (chatbot):', aiErr.message);
      responseAdvice =
        "I'm currently unable to connect to my AI knowledge base. However, I can still help with basic Ayurvedic advice. Try asking about specific foods (like ginger, turmeric), doshas (pitta, vata, kapha), or common health concerns.";
    }
  }

  res.json({ advice: responseAdvice });
});

// POST /chatbot/symptom-checker - NEW FEATURE B ROUTE
router.post('/symptom-checker', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({ message: 'Please provide symptoms' });
    }

    // Get relevant foods from database
    const allFoods = await Food.find({});

    // Create enhanced prompt for symptom analysis
    const prompt = `
You are an expert Ayurvedic practitioner. A patient reports the following symptoms: "${symptoms}"

Please provide:

1. **Dosha Analysis**: Which dosha(s) are likely imbalanced (Vata, Pitta, or Kapha)?

2. **Recommended Foods**: Based on these foods from our database, suggest 5-7 that would help:
${allFoods
  .slice(0, 30)
  .map((f) => `- ${f.name} (${f.category}): ${f.benefits}`)
  .join('\n')}

3. **Foods to Avoid**: List 3-5 foods to avoid.

4. **Lifestyle Recommendations**: Provide 3-4 Ayurvedic lifestyle tips.

5. **When to Seek Help**: Brief note on when to consult a doctor.

Format your response in clear sections with emojis for readability.
`;

    const apiUrl =
      process.env.AI_API_URL ||
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: 'AI API key is not configured on the server.' });
    }

    let aiResponseText = '';

    try {
      const response = await axios.post(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      aiResponseText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Unable to analyze symptoms at this time.';
      console.log('Gemini API response received (symptom-checker)');
    } catch (error) {
      // Explicit handling for 429 rate limit
      console.error(
        'Symptom checker AI error:',
        error.response?.status,
        error.response?.data
      );

      if (error.response && error.response.status === 429) {
        return res.status(503).json({
          message:
            'The AI service is temporarily unavailable right now (rate limit). Please wait a minute and try again.'
        });
      }

      return res.status(500).json({
        message: 'Error analyzing symptoms with AI.',
        error: error.message
      });
    }

    // Extract mentioned foods from database
    const mentionedFoods = allFoods
      .filter((food) =>
        aiResponseText.toLowerCase().includes(food.name.toLowerCase())
      )
      .slice(0, 7);

    return res.json({
      analysis: aiResponseText,
      recommendedFoods: mentionedFoods,
      totalFoodsInDb: allFoods.length
    });
  } catch (error) {
    console.error('Symptom checker unexpected error:', error);
    return res.status(500).json({
      message: 'Error analyzing symptoms',
      error: error.message
    });
  }
});

module.exports = router;
