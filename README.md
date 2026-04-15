# Gemini Express TMS

A full-featured Transport Management System built for **Gemini Express Transport Corporation** — covering Carrier Operations, Freight Brokerage, CFS/Air Cargo, and Unified Billing.

## Architecture

**4-Module System:**
- 🚛 **Carrier TMS** — Load management, dispatch, drivers (ELD), fleet assets, accounting, safety
- 📦 **Brokerage** — Shipment management, carrier matching, DAT/Truckstop posting, customer portal
- ✈ **CFS / Air Cargo** — Import/export orders, warehouse, customs & compliance, dispatch
- 💰 **Unified Billing** — Cross-module invoicing with CargoWise org code matching

**Driver Mobile App** — PWA with 8 screens (Load, Docs, Photos, HOS, DVIR, Chat, CFS, Fuel)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State:** TanStack Query (React Query)
- **Package Manager:** pnpm
- **Structure:** Monorepo (`apps/web`, `apps/driver`)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gemini-express-tms.git
cd gemini-express-tms

# Install dependencies
pnpm install

# Start the web app (development)
cd apps/web
pnpm dev

# Start the driver app (development)
cd apps/driver
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Project Structure

```
gemini-express-tms/
├── apps/
│   ├── web/                    # Main TMS web application
│   │   └── src/
│   │       ├── components/
│   │       │   └── layout/
│   │       │       └── DashboardLayout.tsx    # 4-module layout with nav
│   │       ├── pages/
│   │       │   ├── carrier/    # 15 carrier pages
│   │       │   ├── brokerage/  # 13 brokerage pages
│   │       │   └── cfs/        # 7 CFS pages + billing
│   │       ├── lib/
│   │       ├── stores/
│   │       └── App.tsx
│   └── driver/                 # Driver mobile PWA
│       └── src/
│           └── DriverApp.tsx   # 8-screen mobile app
├── packages/                   # Shared packages (future)
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Key Integrations

| Integration | Purpose |
|---|---|
| CargoWise | Bidirectional sync — invoices, shipments, org codes |
| Motive / Samsara | ELD data, GPS, engine diagnostics |
| DAT / Truckstop | Load board posting for brokerage |
| Trucker Tools | Carrier tracking |
| RMIS / Highway | Carrier onboarding auto-populate |
| I-PASS / E-ZPass | Toll tag management |
| TriumphPay / RTS / OTR | Factoring integration |
| ACE / CBP | Customs entry filing |
| Airline Cargo APIs | Real-time cargo tracking |

## Features

### Carrier Module
- Load board with rate negotiation & auto-accept rules
- Dispatch planner
- Driver management with Pay & Settlement
- Fleet assets with COI, insurance cards, registration cards (VIN auto-match)
- Carrier accounting with AP expenses & CargoWise sync
- Profitability reports by lane, driver, customer
- Fleet intelligence, live map, safety management

### Brokerage Module
- Shipment management with carrier matching (scored)
- DAT + Truckstop load posting
- Trucker Tools tracking integration
- AR/AP aging with auto-dunning emails
- RMIS/Highway carrier onboarding
- Customer portal with quote request
- Carrier scorecard with weighted ratings
- Rate trending by lane

### CFS / Air Cargo Module
- Import orders with AIR AMS upload & auto-parse
- Export orders with MAWB upload & KSP management
- Warehouse — inventory, receiving, consol/decon, barcode printing, photo capture
- Customs & compliance — ISF, holds (FDA/USDA/CBP/EPA), exams, ACE filing, duty calculator
- Dispatch with pickup verification (full/partial/short), route optimization
- Airline cargo tracking

### Billing Module
- Unified billing across all modules
- CargoWise org code matching
- Rate cards per client
- Invoice PDF generation with letterhead
- Payment tracking with remittance matching
- Credit memo & adjustment workflow
- Aging buckets (Current/30/60/90/120+)

### Cross-Module
- Unified home dashboard with KPIs from all 4 modules
- Global search across loads, shipments, MAWBs, invoices, customers
- Clickable notifications with module navigation
- Email/SMS alert delivery configuration
- Audit trail accessible from all modules
- Role-based permissions with CFS location access control
- Module-level access per user (Carrier/Brokerage/CFS/Billing)

## Deployment

### Staging (Vercel)
```bash
npm i -g vercel
vercel --cwd apps/web
```

### Production (Docker)
```bash
docker build -t gemini-tms .
docker run -p 3000:3000 gemini-tms
```

## License

Private — Gemini Express Transport Corporation. All rights reserved.
