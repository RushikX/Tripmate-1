import mongoose from 'mongoose';

const bikePoolSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromDestination: {
    type: String,
    required: true,
    trim: true
  },
  toDestination: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  reachTime: {
    type: Date,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerHead: {
    type: Number,
    required: true,
    min: 0
  },
  bikeDetails: {
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
    color: {
      type: String,
      required: true,
      trim: true
    },
    numberPlate: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    bikeType: {
      type: String,
      enum: ['scooter', 'motorcycle', 'electric'],
      default: 'motorcycle'
    }
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true
  },
  dropLocation: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  rules: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  isFlexible: {
    type: Boolean,
    default: false
  },
  maxDetour: {
    type: Number,
    default: 0,
    min: 0
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

// Virtual for checking if trip is full
bikePoolSchema.virtual('isFull').get(function() {
  return this.availableSeats === 0;
});

// Virtual for checking if trip is in the past
bikePoolSchema.virtual('isPast').get(function() {
  return new Date() > this.startTime;
});

// Method to book a seat
bikePoolSchema.methods.bookSeat = function() {
  if (this.availableSeats > 0) {
    this.availableSeats -= 1;
    return true;
  }
  return false;
};

// Method to cancel a seat
bikePoolSchema.methods.cancelSeat = function() {
  if (this.availableSeats < this.totalSeats) {
    this.availableSeats += 1;
    return true;
  }
  return false;
};

// Indexes for better query performance
bikePoolSchema.index({ driver: 1 });
bikePoolSchema.index({ fromDestination: 1, toDestination: 1 });
bikePoolSchema.index({ startTime: 1 });
bikePoolSchema.index({ status: 1 });
bikePoolSchema.index({ 'bikeDetails.numberPlate': 1 });

const BikePool = mongoose.model('BikePool', bikePoolSchema, 'bikepool_tripmate');

export default BikePool;

