# TripMate Platform Setup Guide

This guide will help you set up the TripMate platform after the migration from OnTheGo to MERN stack.

## 🚀 Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb+srv://rushik:rushik@atlascluster.xxzji77.mongodb.net/
# JWT_SECRET=your_secure_jwt_secret
# PORT=5000

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://rushik:rushik@atlascluster.xxzji77.mongodb.net/
JWT_SECRET=tripmate_jwt_secret_key_2024
PORT=5000
NODE_ENV=development
```

### Frontend API Configuration

The frontend is configured to use:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-deployment-domain.com/api`

Update `frontend/src/lib/api.ts` for production deployment.

## 📱 Testing the Platform

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Access
Open `http://localhost:5173` in your browser

### 3. Test User Registration
- Navigate to `/auth` page
- Create a new account
- Verify JWT token is stored in localStorage

## 🗄️ Database Setup

The MongoDB connection will automatically create the necessary collections:
- `users` - User accounts and profiles
- `carpools` - Carpool trip listings
- `vehicles` - Car and bike rental listings
- `bookings` - User bookings and reservations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting and CORS protection
- Helmet security headers

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Update CORS origins for production domains
3. Deploy to Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Update API endpoints in `src/lib/api.ts`
2. Build with `npm run build`
3. Deploy `dist/` folder to Vercel, Netlify, or AWS S3

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify connection string in `.env`
   - Check network access to MongoDB Atlas

2. **CORS Issues**
   - Verify frontend URL is in CORS configuration
   - Check backend CORS settings

3. **JWT Token Issues**
   - Clear localStorage and re-authenticate
   - Verify JWT_SECRET is set correctly

### Logs

- Backend logs are displayed in the terminal
- Check browser console for frontend errors
- MongoDB Atlas provides database monitoring

## 📚 Next Steps

1. **Add More Features**
   - Payment integration
   - Real-time notifications
   - Advanced search filters

2. **Enhance Security**
   - Email verification
   - Two-factor authentication
   - API rate limiting per user

3. **Performance Optimization**
   - Database indexing
   - Caching strategies
   - CDN integration

## 🆘 Support

For issues or questions:
1. Check the logs and error messages
2. Review the API documentation
3. Check MongoDB Atlas dashboard
4. Create an issue in the repository

---

**TripMate** is now ready to use! 🎉
