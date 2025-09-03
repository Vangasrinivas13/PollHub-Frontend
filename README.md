# Online Voting System - Frontend

A modern React.js frontend for the Online Voting System with real-time updates, comprehensive analytics, and responsive design.

## 🚀 Features

- **Modern User Interface**
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Mobile-first approach
  - Smooth animations with Framer Motion

- **User Authentication**
  - JWT-based authentication
  - Google OAuth integration
  - Protected routes
  - Role-based access control

- **Poll Management**
  - Create and manage polls
  - Real-time voting interface
  - Multiple poll types support
  - Live results visualization

- **Analytics Dashboard**
  - Interactive charts with Chart.js
  - Real-time data visualization
  - Comprehensive voting statistics
  - User engagement metrics
  - Export capabilities

- **Real-time Features**
  - Live vote updates
  - Real-time notifications
  - Socket.IO integration
  - Live user activity

## 🛠️ Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **State Management**: React Hooks + Context API
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Real-time**: Socket.IO Client
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend server running on port 5000

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-voting/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend root directory:
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   
   # Google OAuth (Optional)
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   
   # App Configuration
   REACT_APP_NAME=PollHub
   REACT_APP_VERSION=1.0.0
   
   # Development
   GENERATE_SOURCEMAP=false
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   ├── favicon.ico         # App favicon
│   └── favicon.svg         # SVG favicon
├── src/
│   ├── components/         # Reusable components
│   │   ├── Admin/          # Admin-specific components
│   │   │   ├── Analytics.js    # Analytics dashboard
│   │   │   ├── Dashboard.js    # Admin dashboard
│   │   │   └── UserManagement.js # User management
│   │   ├── Auth/           # Authentication components
│   │   │   ├── Login.js        # Login form
│   │   │   ├── Register.js     # Registration form
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── Layout/         # Layout components
│   │   │   ├── Header.js       # Navigation header
│   │   │   ├── Footer.js       # Page footer
│   │   │   └── Sidebar.js      # Admin sidebar
│   │   ├── Polls/          # Poll-related components
│   │   │   ├── PollCard.js     # Poll display card
│   │   │   ├── PollForm.js     # Poll creation form
│   │   │   ├── PollList.js     # Poll listing
│   │   │   └── VotingInterface.js # Voting UI
│   │   └── UI/             # UI components
│   │       ├── Button.js       # Custom button
│   │       ├── Modal.js        # Modal component
│   │       └── LoadingSpinner.js # Loading indicator
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.js      # Authentication context
│   │   └── ThemeContext.js     # Theme context
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useSocket.js        # Socket.IO hook
│   │   └── useLocalStorage.js  # Local storage hook
│   ├── pages/              # Page components
│   │   ├── Home.js             # Landing page
│   │   ├── Dashboard.js        # User dashboard
│   │   ├── PollDetails.js      # Poll detail view
│   │   └── Profile.js          # User profile
│   ├── utils/              # Utility functions
│   │   ├── api.js              # API configuration
│   │   ├── auth.js             # Auth utilities
│   │   └── helpers.js          # Helper functions
│   ├── App.js              # Main App component
│   ├── App.css             # Global styles
│   └── index.js            # React entry point
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

## 🎨 Component Architecture

### Core Components

#### Authentication Components
- **Login.js**: User login form with validation
- **Register.js**: User registration with form validation
- **ProtectedRoute.js**: Route protection based on authentication

#### Poll Components
- **PollCard.js**: Displays poll information and voting options
- **PollForm.js**: Create/edit poll form with validation
- **VotingInterface.js**: Real-time voting interface

#### Admin Components
- **Analytics.js**: Comprehensive analytics dashboard
- **Dashboard.js**: Admin overview with key metrics
- **UserManagement.js**: User administration interface

### Custom Hooks

#### useAuth Hook
```javascript
const { user, login, logout, isLoading, isAuthenticated } = useAuth();
```

#### useSocket Hook
```javascript
const { socket, connected, emit, on, off } = useSocket();
```

## 🔗 API Integration

### Axios Configuration
```javascript
// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints Used
- **Authentication**: `/api/auth/*`
- **Polls**: `/api/polls/*`
- **Votes**: `/api/votes/*`
- **Analytics**: `/api/analytics/*`
- **Admin**: `/api/admin/*`

## 📊 Analytics Dashboard Features

### Chart Types
- **Line Charts**: Voting trends over time
- **Bar Charts**: Poll performance comparison
- **Pie Charts**: Vote distribution
- **Doughnut Charts**: Category breakdown

### Key Metrics
- Total polls, votes, and users
- Active polls and completion rates
- User engagement statistics
- Top voters and poll performance
- Real-time activity monitoring

### Interactive Features
- Hover effects and tooltips
- Responsive chart sizing
- Data export capabilities
- Time range filtering
- Real-time data updates

## 🎯 Routing Structure

```javascript
// App.js routing
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes */}
  <Route path="/dashboard" element={
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  } />
  <Route path="/polls/:id" element={
    <ProtectedRoute><PollDetails /></ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute><Profile /></ProtectedRoute>
  } />
  
  {/* Admin Routes */}
  <Route path="/admin/*" element={
    <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
  } />
</Routes>
```

## 🔒 Authentication Flow

### Login Process
1. User submits credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. User redirected to dashboard
6. Token included in subsequent API requests

### Protected Routes
```javascript
// ProtectedRoute component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

## 🎨 Styling & Theming

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#6b7280',
          600: '#4b5563',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
```

### Component Styling Patterns
- **Card Components**: Consistent shadow and border radius
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Consistent input styling with validation states
- **Charts**: Responsive containers with proper spacing

## 🔄 Real-time Features

### Socket.IO Integration
```javascript
// useSocket hook
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    
    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  return { socket, connected };
};
```

### Real-time Events
- **vote_cast**: Live vote updates
- **poll_created**: New poll notifications
- **poll_ended**: Poll completion alerts
- **user_joined**: User activity tracking

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- PollCard.test.js
```

### Test Structure
```javascript
// Example test file
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PollCard from '../components/Polls/PollCard';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('renders poll card with title', () => {
  const mockPoll = {
    _id: '1',
    title: 'Test Poll',
    description: 'Test Description',
    options: [{ text: 'Option 1', votes: 0 }]
  };
  
  renderWithRouter(<PollCard poll={mockPoll} />);
  expect(screen.getByText('Test Poll')).toBeInTheDocument();
});
```

## 🚀 Build & Deployment

### Production Build
```bash
# Create production build
npm run build

# Serve build locally for testing
npx serve -s build
```

### Environment-specific Builds
```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Deployment Options

#### Static Hosting (Netlify/Vercel)
1. Connect repository to hosting platform
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile-First Approach
```javascript
// Responsive component example
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4
">
  {/* Content */}
</div>
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` | Yes |
| `REACT_APP_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` | Yes |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth client ID | - | No |
| `REACT_APP_NAME` | Application name | `PollHub` | No |

### Build Configuration
```javascript
// package.json scripts
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

## 🔍 Performance Optimization

### Code Splitting
```javascript
// Lazy loading components
import { lazy, Suspense } from 'react';

const Analytics = lazy(() => import('./components/Admin/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Analytics />
    </Suspense>
  );
}
```

### Optimization Techniques
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive calculations
- **Image optimization**: WebP format with fallbacks
- **Bundle analysis**: Use webpack-bundle-analyzer

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards and conventions
4. Write tests for new features
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

### Code Standards
- **ESLint**: Follow React/JSX best practices
- **Prettier**: Consistent code formatting
- **Component naming**: PascalCase for components
- **File naming**: Match component names
- **Props validation**: Use PropTypes or TypeScript

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the component documentation
- Review the API integration guide

## 🔄 Changelog

### v1.0.0
- Initial release with React 18
- Comprehensive analytics dashboard
- Real-time voting interface
- Mobile-responsive design
- JWT authentication system
- Admin panel with user management
- Chart.js integration for data visualization
