# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
docker --version
docker-compose --version
```

### 2. Clone & Setup
```bash
git clone <your-repo-url>
cd FastQueueKiroCursor
chmod +x setup.sh
./setup.sh
```

The setup script will automatically:
- ✅ Install all dependencies
- ✅ Generate JWT secret
- ✅ Start PostgreSQL & Redis containers
- ✅ Setup database schema
- ✅ Seed with test data

### 3. Configure API Keys

Edit `packages/backend/.env`:

**Required for basic functionality:**
```bash
JWT_SECRET="auto-generated-secret"  # ✅ Already set
DATABASE_URL="postgresql://..."     # ✅ Already set
REDIS_URL="redis://..."            # ✅ Already set
```

**Required for Web3 features:**
```bash
# Get from QuickNode, Alchemy, or Helius
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"

# Get from WalletConnect Cloud
WALLETCONNECT_PROJECT_ID="your-project-id"

# Generate with: solana-keygen new
WALLET_PRIVATE_KEY="[1,2,3,...]"
```

**Optional for Apple Wallet:**
```bash
APPLE_WALLET_TEAM_ID="your-team-id"
APPLE_WALLET_PASS_TYPE_ID="pass.com.yourcompany.queueskip"
# ... other Apple Wallet credentials
```

### 4. Start Development Servers
```bash
npm run dev
```

This starts all services:
- 🖥️  **User App**: http://localhost:3000
- 👨‍💼 **Admin Dashboard**: http://localhost:3002  
- 📱 **Staff Scanner**: http://localhost:3003
- 🔌 **Backend API**: http://localhost:3001

## 🧪 Test the System

### Login Credentials (Test Data)
```
Student User:
- Email: student@hku.hk
- Government ID: HK123456789

Employee User:  
- Email: employee@hku.hk
- SSO ID: hku-sso-123

Visitor User:
- Email: visitor@example.com
- Web3 Address: 5fHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
```

### Test Flow
1. **Login** at http://localhost:3000
2. **Get Passes** - Click "Allocate Passes" 
3. **View QR Code** - See dynamic 30-second refresh
4. **Test Scanner** - Go to http://localhost:3003 and scan QR
5. **Transfer Pass** - Send to another user (if enabled)
6. **Admin Panel** - Manage venue at http://localhost:3002

## 🔧 Development Commands

```bash
# Start all services
npm run dev

# Individual services
npm run dev:backend    # API server only
npm run dev:web       # User web app only  
npm run dev:admin     # Admin dashboard only
npm run dev:scanner   # Staff scanner only

# Database operations
cd packages/backend
npm run db:migrate    # Run migrations
npm run db:seed      # Seed test data
npm run db:generate  # Generate Prisma client

# Build for production
npm run build
```

## 🐳 Docker Commands

```bash
# Start databases only
docker-compose up -d postgres redis

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

## 🔍 API Testing

The backend API is available at http://localhost:3001/api

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Venues
```bash
curl http://localhost:3001/api/venues
```

### Login Test User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email",
    "email": "student@hku.hk",
    "venueId": "venue-hku-station"
  }'
```

## 🎯 Key Features to Test

### 1. Dynamic QR Codes
- QR codes refresh every 30 seconds automatically
- WebSocket real-time updates
- Cryptographically signed for security

### 2. Pass Transfers
- Only works if admin enables `passTransfer: true`
- Only works for `transferable: true` pass types
- Database enforces permissions, blockchain records events

### 3. Multi-Tenant Support
- HKU Station: Transfers enabled, community features
- Commercial Building: Transfers disabled, visitor-only

### 4. Hybrid Blockchain
- Database: Fast operations, immediate user experience
- Solana: Transparency layer for critical events
- Works even if blockchain fails (graceful degradation)

## ❗ Troubleshooting

### Database Issues
```bash
# Reset database
docker-compose down
docker volume rm fastqueuekirocursor_postgres_data
docker-compose up -d postgres
cd packages/backend && npm run db:push && npm run db:seed
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000  # User app
lsof -i :3001  # Backend
lsof -i :3002  # Admin
lsof -i :3003  # Scanner
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

## 🚀 Production Deployment

See `README.md` for detailed production setup instructions including:
- Environment configuration
- SSL certificates
- Database migrations
- Monitoring setup
- Security considerations

---

**Need Help?** Check the full `README.md` or create an issue in the repository.
