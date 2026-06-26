// Food.js - Updated Schema
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Grains', 'Vegetables', 'Fruits', 'Spices', 'Herbs', 'Dairy', 'Oils', 'Legumes', 'Nuts', 'Seeds']
  },
  benefits: {
    type: String,
    required: true
  },
  properties: {
    type: String,
    default: ''
  },
  taste: {
    type: String,
    enum: ['Sweet', 'Sour', 'Salty', 'Bitter', 'Pungent', 'Astringent', ''],
    default: ''
  },
  potency: {
    type: String,
    enum: ['Hot', 'Cold', ''],
    default: ''
  },
  
  // Keep these for backward compatibility or future use
  rasa: String,        // Ayurvedic taste (can be alias of taste)
  virya: String,       // Heating/cooling (can be alias of potency)
  dosha: [String],     // Dosha effects
  description: String  // Additional description
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
