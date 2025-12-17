# BruinCoin Backend

Node.js/Express API backend for BruinCoin cryptocurrency application.

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Render

## 🌳 Git Workflow

### Branch Structure
- `main` - Production branch (stable, deployed code)
- `dev` - Development branch (integration branch for features)
- `feature/*` - Feature branches (cloned off `dev`)

### Workflow
1. Create feature branches from `dev`
2. Develop features in feature branches
3. Merge feature branches into `dev` for testing
4. Merge `dev` into `main` for production releases

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Render account (for deployment)

### Local Development

1. **Setup**
   ```bash
   git clone <backend-repo-url>
   cd bruinCoin-backend
   git checkout dev
   npm install
   cp .env.example .env
   # Fill in your Supabase credentials in .env
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── .env.example         # Environment variables template
├── package.json
└── server.js           # Entry point
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🚀 Deployment

### Render
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy from `main` branch

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Wallets
- `GET /api/wallets` - Get user wallets
- `POST /api/wallets` - Create new wallet
- `GET /api/wallets/:id` - Get specific wallet

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run linter
```
