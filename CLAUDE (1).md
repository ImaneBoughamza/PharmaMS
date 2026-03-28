# PharmaOS — Claude Code Context

## IMPORTANT — READ THIS FIRST

Before writing or editing any file, always read its current content first.
Never assume a file is empty and never assume a file already has content.
Always check first.

- If the file is empty or missing → implement it from scratch.
- If the file already has content → read it fully, understand what is there,
  then continue from where it left off or integrate your additions cleanly
  without duplicating or overwriting existing code.

Follow the implementation steps in order. Do not skip steps.
Do not add code to a file without reading it first.

---

## Project

Web-Based Automated Pharmacy Management System (SaaS)
Capstone project — Al Akhawayn University, Spring 2026

## Monorepo Structure

```
PHARMACY-MS/
├── frontend/     → Next.js 14 (Pages Router)
├── backend/      → Node.js + Express.js
├── .gitignore
├── README.md
└── CLAUDE.md
```

---

## FRONTEND

### Stack

- Framework: Next.js 14 — Pages Router ONLY (src/pages/). Never use App Router.
- UI: React 18
- Styling: CSS Modules ONLY. Never use Tailwind. Never use inline styles
  except for dynamic values like chart colors or role badge colors.
- Data fetching: Axios (one configured instance in src/lib/axios.js) + SWR
- Charts: Recharts
- Forms: React Hook Form + Zod
- i18n: i18next + next-i18next (French and Arabic, with RTL support)
- Icons: Lucide React
- Toasts: Sonner
- Language: JavaScript only. Never use TypeScript.

### Design System

Fonts: Cormorant Garamond (headings and branding) + Outfit (all UI text).
Load both via @import URL in frontend/src/styles/globals.css.

Colors:
- Navy (primary):  #0B1C35
- Blue (accent):   #2563EB
- Background:      #F5F3EE
- Success:         #10B981
- Warning:         #F59E0B
- Error:           #EF4444
- Slate (muted):   #64748B

Every page gets its own CSS Module file named [PageName].module.css
stored in frontend/src/styles/. Every component gets its own CSS Module
stored alongside the component or in src/styles/.

### Frontend File Structure

Every file below is empty and needs to be implemented:

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js
│   │   ├── login.jsx
│   │   ├── dashboard.jsx
│   │   ├── inventory/
│   │   │   ├── index.jsx
│   │   │   ├── add.jsx
│   │   │   └── [id].jsx
│   │   ├── pos.jsx
│   │   ├── reservations/
│   │   │   ├── index.jsx
│   │   │   ├── [id].jsx
│   │   │   ├── new.jsx
│   │   │   └── track/
│   │   │       └── [code].jsx
│   │   ├── suppliers/
│   │   │   ├── index.jsx
│   │   │   ├── add.jsx
│   │   │   └── delivery/
│   │   │       └── new.jsx
│   │   ├── reports.jsx
│   │   ├── audit-logs.jsx
│   │   ├── ai-assistant.jsx
│   │   ├── profile.jsx
│   │   └── settings/
│   │       └── users.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Alert.jsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   │   ├── KpiCard.jsx
│   │   │   ├── SalesChart.jsx
│   │   │   └── AlertFeed.jsx
│   │   ├── inventory/
│   │   │   ├── MedicineTable.jsx
│   │   │   ├── BatchList.jsx
│   │   │   ├── AddMedicineForm.jsx
│   │   │   └── StockAlertBanner.jsx
│   │   ├── pos/
│   │   │   ├── MedicineSearch.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── CheckoutPanel.jsx
│   │   │   └── PharmacistApprovalModal.jsx
│   │   ├── reservations/
│   │   │   ├── ReservationTable.jsx
│   │   │   ├── ReservationDetail.jsx
│   │   │   └── ReservationForm.jsx
│   │   ├── suppliers/
│   │   │   ├── SupplierTable.jsx
│   │   │   ├── AddSupplierForm.jsx
│   │   │   └── DeliveryForm.jsx
│   │   ├── ai/
│   │   │   └── OTCAssistantPanel.jsx
│   │   └── reports/
│   │       └── SalesChart.jsx
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── LoginPage.module.css
│   │   ├── Dashboard.module.css
│   │   ├── AppLayout.module.css
│   │   ├── Sidebar.module.css
│   │   └── Topbar.module.css
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMedicines.js
│   │   ├── useReservations.js
│   │   └── useSales.js
│   │
│   ├── lib/
│   │   ├── axios.js
│   │   └── auth.js
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── roleGuard.js
│   │
│   └── constants/
│       ├── roles.js
│       └── routes.js
│
├── .env.local
├── next.config.js
├── jsconfig.json
└── package.json
```

### Frontend Dependencies (package.json)

```json
{
  "name": "pharmaos-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.2",
    "swr": "^2.2.5",
    "tailwindcss": "^3.4.4",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    "recharts": "^2.12.7",
    "i18next": "^23.11.5",
    "react-i18next": "^14.1.2",
    "next-i18next": "^15.3.1",
    "jose": "^5.4.0",
    "js-cookie": "^3.0.5",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.396.0",
    "sonner": "^1.5.0",
    "@anthropic-ai/sdk": "^0.24.3"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19"
  }
}
```

### Authentication

- JWT is stored in a cookie using js-cookie
- Every Axios request automatically attaches the token via a request interceptor in src/lib/axios.js
- Three roles: pharmacist (full admin), assistant, cashier
- Public pages that require no authentication: /login, /reservations/new, /reservations/track/[code]
- Every other page is protected via ProtectedRoute and roleGuard in getServerSideProps

### RBAC — Who Can Access What

| Page              | Pharmacist | Assistant | Cashier |
|-------------------|-----------|-----------|---------|
| /dashboard        | ✅        | ✅        | ✅      |
| /inventory        | ✅        | ✅        | ❌      |
| /inventory/add    | ✅        | ❌        | ❌      |
| /inventory/[id]   | ✅        | ✅        | ❌      |
| /pos              | ✅        | ✅        | ✅      |
| /reservations     | ✅        | ✅        | ❌      |
| /reservations/[id]| ✅        | ✅        | ❌      |
| /suppliers        | ✅        | ❌        | ❌      |
| /reports          | ✅        | ❌        | ❌      |
| /audit-logs       | ✅        | ❌        | ❌      |
| /settings/users   | ✅        | ❌        | ❌      |
| /ai-assistant     | ✅        | ✅        | ❌      |
| /profile          | ✅        | ✅        | ✅      |

### Frontend Implementation Steps

Follow this order strictly. Do not jump ahead. Each step depends on the previous one.

**Step 1 — Project foundation**
- frontend/src/styles/globals.css
  Import Cormorant Garamond + Outfit from Google Fonts. Add CSS reset.
  Set body background to #F5F3EE and font-family to Outfit.
- frontend/src/pages/_document.js
  Standard Next.js custom document.
- frontend/src/pages/_app.js
  Import globals.css. Wrap Component with layout logic:
  pages that have a getLayout function use it, otherwise render Component directly.
- frontend/src/pages/index.js
  Redirect to /login using getServerSideProps.

**Step 2 — Core utilities and config**
- frontend/src/lib/auth.js
  getToken(), setToken(token), clearToken() using js-cookie. Cookie name: pharmaos_token.
- frontend/src/lib/axios.js
  Create Axios instance with baseURL from process.env.NEXT_PUBLIC_API_URL.
  Add request interceptor: attach Authorization: Bearer <token> header on every request.
  Add response interceptor: on 401, clear token and redirect to /login.
- frontend/src/constants/roles.js
  Export: PHARMACIST = 'pharmacist', ASSISTANT = 'assistant', CASHIER = 'cashier'.
- frontend/src/constants/routes.js
  Export all 18 route path strings as named constants.
- frontend/src/utils/formatCurrency.js
  Format a number as MAD currency (Moroccan Dirham).
- frontend/src/utils/formatDate.js
  Format a date string into a readable format (e.g. DD/MM/YYYY).
- frontend/src/utils/roleGuard.js
  A getServerSideProps wrapper that checks the JWT cookie.
  If no token → redirect to /login.
  If role not in allowed roles → redirect to /dashboard.
- frontend/.env.local
  NEXT_PUBLIC_API_URL=http://localhost:5000
- frontend/jsconfig.json
  Set up path aliases: @ → src/

**Step 3 — Auth hook**
- frontend/src/hooks/useAuth.js
  Read token from cookie, decode it (using jose or manually), expose:
  { user, role, isLoading, logout }
  logout() clears the cookie and redirects to /login.

**Step 4 — UI primitives**
Implement all 8 components in frontend/src/components/ui/.
Each one must be a clean, reusable React component using CSS Modules.
Use the design system colors and Outfit font.
- Button.jsx — variants: primary, secondary, danger, ghost. Sizes: sm, md, lg.
- Input.jsx — label, error state, helper text.
- Badge.jsx — variants: success, warning, error, info, neutral.
- Modal.jsx — overlay + centered card, close on backdrop click.
- Table.jsx — thead, tbody, striped rows, responsive.
- Card.jsx — white card with subtle shadow, padding variants.
- Spinner.jsx — animated loading indicator.
- Alert.jsx — variants: success, warning, error, info. Dismissible.

**Step 5 — Layout components**
- frontend/src/components/auth/ProtectedRoute.jsx
  Wraps a page. Reads role from useAuth. If role not in allowedRoles prop → redirect to /dashboard.
- frontend/src/components/layout/Sidebar.jsx
  Navigation links grouped by module. Highlights active route.
  Groups: Overview (dashboard), Inventory, Sales (pos), Reservations,
  Suppliers, Reports, Audit Logs, AI Assistant, Settings (users, profile).
  Collapsible on mobile.
- frontend/src/components/layout/Topbar.jsx
  Shows current page title, user avatar, role badge, language switcher (FR/AR), logout button.
- frontend/src/components/layout/AppLayout.jsx
  Combines Sidebar + Topbar + main content area.
  Used by all authenticated pages via getLayout pattern.
- frontend/src/components/layout/PublicLayout.jsx
  Minimal layout with logo only in top bar.
  Used by /login, /reservations/new, /reservations/track/[code].

**Step 6 — Login page**
- frontend/src/pages/login.jsx
  Two tabs: Sign In and Create Pharmacy Account.
  Sign In tab: email + password fields, remember me checkbox, forgot password link,
  role quick-fill badges (Pharmacist / Assistant / Cashier for demo).
  Create Pharmacy Account tab: pharmacy name, full name, phone, email, password
  with strength bar (Weak/Fair/Good/Strong), confirm password, terms agreement checkbox.
  One-time setup banner explaining only one admin account can be created.
  On login success: store JWT, redirect to /dashboard.
  On register success: store JWT, redirect to /dashboard.
  Uses PublicLayout.
- frontend/src/styles/LoginPage.module.css
  Split screen: dark navy left panel with decorative capsule shapes and stats,
  white right panel with the form. Responsive: left panel hidden on mobile.

**Step 7 — Dashboard**
- frontend/src/components/dashboard/KpiCard.jsx
  Shows a label, a large number, and a trend indicator.
- frontend/src/components/dashboard/SalesChart.jsx
  Recharts LineChart showing sales for the last 7 days.
- frontend/src/components/dashboard/AlertFeed.jsx
  List of near-expiry and low-stock alerts with badge indicators.
- frontend/src/pages/dashboard.jsx
  Fetches from GET /api/dashboard/summary via SWR.
  Shows 3 KPI cards: Total Sales Today, Low Stock Items, Expiring Soon.
  Shows SalesChart and AlertFeed below.
  Uses AppLayout.
- frontend/src/styles/Dashboard.module.css

**Step 8 — Inventory**
- frontend/src/components/inventory/MedicineTable.jsx
  Searchable table of medicines with columns: name, category, batches count,
  total stock, status badge (OK / Low / Critical), actions.
- frontend/src/components/inventory/BatchList.jsx
  List of batches for a single medicine: batch number, expiry date, qty, price.
- frontend/src/components/inventory/AddMedicineForm.jsx
  Two-section form: medicine details + initial batch details.
- frontend/src/components/inventory/StockAlertBanner.jsx
  Banner shown at top of inventory when low-stock items exist.
- frontend/src/pages/inventory/index.jsx
  Fetches GET /api/medicines via SWR. Renders MedicineTable. Uses AppLayout.
  Pharmacist and Assistant only.
- frontend/src/pages/inventory/add.jsx
  Renders AddMedicineForm. Posts to POST /api/medicines. Uses AppLayout.
  Pharmacist only.
- frontend/src/pages/inventory/[id].jsx
  Fetches GET /api/medicines/:id. Shows medicine detail + BatchList. Uses AppLayout.
  Pharmacist and Assistant only.

**Step 9 — Point of Sale**
- frontend/src/components/pos/MedicineSearch.jsx
  Search input that queries GET /api/medicines with a search param.
- frontend/src/components/pos/CartItem.jsx
  Single row in the cart: medicine name, quantity selector, price, remove button.
- frontend/src/components/pos/Cart.jsx
  List of CartItems with subtotal.
- frontend/src/components/pos/CheckoutPanel.jsx
  Shows cart total, payment method selector, checkout button.
- frontend/src/components/pos/PharmacistApprovalModal.jsx
  Modal shown when checkout requires pharmacist approval.
  Shows a 120 second countdown timer. Waiting / Approved / Rejected states.
- frontend/src/pages/pos.jsx
  Split layout: left side MedicineSearch + item results, right side Cart + CheckoutPanel.
  On checkout POST /api/sales. If response includes requiresApproval flag, show PharmacistApprovalModal.
  Uses AppLayout. All staff roles.

**Step 10 — Reservations**
- frontend/src/components/reservations/ReservationTable.jsx
  Table with status filter tabs: All / Pending / Confirmed / Ready / Expired.
- frontend/src/components/reservations/ReservationDetail.jsx
  Detail view of a single reservation with approve/reject/mark-ready actions.
- frontend/src/components/reservations/ReservationForm.jsx
  Public form: customer name, phone, medicine search + quantity. Submit returns confirmation code.
- frontend/src/pages/reservations/index.jsx
  Fetches GET /api/reservations. Renders ReservationTable. Uses AppLayout.
  Pharmacist and Assistant only.
- frontend/src/pages/reservations/[id].jsx
  Fetches GET /api/reservations/:id. Renders ReservationDetail. Uses AppLayout.
  Pharmacist and Assistant only.
- frontend/src/pages/reservations/new.jsx
  Renders ReservationForm. Posts to POST /api/reservations.
  Shows confirmation code on success. Uses PublicLayout. No auth.
- frontend/src/pages/reservations/track/[code].jsx
  Fetches GET /api/reservations/track/:code. Shows status to customer.
  Uses PublicLayout. No auth.

**Step 11 — Suppliers**
- frontend/src/components/suppliers/SupplierTable.jsx
  Table of suppliers: name, contact, email, delivery count, actions.
- frontend/src/components/suppliers/AddSupplierForm.jsx
  Form: supplier name, contact person, email, address.
- frontend/src/components/suppliers/DeliveryForm.jsx
  Select supplier, add one or more delivery lines (medicine + batch data).
- frontend/src/pages/suppliers/index.jsx
  Fetches GET /api/suppliers. Renders SupplierTable. Uses AppLayout. Pharmacist only.
- frontend/src/pages/suppliers/add.jsx
  Renders AddSupplierForm. Posts to POST /api/suppliers. Uses AppLayout. Pharmacist only.
- frontend/src/pages/suppliers/delivery/new.jsx
  Renders DeliveryForm. Posts to POST /api/deliveries. Uses AppLayout. Pharmacist only.

**Step 12 — Reports**
- frontend/src/pages/reports.jsx
  Date range picker at top. Fetches GET /api/reports/sales and GET /api/reports/expiry.
  Shows sales line chart (Recharts), expiry alert table, export button.
  Uses AppLayout. Pharmacist only.

**Step 13 — Audit Logs**
- frontend/src/pages/audit-logs.jsx
  Fetches GET /api/audit-logs with filters: action, user, date range.
  Shows filterable table: timestamp, user, role, action, entity.
  Uses AppLayout. Pharmacist only.

**Step 14 — Settings — User Management**
- frontend/src/pages/settings/users.jsx
  Fetches GET /api/users. Shows staff table with role badges.
  Add Staff button opens modal: full name, email, role selector, temporary password.
  Posts to POST /api/users. Uses AppLayout. Pharmacist only.

**Step 15 — AI Assistant**
- frontend/src/components/ai/OTCAssistantPanel.jsx
  Textarea for prescription input. Submit button. Streamed response display area.
  Disclaimer banner: "For informational use only."
- frontend/src/pages/ai-assistant.jsx
  Renders OTCAssistantPanel. Posts to POST /api/ai/suggest.
  Uses AppLayout. Pharmacist and Assistant only.

**Step 16 — Profile**
- frontend/src/pages/profile.jsx
  Shows current user info: full name, email, role badge.
  Form to change password: current password, new password, confirm.
  Posts to PATCH /api/auth/change-password.
  Uses AppLayout. All roles.

---

## BACKEND

### Stack

- Runtime: Node.js 20
- Framework: Express.js 4
- Database: MongoDB Atlas 7 + Mongoose 8
- Cache: Redis 7 via Upstash
- Auth: bcryptjs + jsonwebtoken
- Scheduler: node-cron
- Logging: Winston
- Real-time: Socket.io
- AI: Anthropic SDK
- Validation: Zod

### Backend File Structure

Every file below is empty and needs to be implemented:

```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── validate.js
│   │   └── audit.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Medicine.model.js
│   │   ├── Batch.model.js
│   │   ├── Sale.model.js
│   │   ├── Reservation.model.js
│   │   ├── Supplier.model.js
│   │   ├── Delivery.model.js
│   │   └── AuditLog.model.js
│   ├── services/
│   │   ├── fifo.service.js
│   │   ├── pharmacistGate.service.js
│   │   ├── alert.service.js
│   │   └── ai.service.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── medicine.routes.js
│   │   ├── batch.routes.js
│   │   ├── sale.routes.js
│   │   ├── reservation.routes.js
│   │   ├── supplier.routes.js
│   │   ├── delivery.routes.js
│   │   ├── report.routes.js
│   │   ├── auditLog.routes.js
│   │   ├── user.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── medicine.controller.js
│   │   ├── batch.controller.js
│   │   ├── sale.controller.js
│   │   ├── reservation.controller.js
│   │   ├── supplier.controller.js
│   │   ├── delivery.controller.js
│   │   ├── report.controller.js
│   │   ├── auditLog.controller.js
│   │   ├── user.controller.js
│   │   └── ai.controller.js
│   ├── jobs/
│   │   ├── nearExpiry.job.js
│   │   └── reservationExpiry.job.js
│   └── utils/
│       ├── logger.js
│       └── ApiError.js
│
├── .env
└── package.json
```

### MongoDB Schemas

**users:** _id, pharmacyId, fullName, email, passwordHash, role (pharmacist|assistant|cashier), createdAt
**medicines:** _id, pharmacyId, name, genericName, category, unit, minStockLevel, supplierId
**batches:** _id, medicineId, pharmacyId, batchNumber, expiryDate, purchasePrice, salePrice, initialQty, remainingQty, deliveryId
**sales:** _id, pharmacyId, cashierId, pharmacistId, items[{batchId, qty, unitPrice}], totalAmount, approvalStatus, createdAt
**reservations:** _id, pharmacyId, customerName, customerPhone, items[{medicineId, qty}], status (pending|confirmed|ready|expired|cancelled), confirmationCode, expiresAt, createdAt
**suppliers:** _id, pharmacyId, name, contact, email, address
**deliveries:** _id, pharmacyId, supplierId, receivedBy, items[{medicineId, batchData}], deliveryDate
**auditLogs:** _id, pharmacyId, userId, action, entity, entityId, payload, createdAt

### Key Business Logic

**FIFO (fifo.service.js):**
1. Receive medicineId and quantityRequested
2. Query batches where remainingQty > 0, sort by expiryDate ASC
3. Walk through sorted batches, consuming greedily until quantity is fulfilled
4. If total available is less than requested, throw InsufficientStockError — do not write anything
5. Only write all batch updates to MongoDB after full allocation is confirmed in memory

**Pharmacist Gate (pharmacistGate.service.js):**
1. Triggered when a sale contains regulated items and operator role is not pharmacist
2. Emit a Socket.io event to all connected pharmacists
3. Start a 120 second countdown
4. If approved within 120s → proceed with sale
5. If timeout or rejected → throw SaleRejectedError, do not commit sale

**Cron Jobs:**
- nearExpiry.job.js: runs daily at 08:00, finds batches where expiryDate ≤ today + 30 days and remainingQty > 0, creates alert records and writes audit log
- reservationExpiry.job.js: runs every 15 minutes, finds pending reservations where expiresAt < now, releases locked stock, sets status to expired, writes audit log

### API Endpoints

| Method | Route                            | Auth                  | Description                          |
|--------|----------------------------------|-----------------------|--------------------------------------|
| POST   | /api/auth/register               | none                  | pharmacist one-time signup           |
| POST   | /api/auth/login                  | none                  | returns JWT + refresh token          |
| PATCH  | /api/auth/change-password        | any staff             | change own password                  |
| GET    | /api/medicines                   | any staff             | list with stock summary              |
| POST   | /api/medicines                   | pharmacist            | create medicine + initial batch      |
| GET    | /api/medicines/:id               | any staff             | detail with all batches              |
| PATCH  | /api/medicines/:id               | pharmacist            | update medicine info                 |
| POST   | /api/batches                     | pharmacist            | add batch to existing medicine       |
| POST   | /api/sales                       | any staff             | FIFO + approval gate if regulated    |
| GET    | /api/sales                       | any staff             | sales history with filters           |
| GET    | /api/reservations                | pharmacist, assistant | list with status filter              |
| POST   | /api/reservations                | none                  | public create                        |
| GET    | /api/reservations/track/:code    | none                  | public status check                  |
| PATCH  | /api/reservations/:id            | pharmacist            | confirm, reject, or mark ready       |
| GET    | /api/suppliers                   | pharmacist            | supplier list                        |
| POST   | /api/suppliers                   | pharmacist            | add supplier                         |
| POST   | /api/deliveries                  | pharmacist            | register delivery + new batches      |
| GET    | /api/reports/sales               | pharmacist            | aggregated sales data                |
| GET    | /api/reports/expiry              | pharmacist            | near-expiry batch list               |
| GET    | /api/audit-logs                  | pharmacist            | full audit trail with filters        |
| GET    | /api/users                       | pharmacist            | list all staff                       |
| POST   | /api/users                       | pharmacist            | create staff account                 |
| POST   | /api/ai/suggest                  | pharmacist, assistant | OTC suggestions via Anthropic        |

### Backend Implementation Steps

**Step 1 — Foundation**
- src/utils/logger.js: Winston logger with console transport
- src/utils/ApiError.js: class ApiError extends Error with statusCode and message
- src/config/db.js: connect to MongoDB Atlas using MONGO_URI from .env
- src/config/redis.js: connect to Redis using REDIS_URL from .env
- src/server.js: create Express app, connect to db and redis, register all routes,
  initialize Socket.io, start cron jobs, listen on PORT

**Step 2 — Models**
Implement all 8 Mongoose models with proper schemas and timestamps.

**Step 3 — Middleware**
- src/middleware/auth.js: verify JWT from Authorization header, attach decoded user to req.user
- src/middleware/rbac.js: factory function allow(...roles) returns middleware that checks req.user.role
- src/middleware/validate.js: takes a Zod schema, validates req.body, calls next() or returns 400
- src/middleware/audit.js: after response, write an AuditLog document with userId, action, entity, payload

**Step 4 — Services**
- src/services/fifo.service.js: implement FIFO algorithm described above
- src/services/pharmacistGate.service.js: implement Socket.io approval gate described above
- src/services/alert.service.js: createAlert(type, medicineId, batchId, message)
- src/services/ai.service.js: call Anthropic Claude API with prescription text, return suggestions

**Step 5 — Routes and Controllers**
Implement all routes and controllers. Auth routes first, then medicines,
batches, sales, reservations, suppliers, deliveries, reports, audit logs, users, ai.

**Step 6 — Cron Jobs**
- src/jobs/nearExpiry.job.js
- src/jobs/reservationExpiry.job.js

---

## Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### backend/.env
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

---

## Deployment

- Frontend → Vercel (connect GitHub repo, set NEXT_PUBLIC_API_URL to backend Render URL)
- Backend → Render free tier (connect GitHub repo, set all backend env variables)
- Database → MongoDB Atlas free M0 cluster
- Redis → Upstash free tier