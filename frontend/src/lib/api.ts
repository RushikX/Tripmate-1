// API Configuration for TripMate
// This file contains the base URL and common API functions

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployment-domain.com/api' 
  : 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/auth/account`,
  },
  
  // Users
  USERS: {
    GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    GET_RATINGS: (id: string) => `${API_BASE_URL}/users/${id}/ratings`,
    CREATE_RATING: (id: string) => `${API_BASE_URL}/users/${id}/ratings`,
  },
  
  // Carpool
  CARPOOL: {
    CREATE: `${API_BASE_URL}/carpool`,
    GET_ALL: `${API_BASE_URL}/carpool`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/carpool/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/carpool/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/carpool/${id}`,
    DRIVER_TRIPS: `${API_BASE_URL}/carpool/driver/my-trips`,
  },
  
  // Vehicle Rentals
  VEHICLES: {
    CAR_RENT: `${API_BASE_URL}/car-rent`,
    BIKE_RENT: `${API_BASE_URL}/bike-rent`,
    CAR_MY_LISTINGS: `${API_BASE_URL}/car-rent/my-listings`,
    BIKE_MY_LISTINGS: `${API_BASE_URL}/bike-rent/my-listings`,
    CREATE: `${API_BASE_URL}/vehicles`,
    UPDATE: (id: string) => `${API_BASE_URL}/vehicles/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/vehicles/${id}`,
  },
  
  // Bookings
  BOOKINGS: {
    GET_ALL: `${API_BASE_URL}/bookings`,
    CREATE: `${API_BASE_URL}/bookings`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  },
  
  // Health Check
  HEALTH: `${API_BASE_URL}/health`,
};

// Common API request function
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('tripmate_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, config);
};

// API response handler
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Generic API functions
export const api = {
  get: <T>(url: string): Promise<T> => 
    apiRequest(url).then(handleApiResponse<T>),
    
  post: <T>(url: string, data: any): Promise<T> => 
    apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(handleApiResponse<T>),
    
  put: <T>(url: string, data: any): Promise<T> => 
    apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(handleApiResponse<T>),
    
  delete: <T>(url: string): Promise<T> => 
    apiRequest(url, {
      method: 'DELETE',
    }).then(handleApiResponse<T>),
};

export default api;
