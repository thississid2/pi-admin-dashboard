#!/bin/bash

# Pi Admin Dashboard - Authentication Test Script

echo "🧪 Testing Pi Admin Dashboard Authentication"
echo "============================================="

BACKEND_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$url")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "   Response: $response"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        return 1
    fi
}

echo ""
echo "🔍 Backend Service Tests"
echo "------------------------"

# Test backend health
test_json_endpoint "$BACKEND_URL/health" "Backend health check"

# Test auth status (should return unauthenticated)
test_json_endpoint "$BACKEND_URL/auth/status" "Authentication status"

echo ""
echo "🔍 Frontend Service Tests"  
echo "-------------------------"

# Test frontend availability
test_endpoint "$FRONTEND_URL" "200" "Frontend availability"

echo ""
echo "🔗 Authentication Flow Tests"
echo "----------------------------"

echo "1. Login initiation test:"
echo "   Visit: $BACKEND_URL/auth/login"
echo "   Should redirect to AWS Cognito login page"
echo ""

echo "2. Manual authentication test:"
echo "   1. Open browser: $FRONTEND_URL"
echo "   2. Click 'Login' button"
echo "   3. Should redirect to Cognito"
echo "   4. Login with your Cognito credentials"
echo "   5. Should redirect back to dashboard"
echo ""

echo "🔧 Configuration Verification"
echo "-----------------------------"

# Check if environment files exist
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅${NC} Frontend environment file exists"
else
    echo -e "${RED}❌${NC} Frontend .env.local missing"
fi

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅${NC} Backend environment file exists"
    
    # Check for required variables (without showing values)
    if grep -q "AWS_COGNITO_USER_POOL_ID=" backend/.env; then
        echo -e "${GREEN}✅${NC} Cognito User Pool ID configured"
    else
        echo -e "${RED}❌${NC} Cognito User Pool ID missing"
    fi
    
    if grep -q "AWS_COGNITO_CLIENT_ID=" backend/.env; then
        echo -e "${GREEN}✅${NC} Cognito Client ID configured"
    else
        echo -e "${RED}❌${NC} Cognito Client ID missing"
    fi
    
    if grep -q "AWS_COGNITO_CLIENT_SECRET=" backend/.env; then
        echo -e "${GREEN}✅${NC} Cognito Client Secret configured"
    else
        echo -e "${RED}❌${NC} Cognito Client Secret missing"
    fi
else
    echo -e "${RED}❌${NC} Backend .env missing"
fi

echo ""
echo "📊 Test Summary"
echo "==============="
echo "✅ Green = Working correctly"
echo "❌ Red = Needs attention"
echo "⚠️  Yellow = Warning"
echo ""
echo "For detailed troubleshooting, see README.md"
echo "For authentication issues, verify AWS Cognito configuration"
