require('dotenv').config();
const mongoose = require('mongoose');
const AyurvedaResource = require('./models/AyurvedaResource');

const sampleResources = [
  {
    title: "Introduction to Charaka Samhita",
    type: "text",
    category: "Ancient Texts",
    description: "Charaka Samhita is one of the oldest and most important texts of Ayurveda. Written by sage Charaka around 400 BCE, it contains 120 chapters covering fundamental principles of health, disease, and treatment.",
    content: "The Charaka Samhita is divided into eight sections (Ashtanga): Sutra Sthana (principles), Nidana Sthana (pathology), Vimana Sthana (measurements), Sharira Sthana (anatomy), Indriya Sthana (prognosis), Chikitsa Sthana (therapeutics), Kalpa Sthana (pharmaceutics), and Siddhi Sthana (success in treatment).\n\nKey concepts include Tridosha theory (Vata, Pitta, Kapha), Panchamahabhuta (five elements), and the importance of digestion (Agni) in health.",
    difficulty: "Beginner",
    readTime: "10 min read",
    tags: ["ancient texts", "charaka", "fundamentals", "tridosha"],
    author: "Sage Charaka",
    source: "Charaka Samhita",
    language: "English"
  },
  {
    title: "Understanding Tridosha - Vata, Pitta, Kapha",
    type: "article",
    category: "Doshas",
    description: "Learn about the three fundamental energies in Ayurveda that govern all physiological and psychological functions in the human body.",
    content: "**Vata Dosha** (Air + Ether): Governs movement, breathing, circulation. Qualities: dry, light, cold, rough, mobile. Imbalance causes: anxiety, constipation, insomnia.\n\n**Pitta Dosha** (Fire + Water): Controls digestion, metabolism, temperature. Qualities: hot, sharp, liquid, oily. Imbalance causes: inflammation, anger, acidity.\n\n**Kapha Dosha** (Earth + Water): Provides structure, lubrication, stability. Qualities: heavy, slow, cool, oily, stable. Imbalance causes: weight gain, lethargy, congestion.",
    difficulty: "Beginner",
    readTime: "7 min read",
    tags: ["doshas", "vata", "pitta", "kapha", "balance"],
    author: "Ayurveda Knowledge Team",
    language: "English"
  },
  {
    title: "Ayurveda: Ancient Wisdom for Modern Health",
    type: "video",
    category: "Philosophy",
    description: "A comprehensive documentary exploring the 5000-year history of Ayurveda and its relevance in today's world.",
    videoUrl: "https://www.youtube.com/embed/OVRevFVSF5k",
    difficulty: "Beginner",
    readTime: "25 min watch",
    tags: ["documentary", "history", "philosophy", "introduction"],
    language: "English"
  },
  {
    title: "Turmeric (Haridra): The Golden Spice",
    type: "article",
    category: "Herbs & Spices",
    description: "Discover the healing properties of turmeric, one of Ayurveda's most powerful anti-inflammatory herbs.",
    content: "**Sanskrit Name**: Haridra\n**Latin Name**: Curcuma longa\n\n**Properties**:\n- Rasa (Taste): Bitter, pungent\n- Virya (Potency): Hot\n- Vipaka (Post-digestive effect): Pungent\n- Dosha: Balances all three doshas (KVP-)\n\n**Benefits**:\n- Powerful anti-inflammatory\n- Supports liver detoxification\n- Improves skin complexion\n- Aids digestion\n- Boosts immunity\n\n**Usage**: 1/2 teaspoon with warm milk or water daily. Can be applied topically for skin conditions.",
    difficulty: "Beginner",
    readTime: "5 min read",
    tags: ["herbs", "turmeric", "anti-inflammatory", "healing"],
    author: "Dr. Ayurveda Herbs",
    language: "English"
  },
  {
    title: "Sushruta Samhita: The Foundation of Surgery",
    type: "text",
    category: "Ancient Texts",
    description: "Explore Sushruta Samhita, the ancient Ayurvedic text that laid the groundwork for surgical procedures over 2000 years ago.",
    content: "Sushruta, known as the 'Father of Surgery', compiled the Sushruta Samhita around 600 BCE. This text contains detailed descriptions of over 300 surgical procedures and 120 surgical instruments.\n\n**Key Topics**:\n- Plastic surgery techniques (rhinoplasty)\n- Cataract surgery\n- Obstetrics and childbirth\n- Toxicology\n- Anatomy (documented 300 bones in human body)\n\n**Surgical Principles**:\n1. Proper diagnosis\n2. Appropriate instruments\n3. Skilled surgeon\n4. Post-operative care\n\nSushruta emphasized cleanliness, anesthesia using herbs, and the importance of practice on models before operating on patients.",
    difficulty: "Intermediate",
    readTime: "12 min read",
    tags: ["ancient texts", "sushruta", "surgery", "medical procedures"],
    author: "Sage Sushruta",
    source: "Sushruta Samhita",
    language: "English"
  },
  {
    title: "Dinacharya: Daily Ayurvedic Routine",
    type: "article",
    category: "Lifestyle",
    description: "Learn the optimal daily routine according to Ayurveda for maintaining balance and preventing disease.",
    content: "**Morning (6-10 AM - Kapha Time)**:\n- Wake before sunrise (Brahma Muhurta)\n- Eliminate waste\n- Tongue scraping\n- Oil pulling\n- Yoga and meditation\n- Light breakfast\n\n**Afternoon (10 AM-2 PM - Pitta Time)**:\n- Main meal at noon (strongest digestion)\n- Work and productivity\n- Short walk after lunch\n\n**Evening (6-10 PM - Kapha Time)**:\n- Light dinner before sunset\n- Gentle activities\n- Meditation\n- Warm milk with herbs\n- Early bed (before 10 PM)\n\n**Night (10 PM-2 AM - Pitta Time)**:\n- Deep sleep for cellular repair",
    difficulty: "Beginner",
    readTime: "8 min read",
    tags: ["daily routine", "lifestyle", "dinacharya", "balance"],
    author: "Ayurveda Lifestyle Guide",
    language: "English"
  },
  {
    title: "Panchakarma: The Science of Detoxification",
    type: "article",
    category: "Treatments",
    description: "Understanding Panchakarma, Ayurveda's comprehensive detoxification and rejuvenation program.",
    content: "Panchakarma means 'five actions' - five procedures to eliminate toxins and restore balance.\n\n**The Five Procedures**:\n\n1. **Vamana** (Therapeutic vomiting): Removes excess Kapha from respiratory system\n2. **Virechana** (Purgation): Eliminates excess Pitta through intestines\n3. **Basti** (Enema): Removes Vata disorders through colon\n4. **Nasya** (Nasal administration): Clears head and neck region\n5. **Raktamokshana** (Bloodletting): Purifies blood (rarely used today)\n\n**Preparatory Procedures**:\n- Snehana (Oleation): Internal and external oil application\n- Swedana (Sudation): Herbal steam therapy\n\n**Benefits**:\n- Deep detoxification\n- Improved digestion\n- Enhanced immunity\n- Mental clarity\n- Slowed aging",
    difficulty: "Intermediate",
    readTime: "10 min read",
    tags: ["panchakarma", "detox", "cleansing", "treatments"],
    author: "Dr. Panchakarma Expert",
    language: "English"
  },
  {
    title: "Six Tastes (Shad Rasa) in Ayurveda",
    type: "article",
    category: "Diet & Nutrition",
    description: "Understanding how the six tastes affect doshas and overall health in Ayurvedic nutrition.",
    content: "Ayurveda recognizes six tastes, each with specific effects on the body and mind.\n\n**1. Sweet (Madhura)**\n- Elements: Earth + Water\n- Increases: Kapha\n- Decreases: Vata, Pitta\n- Examples: Rice, milk, sugar, ghee\n- Effects: Nourishing, satisfying, strength-building\n\n**2. Sour (Amla)**\n- Elements: Earth + Fire\n- Increases: Pitta, Kapha\n- Decreases: Vata\n- Examples: Lemon, yogurt, vinegar\n- Effects: Stimulates appetite, aids digestion\n\n**3. Salty (Lavana)**\n- Elements: Water + Fire\n- Increases: Pitta, Kapha\n- Decreases: Vata\n- Examples: Sea salt, rock salt\n- Effects: Improves taste, aids digestion\n\n**4. Pungent (Katu)**\n- Elements: Fire + Air\n- Increases: Vata, Pitta\n- Decreases: Kapha\n- Examples: Chili, ginger, black pepper\n- Effects: Stimulates metabolism, clears sinuses\n\n**5. Bitter (Tikta)**\n- Elements: Air + Ether\n- Increases: Vata\n- Decreases: Pitta, Kapha\n- Examples: Turmeric, neem, bitter gourd\n- Effects: Detoxifying, reduces inflammation\n\n**6. Astringent (Kashaya)**\n- Elements: Air + Earth\n- Increases: Vata\n- Decreases: Pitta, Kapha\n- Examples: Pomegranate, beans, tea\n- Effects: Drying, firming, healing\n\n**Balance**: Include all six tastes in your daily meals for optimal health.",
    difficulty: "Beginner",
    readTime: "9 min read",
    tags: ["tastes", "nutrition", "diet", "rasa", "balance"],
    author: "Ayurvedic Nutrition Expert",
    language: "English"
  }
];

const moreResources = [
  {
    title: "The Healing Power of Ashwagandha",
    type: "article",
    category: "Herbs & Spices",
    description: "Ashwagandha, a revered adaptogenic herb, helps in reducing stress, improving stamina, and boosting immunity.",
    content: "Ashwagandha (Withania somnifera) is known as Indian ginseng. It helps to regulate cortisol levels, enhance sleep quality, and support brain function.\n\n**Benefits:**\n- Stress relief\n- Increases energy and endurance\n- Anti-inflammatory properties\n\n**Dosha Effects:** Balances Vata and Kapha\n\nRecommended dosage: 300-500 mg standardized extract daily with warm milk or water.",
    difficulty: "Beginner",
    readTime: "6 min read",
    tags: ["ashwagandha", "adaptogen", "stress relief", "herbs"],
    author: "Dr. Herbal Medicine",
    language: "English"
  },
  {
    title: "The Concept of Agni (Digestive Fire) in Ayurveda",
    type: "article",
    category: "Philosophy",
    description: "Agni refers to the digestive fire that controls metabolism, digestion, and transformation in the body.",
    content: "In Ayurveda, Agni is the biological fire responsible for digestion and assimilation of food and experiences.\n\nThere are 13 types of agni identified:\n- Jatharagni (digestive fire in stomach)\n- Bhutagni (digestive fires at elemental level)\n- Dhatvagni (tissue level digestive fires)\n\n**Agni's Health Effects:**\n- Strong agni leads to good digestion, vitality, and immunity.\n- Weak agni causes indigestion, toxins (Ama), and disease.\n\nLifestyle factors like diet, habits, and stress affect agni.",
    difficulty: "Intermediate",
    readTime: "8 min read",
    tags: ["agni", "digestion", "metabolism", "philosophy"],
    author: "Ayurveda Philosophy Team",
    language: "English"
  },
  {
    title: "Yoga and Ayurveda: Complementary Sciences",
    type: "video",
    category: "Lifestyle",
    description: "Explore how Yoga and Ayurveda work together to balance body, mind, and spirit for holistic health.",
    videoUrl: "https://www.youtube.com/embed/K9h3B1OJOVI",
    difficulty: "Beginner",
    readTime: "18 min watch",
    tags: ["yoga", "lifestyle", "mindfulness", "ayurveda"],
    language: "English"
  },
  {
    title: "The Role of Ojas in Immunity and Health",
    type: "article",
    category: "Philosophy",
    description: "Ojas is the subtle essence that supports vitality, immunity, and mental clarity in Ayurveda.",
    content: "Ojas is considered the vital energy or life force that protects the body from disease and stress.\n\nIt is produced by the proper digestion of nutrients and proper lifestyle.\n\nLow ojas manifests as fatigue, susceptibility to illness, and emotional instability.\n\nTo build ojas:\n- Eat fresh, nourishing foods\n- Maintain balanced lifestyle\n- Practice meditation and restful sleep\n\nOjas is the key to longevity and happiness in Ayurveda.",
    difficulty: "Intermediate",
    readTime: "7 min read",
    tags: ["ojas", "immunity", "vitality", "philosophy"],
    author: "Ayurveda Wisdom Circle",
    language: "English"
  },
  {
    title: "Neem (Azadirachta indica): The Medicinal Tree",
    type: "article",
    category: "Herbs & Spices",
    description: "Neem is a powerful herb used for detoxification, skin health, and immune support in Ayurveda.",
    content: "**Properties:**\n- Rasa: Bitter, astringent\n- Virya: Cooling\n- Dosha: Balances Pitta and Kapha\n\n**Benefits:**\n- Antibacterial, antifungal, antiviral\n- Purifies blood\n- Treats acne, eczema, and psoriasis\n- Supports oral health\n\n**Usage**:\nNeem leaves or powder can be consumed in small quantities or used topically as an oil or paste.",
    difficulty: "Beginner",
    readTime: "5 min read",
    tags: ["neem", "herbs", "detox", "skin health"],
    author: "Dr. Herbal Medicine",
    language: "English"
  },
  {
    title: "Ayurvedic Approach to Stress Management",
    type: "article",
    category: "Lifestyle",
    description: "Ayurveda offers natural methods to manage stress, anxiety, and promote emotional balance.",
    content: "Stress is considered a major cause of disease in Ayurveda, often imbalancing Vata and Pitta.\n\n**Effective techniques include:**\n- Daily Abhyanga (oil massage)\n- Pranayama (breath control exercises)\n- Meditation and mindfulness\n- Balanced diet avoiding stimulants\n- Proper sleep routine\n\nRegular practice strengthens the nervous system and restores peace.",
    difficulty: "Beginner",
    readTime: "10 min read",
    tags: ["stress", "mindfulness", "lifestyle", "mental health"],
    author: "Ayurveda Lifestyle Guide",
    language: "English"
  }
];


async function seedKnowledge() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing resources
    await AyurvedaResource.deleteMany({});
    console.log('🗑️  Cleared existing resources');

    // Insert sample resources
    const result = await AyurvedaResource.insertMany(sampleResources);
    console.log(`✅ Successfully seeded ${result.length} Ayurveda resources!`);
    console.log('📚 Categories:', [...new Set(result.map(r => r.category))]);
    console.log('📊 Types:', [...new Set(result.map(r => r.type))]);

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding knowledge:', error);
    process.exit(1);
  }
}

seedKnowledge();
