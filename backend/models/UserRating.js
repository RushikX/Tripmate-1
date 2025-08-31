import mongoose from 'mongoose';

const userRatingSchema = new mongoose.Schema({
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raterUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings from the same user
userRatingSchema.index({ ratedUser: 1, raterUser: 1 }, { unique: true });

// Indexes for better query performance
userRatingSchema.index({ ratedUser: 1 });
userRatingSchema.index({ raterUser: 1 });
userRatingSchema.index({ rating: -1 });
userRatingSchema.index({ createdAt: -1 });

const UserRating = mongoose.model('UserRating', userRatingSchema, 'user_ratings_tripmate');

export default UserRating;
