import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['carpool', 'bike-pool', 'car-rent', 'bike-rent'],
    required: true
  },
  // For carpool bookings
  carpoolTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPool',
    required: function() { return this.type === 'carpool'; }
  },
  // For bike pool bookings
  bikePoolTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BikePool',
    required: function() { return this.type === 'bike-pool'; }
  },
  // For vehicle rentals
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: function() { return ['car-rent', 'bike-rent'].includes(this.type); }
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
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
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'driver', 'owner', 'system'],
    default: null
  },
  cancellationTime: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewDate: {
    type: Date
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

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    const duration = this.endTime - this.startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }
  return null;
});

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'confirmed' && now >= this.startTime && now <= this.endTime;
});

// Virtual for checking if booking is in the past
bookingSchema.virtual('isPast').get(function() {
  return new Date() > this.endTime;
});

// Method to cancel booking
bookingSchema.methods.cancelBooking = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancellationTime = new Date();
  
  // Calculate refund based on cancellation time
  const now = new Date();
  const timeUntilStart = this.startTime - now;
  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
  
  if (hoursUntilStart > 24) {
    this.refundAmount = this.amount * 0.8; // 80% refund
  } else if (hoursUntilStart > 2) {
    this.refundAmount = this.amount * 0.5; // 50% refund
  } else {
    this.refundAmount = 0; // No refund
  }
  
  return this.save();
};

// Method to complete booking
bookingSchema.methods.completeBooking = function() {
  this.status = 'completed';
  return this.save();
};

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ type: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema, 'bookings_tripmate');

export default Booking;
