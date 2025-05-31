#!/bin/bash

# PromptNotes Setup Script
# This script helps you set up your local development environment

echo "🚀 Setting up PromptNotes development environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your actual credentials:"
    echo "   1. Get Upstash Redis credentials from https://console.upstash.com/"
    echo "   2. Update UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
    echo "   3. Generate a strong JWT_SECRET for production"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    
    # Check if pnpm is available
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo "❌ Neither npm nor pnpm found. Please install Node.js and npm."
        exit 1
    fi
    
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Edit .env file with your actual credentials:"
echo "   nano .env"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. In another terminal, start Netlify functions:"
echo "   netlify dev"
echo ""
echo "4. Open http://localhost:8888 in your browser"
echo ""
echo "📚 Need help? Check the setup instructions in README.md"
