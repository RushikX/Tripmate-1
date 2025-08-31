
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS, api } from '@/lib/api';
import { Car, MapPin, Clock, Users, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CarpoolForm {
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

const CreateCarpoolPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Helper functions to get default times (must be defined before useState)
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const getDefaultReachTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // 2 hours from now
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const [form, setForm] = useState<CarpoolForm>({
    fromDestination: '',
    toDestination: '',
    startTime: getDefaultStartTime(),
    reachTime: getDefaultReachTime(),
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkProfile();
  }, [user, navigate]);

  // Update reach time minimum when start time changes
  useEffect(() => {
    if (form.startTime) {
      const startTime = new Date(form.startTime);
      const reachTime = new Date(form.reachTime);
      
      // If reach time is before or equal to start time, update it
      if (reachTime <= startTime) {
        const newReachTime = new Date(startTime);
        newReachTime.setHours(startTime.getHours() + 1); // 1 hour after start time
        setForm(prev => ({
          ...prev,
          reachTime: newReachTime.toISOString().slice(0, 16)
        }));
      }
    }
  }, [form.startTime]);

  const checkProfile = async () => {
    if (!user) return;

    try {
      const profile = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = await api.post(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
          name: user.name || 'User',
          age: 25,
          userType: 'driver'
        });
        console.log('Profile created:', newProfile);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast({
        title: "Error",
        description: "Failed to check profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate times
    const startTime = new Date(form.startTime);
    const reachTime = new Date(form.reachTime);
    const now = new Date();

    if (startTime <= now) {
      toast({
        title: "Error",
        description: "Start time must be in the future",
        variant: "destructive"
      });
      return;
    }

    if (reachTime <= startTime) {
      toast({
        title: "Error",
        description: "Reach time must be after start time",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const carpoolData = {
        fromDestination: form.fromDestination,
        toDestination: form.toDestination,
        startTime: startTime,
        reachTime: reachTime,
        totalSeats: form.totalSeats,
        availableSeats: form.totalSeats,
        pricePerHead: form.pricePerHead,
        carDetails: {
          model: form.carModel,
          color: form.carColor,
          numberPlate: form.carNumberPlate,
          year: form.carYear
        },
        pickupLocation: form.pickupLocation || form.fromDestination,
        dropLocation: form.dropLocation || form.toDestination,
        description: form.description,
        rules: form.rules,
        isFlexible: form.isFlexible,
        maxDetour: form.maxDetour
      };

      await api.post(API_ENDPOINTS.CARPOOL.CREATE, carpoolData);
      
      toast({
        title: "Success!",
        description: "Carpool trip created successfully!",
      });
      
      navigate('/carpool');
    } catch (error) {
      console.error('Error creating carpool:', error);
      toast({
        title: "Error",
        description: "Failed to create carpool trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    const rule = prompt('Enter a rule for passengers:');
    if (rule && rule.trim()) {
      setForm({ ...form, rules: [...form.rules, rule.trim()] });
    }
  };

  const removeRule = (index: number) => {
    setForm({ ...form, rules: form.rules.filter((_, i) => i !== index) });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Carpool Trip</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Carpool Trip</CardTitle>
          <CardDescription>
            Share your ride and help others reach their destination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Route Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">From Destination</Label>
                  <Input
                    id="from"
                    placeholder="Starting location"
                    value={form.fromDestination}
                    onChange={(e) => setForm({...form, fromDestination: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to">To Destination</Label>
                  <Input
                    id="to"
                    placeholder="Final destination"
                    value={form.toDestination}
                    onChange={(e) => setForm({...form, toDestination: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={form.startTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setForm({...form, startTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reach-time">Expected Reach Time</Label>
                  <Input
                    id="reach-time"
                    type="datetime-local"
                    value={form.reachTime}
                    min={form.startTime || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setForm({...form, reachTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Vehicle Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="car-model">Car Model</Label>
                  <Input
                    id="car-model"
                    placeholder="e.g., Honda City, Maruti Swift"
                    value={form.carModel}
                    onChange={(e) => setForm({...form, carModel: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="car-color">Car Color</Label>
                  <Input
                    id="car-color"
                    placeholder="e.g., White, Black, Red"
                    value={form.carColor}
                    onChange={(e) => setForm({...form, carColor: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="car-number">Number Plate</Label>
                  <Input
                    id="car-number"
                    placeholder="e.g., MH12AB1234"
                    value={form.carNumberPlate}
                    onChange={(e) => setForm({...form, carNumberPlate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="car-year">Car Year</Label>
                  <Input
                    id="car-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={form.carYear}
                    onChange={(e) => setForm({...form, carYear: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Trip Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total-seats">Total Seats Available</Label>
                  <Input
                    id="total-seats"
                    type="number"
                    min="1"
                    max="8"
                    value={form.totalSeats}
                    onChange={(e) => setForm({...form, totalSeats: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price-per-head">Price per Person (₹)</Label>
                  <Input
                    id="price-per-head"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.pricePerHead}
                    onChange={(e) => setForm({...form, pricePerHead: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup-location">Pickup Location</Label>
                  <Input
                    id="pickup-location"
                    placeholder="Specific pickup point (optional)"
                    value={form.pickupLocation}
                    onChange={(e) => setForm({...form, pickupLocation: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="drop-location">Drop Location</Label>
                  <Input
                    id="drop-location"
                    placeholder="Specific drop point (optional)"
                    value={form.dropLocation}
                    onChange={(e) => setForm({...form, dropLocation: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Trip Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell passengers about your trip, any special requirements, etc."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* Rules and Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rules & Preferences</h3>
              
              <div className="space-y-2">
                <Label>Passenger Rules</Label>
                <div className="space-y-2">
                  {form.rules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...form.rules];
                          newRules[index] = e.target.value;
                          setForm({...form, rules: newRules});
                        }}
                        placeholder="Enter rule"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRule(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRule}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-flexible"
                    checked={form.isFlexible}
                    onChange={(e) => setForm({...form, isFlexible: e.target.checked})}
                  />
                  <Label htmlFor="is-flexible">Flexible with pickup/drop locations</Label>
                </div>
                <div>
                  <Label htmlFor="max-detour">Maximum Detour (km)</Label>
                  <Input
                    id="max-detour"
                    type="number"
                    min="0"
                    value={form.maxDetour}
                    onChange={(e) => setForm({...form, maxDetour: parseInt(e.target.value)})}
                    disabled={!form.isFlexible}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCarpoolPage;
