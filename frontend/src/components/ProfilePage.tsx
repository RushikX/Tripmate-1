
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS, api } from '@/lib/api';
import { User, Star, Calendar, Car, Bike, Users, Settings, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  age: number;
  phone: string;
  profilePicture: string;
  userType: 'passenger' | 'driver' | 'owner' | 'admin';
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    language: string;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileForm {
  name: string;
  age: number;
  phone: string;
  userType: string;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    age: 18,
    phone: '',
    userType: 'passenger'
  });
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    totalVehicles: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchStats();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const data = await api.get<UserProfile>(API_ENDPOINTS.AUTH.PROFILE);
      setProfile(data);
      setForm({
        name: data.name,
        age: data.age,
        phone: data.phone || '',
        userType: data.userType
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch user statistics
      const [trips, bookings, vehicles] = await Promise.all([
        api.get(`${API_ENDPOINTS.CARPOOL.DRIVER_TRIPS}`).catch(() => []),
        api.get(`${API_ENDPOINTS.BOOKINGS.GET_ALL}`).catch(() => []),
        api.get(`${API_ENDPOINTS.VEHICLES.CREATE}`).catch(() => [])
      ]);

      setStats({
        totalTrips: Array.isArray(trips) ? trips.length : 0,
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await api.put<UserProfile>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, form);
      setProfile(updatedProfile);
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl bg-white dark:bg-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profilePicture} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{profile.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        

        {/* Statistics */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Your Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTrips}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Trips</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Bookings</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalVehicles}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">My Vehicles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p>No recent activity</p>
              <p className="text-sm">Start using TripMate to see your activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Button */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
