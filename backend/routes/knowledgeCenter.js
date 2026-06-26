const express = require('express');
const router = express.Router();
const AyurvedaResource = require('../models/AyurvedaResource');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all resources (public)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, difficulty } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }
    
    const resources = await AyurvedaResource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ message: 'Error fetching resources', error: err.message });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await AyurvedaResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resource', error: err.message });
  }
});

// Add resource (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const resource = new AyurvedaResource(req.body);
    await resource.save();
    res.status(201).json({ message: 'Resource added successfully', resource });
  } catch (err) {
    res.status(500).json({ message: 'Error adding resource', error: err.message });
  }
});

// Update resource (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const resource = await AyurvedaResource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource updated successfully', resource });
  } catch (err) {
    res.status(500).json({ message: 'Error updating resource', error: err.message });
  }
});

// Delete resource (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const resource = await AyurvedaResource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting resource', error: err.message });
  }
});

module.exports = router;
