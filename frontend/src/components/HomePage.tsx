
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Bike, Users, MapPin, Clock, TrendingUp, Calendar, Star, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, api } from '@/lib/api';

interface RecentActivity {
  id: string;
  type: 'booking' | 'trip' | 'listing' | 'rental';
  title: string;
  description: string;
  amount?: number;
  status: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}

const HomePage = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch recent activities from MongoDB API
      const [carpoolResponse, bookings] = await Promise.all([
        api.get<{ trips: any[], pagination: any }>(API_ENDPOINTS.CARPOOL.GET_ALL).catch(() => ({ trips: [] })),
        api.get(API_ENDPOINTS.BOOKINGS.GET_ALL).catch(() => [])
      ]);

      const activities: RecentActivity[] = [];

      // Add carpool trips - handle the paginated response format
      const carpoolTrips = carpoolResponse?.trips || [];
      if (Array.isArray(carpoolTrips)) {
        carpoolTrips.slice(0, 3).forEach((trip: any) => {
          activities.push({
            id: trip._id,
            type: 'trip',
            title: `Carpool to ${trip.toDestination}`,
            description: `${trip.fromDestination} → ${trip.toDestination}`,
            amount: trip.pricePerHead,
            status: trip.status || 'scheduled',
            date: trip.startTime || trip.createdAt || new Date().toISOString(),
            icon: <Users className="h-5 w-5" />,
            color: 'bg-blue-600'
          });
        });
      }

      // Add recent bookings
      if (Array.isArray(bookings)) {
        bookings.slice(0, 3).forEach((booking: any) => {
          let title = '';
          let description = '';
          let icon = <Calendar className="h-5 w-5" />;
          let color = 'bg-green-500';

          if (booking.type === 'car-rent') {
            title = `Car Rental`;
            description = `From ${new Date(booking.startTime).toLocaleDateString()}`;
            icon = <Car className="h-5 w-5" />;
            color = 'bg-blue-600';
          } else if (booking.type === 'bike-rent') {
            title = `Bike Rental`;
            description = `From ${new Date(booking.startTime).toLocaleDateString()}`;
            icon = <Bike className="h-5 w-5" />;
            color = 'bg-blue-600';
          } else if (booking.type === 'carpool') {
            title = `Carpool Trip`;
            description = `${booking.pickupLocation} → ${booking.dropLocation}`;
            icon = <Users className="h-5 w-5" />;
            color = 'bg-blue-600';
          }

          activities.push({
            id: booking._id,
            type: 'booking',
            title,
            description,
            amount: booking.amount,
            status: booking.status || 'confirmed',
            date: booking.startTime || booking.createdAt || new Date().toISOString(),
            icon,
            color
          });
        });
      }

      // Sort by date and take the most recent 6
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 6));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to mock data if API fails
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'booking',
          title: 'Carpool to Downtown',
          description: 'Airport → Downtown',
          amount: 25,
          status: 'confirmed',
          date: new Date().toISOString(),
          icon: <Users className="h-5 w-5" />,
          color: 'bg-blue-600'
        },
        {
          id: '2',
          type: 'trip',
          title: 'Trip to Shopping Mall',
          description: 'Home → Shopping Mall',
          amount: 30,
          status: 'active',
          date: new Date().toISOString(),
          icon: <Car className="h-5 w-5" />,
          color: 'bg-blue-600'
        }
      ];
      setRecentActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      title: 'Car Pool',
      description: 'Share rides and split costs with fellow travelers',
      icon: Users,
      color: 'bg-blue-600',
      route: '/carpool'
    },
    {
      title: 'Bike Pool',
      description: 'Share bike rides and split costs with fellow travelers',
      icon: Bike,
      color: 'bg-blue-600',
      route: '/bike-pool'
    },
    {
      title: 'Car Rental',
      description: 'Rent cars by the hour or day for your convenience',
      icon: Car,
      color: 'bg-blue-600',
      route: '/car-rent'
    },
    {
      title: 'Bike Rental',
      description: 'Quick and eco-friendly bike rentals for short trips',
      icon: Bike,
      color: 'bg-blue-600',
      route: '/bike-rent'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Cities Covered', value: '50+', icon: MapPin },
    { label: 'Trips Completed', value: '1M+', icon: TrendingUp },
    { label: 'Hours Saved', value: '5M+', icon: Clock },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'available':
      case 'scheduled':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'cancelled':
      case 'rented':
      case 'completed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Welcome back to TripMate
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Your one-stop solution for carpooling, car rentals, and bike rentals. 
            Travel smart, save money, and connect with your community.
          </p>
        </div>

        {/* Recent Activity */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Button variant="outline" onClick={() => navigate('/profile')} className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading recent activity...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start by booking a ride or listing your vehicle</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center text-white`}>
                        {activity.icon}
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                      {activity.amount && (
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          ₹{activity.amount}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow cursor-pointer group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-blue-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">{service.title}</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button 
                  onClick={() => navigate(service.route)}
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  variant="outline"
                  size="sm"
                >
                  Explore {service.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
