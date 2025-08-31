import express from 'express';
import User from '../models/User.js';
import UserRating from '../models/UserRating.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/ratings
// @desc    Get user ratings
// @access  Public
router.get('/:id/ratings', async (req, res) => {
  try {
    const ratings = await UserRating.find({ ratedUser: req.params.id })
      .populate('raterUser', 'name')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/:id/ratings
// @desc    Create user rating
// @access  Private
router.post('/:id/ratings', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, review } = req.body;
    const ratedUserId = req.params.id;
    const raterUserId = req.user.id;

    // Check if user is trying to rate themselves
    if (ratedUserId === raterUserId) {
      return res.status(400).json({ error: 'You cannot rate yourself' });
    }

    // Check if user exists
    const ratedUser = await User.findById(ratedUserId);
    if (!ratedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has already rated this user
    const existingRating = await UserRating.findOne({
      ratedUser: ratedUserId,
      raterUser: raterUserId
    });

    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this user' });
    }

    // Create new rating
    const newRating = new UserRating({
      ratedUser: ratedUserId,
      raterUser: raterUserId,
      rating,
      review
    });

    await newRating.save();

    // Update user's average rating
    const allRatings = await UserRating.find({ ratedUser: ratedUserId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await User.findByIdAndUpdate(ratedUserId, {
      rating: avgRating,
      totalRatings: allRatings.length
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });

  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
