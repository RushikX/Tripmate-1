# TripMate Frontend

A modern, responsive web application for the TripMate platform - a comprehensive carpooling and vehicle rental platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with bottom navigation
- **Dark Mode**: Built-in theme switching with next-themes
- **Real-time Updates**: React Query for efficient data fetching
- **Type Safety**: Full TypeScript implementation
- **Authentication**: JWT-based authentication system
- **Mobile Friendly**: Optimized for mobile devices

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Authentication**: JWT tokens with localStorage
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API config
│   ├── pages/         # Page components
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## API Integration

The frontend communicates with the TripMate backend API. The API configuration is centralized in `src/lib/api.ts` and can be easily updated for different environments:

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-deployment-domain.com/api`

## Key Components

### Authentication
- `useAuth` hook for JWT-based authentication
- Protected routes with `ProtectedRoute` component
- Automatic token validation and refresh

### Layout
- `AppLayout` component with sidebar navigation
- Mobile-friendly bottom navigation
- Responsive design for all screen sizes

### Pages
- **Landing Page**: Welcome screen with feature overview
- **Home Page**: Dashboard with recent activities
- **Carpool**: Search and book carpool trips
- **Car Rental**: Browse and rent cars
- **Bike Rental**: Browse and rent bikes
- **Profile**: User profile management

## Styling

The application uses Tailwind CSS with a custom design system:

- **Color Palette**: Blue, purple, and pink gradients
- **Typography**: Modern, readable fonts
- **Components**: Consistent shadcn/ui components
- **Animations**: Smooth transitions and hover effects
- **Dark Mode**: Automatic theme switching

## Development

### Adding New Components

1. Create component in `src/components/`
2. Use shadcn/ui components for consistency
3. Follow the existing naming conventions
4. Add TypeScript interfaces for props

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed
4. Implement proper loading states

### API Integration

1. Add new endpoints in `src/lib/api.ts`
2. Use the `api` utility functions
3. Implement proper error handling
4. Add loading states with React Query

## Build and Deployment

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TripMate
```

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test on multiple devices and screen sizes
5. Update documentation for new features

## License

This project is part of the TripMate platform and follows the same licensing terms.
