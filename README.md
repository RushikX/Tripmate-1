# TripMate - MERN Stack Platform

TripMate is a comprehensive platform for carpooling, car rental, and bike pooling built on the MERN stack (MongoDB, Express.js, React, Node.js).

## Deployment

[Live Demo - Deployment Link](https://tripmate-1-e2ea.vercel.app)


## Features

- **Carpooling:** Create and join carpool trips
- **Vehicle Rentals:** Rent cars and bikes from other users
- **Bike Pooling:** Share bike rides for short distances
- **User Profiles:** Comprehensive user management with ratings
- **Real-time Updates:** Live trip and booking status updates
- **Responsive Design:** Modern UI that works on all devices

## Tech Stack

### Frontend

- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Rate Limiting** for API protection

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB installed and running locally or accessible via connection string

---

## Backend Setup

1. **Navigate to the backend directory:**
    ```
    cd backend
    ```

2. **Install dependencies:**
    ```
    npm install
    ```

3. **Set up environment variables:**  
   Create a `.env` file inside the backend directory and add the following:
    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/tripmate
    JWT_SECRET=your_jwt_secret_here
    NODE_ENV=development
    ```

4. **Run the backend server:**
    ```
    npm run dev
    ```

---

## Frontend Setup

1. **Navigate to the frontend directory:**
    ```
    cd frontend
    ```

2. **Install dependencies:**
    ```
    npm install
    ```

3. **Run the frontend development server:**
    ```
    npm run dev
    ```

---





