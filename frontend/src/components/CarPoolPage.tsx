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
import { Car, MapPin, Clock, Star, ArrowLeft, Plus, Users, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserProfileDialog from './UserProfileDialog';

interface CarpoolTrip {
  _id: string;
  fromDestination: string;
  toDestination: string;
  startTime: string;
  reachTime: string;
  pricePerHead: number;
  availableSeats: number;
  totalSeats: number;
  carDetails: {
    model: string;
    color: string;
    numberPlate: string;
    year?: number;
  };
  driver: {
    _id: string;
    name: string;
    rating: number;
    totalRatings: number;
  };
  status: string;
  createdAt: string;
  pickupLocation: string;
  dropLocation: string;
  description?: string;
  rules?: string[];
  isFlexible?: boolean;
  maxDetour?: number;
}

interface BookingForm {
  pickupLocation: string;
  pickupTime: string;
  phoneNumber: string;
}

interface EditForm {
  fromDestination: string;
  toDestination: string;
  startTime: string;
  reachTime: string;
  totalSeats: number;
  pricePerHead: number;
  carModel: string;
  carColor: string;
  carNumberPlate: string;
  carYear: number;
  pickupLocation: string;
  dropLocation: string;
  description: string;
  rules: string[];
  isFlexible: boolean;
  maxDetour: number;
}

const CarPoolPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<CarpoolTrip[]>([]);
  const [myTrips, setMyTrips] = useState<CarpoolTrip[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<CarpoolTrip | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    pickupLocation: '',
    pickupTime: '',
    phoneNumber: ''
  });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<CarpoolTrip | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    fromDestination: '',
    toDestination: '',
    startTime: '',
    reachTime: '',
    totalSeats: 4,
    pricePerHead: 0,
    carModel: '',
    carColor: '',
    carNumberPlate: '',
    carYear: new Date().getFullYear(),
    pickupLocation: '',
    dropLocation: '',
    description: '',
    rules: [],
    isFlexible: false,
    maxDetour: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
    fetchMyTrips();
    fetchMyBookings();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ trips: CarpoolTrip[], pagination: any }>(API_ENDPOINTS.CARPOOL.GET_ALL);
      const tripsData = Array.isArray(response.trips) ? response.trips : [];
      
      // Filter out trips with missing essential data
      const validTrips = tripsData.filter(trip => 
        trip.driver && 
        trip.driver.name && 
        trip.carDetails && 
        trip.carDetails.model
      );
      
      setTrips(validTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive"
      });
      setTrips([]);
    }
    setLoading(false);
  };

  const fetchMyTrips = async () => {
    if (!user) return;

    try {
      const data = await api.get<CarpoolTrip[]>(API_ENDPOINTS.CARPOOL.DRIVER_TRIPS);
      setMyTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching my trips:', error);
      setMyTrips([]);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;

    try {
      const data = await api.get<any[]>(API_ENDPOINTS.BOOKINGS.GET_ALL);
      if (Array.isArray(data)) {
        const carpoolBookings = data.filter(booking => booking.type === 'carpool');
        setMyBookings(carpoolBookings);
      } else {
        setMyBookings([]);
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      setMyBookings([]);
    }
  };

  const handleSearch = () => {
    fetchTrips();
  };

  const handleBooking = async () => {
    if (!selectedTrip || !user) return;

    try {
      const bookingData = {
        type: 'carpool',
        carpoolTrip: selectedTrip._id,
        startTime: new Date(bookingForm.pickupTime),
        endTime: new Date(selectedTrip.reachTime),
        pickupLocation: bookingForm.pickupLocation,
        dropLocation: selectedTrip.toDestination,
        amount: selectedTrip.pricePerHead,
        phoneNumber: bookingForm.phoneNumber
      };

      await api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
      
      toast({
        title: "Success",
        description: "Booking created successfully!",
      });
      
      setShowBookingDialog(false);
      setSelectedTrip(null);
      setBookingForm({
        pickupLocation: '',
        pickupTime: '',
        phoneNumber: ''
      });
      
      fetchTrips();
      fetchMyBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      });
    }
  };

  const handleCreateTrip = () => {
    navigate('/create-carpool');
  };

  const handleEditTrip = (trip: CarpoolTrip) => {
    setEditingTrip(trip);
    setEditForm({
      fromDestination: trip.fromDestination,
      toDestination: trip.toDestination,
      startTime: new Date(trip.startTime).toISOString().slice(0, 16),
      reachTime: new Date(trip.reachTime).toISOString().slice(0, 16),
      totalSeats: trip.totalSeats,
      pricePerHead: trip.pricePerHead,
      carModel: trip.carDetails.model,
      carColor: trip.carDetails.color,
      carNumberPlate: trip.carDetails.numberPlate,
      carYear: trip.carDetails.year || new Date().getFullYear(),
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation,
      description: trip.description || '',
      rules: trip.rules || [],
      isFlexible: trip.isFlexible || false,
      maxDetour: trip.maxDetour || 0
    });
    setShowEditDialog(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;

    setLoading(true);
    try {
      const updatedData = {
        fromDestination: editForm.fromDestination,
        toDestination: editForm.toDestination,
        startTime: new Date(editForm.startTime),
        reachTime: new Date(editForm.reachTime),
        totalSeats: editForm.totalSeats,
        pricePerHead: editForm.pricePerHead,
        carDetails: {
          model: editForm.carModel,
          color: editForm.carColor,
          numberPlate: editForm.carNumberPlate,
          year: editForm.carYear
        },
        pickupLocation: editForm.pickupLocation,
        dropLocation: editForm.dropLocation,
        description: editForm.description,
        rules: editForm.rules,
        isFlexible: editForm.isFlexible,
        maxDetour: editForm.maxDetour
      };

      await api.put(API_ENDPOINTS.CARPOOL.UPDATE(editingTrip._id), updatedData);
      
      toast({
        title: "Success!",
        description: "Trip updated successfully!",
      });
      
      setShowEditDialog(false);
      setEditingTrip(null);
      fetchMyTrips();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.put(API_ENDPOINTS.CARPOOL.UPDATE(tripId), { status: 'cancelled' });
      
      toast({
        title: "Success!",
        description: "Trip cancelled successfully!",
      });
      
      fetchMyTrips();
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast({
        title: "Error",
        description: "Failed to cancel trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openUserProfile = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowUserProfile(true);
  };

  const filteredTrips = Array.isArray(trips) ? trips.filter(trip => {
    if (searchFrom && !trip.fromDestination.toLowerCase().includes(searchFrom.toLowerCase())) return false;
    if (searchTo && !trip.toDestination.toLowerCase().includes(searchTo.toLowerCase())) return false;
    return true;
  }) : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl bg-white dark:bg-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Car Pooling</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Find and share rides with your community</p>
        </div>
        <Button onClick={handleCreateTrip} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
      </div>

      {/* Search Section */}
      <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Search Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="from" className="text-gray-700 dark:text-gray-300">From</Label>
              <Input
                id="from"
                placeholder="Enter departure location"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-gray-700 dark:text-gray-300">To</Label>
              <Input
                id="to"
                placeholder="Enter destination"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
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
          <TabsTrigger value="available" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">Available Trips</TabsTrigger>
          <TabsTrigger value="my-trips" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">My Trips</TabsTrigger>
          <TabsTrigger value="my-bookings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">My Bookings</TabsTrigger>
        </TabsList>

        {/* Available Trips */}
        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No trips available</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTrips.map((trip) => (
                <Card key={trip._id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {trip.driver?.name ? trip.driver.name.charAt(0) : 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {trip.driver?.name || 'Unknown Driver'}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{trip.driver?.rating?.toFixed(1) || '0.0'}</span>
                            <span>({trip.driver?.totalRatings || 0})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={trip.status === 'scheduled' ? 'default' : 'secondary'} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {trip.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">From</div>
                          <div className="font-medium text-gray-900 dark:text-white">{trip.fromDestination}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">To</div>
                          <div className="font-medium text-gray-900 dark:text-white">{trip.toDestination}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Start Time</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(trip.startTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Reach Time</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(trip.reachTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Available Seats</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {trip.availableSeats}/{trip.totalSeats}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Car Details</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {trip.carDetails?.model || 'Unknown'} - {trip.carDetails?.color || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trip.carDetails?.numberPlate || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{trip.pricePerHead}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">per person</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (trip.driver?._id && trip.driver?.name) {
                            openUserProfile(trip.driver._id, trip.driver.name);
                          } else {
                            toast({
                              title: "Error",
                              description: "Driver information not available",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={!trip.driver?._id}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowBookingDialog(true);
                        }}
                        disabled={trip.availableSeats === 0}
                      >
                        Book Seat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Trips */}
        <TabsContent value="my-trips" className="space-y-4">
          {myTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No trips created yet</p>
              <p className="text-sm">Create your first trip to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myTrips.map((trip) => (
                <Card key={trip._id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {trip.fromDestination} → {trip.toDestination}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(trip.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={trip.status === 'scheduled' ? 'default' : 'secondary'} className="self-start sm:self-auto bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {trip.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Price</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">₹{trip.pricePerHead}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Seats</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                          {trip.availableSeats}/{trip.totalSeats}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Start Time</div>
                        <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                          {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Reach Time</div>
                        <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                          {new Date(trip.reachTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEditTrip(trip)} className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCancelTrip(trip._id)} className="w-full sm:w-auto border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Bookings */}
        <TabsContent value="my-bookings" className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No bookings yet</p>
              <p className="text-sm">Book a trip to see your reservations here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myBookings.map((booking) => (
                <Card key={booking._id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {booking.trip?.fromDestination} → {booking.trip?.toDestination}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="self-start sm:self-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Driver</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{booking.trip?.driver?.name || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Amount</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">₹{booking.trip?.pricePerHead || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Trip Date</div>
                        <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                          {new Date(booking.trip?.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        View Details
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full sm:w-auto border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900">
                        Cancel Booking
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
        <DialogContent className="bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Book Carpool Trip</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Confirm your booking details for the trip from {selectedTrip?.fromDestination} to {selectedTrip?.toDestination}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pickup-location" className="text-gray-700 dark:text-gray-300">Pickup Location</Label>
              <Input
                id="pickup-location"
                value={bookingForm.pickupLocation}
                onChange={(e) => setBookingForm({...bookingForm, pickupLocation: e.target.value})}
                placeholder="Enter pickup location"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="pickup-time" className="text-gray-700 dark:text-gray-300">Pickup Time</Label>
              <Input
                id="pickup-time"
                type="datetime-local"
                value={bookingForm.pickupTime}
                onChange={(e) => setBookingForm({...bookingForm, pickupTime: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="phone-number" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
              <Input
                id="phone-number"
                value={bookingForm.phoneNumber}
                onChange={(e) => setBookingForm({...bookingForm, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button onClick={handleBooking} className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800">
                Confirm Booking
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Carpool Trip</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Edit details for the trip from {editingTrip?.fromDestination} to {editingTrip?.toDestination}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-from" className="text-gray-700 dark:text-gray-300">From</Label>
              <Input
                id="edit-from"
                value={editForm.fromDestination}
                onChange={(e) => setEditForm({...editForm, fromDestination: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-to" className="text-gray-700 dark:text-gray-300">To</Label>
              <Input
                id="edit-to"
                value={editForm.toDestination}
                onChange={(e) => setEditForm({...editForm, toDestination: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-start-time" className="text-gray-700 dark:text-gray-300">Start Time</Label>
              <Input
                id="edit-start-time"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-reach-time" className="text-gray-700 dark:text-gray-300">Reach Time</Label>
              <Input
                id="edit-reach-time"
                type="datetime-local"
                value={editForm.reachTime}
                onChange={(e) => setEditForm({...editForm, reachTime: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-total-seats" className="text-gray-700 dark:text-gray-300">Total Seats</Label>
              <Input
                id="edit-total-seats"
                type="number"
                value={editForm.totalSeats}
                onChange={(e) => setEditForm({...editForm, totalSeats: parseInt(e.target.value, 10)})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-price-per-head" className="text-gray-700 dark:text-gray-300">Price Per Head</Label>
              <Input
                id="edit-price-per-head"
                type="number"
                value={editForm.pricePerHead}
                onChange={(e) => setEditForm({...editForm, pricePerHead: parseFloat(e.target.value)})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-car-model" className="text-gray-700 dark:text-gray-300">Car Model</Label>
              <Input
                id="edit-car-model"
                value={editForm.carModel}
                onChange={(e) => setEditForm({...editForm, carModel: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-car-color" className="text-gray-700 dark:text-gray-300">Car Color</Label>
              <Input
                id="edit-car-color"
                value={editForm.carColor}
                onChange={(e) => setEditForm({...editForm, carColor: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-car-number-plate" className="text-gray-700 dark:text-gray-300">Car Number Plate</Label>
              <Input
                id="edit-car-number-plate"
                value={editForm.carNumberPlate}
                onChange={(e) => setEditForm({...editForm, carNumberPlate: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-car-year" className="text-gray-700 dark:text-gray-300">Car Year</Label>
              <Input
                id="edit-car-year"
                type="number"
                value={editForm.carYear}
                onChange={(e) => setEditForm({...editForm, carYear: parseInt(e.target.value, 10)})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-pickup-location" className="text-gray-700 dark:text-gray-300">Pickup Location</Label>
              <Input
                id="edit-pickup-location"
                value={editForm.pickupLocation}
                onChange={(e) => setEditForm({...editForm, pickupLocation: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-drop-location" className="text-gray-700 dark:text-gray-300">Drop Location</Label>
              <Input
                id="edit-drop-location"
                value={editForm.dropLocation}
                onChange={(e) => setEditForm({...editForm, dropLocation: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-rules" className="text-gray-700 dark:text-gray-300">Rules</Label>
              <Input
                id="edit-rules"
                value={editForm.rules.join(', ')}
                onChange={(e) => setEditForm({...editForm, rules: e.target.value.split(',').map(r => r.trim())})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-is-flexible" className="text-gray-700 dark:text-gray-300">Is Flexible</Label>
              <Select onValueChange={(value) => setEditForm({...editForm, isFlexible: value === 'true'})} value={editForm.isFlexible ? 'true' : 'false'} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectTrigger className="text-gray-700 dark:text-gray-300">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectItem value="true" className="text-gray-700 dark:text-gray-300">Yes</SelectItem>
                  <SelectItem value="false" className="text-gray-700 dark:text-gray-300">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-max-detour" className="text-gray-700 dark:text-gray-300">Max Detour</Label>
              <Input
                id="edit-max-detour"
                type="number"
                value={editForm.maxDetour}
                onChange={(e) => setEditForm({...editForm, maxDetour: parseInt(e.target.value, 10)})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button onClick={handleUpdateTrip} className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarPoolPage;
