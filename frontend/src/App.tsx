
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import LandingPage from "@/components/LandingPage";
import AuthPage from "@/components/AuthPage";
import HomePage from "@/components/HomePage";
import CarPoolPage from "@/components/CarPoolPage";
import CarRentPage from "@/components/CarRentPage";
import BikeRentPage from "@/components/BikeRentPage";
import ProfilePage from "@/components/ProfilePage";
import CreateCarpoolPage from "@/components/CreateCarpoolPage";
import CreateVehiclePage from "@/components/CreateVehiclePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <AuthPage />} />
      
      {/* Protected routes with sidebar layout */}
      <Route path="/home" element={
        <ProtectedRoute>
          <AppLayout>
            <HomePage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/carpool" element={
        <ProtectedRoute>
          <AppLayout>
            <CarPoolPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/create-carpool" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateCarpoolPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/car-rent" element={
        <ProtectedRoute>
          <AppLayout>
            <CarRentPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/create-vehicle" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateVehiclePage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/bike-rent" element={
        <ProtectedRoute>
          <AppLayout>
            <BikeRentPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
