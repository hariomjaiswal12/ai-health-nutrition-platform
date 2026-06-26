require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('./Food');

// Get MongoDB URI from environment or use your connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hdims_user:DKv16100%40%23@dukandb.cj0ackp.mongodb.net/swasthya_sutra?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function seedFoods() {
  try {
    console.log('🗑️  Clearing existing foods...');
    await Food.deleteMany({});
    
    const foods = [
      // Spices
      { 
        name: 'Ginger', 
        category: 'Spices', 
        benefits: 'Improves digestion, reduces inflammation, relieves nausea', 
        properties: 'Balances Vata and Kapha doshas, stimulates digestive fire (Agni)', 
        taste: 'Pungent', 
        potency: 'Hot',
        dosha: ['vata', 'kapha']
      },
      { 
        name: 'Turmeric', 
        category: 'Spices', 
        benefits: 'Anti-inflammatory, boosts immunity, supports liver health', 
        properties: 'Balances all three doshas, purifies blood', 
        taste: 'Bitter', 
        potency: 'Hot',
        dosha: ['vata', 'pitta', 'kapha']
      },
      { 
        name: 'Cumin', 
        category: 'Spices', 
        benefits: 'Aids digestion, reduces bloating, enhances nutrient absorption', 
        properties: 'Balances Vata and Kapha', 
        taste: 'Pungent', 
        potency: 'Hot',
        dosha: ['vata', 'kapha']
      },
      { 
        name: 'Fenugreek', 
        category: 'Spices', 
        benefits: 'Regulates blood sugar, aids digestion, reduces cholesterol', 
        properties: 'Balances Vata and Kapha', 
        taste: 'Bitter', 
        potency: 'Hot',
        dosha: ['vata', 'kapha']
      },
      
      // Vegetables
      { 
        name: 'Cucumber', 
        category: 'Vegetables', 
        benefits: 'Cooling, hydrating, reduces acidity', 
        properties: 'Balances Pitta dosha, calms excess heat', 
        taste: 'Sweet', 
        potency: 'Cold',
        dosha: ['pitta']
      },
      { 
        name: 'Bitter Gourd', 
        category: 'Vegetables', 
        benefits: 'Regulates blood sugar, purifies blood, supports diabetes management', 
        properties: 'Balances Kapha and Pitta', 
        taste: 'Bitter', 
        potency: 'Cold',
        dosha: ['kapha', 'pitta']
      },
      { 
        name: 'Spinach', 
        category: 'Vegetables', 
        benefits: 'Rich in iron, supports blood health, improves digestion', 
        properties: 'Balances Pitta and Kapha', 
        taste: 'Astringent', 
        potency: 'Cold',
        dosha: ['pitta', 'kapha']
      },
      
      // Fruits
      { 
        name: 'Dates', 
        category: 'Fruits', 
        benefits: 'Energizing, nourishing, improves strength and stamina', 
        properties: 'Balances Vata dosha, builds tissues', 
        taste: 'Sweet', 
        potency: 'Hot',
        dosha: ['vata']
      },
      { 
        name: 'Amla (Indian Gooseberry)', 
        category: 'Fruits', 
        benefits: 'Rich in Vitamin C, rejuvenating, supports immunity', 
        properties: 'Balances all doshas, especially Pitta', 
        taste: 'Sour', 
        potency: 'Cold',
        dosha: ['vata', 'pitta', 'kapha']
      },
      { 
        name: 'Coconut', 
        category: 'Fruits', 
        benefits: 'Cooling, nourishing, supports hydration', 
        properties: 'Balances Pitta and Vata', 
        taste: 'Sweet', 
        potency: 'Cold',
        dosha: ['pitta', 'vata']
      },
      
      // Herbs
      { 
        name: 'Mint', 
        category: 'Herbs', 
        benefits: 'Cooling, aids digestion, freshens breath', 
        properties: 'Balances Pitta dosha', 
        taste: 'Pungent', 
        potency: 'Cold',
        dosha: ['pitta']
      },
      { 
        name: 'Coriander', 
        category: 'Herbs', 
        benefits: 'Cooling, digestive, reduces inflammation', 
        properties: 'Balances Pitta and Kapha', 
        taste: 'Sweet', 
        potency: 'Cold',
        dosha: ['pitta', 'kapha']
      },
      
      // Grains
      { 
        name: 'Barley', 
        category: 'Grains', 
        benefits: 'Light, cooling, supports weight management', 
        properties: 'Balances Kapha dosha', 
        taste: 'Sweet', 
        potency: 'Cold',
        dosha: ['kapha']
      },
      { 
        name: 'Rice (Basmati)', 
        category: 'Grains', 
        benefits: 'Easy to digest, nourishing, calming', 
        properties: 'Balances Vata and Pitta', 
        taste: 'Sweet', 
        potency: 'Cold',
        dosha: ['vata', 'pitta']
      },
      
      // Dairy
      { 
        name: 'Ghee (Clarified Butter)', 
        category: 'Dairy', 
        benefits: 'Nourishing, improves digestion, supports brain health', 
        properties: 'Balances Vata and Pitta, increases Ojas (vitality)', 
        taste: 'Sweet', 
        potency: 'Hot',
        dosha: ['vata', 'pitta']
      },
      
      // Oils
      { 
        name: 'Sesame Oil', 
        category: 'Oils', 
        benefits: 'Warming, nourishing, supports joint health', 
        properties: 'Balances Vata dosha', 
        taste: 'Sweet', 
        potency: 'Hot',
        dosha: ['vata']
      }
    ];
    
    console.log('📝 Inserting Ayurvedic foods...');
    await Food.insertMany(foods);
    
    console.log(`✅ Successfully seeded ${foods.length} Ayurvedic foods!`);
    
    // Verify
    const count = await Food.countDocuments();
    console.log(`📊 Total foods in database: ${count}`);
    
  } catch (err) {
    console.error('❌ Error seeding foods:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedFoods();
