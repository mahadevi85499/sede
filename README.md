# Hotel Management System

A comprehensive hotel management system with mobile-friendly customer interface, staff management panel, and admin dashboard. Built with React, TypeScript, and Firebase.

## Features

### Customer Panel (Mobile-Optimized)
- 📱 Mobile-first design with floating cart and help buttons
- 🍽️ Interactive menu with real-time quantity controls
- 🛒 Smart shopping cart with packaging options
- 💳 Professional payment experience (cash/UPI)
- 🔔 Quick service requests (staff call, water, cleaning)

### Staff Panel (Tablet-Optimized) 
- 📋 Real-time order management with automatic updates
- ⚡ Priority service alerts with countdown timers
- ✅ One-click order and service completion
- 📊 Visual order cards with detailed information

### Admin Panel (Desktop-Optimized)
- 📈 Comprehensive dashboard with system metrics
- 📄 Advanced billing and payment processing
- 👥 Service request monitoring and assignment
- 📊 Order tracking and status management

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Database**: Firebase Firestore (Real-time)
- **State Management**: TanStack React Query
- **Routing**: Wouter (lightweight)
- **Icons**: Lucide React

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Update `client/src/lib/firebase.ts` with your config
4. Set up Firestore security rules from `firestore.rules`

### 3. Development
```bash
npm run dev
```
Runs on http://localhost:5000

### 4. Production Build
```bash
npm run build
```
Outputs to `dist/public/`

## Firebase Deployment

### Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created and configured

### Deploy Commands
```bash
# Login to Firebase
firebase login

# Initialize project (first time only)
firebase init

# Deploy to Firebase Hosting
firebase deploy
```

Or use the deployment script:
```bash
./deploy.sh
```

## Project Structure

```
├── client/src/
│   ├── components/
│   │   ├── customer/     # Mobile-optimized customer components
│   │   ├── staff/        # Staff management components  
│   │   ├── admin/        # Admin dashboard components
│   │   └── ui/           # Reusable UI components
│   ├── pages/            # Application pages/routes
│   ├── lib/              # Utilities and Firebase config
│   └── hooks/            # Custom React hooks
├── server/               # Express.js backend (optional)
├── shared/               # Shared schemas and types
└── Firebase configuration files
```

## Environment Variables

For development with environment variables (optional):
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id  
VITE_FIREBASE_APP_ID=your_app_id
```

## Application URLs

After deployment:
- **Customer Panel**: `/customer` (Mobile-friendly)
- **Staff Panel**: `/staff` (Tablet-friendly)
- **Admin Panel**: `/admin` (Desktop-friendly)

## Key Features Implemented

✅ Mobile-first customer interface with floating controls  
✅ Real-time Firebase integration for live updates  
✅ Professional payment experience with waiter-based payment  
✅ Comprehensive menu system with quantity controls  
✅ Service request system for hotel operations  
✅ Multi-panel architecture for different user types  
✅ Production-ready Firebase deployment configuration  

## Support

For deployment issues or technical questions, refer to:
- `Firebase-Deployment-Guide.md` - Detailed deployment instructions
- `replit.md` - Technical architecture documentation

## License

MIT License - Feel free to use and modify for your hotel business.