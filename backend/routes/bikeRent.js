import express from 'express';
import Vehicle from '../models/Vehicle.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bike-rent
// @desc    Get available bikes for rent
// @access  Public
router.get('/', async (req, res) => {
  try {
    const bikes = await Vehicle.find({ 
      type: 'bike', 
      isAvailable: true 
    }).populate('owner', 'name rating');
    
    res.json(bikes);
  } catch (error) {
    console.error('Get bikes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/bike-rent/my-listings
// @desc    Get current user's bike listings
// @access  Private
router.get('/my-listings', auth, async (req, res) => {
  try {
    const bikes = await Vehicle.find({ 
      type: 'bike', 
      owner: req.user.id 
    }).populate('owner', 'name rating');
    
    res.json(bikes);
  } catch (error) {
    console.error('Get my bike listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
