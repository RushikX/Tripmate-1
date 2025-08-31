import express from 'express';
import Vehicle from '../models/Vehicle.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/vehicles
// @desc    Create a new vehicle listing
// @access  Private
router.post('/', [
  auth,
  body('type').isIn(['car', 'bike']).withMessage('Vehicle type must be car or bike'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('numberPlate').trim().notEmpty().withMessage('Number plate is required'),
  body('mileage').isFloat({ min: 0 }).withMessage('Valid mileage is required'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Valid hourly price is required'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Valid daily price is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      brand,
      model,
      year,
      color,
      numberPlate,
      fuelType,
      transmission,
      engineCapacity,
      mileage,
      seats,
      pricePerHour,
      pricePerDay,
      location,
      description,
      features,
      rules
    } = req.body;

    // Check if number plate already exists
    const existingVehicle = await Vehicle.findOne({ numberPlate });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this number plate already exists' });
    }

    const newVehicle = new Vehicle({
      owner: req.user.id,
      type,
      brand,
      model,
      year,
      color,
      numberPlate,
      fuelType: type === 'car' ? fuelType : undefined,
      transmission: type === 'car' ? transmission : undefined,
      engineCapacity: type === 'car' ? engineCapacity : undefined,
      mileage,
      seats: type === 'car' ? seats : 1,
      pricePerHour,
      pricePerDay,
      location,
      description,
      features: features || [],
      rules: rules || [],
      isAvailable: true
    });

    await newVehicle.save();
    await newVehicle.populate('owner', 'name rating');

    res.status(201).json({
      message: 'Vehicle listing created successfully',
      vehicle: newVehicle
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Vehicle with this number plate already exists' });
    }
    res.status(500).json({ error: 'Server error creating vehicle listing' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email rating totalRatings');

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle listing
// @access  Private (owner only)
router.put('/:id', [
  auth,
  body('pricePerHour').optional().isFloat({ min: 0 }),
  body('pricePerDay').optional().isFloat({ min: 0 }),
  body('location.address').optional().trim().notEmpty(),
  body('location.city').optional().trim().notEmpty(),
  body('location.state').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('features').optional().isArray(),
  body('rules').optional().isArray(),
  body('isAvailable').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if user is the owner
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name email rating');

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: 'Server error updating vehicle' });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle listing
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if user is the owner
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle listing deleted successfully' });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: 'Server error deleting vehicle' });
  }
});

export default router;
