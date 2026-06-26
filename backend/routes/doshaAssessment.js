const express = require('express');
const router = express.Router();
const DoshaAssessment = require('../models/DoshaAssessment');
const PDFDocument = require('pdfkit');
const { authenticateToken } = require('../middleware/auth');

// Quiz Questions
const quizQuestions = [
  // Physical Characteristics (10 questions)
  {
    id: 1,
    category: 'physical',
    question: 'How would you describe your body frame?',
    options: [
      { text: 'Thin, lean, hard to gain weight', dosha: 'vata', points: 3 },
      { text: 'Medium build, athletic, well-proportioned', dosha: 'pitta', points: 3 },
      { text: 'Large frame, heavy, easy to gain weight', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 2,
    category: 'physical',
    question: 'What is your skin type?',
    options: [
      { text: 'Dry, rough, cool, thin', dosha: 'vata', points: 3 },
      { text: 'Warm, oily, prone to rashes/acne', dosha: 'pitta', points: 3 },
      { text: 'Thick, oily, smooth, cool', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 3,
    category: 'physical',
    question: 'How would you describe your hair?',
    options: [
      { text: 'Dry, brittle, thin, easily tangled', dosha: 'vata', points: 3 },
      { text: 'Fine, soft, oily, prone to early graying', dosha: 'pitta', points: 3 },
      { text: 'Thick, lustrous, oily, wavy', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 4,
    category: 'physical',
    question: 'What is your typical body temperature?',
    options: [
      { text: 'Often cold, prefer warmth', dosha: 'vata', points: 3 },
      { text: 'Usually warm, dislike heat', dosha: 'pitta', points: 3 },
      { text: 'Comfortable in most temperatures', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 5,
    category: 'physical',
    question: 'How is your appetite and digestion?',
    options: [
      { text: 'Irregular, sometimes forget to eat', dosha: 'vata', points: 3 },
      { text: 'Strong appetite, get irritable if hungry', dosha: 'pitta', points: 3 },
      { text: 'Steady but can skip meals easily', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 6,
    category: 'physical',
    question: 'What is your sleep pattern?',
    options: [
      { text: 'Light sleeper, wake frequently, insomnia', dosha: 'vata', points: 3 },
      { text: 'Moderate, need 7-8 hours, wake refreshed', dosha: 'pitta', points: 3 },
      { text: 'Deep sleeper, need 8+ hours, slow to wake', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 7,
    category: 'physical',
    question: 'How would you describe your energy levels?',
    options: [
      { text: 'Fluctuating, bursts of energy then fatigue', dosha: 'vata', points: 3 },
      { text: 'High, consistent, driven', dosha: 'pitta', points: 3 },
      { text: 'Steady, slow to start but good endurance', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 8,
    category: 'physical',
    question: 'How do you handle stress physically?',
    options: [
      { text: 'Anxiety, trembling, restlessness', dosha: 'vata', points: 3 },
      { text: 'Anger, frustration, irritability', dosha: 'pitta', points: 3 },
      { text: 'Withdrawn, depressed, eat more', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 9,
    category: 'physical',
    question: 'What is your typical bowel movement pattern?',
    options: [
      { text: 'Irregular, prone to constipation', dosha: 'vata', points: 3 },
      { text: 'Regular, 2-3 times daily, loose', dosha: 'pitta', points: 3 },
      { text: 'Regular but slow, once daily or less', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 10,
    category: 'physical',
    question: 'How do you sweat?',
    options: [
      { text: 'Minimal sweating even in heat', dosha: 'vata', points: 3 },
      { text: 'Profuse sweating, strong body odor', dosha: 'pitta', points: 3 },
      { text: 'Moderate sweating, pleasant odor', dosha: 'kapha', points: 3 }
    ]
  },
  
  // Mental/Emotional (6 questions)
  {
    id: 11,
    category: 'mental',
    question: 'How would you describe your thinking style?',
    options: [
      { text: 'Quick, creative, easily distracted', dosha: 'vata', points: 3 },
      { text: 'Sharp, focused, analytical', dosha: 'pitta', points: 3 },
      { text: 'Slow, steady, methodical', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 12,
    category: 'mental',
    question: 'How is your memory?',
    options: [
      { text: 'Quick to learn, quick to forget', dosha: 'vata', points: 3 },
      { text: 'Sharp, clear, accurate recall', dosha: 'pitta', points: 3 },
      { text: 'Slow to learn but never forget', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 13,
    category: 'mental',
    question: 'What is your emotional temperament?',
    options: [
      { text: 'Anxious, nervous, worried', dosha: 'vata', points: 3 },
      { text: 'Intense, passionate, irritable', dosha: 'pitta', points: 3 },
      { text: 'Calm, content, possessive', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 14,
    category: 'mental',
    question: 'How do you make decisions?',
    options: [
      { text: 'Quickly but change mind often', dosha: 'vata', points: 3 },
      { text: 'Decisively with conviction', dosha: 'pitta', points: 3 },
      { text: 'Slowly after careful consideration', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 15,
    category: 'mental',
    question: 'How do you handle change?',
    options: [
      { text: 'Love change, thrive on variety', dosha: 'vata', points: 3 },
      { text: 'Accept change if it makes sense', dosha: 'pitta', points: 3 },
      { text: 'Resist change, prefer routine', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 16,
    category: 'mental',
    question: 'What is your speech pattern?',
    options: [
      { text: 'Fast, talkative, rambling', dosha: 'vata', points: 3 },
      { text: 'Clear, sharp, articulate', dosha: 'pitta', points: 3 },
      { text: 'Slow, deliberate, melodious', dosha: 'kapha', points: 3 }
    ]
  },
  
  // Lifestyle (4 questions)
  {
    id: 17,
    category: 'lifestyle',
    question: 'How do you spend your free time?',
    options: [
      { text: 'Active, travel, new experiences', dosha: 'vata', points: 3 },
      { text: 'Competitive activities, sports', dosha: 'pitta', points: 3 },
      { text: 'Relaxing, reading, watching TV', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 18,
    category: 'lifestyle',
    question: 'How do you manage finances?',
    options: [
      { text: 'Spend impulsively, poor at saving', dosha: 'vata', points: 3 },
      { text: 'Spend on quality, plan investments', dosha: 'pitta', points: 3 },
      { text: 'Save money, frugal, accumulate', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 19,
    category: 'lifestyle',
    question: 'What is your work style?',
    options: [
      { text: 'Multitask, creative, start many projects', dosha: 'vata', points: 3 },
      { text: 'Focused, goal-oriented, finish what you start', dosha: 'pitta', points: 3 },
      { text: 'Slow and steady, methodical, thorough', dosha: 'kapha', points: 3 }
    ]
  },
  {
    id: 20,
    category: 'lifestyle',
    question: 'What weather do you prefer?',
    options: [
      { text: 'Warm, humid, dislike cold/wind', dosha: 'vata', points: 3 },
      { text: 'Cool, mild, dislike heat', dosha: 'pitta', points: 3 },
      { text: 'Warm and dry, dislike cold/damp', dosha: 'kapha', points: 3 }
    ]
  }
];

// Get quiz questions
router.get('/questions', (req, res) => {
  res.json(quizQuestions);
});

// Submit quiz and calculate results
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { name, email, age, gender, responses } = req.body;
    
    // Calculate dosha scores
    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;
    
    responses.forEach(response => {
      const question = quizQuestions.find(q => q.id === response.questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.text === response.answer);
        if (selectedOption) {
          if (selectedOption.dosha === 'vata') vataScore += selectedOption.points;
          if (selectedOption.dosha === 'pitta') pittaScore += selectedOption.points;
          if (selectedOption.dosha === 'kapha') kaphaScore += selectedOption.points;
        }
      }
    });
    
    // Calculate total and percentages
    const totalScore = vataScore + pittaScore + kaphaScore;
    const vataPercentage = Math.round((vataScore / totalScore) * 100);
    const pittaPercentage = Math.round((pittaScore / totalScore) * 100);
    const kaphaPercentage = Math.round((kaphaScore / totalScore) * 100);
    
    // Determine primary and secondary dosha
    const doshas = [
      { name: 'Vata', score: vataScore, percentage: vataPercentage },
      { name: 'Pitta', score: pittaScore, percentage: pittaPercentage },
      { name: 'Kapha', score: kaphaScore, percentage: kaphaPercentage }
    ].sort((a, b) => b.score - a.score);
    
    const primaryDosha = doshas[0].name;
    const secondaryDosha = doshas[1].name;
    
    // Generate recommendations based on primary dosha
    const recommendations = generateRecommendations(primaryDosha);
    
    // Save assessment
    const assessment = new DoshaAssessment({
      userId: req.user.id,
      name,
      email,
      age,
      gender,
      responses: responses.map(r => ({
        question: quizQuestions.find(q => q.id === r.questionId)?.question,
        answer: r.answer,
        category: quizQuestions.find(q => q.id === r.questionId)?.category
      })),
      vataScore: vataPercentage,
      pittaScore: pittaPercentage,
      kaphaScore: kaphaPercentage,
      primaryDosha,
      secondaryDosha,
      ...recommendations
    });
    
    await assessment.save();
    
    res.json({
      message: 'Assessment completed successfully',
      assessmentId: assessment._id,
      results: {
        vata: vataPercentage,
        pitta: pittaPercentage,
        kapha: kaphaPercentage,
        primaryDosha,
        secondaryDosha,
        ...recommendations
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Error processing assessment', error: error.message });
  }
});

// Get user's assessments
router.get('/my-assessments', authenticateToken, async (req, res) => {
  try {
    const assessments = await DoshaAssessment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments', error: error.message });
  }
});

// Get specific assessment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assessment = await DoshaAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessment', error: error.message });
  }
});

// Generate PDF report
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const assessment = await DoshaAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dosha-report-${assessment._id}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(24).fillColor('#2C5F2D').text('🌿 Ayurvedic Dosha Assessment Report', { align: 'center' });
    doc.moveDown();
    
    // Personal Info
    doc.fontSize(14).fillColor('#000').text(`Name: ${assessment.name}`);
    doc.text(`Age: ${assessment.age} | Gender: ${assessment.gender}`);
    doc.text(`Date: ${new Date(assessment.completedAt).toLocaleDateString()}`);
    doc.moveDown(2);
    
    // Dosha Results
    doc.fontSize(18).fillColor('#2C5F2D').text('Your Dosha Constitution (Prakriti)', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000');
    doc.text(`Vata: ${assessment.vataScore}%`);
    doc.text(`Pitta: ${assessment.pittaScore}%`);
    doc.text(`Kapha: ${assessment.kaphaScore}%`);
    doc.moveDown();
    doc.fontSize(14).text(`Primary Dosha: ${assessment.primaryDosha}`, { bold: true });
    doc.text(`Secondary Dosha: ${assessment.secondaryDosha}`);
    doc.moveDown(2);
    
    // Diet Recommendations
    doc.fontSize(16).fillColor('#2C5F2D').text('Diet Recommendations', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000');
    assessment.dietRecommendations.forEach(rec => {
      doc.text(`• ${rec}`);
    });
    doc.moveDown(2);
    
    // Foods to Favor
    doc.fontSize(16).fillColor('#2C5F2D').text('Foods to Favor', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000');
    assessment.foodsToFavor.forEach(food => {
      doc.text(`• ${food}`);
    });
    doc.moveDown(2);
    
    // Foods to Avoid
    doc.fontSize(16).fillColor('#2C5F2D').text('Foods to Avoid', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000');
    assessment.foodsToAvoid.forEach(food => {
      doc.text(`• ${food}`);
    });
    doc.moveDown(2);
    
    // Lifestyle Recommendations
    doc.fontSize(16).fillColor('#2C5F2D').text('Lifestyle Recommendations', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000');
    assessment.lifestyleRecommendations.forEach(rec => {
      doc.text(`• ${rec}`);
    });
    
    doc.end();
    
    // Mark as report generated
    assessment.reportGenerated = true;
    await assessment.save();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF report', error: error.message });
  }
});

// Helper function to generate recommendations
function generateRecommendations(primaryDosha) {
  const recommendations = {
    Vata: {
      dietRecommendations: [
        'Eat warm, cooked, moist foods',
        'Favor sweet, sour, and salty tastes',
        'Eat at regular times, don\'t skip meals',
        'Drink warm beverages',
        'Use healthy fats like ghee and sesame oil'
      ],
      foodsToFavor: [
        'Rice, wheat, oats',
        'Sweet fruits (bananas, berries, mangoes)',
        'Cooked vegetables (carrots, beets, sweet potato)',
        'Dairy products (warm milk, ghee)',
        'Nuts and seeds',
        'Warming spices (ginger, cinnamon, cumin)'
      ],
      foodsToAvoid: [
        'Cold, raw, dry foods',
        'Bitter and astringent vegetables (kale, cabbage)',
        'Dried fruits',
        'Beans and legumes',
        'Caffeine and stimulants',
        'Fried and processed foods'
      ],
      lifestyleRecommendations: [
        'Maintain regular daily routine',
        'Get adequate rest and sleep (8-9 hours)',
        'Practice gentle yoga and meditation',
        'Stay warm, especially in cold weather',
        'Practice oil massage (Abhyanga) daily',
        'Avoid excessive travel and overstimulation'
      ]
    },
    Pitta: {
      dietRecommendations: [
        'Eat cool or room temperature foods',
        'Favor sweet, bitter, and astringent tastes',
        'Avoid spicy, salty, and sour foods',
        'Eat moderate portions at regular times',
        'Stay hydrated with cool water'
      ],
      foodsToFavor: [
        'Rice, barley, oats',
        'Sweet fruits (grapes, melon, coconut)',
        'Leafy greens and cooling vegetables (cucumber, zucchini)',
        'Milk, butter, ghee',
        'Coconut, sunflower seeds',
        'Cooling spices (coriander, fennel, cardamom)'
      ],
      foodsToAvoid: [
        'Hot, spicy, fried foods',
        'Sour fruits (citrus, tomatoes)',
        'Fermented foods',
        'Red meat',
        'Alcohol and caffeine',
        'Excessive salt'
      ],
      lifestyleRecommendations: [
        'Avoid excessive heat and sun exposure',
        'Practice cooling pranayama (Sheetali)',
        'Engage in moderate, non-competitive exercise',
        'Take time to relax and avoid overwork',
        'Practice patience and forgiveness',
        'Spend time in nature, especially near water'
      ]
    },
    Kapha: {
      dietRecommendations: [
        'Eat warm, light, dry foods',
        'Favor pungent, bitter, and astringent tastes',
        'Reduce heavy, oily, sweet foods',
        'Eat smaller portions, may skip breakfast',
        'Use stimulating spices'
      ],
      foodsToFavor: [
        'Barley, corn, millet, rye',
        'Apples, pears, pomegranates',
        'Leafy greens and light vegetables (asparagus, broccoli)',
        'Legumes and beans',
        'Honey (in small amounts)',
        'Warming spices (ginger, black pepper, turmeric)'
      ],
      foodsToAvoid: [
        'Heavy, oily, fried foods',
        'Sweet, juicy fruits (bananas, melons)',
        'Dairy products (especially cheese)',
        'Nuts and seeds',
        'Wheat and rice in excess',
        'Sweets and desserts'
      ],
      lifestyleRecommendations: [
        'Engage in vigorous daily exercise',
        'Wake up early (before 6 AM)',
        'Practice invigorating pranayama (Bhastrika)',
        'Seek variety and new experiences',
        'Avoid daytime naps',
        'Stay warm and dry, especially in damp weather'
      ]
    }
  };
  
  return recommendations[primaryDosha] || recommendations.Vata;
}

module.exports = router;
