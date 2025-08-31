import express from 'express';
import { body, validationResult, query } from 'express-validator';
import CarPool from '../models/CarPool.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/carpool
// @desc    Create a new carpool trip
// @access  Private
router.post('/', [
  auth,
  body('fromDestination').trim().notEmpty(),
  body('toDestination').trim().notEmpty(),
  body('startTime').isISO8601(),
  body('reachTime').isISO8601(),
  body('totalSeats').isInt({ min: 1, max: 8 }),
  body('pricePerHead').isFloat({ min: 0 }),
  body('carDetails.model').trim().notEmpty(),
  body('carDetails.color').trim().notEmpty(),
  body('carDetails.numberPlate').trim().notEmpty(),
  body('pickupLocation').trim().notEmpty(),
  body('dropLocation').trim().notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fromDestination,
      toDestination,
      startTime,
      reachTime,
      totalSeats,
      pricePerHead,
      carDetails,
      pickupLocation,
      dropLocation,
      description,
      rules,
      amenities,
      isFlexible,
      maxDetour
    } = req.body;

    // Check if start time is in the future
    if (new Date(startTime) <= new Date()) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    // Check if reach time is after start time
    if (new Date(reachTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'Reach time must be after start time' });
    }

    // Create new carpool trip
    const carpoolTrip = new CarPool({
      driver: req.user.id,
      fromDestination,
      toDestination,
      startTime,
      reachTime,
      totalSeats,
      availableSeats: totalSeats,
      pricePerHead,
      carDetails,
      pickupLocation,
      dropLocation,
      description,
      rules: rules || [],
      amenities: amenities || [],
      isFlexible: isFlexible || false,
      maxDetour: maxDetour || 0
    });

    await carpoolTrip.save();

    // Populate driver details
    await carpoolTrip.populate('driver', 'name email rating');

    res.status(201).json({
      message: 'Carpool trip created successfully',
      trip: carpoolTrip
    });

  } catch (error) {
    console.error('Create carpool error:', error);
    res.status(500).json({ error: 'Server error creating carpool trip' });
  }
});

// @route   GET /api/carpool
// @desc    Get all carpool trips with filters
// @access  Public
router.get('/', [
  query('from').optional().trim(),
  query('to').optional().trim(),
  query('date').optional().isISO8601(),
  query('minSeats').optional().isInt({ min: 1 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      minSeats,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { status: 'scheduled' };
    
    if (from) {
      filter.fromDestination = { $regex: from, $options: 'i' };
    }
    
    if (to) {
      filter.toDestination = { $regex: to, $options: 'i' };
    }
    
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.startTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    if (minSeats) {
      filter.availableSeats = { $gte: parseInt(minSeats) };
    }
    
    if (maxPrice) {
      filter.pricePerHead = { $lte: parseFloat(maxPrice) };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get trips with pagination
    const trips = await CarPool.find(filter)
      .populate('driver', 'name rating totalRatings')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await CarPool.countDocuments(filter);

    res.json({
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get carpool trips error:', error);
    res.status(500).json({ error: 'Server error getting carpool trips' });
  }
});

// @route   GET /api/carpool/:id
// @desc    Get carpool trip by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const trip = await CarPool.findById(req.params.id)
      .populate('driver', 'name email rating totalRatings profilePicture');

    if (!trip) {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }

    res.json(trip);

  } catch (error) {
    console.error('Get carpool trip error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }
    res.status(500).json({ error: 'Server error getting carpool trip' });
  }
});

// @route   PUT /api/carpool/:id
// @desc    Update carpool trip
// @access  Private (driver only)
router.put('/:id', [
  auth,
  body('fromDestination').optional().trim().notEmpty(),
  body('toDestination').optional().trim().notEmpty(),
  body('startTime').optional().isISO8601(),
  body('reachTime').optional().isISO8601(),
  body('pricePerHead').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('rules').optional().isArray(),
  body('amenities').optional().isArray()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = await CarPool.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }

    // Check if user is the driver
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this trip' });
    }

    // Check if trip can be updated (not in progress or completed)
    if (['in-progress', 'completed'].includes(trip.status)) {
      return res.status(400).json({ error: 'Cannot update trip in progress or completed' });
    }

    // Update trip
    const updatedTrip = await CarPool.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('driver', 'name email rating');

    res.json({
      message: 'Carpool trip updated successfully',
      trip: updatedTrip
    });

  } catch (error) {
    console.error('Update carpool trip error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }
    res.status(500).json({ error: 'Server error updating carpool trip' });
  }
});

// @route   DELETE /api/carpool/:id
// @desc    Cancel carpool trip
// @access  Private (driver only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await CarPool.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }

    // Check if user is the driver
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this trip' });
    }

    // Check if trip can be cancelled
    if (['in-progress', 'completed'].includes(trip.status)) {
      return res.status(400).json({ error: 'Cannot cancel trip in progress or completed' });
    }

    // Cancel trip
    trip.status = 'cancelled';
    await trip.save();

    res.json({ message: 'Carpool trip cancelled successfully' });

  } catch (error) {
    console.error('Cancel carpool trip error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Carpool trip not found' });
    }
    res.status(500).json({ error: 'Server error cancelling carpool trip' });
  }
});

// @route   GET /api/carpool/driver/my-trips
// @desc    Get driver's carpool trips
// @access  Private
router.get('/driver/my-trips', auth, async (req, res) => {
  try {
    const trips = await CarPool.find({ driver: req.user.id })
      .sort({ startTime: -1 });

    res.json(trips);

  } catch (error) {
    console.error('Get driver trips error:', error);
    res.status(500).json({ error: 'Server error getting driver trips' });
  }
});

export default router;
