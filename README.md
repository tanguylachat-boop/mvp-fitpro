# FitOS Pro - MVP

Multi-tenant SaaS platform for fitness centers.

## Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS + shadcn/ui
- **Payments**: Stripe Checkout
- **Auth**: JWT

## Quick Start

### Prerequisites

- Node.js >= 18
- Docker (for PostgreSQL)
- npm >= 9

### Installation

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start PostgreSQL
npm run docker:up

# 3. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit .env files with your configuration

# 4. Run database migrations
npm run prisma:migrate

# 5. Start development servers
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `npm run prisma:studio`

## Project Structure

```
mvp-fitpro/
├── backend/     # NestJS API
└── frontend/    # Next.js App
```

## Features

### For Gym Admins
- Manage membership plans
- View members and subscriptions
- Dashboard with KPIs (active members, monthly revenue, check-ins)

### For Members
- Register and login
- Complete fitness onboarding
- Subscribe to plans via Stripe
- View personalized workout programs
- Virtual access badge for check-ins

## Development

```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run both (recommended)
npm run dev

# Database management
npm run prisma:studio
npm run prisma:migrate

# Docker
npm run docker:up
npm run docker:down
```

## Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.
