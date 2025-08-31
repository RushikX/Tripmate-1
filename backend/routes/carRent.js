import express from 'express';
import Vehicle from '../models/Vehicle.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/car-rent
// @desc    Get available cars for rent
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cars = await Vehicle.find({ 
      type: 'car', 
      isAvailable: true 
    }).populate('owner', 'name rating');
    
    res.json(cars);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/car-rent/my-listings
// @desc    Get current user's car listings
// @access  Private
router.get('/my-listings', auth, async (req, res) => {
  try {
    const cars = await Vehicle.find({ 
      type: 'car', 
      owner: req.user.id 
    }).populate('owner', 'name rating');
    
    res.json(cars);
  } catch (error) {
    console.error('Get my car listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
