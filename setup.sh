#!/bin/bash

echo "🚀 FWC HRMS Setup Script"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  Created backend/.env from example"
    echo "👉 EDIT backend/.env with your:"
    echo "   - MONGO_URI (MongoDB Atlas connection string)"
    echo "   - ANTHROPIC_API_KEY (from console.anthropic.com)"
    echo ""
fi

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  Terminal 1 (backend):  cd backend && npm start"
echo "  Terminal 2 (frontend): cd frontend && npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo "Click 'Seed demo users' on the login page for test accounts."
echo ""
echo "Demo credentials:"
echo "  Admin:    admin@fwc.co.in    / Admin@123"
echo "  Manager:  manager@fwc.co.in  / Manager@123"
echo "  HR:       hr@fwc.co.in       / Hr@123456"
echo "  Employee: employee@fwc.co.in / Emp@12345"
