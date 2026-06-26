// nlpHelper.js
const nlp = require('compromise');

function detectIntent(text) {
  const doc = nlp(text.toLowerCase());
  if (doc.has('food') || doc.has('diet') || doc.has('pitta') || doc.has('cooling')) {
    return 'food';
  }
  if (doc.has('symptom') || doc.has('pain') || doc.has('fever')) {
    return 'symptom';
  }
  if (doc.has('disease') || doc.has('diabetes') || doc.has('bp')) {
    return 'disease';
  }
  if (doc.has('routine') || doc.has('exercise') || doc.has('daily')) {
    return 'routine';
  }
  return 'general';
}

module.exports = { detectIntent };
