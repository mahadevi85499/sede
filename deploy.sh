#!/bin/bash

echo "🚀 Deploying Hotel Management System to Firebase..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "🌐 Your application is now live at:"
    echo "   Customer Panel: https://gastroflow-dvlg0.web.app/customer"
    echo "   Staff Panel:    https://gastroflow-dvlg0.web.app/staff"
    echo "   Admin Panel:    https://gastroflow-dvlg0.web.app/admin"
    echo ""
    echo "📱 Test the customer panel on mobile devices"
    echo "💻 Test staff/admin panels on tablets/desktops"
else
    echo "❌ Deployment failed!"
    exit 1
fi