import express from 'express';
import Booking from '../models/Booking.js';
import CarPool from '../models/CarPool.js';
import BikePool from '../models/BikePool.js';
import Vehicle from '../models/Vehicle.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('carpoolTrip')
      .populate('bikePoolTrip')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, [
  body('type').isIn(['carpool', 'bike-pool', 'car-rent', 'bike-rent']).withMessage('Valid booking type is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('dropLocation').notEmpty().withMessage('Drop location is required'),
  body('amount').isNumeric().withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      carpoolTrip,
      bikePoolTrip,
      vehicle,
      startTime,
      endTime,
      pickupLocation,
      dropLocation,
      amount,
      specialRequests,
      phoneNumber
    } = req.body;

    // Validate booking type specific fields
    if (type === 'carpool' && !carpoolTrip) {
      return res.status(400).json({ error: 'Carpool trip ID is required for carpool bookings' });
    }
    if (type === 'bike-pool' && !bikePoolTrip) {
      return res.status(400).json({ error: 'Bike pool trip ID is required for bike pool bookings' });
    }
    if (['car-rent', 'bike-rent'].includes(type) && !vehicle) {
      return res.status(400).json({ error: 'Vehicle ID is required for vehicle rentals' });
    }

    // Check if carpool trip has available seats
    if (type === 'carpool') {
      const trip = await CarPool.findById(carpoolTrip);
      if (!trip) {
        return res.status(404).json({ error: 'Carpool trip not found' });
      }
      if (trip.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats on this trip' });
      }
      // Update available seats
      trip.availableSeats -= 1;
      await trip.save();
    }

    // Check if bike pool trip has available seats
    if (type === 'bike-pool') {
      const trip = await BikePool.findById(bikePoolTrip);
      if (!trip) {
        return res.status(404).json({ error: 'Bike pool trip not found' });
      }
      if (trip.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats on this trip' });
      }
      // Update available seats
      trip.availableSeats -= 1;
      await trip.save();
    }

    // Check if vehicle is available
    if (['car-rent', 'bike-rent'].includes(type)) {
      const vehicleDoc = await Vehicle.findById(vehicle);
      if (!vehicleDoc) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      if (!vehicleDoc.isAvailable) {
        return res.status(400).json({ error: 'Vehicle is not available for the selected time' });
      }
    }

    const newBooking = new Booking({
      user: req.user.id,
      type,
      carpoolTrip: type === 'carpool' ? carpoolTrip : undefined,
      bikePoolTrip: type === 'bike-pool' ? bikePoolTrip : undefined,
      vehicle: ['car-rent', 'bike-rent'].includes(type) ? vehicle : undefined,
      startTime,
      endTime,
      pickupLocation,
      dropLocation,
      amount,
      specialRequests,
      phoneNumber,
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    const booking = await newBooking.save();
    await booking.populate('carpoolTrip');
    await booking.populate('bikePoolTrip');
    await booking.populate('vehicle');
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carpoolTrip')
      .populate('bikePoolTrip')
      .populate('vehicle')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('carpoolTrip').populate('bikePoolTrip').populate('vehicle');
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    // If it's a carpool booking, restore the seat
    if (booking.type === 'carpool' && booking.carpoolTrip) {
      const trip = await CarPool.findById(booking.carpoolTrip);
      if (trip) {
        trip.availableSeats += 1;
        await trip.save();
      }
    }

    // If it's a bike pool booking, restore the seat
    if (booking.type === 'bike-pool' && booking.bikePoolTrip) {
      const trip = await BikePool.findById(booking.bikePoolTrip);
      if (trip) {
        trip.availableSeats += 1;
        await trip.save();
      }
    }
    
    // Cancel the booking instead of deleting
    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancellationTime = new Date();
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
