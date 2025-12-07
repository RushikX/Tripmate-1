
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Car, Bike, Users, User, Home, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const navigation = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Car Pool', url: '/carpool', icon: Users },
  { title: 'Car Rent', url: '/car-rent', icon: Car },
  // { title: 'Bike Rent', url: '/bike-rent', icon: Bike },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      {/* Main Content */}
      <div className="flex-1 pb-20">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex items-center px-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">TripMate</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.email} />
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{user?.email}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      User
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-white dark:bg-black pb-4">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.title}</span>

              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
