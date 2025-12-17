#!/bin/bash

# BruinCoin Development Server Runner
# This script runs both frontend and backend simultaneously

echo "🚀 Starting BruinCoin Development Servers..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${BLUE}📦 Starting Backend (port 3000)...${NC}"
cd backend/bruincoindb
npm run dev > /tmp/bruincoin-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend (port 3001)...${NC}"
cd frontend/btwn
npm run dev > /tmp/bruincoin-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

echo ""
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo "📍 Backend:  http://localhost:3000"
echo "📍 Frontend: http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/bruincoin-backend.log"
echo "   Frontend: tail -f /tmp/bruincoin-frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
