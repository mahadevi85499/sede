# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Build and Development
```bash
# Development server with hot reload
npm run dev

# Type checking (verify TypeScript types)
npm run check

# Production build
npm run build

# Start production server
npm start
```

### Database Operations
```bash
# Push Drizzle schema changes to PostgreSQL database
npm run db:push
```

### Firebase Deployment
```bash
# Quick deployment using provided script
./deploy.sh

# Manual Firebase deployment
firebase login
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### Testing Individual Components
```bash
# Test specific user panels by accessing URLs directly:
# Customer panel (mobile-optimized): http://localhost:5000/customer
# Staff panel (tablet-optimized): http://localhost:5000/staff  
# Admin panel (desktop-optimized): http://localhost:5000/admin
```

## Architecture Overview

### Multi-Tier Application Structure
This is a **full-stack hotel management system** with three distinct user interfaces:
- **Customer Panel**: Mobile-first interface for table-side ordering, service requests, reservations, and loyalty rewards
- **Staff Panel**: Real-time kitchen display system and service request management for tablets
- **Admin Panel**: Business management dashboard with analytics, inventory control, and billing

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite with Wouter routing
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Database**: Dual-persistence architecture:
  - **Firebase Firestore**: Real-time features (orders, service requests, reservations)
  - **PostgreSQL + Drizzle ORM**: Structured data (menu items, tables, analytics)
- **Backend**: Express.js REST API with typed routes

### Key Architectural Patterns

#### Dual Database Strategy
The system uses Firebase for real-time features and PostgreSQL for structured business data:
- **Firebase Collections**: `events` (orders, service-requests, billing-requests, reservations, feedback)
- **PostgreSQL Tables**: Menu items, tables, user data, analytics (via Drizzle ORM)
- **Shared Schema**: `shared/schema.ts` and `shared/drizzle-schema.ts` define all data types

#### Multi-Panel Routing Architecture
```typescript
// Routes are device-optimized:
// /customer or /:tableNumber - Mobile customer interface
// /staff - Tablet staff interface  
// /admin/:page? - Desktop admin interface
```

#### Real-Time Event System
Uses Firebase Firestore listeners for instant updates across all panels:
- Order placement → Immediate staff panel notification
- Service requests → Real-time staff alerts
- Inventory changes → Live menu updates across devices

#### Type-Safe API Layer
All API endpoints in `server/routes.ts` use shared Zod schemas for validation:
- Orders API: `/api/orders` (GET, POST, PATCH)
- Menu API: `/api/menu` (GET, POST, PUT, DELETE)
- Reservations API: `/api/reservations` (GET, POST)
- Service Requests API: `/api/service-requests` (GET, POST)
- Tables API: `/api/tables` (GET, POST, PUT)

### Project Structure Navigation
```
├── client/src/           # React frontend
│   ├── components/       # UI components organized by user type
│   │   ├── customer/     # Mobile-optimized components
│   │   ├── staff/        # Staff management interface
│   │   ├── admin/        # Admin dashboard components
│   │   └── ui/           # Reusable Shadcn components
│   ├── pages/            # Route components (customer, staff, admin, landing)
│   ├── lib/              # Firebase config, utilities, query client
│   └── hooks/            # Custom React hooks
├── server/               # Express.js backend
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── database.ts       # Drizzle ORM configuration
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Firebase/Firestore schemas (Zod)
│   └── drizzle-schema.ts # PostgreSQL schemas (Drizzle)
└── Firebase config files # deployment configuration
```

### Development Workflow Patterns

#### Component Development
- Customer components: Design mobile-first, test on actual mobile devices
- Staff components: Optimize for tablets, focus on real-time updates
- Admin components: Desktop-optimized, data-heavy interfaces
- All components use TypeScript + Shadcn/ui patterns

#### Database Schema Changes
1. Update `shared/drizzle-schema.ts` for PostgreSQL changes
2. Update `shared/schema.ts` for Firebase schema changes  
3. Run `npm run db:push` to apply PostgreSQL changes
4. Update Firestore rules if needed: `firestore.rules`

#### Real-Time Feature Development
- Use Firebase Firestore listeners in React components
- All real-time events go through `shared/schema.ts` event types
- Test cross-panel updates: place order on customer → verify staff panel update

#### API Development
- Add routes to `server/routes.ts` with proper error handling
- Use Zod schemas from `shared/` for request validation
- Follow existing patterns for storage layer abstraction

### Environment Configuration

#### Development Environment Variables
```bash
# Optional Firebase overrides (defaults provided in firebase.ts)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# Database configuration
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=development
```

#### Production Deployment
The system is pre-configured for Firebase hosting with project `gastroflow-dvlg0`. Firebase configuration includes:
- Hosting: `dist/public/` directory
- Firestore: Real-time database with rules
- Storage: File uploads for menu images

### Important Development Notes

#### Multi-Device Testing Strategy
This system is designed for different devices:
1. **Customer Panel**: Test primarily on mobile phones (portrait mode)
2. **Staff Panel**: Test on tablets (landscape preferred)  
3. **Admin Panel**: Test on desktop/laptop (wide screens)

#### Real-Time Considerations
- All Firebase listeners should be properly cleaned up in React useEffect
- Test real-time updates across multiple browser tabs/devices
- Service requests have priority handling - test staff notification timing

#### Menu Management Flow
Menu items are managed through dual persistence:
- Admin adds items via `/admin` → Stored in PostgreSQL
- Real-time menu changes → Synced through Firebase for instant customer updates
- Inventory tracking affects customer-facing menu availability

#### Firebase Security Rules
Current Firestore rules allow open read/write access. For production deployment, implement proper authentication-based security rules in `firestore.rules`.

## Firebase Project Configuration

The codebase is pre-configured for Firebase project: **gastroflow-dvlg0**
- **Live URLs**: 
  - Customer: `https://gastroflow-dvlg0.web.app/customer`
  - Staff: `https://gastroflow-dvlg0.web.app/staff`  
  - Admin: `https://gastroflow-dvlg0.web.app/admin`

All Firebase configuration is already set up in `client/src/lib/firebase.ts` with fallback values for immediate development.
