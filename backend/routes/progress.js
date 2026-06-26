const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Add new entry
router.post('/', async (req, res) => {
  try {
    const progress = new Progress(req.body);
    await progress.save();
    res.json({ message: 'Progress entry added', progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await Progress.find({ patientId }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
