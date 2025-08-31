
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, Bike, Star, Shield, Clock, MapPin, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Car className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />,
      title: "Car Pooling",
      description: "Share rides, split costs, and make new connections on your daily commute."
    },
    {
      icon: <Car className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />,
      title: "Car Rental",
      description: "Rent cars by the hour or day from trusted local owners."
    },
    {
      icon: <Bike className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />,
      title: "Bike Rental",
      description: "Eco-friendly bike rentals for short trips around the city."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />,
      title: "Safe & Secure",
      description: "Verified users and secure payment system"
    },
    {
      icon: <Clock className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />,
      title: "24/7 Available",
      description: "Book rides and rentals anytime, anywhere"
    },
    {
      icon: <Star className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />,
      title: "Rated Community",
      description: "User ratings and reviews for trust"
    },
    {
      icon: <Zap className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />,
      title: "Instant Booking",
      description: "Quick and easy booking process"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:py-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                TripMate
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                Your Ultimate Travel Companion - Carpool, Rent, Ride, Repeat
              </p>
            </div>
            
            <div className="space-y-6">
              
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors w-full sm:w-auto"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Today
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Website Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-8 text-center space-y-4">
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Commute?</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100 px-4">
            Join our community and start saving money while making new connections
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold w-full sm:w-auto"
            onClick={() => navigate('/auth')}
          >
            Signup Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-sm md:text-base">&copy; 2024 TripMate. All rights reserved.</p>
          </div>
          
      </footer>
    </div>
  );
};

export default LandingPage;
