// DietPlan.js
const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealTime: {
    type: String, // e.g., "Breakfast", "Lunch", "Dinner"
    required: true
  },
  foods: [{
    type: String // List of food names or IDs depending on your design
  }],
  rasa: String,
  doshaBalance: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
