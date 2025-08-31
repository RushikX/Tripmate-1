import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['car', 'bike'],
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  numberPlate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'battery'],
    required: function() { return this.type === 'car'; }
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt'],
    required: function() { return this.type === 'car'; }
  },
  engineCapacity: {
    type: Number,
    min: 0,
    required: function() { return this.type === 'car'; }
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  seats: {
    type: Number,
    min: 1,
    max: 12,
    required: function() { return this.type === 'car'; }
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  images: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  features: [{
    type: String,
    trim: true
  }],
  rules: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  documents: {
    rc: { type: String, default: '' },
    insurance: { type: String, default: '' },
    permit: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for checking if vehicle is expensive
vehicleSchema.virtual('isExpensive').get(function() {
  return this.pricePerHour > 100 || this.pricePerDay > 1000;
});

// Virtual for vehicle age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Method to update availability
vehicleSchema.methods.updateAvailability = function(available) {
  this.isAvailable = available;
  return this.save();
};

// Method to update rating
vehicleSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.totalRatings) + newRating;
  this.totalRatings += 1;
  this.rating = totalRating / this.totalRatings;
  return this.save();
};

// Indexes for better query performance
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ location: { city: 1, state: 1 } });
vehicleSchema.index({ isAvailable: 1 });
vehicleSchema.index({ pricePerHour: 1, pricePerDay: 1 });
vehicleSchema.index({ rating: -1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema, 'vehicles_tripmate');

export default Vehicle;
