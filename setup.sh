#!/bin/bash

# Queue Skip Web3 Setup Script
echo "🚀 Setting up Queue Skip Web3 project..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Please install Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Please install Docker Compose"; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Setup environment files
echo "⚙️ Setting up environment files..."

if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/env.example packages/backend/.env
    echo "✅ Created backend .env file"
    echo "⚠️  Please edit packages/backend/.env with your configuration"
else
    echo "ℹ️  Backend .env file already exists"
fi

# Generate JWT secret if not set
if ! grep -q "your-super-secret-jwt-key-here" packages/backend/.env 2>/dev/null; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" packages/backend/.env
    rm packages/backend/.env.bak 2>/dev/null
    echo "✅ Generated JWT secret"
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

# Build shared package
echo "🔨 Building shared package..."
npm run build --workspace=shared

# Setup database
echo "🗄️ Setting up database..."
npm run db:generate --workspace=backend
npm run db:push --workspace=backend

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed"
    exit 1
fi

# Seed database (optional)
echo "🌱 Seeding database with test data..."
npm run db:seed --workspace=backend 2>/dev/null || echo "ℹ️  No seed script found, skipping..."

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your API keys in packages/backend/.env"
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "   User Web App:     http://localhost:3000"
echo "   Admin Dashboard:  http://localhost:3002"
echo "   Staff Scanner:    http://localhost:3003"
echo "   Backend API:      http://localhost:3001"
echo ""
echo "📚 Required API Keys:"
echo "   • JWT_SECRET (✅ generated)"
echo "   • SOLANA_RPC_URL (⚠️  configure for Web3 features)"
echo "   • WALLETCONNECT_PROJECT_ID (⚠️  configure for Web3 features)"
echo "   • Apple Wallet credentials (optional, for .pkpass files)"
echo ""
echo "📖 See README.md for detailed configuration instructions"
