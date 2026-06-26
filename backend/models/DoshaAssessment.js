const mongoose = require('mongoose');

const doshaAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  
  // Quiz Responses (20 questions)
  responses: [{
    question: String,
    answer: String,
    category: String // 'physical', 'mental', 'lifestyle'
  }],
  
  // Calculated Results
  vataScore: { type: Number, default: 0 },
  pittaScore: { type: Number, default: 0 },
  kaphaScore: { type: Number, default: 0 },
  
  // Dominant Dosha
  primaryDosha: String,
  secondaryDosha: String,
  
  // Recommendations
  dietRecommendations: [String],
  lifestyleRecommendations: [String],
  foodsToAvoid: [String],
  foodsToFavor: [String],
  
  // Metadata
  completedAt: { type: Date, default: Date.now },
  reportGenerated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DoshaAssessment', doshaAssessmentSchema);
