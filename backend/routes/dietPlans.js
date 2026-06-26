const express = require('express');
const router = express.Router();
const DietPlan = require('../DietPlan');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all diet plans (admin/doctor only)
router.get('/', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const plans = await DietPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new diet plan (doctors & admins only)
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const newPlan = new DietPlan(req.body);
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single diet plan by ID (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Diet plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a diet plan (doctors & admins only)
router.put('/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const updatedPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlan) return res.status(404).json({ error: 'Diet plan not found' });
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a diet plan (doctors & admins only)
router.delete('/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const deletedPlan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ error: 'Diet plan not found' });
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all diet plans for a specific patient (authenticated)
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const plans = await DietPlan.find({ patientId: req.params.patientId });
    res.json(plans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
