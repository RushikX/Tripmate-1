import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS, api } from '@/lib/api';
import { Bike, MapPin, Clock, Star, ArrowLeft, Plus, Calendar, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserProfileDialog from './UserProfileDialog';

interface BikeListing {
  _id: string;
  brand: string;
  model: string;
  color: string;
  numberPlate: string;
  year: number;
  fuelType: string;
  mileage: number;
  pricePerHour: number;
  pricePerDay: number;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  description: string;
  features: string[];
  isAvailable: boolean;
  owner: {
    _id: string;
    name: string;
    rating: number;
    totalRatings: number;
  };
  rating: number;
  totalRatings: number;
}

interface BookingForm {
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  totalPrice: number;
}

const BikeRentPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<BikeListing[]>([]);
  const [myListings, setMyListings] = useState<BikeListing[]>([]);
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [rentalType, setRentalType] = useState<'short_term' | 'long_term' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<BikeListing | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: '',
    totalPrice: 0
  });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    numberPlate: '',
    pricePerHour: 0,
    pricePerDay: 0,
    description: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOpenUserProfile = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserProfile(true);
  };

  useEffect(() => {
    fetchListings();
    fetchMyListings();
    fetchMyRentals();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.get<BikeListing[]>(API_ENDPOINTS.VEHICLES.BIKE_RENT);
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bike listings",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const fetchMyListings = async () => {
    if (!user) return;

    try {
      const data = await api.get<BikeListing[]>(API_ENDPOINTS.VEHICLES.BIKE_MY_LISTINGS);
      setMyListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      setMyListings([]);
    }
  };

  const fetchMyRentals = async () => {
    if (!user) return;

    try {
      const data = await api.get<any[]>(API_ENDPOINTS.BOOKINGS.GET_ALL);
      if (Array.isArray(data)) {
        const bikeRentals = data.filter(booking => booking.type === 'bike-rent');
        setMyRentals(bikeRentals);
      } else {
        setMyRentals([]);
      }
    } catch (error) {
      console.error('Error fetching my rentals:', error);
      setMyRentals([]);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleBooking = async () => {
    if (!selectedListing || !user) return;

    try {
      const bookingData = {
        type: 'bike-rent',
        vehicle: selectedListing._id,
        startTime: new Date(`${bookingForm.fromDate}T${bookingForm.fromTime}`),
        endTime: new Date(`${bookingForm.toDate}T${bookingForm.toTime}`),
        pickupLocation: selectedListing.location.address,
        dropLocation: selectedListing.location.address,
        amount: bookingForm.totalPrice
      };

      await api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
      
      toast({
        title: "Success",
        description: "Bike rental booking created successfully!",
      });
      
      setShowBookingDialog(false);
      setSelectedListing(null);
      setBookingForm({
        fromDate: '',
        toDate: '',
        fromTime: '',
        toTime: '',
        totalPrice: 0
      });
      
      fetchListings();
      fetchMyRentals();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create bike rental booking",
        variant: "destructive"
      });
    }
  };

  const handleCreateListing = () => {
    navigate('/create-vehicle?type=bike');
  };

  const handleEditListing = (listing: any) => {
    setEditingListing(listing);
    setEditForm({
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      color: listing.color,
      numberPlate: listing.numberPlate,
      pricePerHour: listing.pricePerHour,
      pricePerDay: listing.pricePerDay,
      description: listing.description || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateListing = async () => {
    if (!editingListing) return;

    setLoading(true);
    try {
      const updatedData = {
        brand: editForm.brand,
        model: editForm.model,
        year: editForm.year,
        color: editForm.color,
        numberPlate: editForm.numberPlate,
        pricePerHour: editForm.pricePerHour,
        pricePerDay: editForm.pricePerDay,
        description: editForm.description
      };

      await api.put(API_ENDPOINTS.VEHICLES.UPDATE(editingListing._id), updatedData);
      
      toast({
        title: "Success!",
        description: "Bike listing updated successfully!",
      });
      
      setShowEditDialog(false);
      setEditingListing(null);
      fetchMyListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(API_ENDPOINTS.VEHICLES.DELETE(listingId));
      
      toast({
        title: "Success!",
        description: "Bike listing removed successfully!",
      });
      
      fetchMyListings();
    } catch (error) {
      console.error('Error removing listing:', error);
      toast({
        title: "Error",
        description: "Failed to remove listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async (rentalId: string) => {
    if (!confirm('Are you sure you want to cancel this rental? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.put(API_ENDPOINTS.BOOKINGS.UPDATE(rentalId), { status: 'cancelled' });
      
      toast({
        title: "Success!",
        description: "Rental cancelled successfully!",
      });
      
      fetchMyRentals();
    } catch (error) {
      console.error('Error cancelling rental:', error);
      toast({
        title: "Error",
        description: "Failed to cancel rental. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedListing || !bookingForm.fromDate || !bookingForm.toDate || !bookingForm.fromTime || !bookingForm.toTime) {
      return 0;
    }

    const start = new Date(`${bookingForm.fromDate}T${bookingForm.fromTime}`);
    const end = new Date(`${bookingForm.toDate}T${bookingForm.toTime}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours <= 24) {
      return Math.ceil(durationHours) * selectedListing.pricePerHour;
    } else {
      const days = Math.ceil(durationHours / 24);
      return days * selectedListing.pricePerDay;
    }
  };

  const filteredListings = Array.isArray(listings) ? listings.filter(listing => {
    if (searchCity && !listing.location.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
    if (rentalType !== 'all') {
      if (rentalType === 'short_term' && listing.pricePerHour > 50) return false;
      if (rentalType === 'long_term' && listing.pricePerDay > 500) return false;
    }
    return true;
  }) : [];

  const [bikeType, setBikeType] = useState<'all' | 'scooter' | 'motorcycle' | 'electric'>('all');
  const filteredListings = Array.isArray(listings) 
  ? listings.filter(listing => {
      if (searchCity && !listing.location.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (rentalType !== 'all') {
        if (rentalType === 'short_term' && listing.pricePerHour > 50) return false;
        if (rentalType === 'long_term' && listing.pricePerDay > 500) return false;
      }
      if (bikeType !== 'all' && listing.bikeType !== bikeType) return false;
      return true;
    })
  : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl bg-white dark:bg-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bike Rentals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Find and rent bikes from trusted owners</p>
        </div>
        <Button onClick={() => navigate('/create-vehicle?type=bike')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          List Your Bike
        </Button>
      </div>

      {/* Search Section */}
      <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Search Bikes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
              <Input
                id="location"
                placeholder="Enter location"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="rental-type" className="text-gray-700 dark:text-gray-300">Rental Type</Label>
              <Select value={rentalType} onValueChange={(value: any) => setRentalType(value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select rental type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="short_term">Short Term (Hourly)</SelectItem>
                  <SelectItem value="long_term">Long Term (Daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bike-type" className="text-gray-700 dark:text-gray-300">Bike Type</Label>
              <Select value={bikeType} onValueChange={(value: any) => setBikeType(value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select bike type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="available" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">Available Bikes</TabsTrigger>
          <TabsTrigger value="my-listings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">My Listings</TabsTrigger>
          <TabsTrigger value="my-rentals" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">My Rentals</TabsTrigger>
        </TabsList>

        {/* Available Bikes */}
        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading bikes...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bike className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No bikes available</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredListings.map((listing) => (
                <Card key={listing._id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={listing.images[0] || ''} />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {listing.owner?.name ? listing.owner.name.charAt(0) : 'O'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {listing.owner?.name || 'Unknown Owner'}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{listing.owner?.rating?.toFixed(1) || '0.0'}</span>
                            <span>({listing.owner?.totalRatings || 0})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={listing.isAvailable ? 'default' : 'secondary'} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {listing.isAvailable ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{listing.brand} {listing.model}</h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div>Type: {listing.bikeType}</div>
                          <div>Year: {listing.year}</div>
                          <div>Color: {listing.color}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{listing.pricePerHour}/hr
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          or ₹{listing.pricePerDay}/day
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Engine</div>
                        <div className="font-medium text-gray-900 dark:text-white">{listing.engineCapacity}cc</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Mileage</div>
                        <div className="font-medium text-gray-900 dark:text-white">{listing.mileage} km/l</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Fuel Type</div>
                        <div className="font-medium text-gray-900 dark:text-white">{listing.fuelType}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Location</div>
                        <div className="font-medium text-gray-900 dark:text-white">{listing.location.city}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenUserProfile(listing.owner._id, listing.owner.name)}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowRentalDialog(true);
                        }}
                        disabled={!listing.isAvailable}
                      >
                        Rent Bike
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Listings */}
        <TabsContent value="my-listings" className="space-y-4">
          {myListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bike listings yet</div>
          ) : (
            <div className="grid gap-4">
              {myListings.map((listing) => (
                <Card key={listing._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {listing.brand} {listing.model} ({listing.year})
                        </h3>
                        <p className="text-gray-600">{listing.location.city}, {listing.location.state}</p>
                      </div>
                      <Badge variant={listing.isAvailable ? 'default' : 'secondary'}>
                        {listing.isAvailable ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Hourly Rate</div>
                        <div className="font-medium">₹{listing.pricePerHour}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Daily Rate</div>
                        <div className="font-medium">₹{listing.pricePerDay}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Rating</div>
                        <div className="font-medium">{listing.rating.toFixed(1)} ⭐</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Rentals</div>
                        <div className="font-medium">{listing.totalRatings}</div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditListing(listing)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveListing(listing._id)}>
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Rentals */}
        <TabsContent value="my-rentals" className="space-y-4">
          {myRentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bike rentals yet</div>
          ) : (
            <div className="grid gap-4">
              {myRentals.map((rental) => (
                <Card key={rental._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {rental.vehicle?.brand} {rental.vehicle?.model}
                        </h3>
                        <p className="text-gray-600">
                          {new Date(rental.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={rental.status === 'confirmed' ? 'default' : 'secondary'}>
                        {rental.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-medium">₹{rental.amount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Pickup Time</div>
                        <div className="font-medium">
                          {new Date(rental.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Return Time</div>
                        <div className="font-medium">
                          {new Date(rental.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCancelRental(rental._id)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rent Bike</DialogTitle>
            <DialogDescription>
              Confirm your rental details for {selectedListing?.brand} {selectedListing?.model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={bookingForm.fromDate}
                  onChange={(e) => setBookingForm({...bookingForm, fromDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={bookingForm.toDate}
                  onChange={(e) => setBookingForm({...bookingForm, toDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-time">From Time</Label>
                <Input
                  id="from-time"
                  type="time"
                  value={bookingForm.fromTime}
                  onChange={(e) => setBookingForm({...bookingForm, fromTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="to-time">To Time</Label>
                <Input
                  id="to-time"
                  type="time"
                  value={bookingForm.toTime}
                  onChange={(e) => setBookingForm({...bookingForm, toTime: e.target.value})}
                />
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Price</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{calculatePrice()}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBooking}>
                Confirm Rental
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      {/* Edit Listing Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bike Listing</DialogTitle>
            <DialogDescription>
              Update details for {editingListing?.brand} {editingListing?.model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-brand">Brand</Label>
                <Input
                  id="edit-brand"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={editForm.model}
                  onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={editForm.color}
                  onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-number-plate">Number Plate</Label>
              <Input
                id="edit-number-plate"
                value={editForm.numberPlate}
                onChange={(e) => setEditForm({...editForm, numberPlate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price-hour">Price Per Hour</Label>
                <Input
                  id="edit-price-hour"
                  type="number"
                  value={editForm.pricePerHour}
                  onChange={(e) => setEditForm({...editForm, pricePerHour: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="edit-price-day">Price Per Day</Label>
                <Input
                  id="edit-price-day"
                  type="number"
                  value={editForm.pricePerDay}
                  onChange={(e) => setEditForm({...editForm, pricePerDay: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateListing}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BikeRentPage;
