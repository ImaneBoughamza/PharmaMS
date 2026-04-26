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
Capstone project — Al Akhawayn University in Ifrane, Spring 2026
Student: Imane Boughamza
Supervisor: Dr. Driss Kettani
Live URL: https://pharmacy-management-system-one-drab.vercel.app/

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

---

### DESIGN SYSTEM — READ CAREFULLY

This is a professional pharmacy management system used by licensed healthcare
staff. The interface must look like it was designed by a human designer with
domain knowledge — not like a generic AI-generated SaaS dashboard.

#### What NOT to do

Do NOT produce the typical AI-generated UI pattern. Specifically avoid:
- Blue gradient hero banners or gradient backgrounds of any kind
- Heavy floating card grids with large box-shadows everywhere
- Rounded pill buttons (border-radius > 6px on buttons)
- Teal/cyan/purple accent colors
- "Feature highlight" sections with icon + title + paragraph in 3-column grids
- Glassmorphism (backdrop-filter, frosted glass effects)
- Large emoji or illustrated icons as decorative elements
- Excessive white space with centered minimal content
- SaaS landing page aesthetics applied to a data management tool
- Every section being a rounded white card with a drop shadow
- Heroic large typography on functional pages

#### What TO do — The PharmaOS Aesthetic

The interface references professional French pharmacy and clinical software.
It is structured, readable, and purposeful. Think of it as the UI a
pharmacist would trust with medication data — not a consumer app.

**Layout philosophy:**
- Dense but not cramped. Show more data, less decoration.
- Tables are the primary layout pattern for list views — not card grids.
- Forms are structured with clear field grouping, not floating cards.
- The sidebar is the navigation anchor — it should feel solid and reliable.
- Pages have a clear title area at the top, then content below — no hero sections.

**Colors:**
- Background:        #F7F5F0  (warm parchment — not pure white)
- Surface:           #FFFFFF  (white — for content areas only)
- Sidebar:           #0F2340  (deep navy)
- Sidebar active:    #1A3A5C
- Primary action:    #1B5E42  (forest green — pharmacy color tradition)
- Primary hover:     #154D36
- Secondary:         #0B1C35  (navy)
- Border:            #DDD9D0  (warm gray — not cool gray)
- Text primary:      #1A1A1A
- Text secondary:    #5C5C5C
- Text muted:        #8C8C8C
- Success:           #1B5E42
- Warning:           #92400E
- Error:             #7F1D1D
- Info:              #1E3A5F

**Typography:**
- Headings: 'Libre Baskerville', serif — loaded via Google Fonts @import
- Body / UI: 'Inter', sans-serif — loaded via Google Fonts @import
- Monospace (codes, batch numbers): 'JetBrains Mono', monospace
- Load all three via @import in globals.css

Page titles: 22px, Libre Baskerville, color #0B1C35
Section headers: 14px, Inter 600 (semibold), uppercase, letter-spacing 0.08em, color #5C5C5C
Table headers: 11px, Inter 600, uppercase, letter-spacing 0.06em, color #8C8C8C, background #F7F5F0
Body text: 14px, Inter 400
Small/labels: 12px, Inter 400, color #5C5C5C
Batch/code values: 13px, JetBrains Mono

**Buttons:**
- Primary: background #1B5E42, color white, border-radius 4px, padding 8px 16px, font-size 13px, font-weight 600
- Secondary: background white, border 1px solid #DDD9D0, color #1A1A1A, border-radius 4px
- Danger: background #7F1D1D, color white, border-radius 4px
- Never use pill-shaped buttons (border-radius 20px+)
- Never use gradient backgrounds on buttons

**Tables:**
- Full-width, no rounded corners
- Header row: background #F7F5F0, border-bottom 2px solid #DDD9D0
- Body rows: background white, border-bottom 1px solid #EEE9E0
- Row hover: background #F7F5F0
- No card wrapping around tables — tables sit directly in the page

**Forms:**
- Field labels: 12px, Inter 600, color #5C5C5C, uppercase, letter-spacing 0.05em
- Inputs: border 1px solid #DDD9D0, border-radius 3px, padding 8px 10px, font-size 14px
- Input focus: border-color #1B5E42, outline none
- Group related fields with a horizontal rule and a section label — not by wrapping in a card
- Required fields: add a red asterisk after the label, no other decoration

**Sidebar:**
- Background #0F2340
- Logo area: 60px height, pharmacy cross icon + "PharmaOS" in white Libre Baskerville
- Nav items: 40px height, 14px Inter, color rgba(255,255,255,0.7)
- Active nav item: background #1A3A5C, color white, left border 3px solid #1B5E42
- Section dividers in sidebar: 1px solid rgba(255,255,255,0.1) with uppercase label 10px

**Status badges:**
- Pending:   background #FEF3C7, color #92400E, border 1px solid #FDE68A
- Confirmed: background #D1FAE5, color #1B5E42, border 1px solid #6EE7B7
- Ready:     background #DBEAFE, color #1E3A5F, border 1px solid #93C5FD
- Expired:   background #F3F4F6, color #6B7280, border 1px solid #D1D5DB
- Cancelled: background #FEE2E2, color #7F1D1D, border 1px solid #FECACA
- Regulated: background #FFF7ED, color #92400E, border 1px solid #FED7AA
- Border-radius on badges: 3px maximum

**Dashboard specifically:**
- No large KPI cards with gradients
- KPI row: 4 inline stat blocks with left border in primary color, background white
- Stats show number in 28px Libre Baskerville + label in 12px Inter below
- Chart section: plain white background, labeled title in section-header style
- Alert feed: simple table-style list, not card stack

**POS page specifically:**
- Two-column layout: left 60% for product search + cart, right 40% for checkout
- Cart is a table — not floating card items
- No animations or transitions on cart add/remove

**Public reservation portal specifically:**
- Clean centered form on the parchment background
- No hero image, no gradient banner
- Simple logo + tagline, then the form
- Mobile-first, works at 320px

---

### Frontend File Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js                          → redirects to /login
│   │   ├── login.jsx                         → Sign In + Create Pharmacy Account tabs
│   │   ├── dashboard.jsx                     → BACK OFFICE
│   │   │
│   │   ├── products/                         → BACK OFFICE — Manage Product (BB2)
│   │   │   ├── index.jsx                     → /products — medicine list + parapharmacy list tabs
│   │   │   ├── add.jsx                       → /products/add — register medicine
│   │   │   ├── [id].jsx                      → /products/[id] — medicine detail
│   │   │   ├── parapharmacy/
│   │   │   │   ├── index.jsx                 → /products/parapharmacy — parapharmacy list
│   │   │   │   ├── add.jsx                   → /products/parapharmacy/add
│   │   │   │   └── [id].jsx                  → /products/parapharmacy/[id]
│   │   │   └── orders/
│   │   │       ├── index.jsx                 → /products/orders — purchase orders list
│   │   │       └── new.jsx                   → /products/orders/new
│   │   │
│   │   ├── stock/                            → BACK OFFICE — Manage Stock (BB3)
│   │   │   ├── index.jsx                     → /stock — stock overview, alerts, batch management
│   │   │   └── report.jsx                    → /stock/report — stock management report
│   │   │
│   │   ├── pos.jsx                           → BACK OFFICE — Manage Sales (BB4)
│   │   │
│   │   ├── reservations/                     → Manage Reservations (BB5)
│   │   │   ├── index.jsx                     → BACK OFFICE — staff reservations list
│   │   │   ├── [id].jsx                      → BACK OFFICE — reservation detail
│   │   │   ├── new.jsx                       → FRONT OFFICE — public reservation form
│   │   │   └── track/
│   │   │       └── [code].jsx                → FRONT OFFICE — public status tracking
│   │   │
│   │   ├── transactions/
│   │   │   └── index.jsx                     → BACK OFFICE — Manage Transactions (BB6)
│   │   │
│   │   ├── suppliers/                        → BACK OFFICE — Manage Suppliers (BB7)
│   │   │   ├── index.jsx
│   │   │   ├── add.jsx
│   │   │   ├── [id].jsx
│   │   │   └── delivery/
│   │   │       └── new.jsx
│   │   │
│   │   ├── settings/
│   │   │   └── users.jsx                     → BACK OFFICE — Manage Users (BB8)
│   │   │
│   │   ├── ai-assistant.jsx                  → BACK OFFICE — AI Decision Support (BB9)
│   │   ├── audit-logs.jsx                    → BACK OFFICE — Manage Audit Logs
│   │   ├── reports.jsx                       → BACK OFFICE — Sales reports
│   │   └── profile.jsx                       → BACK OFFICE — own profile
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx                 → Sidebar + Topbar — all back office pages
│   │   │   ├── PublicLayout.jsx              → logo only — login, reservations/new, track
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
│   │   │   ├── KpiRow.jsx
│   │   │   ├── SalesChart.jsx
│   │   │   └── AlertFeed.jsx
│   │   ├── products/
│   │   │   ├── MedicineTable.jsx
│   │   │   ├── ParapharmacyTable.jsx
│   │   │   ├── BatchList.jsx
│   │   │   ├── AddMedicineForm.jsx
│   │   │   ├── AddParapharmacyForm.jsx
│   │   │   ├── StockAlertBanner.jsx
│   │   │   └── OrderForm.jsx
│   │   ├── stock/
│   │   │   ├── StockOverview.jsx
│   │   │   ├── ExpiryAlerts.jsx
│   │   │   ├── LowStockAlerts.jsx
│   │   │   └── StockReport.jsx
│   │   ├── pos/
│   │   │   ├── ProductSearch.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── CheckoutPanel.jsx
│   │   │   ├── BillingPanel.jsx
│   │   │   └── PharmacistApprovalModal.jsx
│   │   ├── reservations/
│   │   │   ├── ReservationTable.jsx
│   │   │   ├── ReservationDetail.jsx
│   │   │   └── ReservationForm.jsx
│   │   ├── transactions/
│   │   │   ├── TransactionTable.jsx
│   │   │   └── EndOfDayPanel.jsx
│   │   ├── suppliers/
│   │   │   ├── SupplierTable.jsx
│   │   │   ├── AddSupplierForm.jsx
│   │   │   └── DeliveryForm.jsx
│   │   ├── ai/
│   │   │   ├── PrescriptionScanner.jsx
│   │   │   ├── RecommendationPanel.jsx
│   │   │   └── ConsultationHistory.jsx
│   │   └── reports/
│   │       └── SalesReportChart.jsx
│   │
│   ├── styles/
│   │   ├── globals.css                       → @import fonts + CSS reset + CSS vars
│   │   ├── LoginPage.module.css
│   │   ├── Dashboard.module.css
│   │   ├── AppLayout.module.css
│   │   ├── Sidebar.module.css
│   │   └── Topbar.module.css
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMedicines.js
│   │   ├── useParapharmacy.js
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
├── .env.local                                → NEXT_PUBLIC_API_URL=http://localhost:5000
├── next.config.js
├── jsconfig.json
└── package.json
```

### Authentication

- JWT stored in cookies via js-cookie
- Attached to every request via Axios request interceptor
- Three roles: pharmacist (admin), assistant, cashier
- FRONT OFFICE routes (no auth): /login, /reservations/new, /reservations/track/[code]
- All BACK OFFICE routes: protected via ProtectedRoute + roleGuard in getServerSideProps

### RBAC Rules

| Page                        | Pharmacist | Assistant | Cashier |
|-----------------------------|-----------|-----------|---------|
| /dashboard                  | ✅        | ✅        | ✅      |
| /products                   | ✅        | ✅        | ❌      |
| /products/add               | ✅        | ❌        | ❌      |
| /products/[id]              | ✅        | ✅        | ❌      |
| /products/parapharmacy      | ✅        | ✅        | ❌      |
| /products/parapharmacy/add  | ✅        | ❌        | ❌      |
| /products/orders            | ✅        | ❌        | ❌      |
| /stock                      | ✅        | ✅        | ❌      |
| /stock/report               | ✅        | ❌        | ❌      |
| /pos                        | ✅        | ✅        | ✅      |
| /reservations (staff)       | ✅        | ✅        | ✅      |
| /reservations/[id]          | ✅        | ✅        | ✅      |
| /transactions               | ✅        | ❌        | ❌      |
| /suppliers                  | ✅        | ❌        | ❌      |
| /reports                    | ✅        | ❌        | ❌      |
| /audit-logs                 | ✅        | ❌        | ❌      |
| /settings/users             | ✅        | ❌        | ❌      |
| /ai-assistant               | ✅        | ✅        | ❌      |
| /profile                    | ✅        | ✅        | ✅      |

### Frontend Implementation Steps

Implement frontend only after the backend is running locally.

Step 1 — Foundation
- _app.js, _document.js, globals.css (with font imports + CSS vars), index.js

Step 2 — Core utilities
- src/lib/auth.js, src/lib/axios.js
- src/constants/roles.js, src/constants/routes.js
- src/utils/formatCurrency.js, formatDate.js, roleGuard.js
- frontend/.env.local

Step 3 — Auth hook
- src/hooks/useAuth.js

Step 4 — UI primitives
- All 8 components in src/components/ui/
- Apply the design system above to every component

Step 5 — Layout
- ProtectedRoute.jsx, Sidebar.jsx, Topbar.jsx, AppLayout.jsx, PublicLayout.jsx

Step 6 — Login page
- src/pages/login.jsx + LoginPage.module.css

Step 7 — Dashboard
- KpiRow.jsx, SalesChart.jsx, AlertFeed.jsx
- src/pages/dashboard.jsx

Step 8 — Manage Product (BB2)
- MedicineTable, ParapharmacyTable, BatchList, AddMedicineForm,
  AddParapharmacyForm, StockAlertBanner, OrderForm
- pages: products/index, add, [id], parapharmacy/index, add, [id], orders/index, new

Step 9 — Manage Stock (BB3)
- StockOverview, ExpiryAlerts, LowStockAlerts, StockReport
- pages: stock/index, report

Step 10 — Manage Sales / POS (BB4)
- ProductSearch, Cart, CartItem, CheckoutPanel, BillingPanel, PharmacistApprovalModal
- pages: pos.jsx

Step 11 — Manage Reservations (BB5)
- ReservationTable, ReservationDetail, ReservationForm
- pages: reservations/index, [id], new, track/[code]

Step 12 — Manage Transactions (BB6)
- TransactionTable, EndOfDayPanel
- pages: transactions/index

Step 13 — Manage Suppliers (BB7)
- SupplierTable, AddSupplierForm, DeliveryForm
- pages: suppliers/index, add, [id], delivery/new

Step 14 — AI Decision Support (BB9)
- PrescriptionScanner, RecommendationPanel, ConsultationHistory
- pages: ai-assistant.jsx
- The prescription scan sends a base64-encoded JPEG/PNG to POST /api/ai/scan
- The API returns extracted medicines + parapharmacy complement suggestions
- The pharmacist reviews and validates before presenting to customer

Step 15 — Reports, Audit Logs, Settings, Profile
- pages: reports.jsx, audit-logs.jsx, settings/users.jsx, profile.jsx

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
- AI: Anthropic SDK (claude-sonnet-4-20250514 — supports vision for prescription scan)
- Email: Nodemailer + SendGrid SMTP
- Validation: Zod

### Backend File Structure

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
│   │   ├── ParapharmacyProduct.model.js      → NEW — separate collection
│   │   ├── Batch.model.js
│   │   ├── Order.model.js
│   │   ├── Sale.model.js
│   │   ├── Reservation.model.js
│   │   ├── Supplier.model.js
│   │   ├── Delivery.model.js
│   │   └── AuditLog.model.js
│   ├── services/
│   │   ├── fifo.service.js
│   │   ├── pharmacistGate.service.js
│   │   ├── email.service.js                  → NEW — Nodemailer + SendGrid
│   │   └── ai.service.js                     → UPDATED — now handles vision input
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── medicine.routes.js
│   │   ├── parapharmacy.routes.js            → NEW
│   │   ├── batch.routes.js
│   │   ├── order.routes.js
│   │   ├── stock.routes.js
│   │   ├── sale.routes.js
│   │   ├── reservation.routes.js
│   │   ├── transaction.routes.js
│   │   ├── supplier.routes.js
│   │   ├── delivery.routes.js
│   │   ├── report.routes.js
│   │   ├── auditLog.routes.js
│   │   ├── user.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── medicine.controller.js
│   │   ├── parapharmacy.controller.js        → NEW
│   │   ├── batch.controller.js
│   │   ├── order.controller.js
│   │   ├── stock.controller.js
│   │   ├── sale.controller.js
│   │   ├── reservation.controller.js
│   │   ├── transaction.controller.js
│   │   ├── supplier.controller.js
│   │   ├── delivery.controller.js
│   │   ├── report.controller.js
│   │   ├── auditLog.controller.js
│   │   ├── user.controller.js
│   │   └── ai.controller.js
│   ├── jobs/
│   │   ├── nearExpiry.job.js                 → daily at 08:00
│   │   └── reservationExpiry.job.js          → every 15 minutes
│   └── utils/
│       ├── logger.js
│       └── ApiError.js
│
├── .env
└── package.json
```

### MongoDB Schemas

**users:**
_id, pharmacyId, fullName, email, passwordHash,
role (pharmacist|assistant|cashier), isActive, createdAt, updatedAt

**medicines:**
_id, pharmacyId, name, genericName,
category (prescription|non-prescription|regulated),
unit, minStockLevel, supplierId, isActive, createdAt, updatedAt

**parapharmacyProducts:**
_id, pharmacyId, name, brand,
category (cosmetics|supplements|medical-device|hygiene|other),
purchasePrice, salePrice, stockQty, minStockLevel,
supplierId, isActive, createdAt, updatedAt

**batches:**
_id, medicineId, pharmacyId, batchNumber, expiryDate,
purchasePrice, salePrice, initialQty, remainingQty,
deliveryId, isActive, createdAt

**orders:**
_id, pharmacyId, supplierId,
productType (medicine|parapharmacy),
items[{productId, orderedQty}],
status (ordered|received|cancelled), createdAt, updatedAt

**sales:**
_id, pharmacyId, cashierId, pharmacistId,
items[{batchId, qty, unitPrice}],
parapharmacyItems[{productId, qty, unitPrice}],
totalAmount, paymentMethod (cash|electronic),
approvalStatus (approved|pending|rejected|voided),
voidReason,
invoice{receiptNumber, generatedAt, medicineSubtotal, parapharmacySubtotal},
createdAt

**reservations:**
_id, pharmacyId, customerName, customerPhone, customerEmail,
items[{productType, productId, qty}],
status (pending|confirmed|ready|expired|cancelled),
confirmationCode, paymentMethod (online|pay-on-pickup),
rejectionReason, expiresAt, createdAt, updatedAt

**suppliers:**
_id, pharmacyId, name, contact, email, phone, address,
type (grossiste|laboratoire|parapharmacy-distributor|other),
isActive, createdAt, updatedAt

**deliveries:**
_id, pharmacyId, supplierId, receivedBy, orderId,
medicineItems[{medicineId, batchNumber, expiryDate, receivedQty, purchasePrice, salePrice}],
parapharmacyItems[{productId, receivedQty, purchasePrice}],
deliveryDate, notes, createdAt

**auditLogs:**
_id, pharmacyId, userId, action, entity,
entityId, payload, createdAt
(immutable — never update or delete)

### API Endpoints

#### Auth
| Method | Route                       | Auth      | Description                         |
|--------|-----------------------------|-----------|-------------------------------------|
| POST   | /api/auth/register          | none      | Pharmacist one-time signup          |
| POST   | /api/auth/login             | none      | Returns JWT + refresh token         |
| POST   | /api/auth/refresh           | none      | Refresh access token                |
| PATCH  | /api/auth/change-password   | any staff | Change own password                 |

#### Manage Product — Medicines (BB2)
| Method | Route                       | Auth        | Description                         |
|--------|-----------------------------|-------------|-------------------------------------|
| GET    | /api/medicines              | staff       | List with batch stock summary       |
| POST   | /api/medicines              | pharmacist  | Register medicine + initial batch   |
| GET    | /api/medicines/:id          | staff       | Detail with all batches             |
| PATCH  | /api/medicines/:id          | pharmacist  | Update medicine                     |
| PATCH  | /api/medicines/:id/deactivate | pharmacist| Soft delete                         |
| PATCH  | /api/medicines/:id/reactivate | pharmacist| Restore                             |

#### Manage Product — Parapharmacy (BB2)
| Method | Route                            | Auth        | Description                    |
|--------|----------------------------------|-------------|--------------------------------|
| GET    | /api/parapharmacy                | staff       | List with stock levels         |
| POST   | /api/parapharmacy                | pharmacist  | Register parapharmacy product  |
| GET    | /api/parapharmacy/:id            | staff       | Product detail                 |
| PATCH  | /api/parapharmacy/:id            | pharmacist  | Update product                 |
| PATCH  | /api/parapharmacy/:id/deactivate | pharmacist  | Soft delete                    |
| PATCH  | /api/parapharmacy/:id/reactivate | pharmacist  | Restore                        |

#### Manage Product — Orders (BB2)
| Method | Route                | Auth        | Description                         |
|--------|----------------------|-------------|-------------------------------------|
| GET    | /api/orders          | pharmacist  | List purchase orders with filters   |
| POST   | /api/orders          | pharmacist  | Create purchase order               |
| PATCH  | /api/orders/:id      | pharmacist  | Update order status                 |

#### Manage Stock (BB3)
| Method | Route                     | Auth        | Description                         |
|--------|---------------------------|-------------|-------------------------------------|
| GET    | /api/stock/alerts         | staff       | Low-stock alerts (both types)       |
| PATCH  | /api/stock/adjust         | pharmacist  | Manual adjustment with reason       |
| GET    | /api/stock/expiry/alerts  | staff       | Near-expiry batch list              |
| PATCH  | /api/stock/expiry/threshold | pharmacist| Set near-expiry threshold in days   |
| POST   | /api/stock/return         | pharmacist  | Mark batch for supplier return      |
| POST   | /api/batches              | pharmacist  | Register batch manually             |
| GET    | /api/batches/:id/history  | pharmacist  | Batch consumption history           |
| PATCH  | /api/batches/:id/deactivate | pharmacist| Deactivate batch (before use)       |
| GET    | /api/reports/stock        | pharmacist  | Full stock management report        |

#### Manage Sales / POS (BB4)
| Method | Route                      | Auth        | Description                        |
|--------|----------------------------|-------------|------------------------------------|
| POST   | /api/sales                 | staff       | Add sale (FIFO + gate if needed)   |
| GET    | /api/sales                 | staff       | List with filters                  |
| GET    | /api/sales/:id             | staff       | Sale detail + invoice              |
| GET    | /api/sales/:id/invoice     | staff       | Invoice/receipt                    |
| PATCH  | /api/sales/:id/void        | pharmacist  | Void sale with reason              |
| GET    | /api/reports/sales         | pharmacist  | Aggregated sales report            |

#### Manage Reservations (BB5)
| Method | Route                             | Auth        | Description                    |
|--------|-----------------------------------|-------------|--------------------------------|
| POST   | /api/reservations                 | none        | Public — submit reservation    |
| GET    | /api/reservations/track/:code     | none        | Public — status check          |
| PATCH  | /api/reservations/track/:code     | none        | Public — update reservation    |
| DELETE | /api/reservations/track/:code     | none        | Public — cancel reservation    |
| GET    | /api/reservations                 | staff       | Staff — list with filters      |
| GET    | /api/reservations/:id             | staff       | Staff — reservation detail     |
| PATCH  | /api/reservations/:id/confirm     | pharmacist  | Approve                        |
| PATCH  | /api/reservations/:id/reject      | pharmacist  | Reject with reason             |
| PATCH  | /api/reservations/:id/ready       | staff       | Mark ready for pickup          |
| PATCH  | /api/reservations/:id/cancel      | staff       | Staff cancel                   |
| POST   | /api/reservations/:id/convert     | staff       | Convert to sale                |

#### Manage Transactions (BB6)
| Method | Route                         | Auth        | Description                        |
|--------|-------------------------------|-------------|------------------------------------|
| GET    | /api/transactions             | pharmacist  | Unified view: sales+res+deliveries |
| GET    | /api/transactions/summary     | pharmacist  | Totals by period                   |
| GET    | /api/transactions/reconcile   | pharmacist  | End-of-day reconciliation data     |
| POST   | /api/transactions/reconcile   | pharmacist  | Confirm + close the day            |

#### Manage Suppliers (BB7)
| Method | Route                            | Auth        | Description                    |
|--------|----------------------------------|-------------|--------------------------------|
| GET    | /api/suppliers                   | pharmacist  | Supplier list                  |
| POST   | /api/suppliers                   | pharmacist  | Add supplier                   |
| GET    | /api/suppliers/:id               | pharmacist  | Supplier detail + history      |
| PATCH  | /api/suppliers/:id               | pharmacist  | Update supplier                |
| PATCH  | /api/suppliers/:id/deactivate    | pharmacist  | Soft delete                    |
| PATCH  | /api/suppliers/:id/reactivate    | pharmacist  | Restore                        |
| POST   | /api/deliveries                  | pharmacist  | Register delivery (both types) |
| GET    | /api/deliveries                  | pharmacist  | Delivery history               |

#### Manage Users (BB8)
| Method | Route                | Auth        | Description                         |
|--------|----------------------|-------------|-------------------------------------|
| GET    | /api/users           | pharmacist  | List all staff                      |
| POST   | /api/users           | pharmacist  | Create staff account                |
| PATCH  | /api/users/:id       | pharmacist  | Update or deactivate account        |
| PATCH  | /api/users/:id/reset-password | pharmacist | Reset password              |

#### AI Decision Support (BB9)
| Method | Route                  | Auth                   | Description                    |
|--------|------------------------|------------------------|--------------------------------|
| POST   | /api/ai/scan           | pharmacist, assistant  | Upload prescription image, get extracted medicines + suggestions |
| GET    | /api/ai/consultations  | pharmacist, assistant  | Consultation history           |
| GET    | /api/ai/consultations/:id | pharmacist, assistant | Consultation detail           |

#### Manage Audit Logs
| Method | Route              | Auth        | Description                         |
|--------|--------------------|-------------|-------------------------------------|
| GET    | /api/audit-logs    | pharmacist  | Full audit trail with filters       |

### Key Business Logic

**FIFO (fifo.service.js):**
Input: medicineId, quantityRequested
1. Query batches where remainingQty > 0 AND isActive = true, sort by expiryDate ASC
2. Greedily consume from oldest batch until quantity fulfilled
3. If total available < requested → throw InsufficientStockError, commit nothing
4. Confirm all batch updates in memory first, then write atomically to MongoDB

**Pharmacist Gate (pharmacistGate.service.js):**
1. If sale items contain regulated medicines AND operator role ≠ pharmacist → trigger gate
2. Emit Socket.io APPROVAL_REQUIRED event to pharmacist channel
3. Start 120-second countdown
4. On approval → proceed; on timeout or rejection → throw SaleRejectedError
5. Parapharmacy items NEVER trigger the gate

**Delivery Processing (delivery.controller.js):**
- For each medicineItem in delivery → create a new Batch document
- For each parapharmacyItem in delivery → increment stockQty on ParapharmacyProduct
- Both operations in one atomic transaction where possible

**AI Prescription Scan (ai.service.js):**
1. Receive base64-encoded JPEG/PNG from frontend
2. Call Anthropic SDK with vision input: send prescription image
3. Prompt: extract list of prescribed medicines, then suggest complementary
   vitamins, supplements, and parapharmacy products (NOT OTC medicines)
   from the pharmacy's current in-stock parapharmacy catalogue
4. Return: { extractedMedicines: [], suggestions: [{productId, name, rationale}] }
5. Save consultation to a consultations sub-document or separate collection
6. Store prescription image only if pharmacist explicitly saves — otherwise session only

**Email Notifications (email.service.js):**
Uses Nodemailer with SendGrid SMTP. All sends are async — never block API response.
Five triggers:
1. Reservation submitted → send confirmation email with code + items + pickup window
2. Reservation confirmed by pharmacist → send confirmed email
3. Reservation rejected → send rejected email with reason
4. Reservation ready for pickup → send ready email
5. Reservation auto-expired → send expiry email (triggered by cron job)

**Cron Jobs:**
- nearExpiry.job.js: daily at 08:00
  → batches where expiryDate ≤ today + threshold (configurable) AND remainingQty > 0
  → log via Winston, do not crash on error

- reservationExpiry.job.js: every 15 minutes
  → pending reservations where expiresAt < now
  → releaseLockedStock() for both medicine batches and parapharmacy stockQty
  → set status = expired
  → send expiry email via email.service.js
  → write auditLog entry
  → log via Winston

**End-of-Day Reconciliation (transaction.controller.js):**
GET /api/transactions/reconcile → return today's totals:
- total sales revenue (cash + electronic separately)
- total voided sales + reasons
- total reservations by status
- flag discrepancies (e.g. expected total vs recorded total)
POST /api/transactions/reconcile → pharmacist confirms + closes day:
- create immutable reconciliation record with timestamp + pharmacistId
- closed days cannot be modified retroactively

### Backend Implementation Steps

Step 1 — Foundation
- src/utils/logger.js — Winston logger
- src/utils/ApiError.js — structured error class
- src/config/db.js — MongoDB Atlas connection
- src/config/redis.js — Redis Upstash connection
- src/server.js — Express app, all routes, Socket.io, cron jobs, listen

Step 2 — Models
Implement all 10 Mongoose models with proper schemas and timestamps.

Step 3 — Middleware
- auth.js: verify JWT from Authorization header, attach req.user
- rbac.js: allow(...roles) factory function
- validate.js: Zod schema validation middleware
- audit.js: write AuditLog document after every mutation

Step 4 — Services
- fifo.service.js
- pharmacistGate.service.js
- email.service.js
- ai.service.js

Step 5 — Routes and Controllers
Implement in this order:
1. auth
2. medicines + batches
3. parapharmacy
4. orders
5. stock
6. sales
7. reservations
8. transactions + reconciliation
9. suppliers + deliveries
10. reports/sales + reports/stock
11. audit-logs
12. users
13. ai (prescription scan + consultation history)

Step 6 — Cron Jobs
- jobs/nearExpiry.job.js
- jobs/reservationExpiry.job.js

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
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@pharmaos.ma
NODE_ENV=development
```

---

## Deployment

- Frontend → Vercel (connect GitHub, set NEXT_PUBLIC_API_URL to Render backend URL)
- Backend → Render free tier (connect GitHub, set all env variables)
- Database → MongoDB Atlas free M0 cluster
- Redis → Upstash free tier
- Live frontend URL: https://pharmacy-management-system-one-drab.vercel.app/
