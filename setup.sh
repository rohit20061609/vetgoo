#!/bin/bash

# VetGo Quick Start Script
# This script sets up the development environment for VetGo

set -e

echo "🐾 VetGo Setup Script"
echo "===================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your API keys"
fi

# Generate Prisma Client
echo ""
echo "🗄️  Generating Prisma Client..."
npm run db:generate

# Check if database is configured
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "⚠️  DATABASE_URL not set in .env.local"
    echo "    Set it to your PostgreSQL connection string"
    echo "    Example: postgresql://user:password@localhost:5432/vetgo"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run: npm run db:push (to initialize database)"
echo "3. Run: npm run dev (to start development server)"
echo ""
echo "📖 Documentation:"
echo "   - README.md - Project documentation"
echo "   - DEPLOYMENT.md - Deployment guides"
echo "   - CONTRIBUTING.md - Contributing guidelines"
echo "   - PROJECT_SETUP.md - Setup details"
echo ""
