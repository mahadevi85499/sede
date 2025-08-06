# Firebase Deployment Guide - Hotel Management System

## Prerequisites
✅ Firebase project created: `gastroflow-dvlg0`
✅ Firebase configuration set up in the application
✅ Production build completed successfully

## Deployment Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init
```
Choose:
- Firestore: Configure rules and indexes
- Hosting: Set up Firebase hosting
- Use existing project: `gastroflow-dvlg0`

### 4. Deploy to Firebase
```bash
firebase deploy
```

## Current Configuration

### Firebase Config (already set)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCh9M_Xjkc_Vh1vBi-r2qrpTz7JnWJqhY4",
  authDomain: "gastroflow-dvlg0.firebaseapp.com",
  projectId: "gastroflow-dvlg0",
  storageBucket: "gastroflow-dvlg0.firebasestorage.app",
  messagingSenderId: "661255645986",
  appId: "1:661255645986:web:dbeeafc488d9025ac1d37b"
};
```

### Firestore Collections Used
- `events` - Orders, service requests, and billing requests
- Collections are auto-created when first document is added

### Application URLs After Deployment
- **Customer Panel**: `https://gastroflow-dvlg0.web.app/customer`
- **Staff Panel**: `https://gastroflow-dvlg0.web.app/staff`  
- **Admin Panel**: `https://gastroflow-dvlg0.web.app/admin`

## Security Rules
Current Firestore rules allow read/write access to all collections. For production, consider adding authentication-based rules.

## Post-Deployment Checklist
- [ ] Test customer panel on mobile device
- [ ] Verify order placement works
- [ ] Test service requests functionality
- [ ] Check staff panel real-time updates
- [ ] Verify admin panel functionality
- [ ] Test all three panels on different devices

## Troubleshooting
- If deployment fails, ensure you're logged into the correct Firebase account
- Check that your Firebase project ID matches: `gastroflow-dvlg0`
- Verify build files exist in `dist/public/` directory