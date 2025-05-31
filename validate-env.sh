#!/bin/bash

# Environment Validation Script
# Checks if all required environment variables are properly configured

echo "🔍 Validating PromptNotes environment configuration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load .env file if it exists
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Run ./setup.sh first to create the environment file"
    exit 1
fi

errors=0

# Check required variables
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local required=$2
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $var_name is required but not set${NC}"
            errors=$((errors + 1))
        else
            echo -e "${YELLOW}⚠️  $var_name is optional but not set${NC}"
        fi
    else
        # Check for placeholder values
        if [[ "$var_value" == *"your-"* ]] || [[ "$var_value" == *"example"* ]]; then
            echo -e "${YELLOW}⚠️  $var_name appears to have a placeholder value: $var_value${NC}"
            errors=$((errors + 1))
        else
            echo -e "${GREEN}✅ $var_name is set${NC}"
        fi
    fi
}

echo "Checking required environment variables..."
echo ""

# Required variables
check_var "UPSTASH_REDIS_REST_URL" true
check_var "UPSTASH_REDIS_REST_TOKEN" true
check_var "JWT_SECRET" true

echo ""
echo "Checking optional environment variables..."
echo ""

# Optional variables
check_var "NODE_ENV" false
check_var "VITE_APP_URL" false
check_var "VITE_API_BASE_URL" false
check_var "CORS_ORIGINS" false

echo ""
echo "Checking for development placeholders..."
echo ""

# Check for insecure development values in production
if [ "$NODE_ENV" = "production" ]; then
    if [ "$JWT_SECRET" = "dev-secret-change-in-production-abc123xyz789" ]; then
        echo -e "${RED}❌ Using development JWT_SECRET in production!${NC}"
        errors=$((errors + 1))
    fi
fi

# Check JWT secret strength
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠️  JWT_SECRET should be at least 32 characters long${NC}"
    echo "   Generate a stronger secret with: openssl rand -base64 32"
fi

echo ""
echo "═══════════════════════════════════════════════"

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 Environment configuration looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the development server: npm run dev"
    echo "2. Start Netlify functions: netlify dev"
    echo "3. Open http://localhost:8888"
else
    echo -e "${RED}❌ Found $errors configuration issue(s)${NC}"
    echo ""
    echo "Please fix the issues above before continuing."
    echo "Check the setup instructions in README.md for help."
    exit 1
fi
