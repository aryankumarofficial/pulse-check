# PulseCheck 🚀

PulseCheck is a modern Downtime Detector & API Monitoring SaaS platform built with Next.js 16, Tailwind CSS, and the InsForge BaaS platform.

## Features ✨
- **Website & API Monitoring:** Monitor the uptime of endpoints and services.
- **Maintenance Mode:** Administrators can instantly toggle a global maintenance mode via the Platform Settings dashboard. This intercepts traffic dynamically at the Edge via Next.js Middleware.
- **Admin Dashboard:** Manage users, platform settings, and monitor system health.
- **Authentication:** Secure user authentication managed by InsForge.
- **Payments:** Subscription and billing management powered by Razorpay.

## Tech Stack 🛠️
- **Frontend:** Next.js 16 (Turbopack, App Router), React 19, Tailwind CSS, Framer Motion
- **Backend/Database:** InsForge BaaS (PostgreSQL, PostgREST API)
- **Deployment:** Vercel (via InsForge deployment CLI)
- **Payments:** Razorpay

---

## First-Time Setup ⚙️

To get the project running locally, you need to set up your environment variables and database tables.

### 1. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# InsForge Backend
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-app-id.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PulseCheck

# InsForge Service Role (Required for secure backend operations)
INSFORGE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="your_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Razorpay Plan IDs
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxx
RAZORPAY_PLAN_PRO_ANNUAL=plan_xxxx
RAZORPAY_PLAN_BUSINESS_MONTHLY=plan_xxxx
RAZORPAY_PLAN_BUSINESS_ANNUAL=plan_xxxx

# OpenRouter (For AI Endpoint Monitoring)
OPENROUTER_API_KEY=sk-or-v1-xxxx
```

### 2. Database Setup (InsForge)
Ensure your InsForge database has the required tables. Key tables include:
- `auth.users` (managed by InsForge Auth)
- `platform_settings`: Used for global toggles like `maintenance_mode`.

**Important Schema Notes:**
- Setting user roles (like assigning an admin) requires creating an RPC function (`set_user_role`) that updates `auth.users` securely.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Deployment 🌐

This project is configured to be deployed natively via the InsForge MCP deployment tool (which uses Vercel infrastructure).

To deploy the latest changes:
1. Ensure all environment variables are correctly set in your `.env.local`.
2. Use the InsForge `create-deployment` tool to push your source code to production.
