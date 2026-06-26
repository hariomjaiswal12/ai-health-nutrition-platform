const mongoose = require('mongoose');

const ayurvedaResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['article', 'video', 'text', 'document'] 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Ancient Texts', 'Doshas', 'Herbs & Spices', 'Treatments', 'Lifestyle', 'Philosophy', 'History', 'Diet & Nutrition']
  },
  content: String, // For articles
  videoUrl: String, // YouTube embed URL
  description: { type: String, required: true },
  language: { type: String, default: 'English', enum: ['English', 'Hindi', 'Sanskrit'] },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  readTime: String, // "5 min read"
  tags: [String],
  author: String,
  source: String, // Original text source
  imageUrl: String, // Optional thumbnail
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for search
ayurvedaResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('AyurvedaResource', ayurvedaResourceSchema);
