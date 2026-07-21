# WiFi Rewards

A Next.js application for redeeming WiFi bundles using virtual SB credits.

## Installation

```bash
npm install
```

## Environment Variables

Copy to your `.env` and configure:

```bash
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-key-here"
```

## Database Setup

```bash
npx prisma db push
```

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User registration and login
- SB balance management with admin controls
- WiFi bundle redemption (100MB, 500MB, 1GB)
- Transaction history
- JWT-based session authentication



