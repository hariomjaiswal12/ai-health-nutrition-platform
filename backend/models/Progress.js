const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: Number,
  bp: String,
  bloodSugar: Number,
  sleepQuality: { type: Number, min: 1, max: 10 },
  mood: { type: Number, min: 1, max: 10 },
  digestion: { type: Number, min: 1, max: 10 },
  notes: String,
});

module.exports = mongoose.model('Progress', progressSchema);

