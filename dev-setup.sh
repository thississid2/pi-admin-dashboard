#!/bin/bash

# Pi Admin Dashboard - Development Startup Script

echo "🚀 Starting Pi Admin Dashboard Development Environment"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the pi-admin-dashboard root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
if ! check_port 3000; then
    echo "   Frontend port 3000 is busy"
fi
if ! check_port 5001; then
    echo "   Backend port 5001 is busy"
fi

echo ""
echo "📋 Prerequisites checklist:"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
elif command -v python >/dev/null 2>&1; then
    PYTHON_VERSION=$(python --version)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check backend virtual environment
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check environment files
echo ""
echo "🔧 Environment configuration:"

if [ -f ".env.local" ]; then
    echo "✅ Frontend environment file exists"
else
    echo "⚠️  Frontend .env.local not found"
    echo "   Copy .env.local.example to .env.local and configure it"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend environment file exists"
else
    echo "⚠️  Backend .env not found"
    echo "   Copy backend/.env.example to backend/.env and configure it"
fi

echo ""
echo "🎯 Quick start commands:"
echo ""
echo "1. Start backend (Terminal 1):"
echo "   cd backend && source venv/bin/activate && python app.py"
echo ""
echo "2. Start frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3. Access application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""
echo "4. Test health:"
echo "   curl http://localhost:5001/health"
echo ""
echo "🔍 For troubleshooting, see README.md"
echo "======================================================"
