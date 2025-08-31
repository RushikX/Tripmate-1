import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, Calendar, MapPin } from 'lucide-react';
import { API_ENDPOINTS, api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  _id: string;
  name: string;
  age: number;
  rating: number;
  totalRatings: number;
  profilePicture: string | null;
  userType: 'passenger' | 'driver' | 'owner' | 'admin';
}

interface UserRating {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  raterUser: {
    _id: string;
    name: string;
    profilePicture: string | null;
  };
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const UserProfileDialog = ({ open, onOpenChange, userId, userName }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    review: ''
  });
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchProfile();
      fetchRatings();
    }
  }, [open, userId]);

  const fetchProfile = async () => {
    try {
      const data = await api.get<UserProfile>(API_ENDPOINTS.USERS.GET_BY_ID(userId));
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const data = await api.get<UserRating[]>(API_ENDPOINTS.USERS.GET_RATINGS(userId));
      setRatings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
    }
  };

  const submitRating = async () => {
    if (!user || !profile) return;

    // Check if user is trying to rate themselves
    if (user._id === userId) {
      toast({
        title: "Error",
        description: "You cannot rate yourself",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user has already rated this profile
      const existingRating = ratings.find(rating => rating.raterUser._id === user._id);
      
      if (existingRating) {
        toast({
          title: "Error",
          description: "You have already rated this user",
          variant: "destructive"
        });
        return;
      }

      // Submit rating
      const ratingData = {
        rating: ratingForm.rating,
        review: ratingForm.review
      };
      
      await api.post(API_ENDPOINTS.USERS.CREATE_RATING(userId), ratingData);

      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });

      setRatingForm({ rating: 5, review: '' });
      setShowRatingForm(false);
      fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'owner':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View profile and ratings for {profile.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profilePicture || ''} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">{profile.age} years old</Badge>
                    <Badge className={getUserTypeColor(profile.userType)}>
                      {profile.userType}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-600">({profile.totalRatings} ratings)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Form */}
          {user && user._id !== userId && (
            <Card>
              <CardHeader>
                <CardTitle>Rate this user</CardTitle>
                <CardDescription>
                  Share your experience with {profile.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showRatingForm ? (
                  <Button onClick={() => setShowRatingForm(true)}>
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= ratingForm.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review">Review (optional)</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience..."
                        value={ratingForm.review}
                        onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={submitRating}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Submitting...' : 'Submit Rating'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRatingForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ratings List */}
          <Card>
            <CardHeader>
              <CardTitle>User Ratings</CardTitle>
              <CardDescription>
                What others say about {profile.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No ratings yet</p>
                  <p className="text-sm">Be the first to rate this user!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rating.raterUser.profilePicture || ''} />
                            <AvatarFallback>{rating.raterUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{rating.raterUser.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.review && (
                        <p className="text-gray-600 text-sm">{rating.review}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog; 