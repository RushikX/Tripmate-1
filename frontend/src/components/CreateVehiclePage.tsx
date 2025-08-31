
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS, api } from '@/lib/api';
import { Car, Bike, MapPin, DollarSign, Settings, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface VehicleForm {
  type: 'car' | 'bike';
  brand: string;
  model: string;
  year: number;
  color: string;
  numberPlate: string;
  fuelType: string;
  transmission: string;
  engineCapacity: number;
  mileage: number;
  seats: number;
  pricePerHour: number;
  pricePerDay: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
  description: string;
  features: string[];
  rules: string[];
}

const CreateVehiclePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Get vehicle type from URL query parameters
  const getVehicleTypeFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    return type === 'bike' ? 'bike' : 'car';
  };

  const [form, setForm] = useState<VehicleForm>({
    type: getVehicleTypeFromURL(),
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    numberPlate: '',
    fuelType: 'petrol',
    transmission: 'manual',
    engineCapacity: 0,
    mileage: 0,
    seats: getVehicleTypeFromURL() === 'bike' ? 2 : 5,
    pricePerHour: 0,
    pricePerDay: 0,
    location: {
      address: '',
      city: '',
      state: ''
    },
    description: '',
    features: [],
    rules: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkProfile();
  }, [user, navigate]);

  // Update form when vehicle type changes
  useEffect(() => {
    const vehicleType = getVehicleTypeFromURL();
    setForm(prev => ({
      ...prev,
      type: vehicleType,
      seats: vehicleType === 'bike' ? 2 : 5
    }));
  }, [location.search]);

  const checkProfile = async () => {
    if (!user) return;

    try {
      const profile = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = await api.post(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
          name: user.name || 'User',
          age: 25,
          userType: 'owner'
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

    setLoading(true);

    try {
      const vehicleData = {
        type: form.type,
        brand: form.brand,
        model: form.model,
        year: form.year,
        color: form.color,
        numberPlate: form.numberPlate,
        fuelType: form.fuelType,
        transmission: form.transmission,
        engineCapacity: form.engineCapacity,
        mileage: form.mileage,
        seats: form.seats,
        pricePerHour: form.pricePerHour,
        pricePerDay: form.pricePerDay,
        location: form.location,
        description: form.description,
        features: form.features,
        rules: form.rules,
        isAvailable: true
      };

      await api.post(API_ENDPOINTS.VEHICLES.CREATE, vehicleData);
      
      toast({
        title: "Success!",
        description: "Vehicle listing created successfully!",
      });
      
      navigate(form.type === 'bike' ? '/bike-rent' : '/car-rent');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to create vehicle listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    const feature = prompt('Enter a feature:');
    if (feature && feature.trim()) {
      setForm({ ...form, features: [...form.features, feature.trim()] });
    }
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const addRule = () => {
    const rule = prompt('Enter a rule for renters:');
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
        <h1 className="text-3xl font-bold">
          List Your {form.type === 'bike' ? 'Bike' : 'Car'}
        </h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New {form.type === 'bike' ? 'Bike' : 'Car'} Listing</CardTitle>
          <CardDescription>
            Share your {form.type === 'bike' ? 'bike' : 'car'} and earn money by renting it out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    form.type === 'car' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setForm({ ...form, type: 'car' })}
                >
                  <div className="flex items-center space-x-3">
                    <Car className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">Car</div>
                      <div className="text-sm text-gray-600">Sedan, SUV, Hatchback</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    form.type === 'bike' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => setForm({ ...form, type: 'bike' })}
                >
                  <div className="flex items-center space-x-3">
                    <Bike className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">Bike</div>
                      <div className="text-sm text-gray-600">Motorcycle, Scooter</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Honda, Maruti, Toyota"
                    value={form.brand}
                    onChange={(e) => setForm({...form, brand: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., City, Swift, Innova"
                    value={form.model}
                    onChange={(e) => setForm({...form, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={(e) => setForm({...form, year: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., White, Black, Red"
                    value={form.color}
                    onChange={(e) => setForm({...form, color: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="number-plate">Number Plate</Label>
                  <Input
                    id="number-plate"
                    placeholder="e.g., MH12AB1234"
                    value={form.numberPlate}
                    onChange={(e) => setForm({...form, numberPlate: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuel-type">Fuel Type</Label>
                  <Select value={form.fuelType} onValueChange={(value) => setForm({...form, fuelType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="battery">Battery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type === 'car' && (
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select value={form.transmission} onValueChange={(value) => setForm({...form, transmission: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {form.type === 'car' && (
                  <div>
                    <Label htmlFor="engine-capacity">Engine Capacity (cc)</Label>
                    <Input
                      id="engine-capacity"
                      type="number"
                      min="0"
                      placeholder="1200"
                      value={form.engineCapacity}
                      onChange={(e) => setForm({...form, engineCapacity: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={form.mileage}
                    onChange={(e) => setForm({...form, mileage: parseInt(e.target.value)})}
                    required
                  />
                </div>
                {form.type === 'car' && (
                  <div>
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="5"
                      value={form.seats}
                      onChange={(e) => setForm({...form, seats: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price-per-hour">Price per Hour (₹)</Label>
                  <Input
                    id="price-per-hour"
                    type="number"
                    min="0"
                    placeholder="100"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({...form, pricePerHour: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price-per-day">Price per Day (₹)</Label>
                  <Input
                    id="price-per-day"
                    type="number"
                    min="0"
                    placeholder="800"
                    value={form.pricePerDay}
                    onChange={(e) => setForm({...form, pricePerDay: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    value={form.location.city}
                    onChange={(e) => setForm({...form, location: {...form.location, city: e.target.value}})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g., Maharashtra, Delhi, Karnataka"
                    value={form.location.state}
                    onChange={(e) => setForm({...form, location: {...form.location, state: e.target.value}})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="Complete address for pickup/drop"
                  value={form.location.address}
                  onChange={(e) => setForm({...form, location: {...form.location, address: e.target.value}})}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <div>
                <Label htmlFor="description">Vehicle Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your vehicle, its condition, any special features, etc."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="space-y-2">
                {form.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...form.features];
                        newFeatures[index] = e.target.value;
                        setForm({...form, features: newFeatures});
                      }}
                      placeholder="Enter feature"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rules for Renters</h3>
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
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVehiclePage;
