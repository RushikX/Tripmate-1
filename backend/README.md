# TripMate Backend API

A MERN stack backend for the TripMate platform - a comprehensive carpooling and vehicle rental platform.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Carpool Management**: Create, search, and manage carpool trips
- **Vehicle Rentals**: Car and bike rental system
- **Booking System**: Comprehensive booking management
- **User Profiles**: User management and ratings
- **MongoDB Integration**: Scalable NoSQL database with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     NODE_ENV=development
     ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `DELETE /api/auth/account` - Deactivate account

### Carpool
- `POST /api/carpool` - Create carpool trip
- `GET /api/carpool` - Search carpool trips
- `GET /api/carpool/:id` - Get trip details
- `PUT /api/carpool/:id` - Update trip
- `DELETE /api/carpool/:id` - Cancel trip
- `GET /api/carpool/driver/my-trips` - Driver's trips

### Vehicle Rentals
- `GET /api/car-rent` - Available cars
- `GET /api/bike-rent` - Available bikes

### Bookings
- `GET /api/bookings` - User's bookings

### Users
- `GET /api/users/:id` - Get user profile

## Database Models

### User
- Authentication details (email, password)
- Profile information (name, age, phone, profile picture)
- User type (passenger, driver, owner, admin)
- Rating system
- Preferences and settings

### CarPool
- Trip details (from/to destinations, times)
- Vehicle information (model, color, number plate)
- Pricing and seat management
- Driver information
- Trip status and rules

### Vehicle
- Vehicle details (brand, model, year, color)
- Rental pricing (hourly/daily rates)
- Location and availability
- Owner information
- Features and amenities

### Booking
- Booking details (type, dates, locations)
- Payment information
- Status tracking
- User and service references

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express

## Development

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Routes

1. Create a new route file in `routes/` directory
2. Import and use in `server.js`
3. Follow the existing pattern for validation and error handling

### Database Changes

1. Update the relevant model in `models/` directory
2. Add any necessary indexes for performance
3. Update related routes if needed

## Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Update `MONGODB_URI` for production database
- Use strong `JWT_SECRET`
- Configure CORS origins for production domains

### Performance Considerations
- Database indexes are configured for common queries
- Rate limiting prevents API abuse
- Static file serving for uploads
- Error handling with appropriate HTTP status codes

## Support

For questions or issues, please refer to the main project documentation or create an issue in the repository.
