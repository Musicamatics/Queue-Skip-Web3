# Queue Skip Web3

> **⚠️ Proof of Concept / Prototype**  
> This is a functional prototype demonstrating a multi-tenant queue management system with Web3 integration. While most core features are implemented and working, this project is designed for demonstration and development purposes. Further development, testing, and security hardening would be needed for production deployment.

A multi-tenant queue management system with Web3 integration, featuring dynamic QR codes, pass transfers, and blockchain transparency.

**Credits:** Built with ❤️ with AWS Kiro and Claude

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple venues with configurable features
- **Dynamic QR Codes**: Refresh every 30 seconds with cryptographic security
- **Hybrid Blockchain Integration**: Database for performance + Solana for transparency
- **Pass Management**: Allocation, transfer, and redemption with admin controls
- **WalletConnect v2 Integration**: Web3 wallet authentication (no MetaMask fallback)
- **Auto-Registration on Sign-In**: Configurable per-venue user registration
- **Usage Predictions**: Optional survey system with public crowd predictions
- **Apple Wallet Integration**: .pkpass file support for iOS users
- **Real-time Updates**: WebSocket connections for live QR refreshes
- **Community Features**: Pass donation requests and community forum
- **Staff Scanner Interface**: Web-based QR validation for staff
- **Admin Dashboard**: Comprehensive venue management and analytics

## 🏗️ Architecture

### Hybrid Approach
- **Database Layer**: PostgreSQL for fast operations and user experience
- **Blockchain Layer**: Solana for critical event recording (allocation, transfer, redemption)
- **Cache Layer**: Redis for QR codes and frequently accessed data
- **Real-time Layer**: WebSocket for live updates

### Key Services
- **Pass Service**: Core pass lifecycle with admin permission enforcement
- **QR Service**: Dynamic QR generation with 30-second refresh
- **Blockchain Service**: Solana NFT integration for transparency
- **Auth Service**: Multi-method authentication (SSO, government ID, Web3 wallet, email)
- **Venue Service**: Multi-tenant configuration management

## 🛠️ Tech Stack

### Backend
- **Node.js** + **TypeScript** + **Express**
- **PostgreSQL** with **Prisma ORM**
- **Redis** for caching
- **Solana Web3.js** + **Anchor** for blockchain
- **WebSocket** for real-time updates
- **JWT** for authentication

### Frontend
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Socket.io** for real-time features
- **QRCode.react** for QR display
- **WalletConnect Universal Provider v2** for Web3 integration

### Infrastructure
- **Docker** + **Docker Compose**
- **Monorepo** with **npm workspaces**

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd FastQueueKiroCursor
npm install
\`\`\`

### 2. Environment Setup
Copy the environment file and configure:
\`\`\`bash
cp packages/backend/env.example packages/backend/.env
\`\`\`

### 3. Start with Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### 4. Database Setup
\`\`\`bash
# Run migrations
npm run db:migrate --workspace=backend

# Seed test data
npm run db:seed --workspace=backend
\`\`\`

### 5. Access Applications
- **User Web App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3002
- **Staff Scanner**: http://localhost:3003
- **Backend API**: http://localhost:3001

## 🔧 Configuration

### Required API Keys

#### Essential (Required for basic functionality)
\`\`\`bash
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/queue_skip_web3"
REDIS_URL="redis://localhost:6379"
\`\`\`

#### Blockchain Integration (Required for Web3 features)
\`\`\`bash
# Solana Configuration
SOLANA_RPC_URL="https://api.devnet.solana.com"  # or mainnet-beta
SOLANA_NETWORK="devnet"  # or mainnet-beta
SOLANA_PROGRAM_ID="your-deployed-program-id"
WALLET_PRIVATE_KEY="[1,2,3,...]"  # Array format private key

# WalletConnect
WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
\`\`\`

#### Apple Wallet Integration (Optional - only for .pkpass files)
\`\`\`bash
APPLE_WALLET_TEAM_ID="your-apple-developer-team-id"
APPLE_WALLET_PASS_TYPE_ID="pass.com.yourcompany.queueskip"
APPLE_WALLET_CERTIFICATE_PATH="/path/to/pass-certificate.p12"
APPLE_WALLET_CERTIFICATE_PASSWORD="certificate-password"
APPLE_WALLET_WWDR_CERTIFICATE_PATH="/path/to/wwdr-certificate.pem"
\`\`\`

### Getting API Keys

#### 1. JWT Secret
Generate a secure random string:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

#### 2. Solana Setup
- **RPC URL**: Use public endpoints or get from [QuickNode](https://www.quicknode.com/), [Alchemy](https://www.alchemy.com/), or [Helius](https://helius.xyz/)
- **Program ID**: Deploy your Solana program and get the program ID
- **Wallet Private Key**: Generate with \`solana-keygen new\`

#### 3. WalletConnect
- Sign up at [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a new project and get the Project ID

#### 4. Apple Wallet (Optional)
- Join [Apple Developer Program](https://developer.apple.com/programs/)
- Create Pass Type ID and certificates in Apple Developer Console
- Download and configure certificates

## 📱 Usage

### For Users
1. **Login**: Use email, government ID, SSO, or Web3 wallet
2. **Get Passes**: Automatic allocation based on venue rules
3. **View QR Code**: Dynamic QR that refreshes every 30 seconds
4. **Transfer Passes**: Send unused passes to friends (if enabled)
5. **Community**: Request pass donations when needed

### For Venue Admins
1. **Setup Venue**: Configure authentication methods and user groups
2. **Manage Pass Types**: Define pass categories and restrictions
3. **Set Allocation Rules**: Control how passes are distributed
4. **Feature Toggles**: Enable/disable transfers, community features, etc.
5. **Monitor Usage**: Real-time analytics and usage patterns

### For Staff
1. **Scan QR Codes**: Validate passes with camera or manual input
2. **Real-time Validation**: Instant verification with blockchain transparency
3. **Error Handling**: Clear messages for invalid/expired passes

## 🔒 Security Features

- **Dynamic QR Codes**: Refresh every 30 seconds to prevent screenshots
- **Cryptographic Signing**: JWT tokens with venue-specific keys
- **Replay Attack Prevention**: Time-based token validation
- **Admin Permission Enforcement**: Database-level transfer controls
- **Blockchain Transparency**: Immutable record of critical events

## 🏢 Multi-Tenant Support

Each venue can independently configure:
- Authentication methods (SSO, government ID, email, Web3)
- User groups and access levels
- Pass types and allocation rules
- Feature enablement (transfers, community, etc.)
- Integration settings

## 🔧 Development

### Project Structure
\`\`\`
packages/
├── backend/          # Node.js API server
├── web-app/         # User React app
├── admin-dashboard/ # Admin React app
├── staff-scanner/   # Staff React app
└── shared/          # Shared types and utilities
\`\`\`

### Development Commands
\`\`\`bash
# Start all services
npm run dev

# Individual services
npm run dev:backend
npm run dev:web
npm run dev:admin
npm run dev:scanner

# Database operations
npm run db:migrate --workspace=backend
npm run db:generate --workspace=backend
npm run db:seed --workspace=backend

# Testing
npm run test

# Build for production
npm run build
\`\`\`

## 📊 Monitoring

The system includes comprehensive logging and monitoring:
- **Winston** logging with structured logs
- **Health check** endpoints
- **Real-time** WebSocket connection monitoring
- **Database** query performance tracking
- **Blockchain** transaction status monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation above
2. Review the [Issues](link-to-issues) section
3. Create a new issue with detailed information

---

**Note**: This system enforces admin controls at the database level. Even with Web3 integration, venue administrators maintain full control over pass transfers and feature availability. The blockchain serves as a transparency and audit layer, not a permission override mechanism.
